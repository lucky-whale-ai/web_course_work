import test from "node:test";
import assert from "node:assert/strict";
import { createApi } from "../server/api.js";
import { hashPassword } from "../server/security.js";
import {
  ageAt,
  registrationErrors,
  generatePassword,
} from "../js/validation.js";
import passwords2023 from "../js/common-passwords.js";

const valid = {
  firstName: "Иван",
  lastName: "Иванов",
  phone: "+375 (29) 123-45-67",
  email: "ivan@example.test",
  birthDate: "2000-01-01",
  nickname: "ivan_test",
  password: "BuildSecure!42",
  confirmPassword: "BuildSecure!42",
  agreement: true,
};
test("published 2023 passwords are rejected, including syntactically complex entries", () => {
  assert.equal(passwords2023.length, 200);
  for (const password of passwords2023)
    assert.ok(
      registrationErrors({ ...valid, password, confirmPassword: password })
        .password,
      password,
    );
  for (const password of [
    "Pass@123",
    "Aa@123456",
    "Demo@123",
    "Password@123",
    "Welcome@123",
  ])
    assert.equal(
      registrationErrors({ ...valid, password, confirmPassword: password })
        .password,
      "common",
    );
});
function memory(seed = {}) {
  const data = structuredClone({
    users: [],
    projects: [],
    sessions: [],
    favorites: [],
    requests: [],
    ...seed,
  });
  return {
    data,
    async all(t) {
      return structuredClone(data[t]);
    },
    async get(t, id) {
      return structuredClone(data[t].find((r) => r.id === id) || null);
    },
    async insert(t, r) {
      if (
        data[t].some(
          (x) =>
            x.id === r.id ||
            (t === "users" &&
              (x.email === r.email || x.nickname === r.nickname)),
        )
      )
        throw Object.assign(new Error("Conflict"), { code: "CONFLICT" });
      data[t].push(structuredClone(r));
    },
    async put(t, r) {
      const i = data[t].findIndex((x) => x.id === r.id);
      if (i < 0) data[t].push(structuredClone(r));
      else data[t][i] = structuredClone(r);
    },
    async remove(t, id) {
      data[t] = data[t].filter((r) => r.id !== id);
    },
  };
}
function client(api) {
  let cookie = "";
  return async (path, method = "GET", body, origin) => {
    const response = await api(
      new Request(`http://localhost/api${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Cookie: cookie,
          ...(origin ? { Origin: origin } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
    );
    if (response.headers.has("set-cookie"))
      cookie = response.headers.get("set-cookie").split(";")[0];
    return {
      status: response.status,
      data: await response.json(),
      cookie: response.headers.get("set-cookie"),
    };
  };
}
test("age boundary and invalid calendar dates", () => {
  assert.equal(ageAt("2010-09-08", new Date("2026-09-08")), 16);
  assert.equal(ageAt("2010-09-09", new Date("2026-09-08")), 15);
  assert.equal(ageAt("2001-02-29"), -1);
  assert.equal(
    registrationErrors(
      { ...valid, birthDate: "2010-09-09" },
      { now: new Date("2026-09-08") },
    ).birthDate,
    "age",
  );
});
test("registration rejects malformed fields and common passwords", () => {
  assert.deepEqual(registrationErrors(valid), {});
  for (const [key, value] of [
    ["phone", "+79991234567"],
    ["email", "bad"],
    ["firstName", "123"],
    ["nickname", "!"],
    ["agreement", false],
    ["password", "Password1!"],
    ["confirmPassword", "different"],
  ])
    assert.ok(registrationErrors({ ...valid, [key]: value })[key], key);
  for (let i = 0; i < 40; i++)
    assert.equal(
      registrationErrors({
        ...valid,
        password: generatePassword(),
        passwordMode: "generated",
      }).password,
      undefined,
    );
});
test("registration enforces role, hashes password, duplicate and logout checks", async () => {
  const db = memory(),
    call = client(createApi(db));
  const result = await call("/register", "POST", { ...valid, role: "admin" });
  assert.equal(result.status, 201);
  assert.equal(result.data.user.role, "user");
  assert.ok(!("passwordHash" in result.data.user));
  assert.match(result.cookie, /HttpOnly; SameSite=Lax/);
  assert.notEqual(db.data.users[0].passwordHash, valid.password);
  assert.equal((await call("/register", "POST", valid)).status, 409);
  assert.ok((await call("/me")).data.user);
  await call("/logout", "POST");
  assert.equal((await call("/me")).data.user, null);
  assert.equal(
    (await call("/login", "POST", { login: valid.email, password: "wrong" }))
      .status,
    401,
  );
  assert.equal(
    (
      await call("/login", "POST", {
        login: valid.email,
        password: valid.password,
      })
    ).status,
    200,
  );
});
test("ownership, admin status, CSRF, and favourite idempotence", async () => {
  const admin = {
    id: "admin",
    role: "admin",
    nickname: "admin",
    email: "admin@example.test",
    passwordHash: await hashPassword("SecureAdmin!42"),
  };
  const db = memory({ users: [admin], projects: [{ id: "1" }] }),
    api = createApi(db),
    a = client(api),
    b = client(api),
    root = client(api);
  await a("/register", "POST", valid);
  await b("/register", "POST", {
    ...valid,
    nickname: "other",
    email: "other@example.test",
  });
  assert.equal((await a("/favorites/1", "PUT")).status, 200);
  await a("/favorites/1", "PUT");
  assert.equal((await a("/favorites")).data.length, 1);
  assert.equal((await b("/favorites")).data.length, 0);
  const created = await a("/requests", "POST", {
    type: "question",
    name: "Иван",
    email: valid.email,
    message: "Уточните сроки работ.",
    consent: true,
    userId: "admin",
    status: "done",
  });
  assert.equal(created.data.status, "new");
  assert.notEqual(created.data.userId, "admin");
  assert.equal((await b("/requests")).data.length, 0);
  assert.equal(
    (await a(`/requests/${created.data.id}`, "PATCH", { status: "done" }))
      .status,
    403,
  );
  await root("/login", "POST", { login: "admin", password: "SecureAdmin!42" });
  assert.equal(
    (await root(`/requests/${created.data.id}`, "PATCH", { status: "done" }))
      .status,
    200,
  );
  assert.equal((await a("/requests")).data[0].status, "done");
  assert.equal(
    (await a("/requests", "POST", {}, "https://evil.test")).status,
    403,
  );
  await a("/favorites/1", "DELETE");
  assert.equal((await a("/favorites")).data.length, 0);
  assert.equal((await client(api)("/users")).status, 404);
});
test("catalogue combines search, category, sort, pagination", async () => {
  const projects = Array.from({ length: 30 }, (_, i) => ({
    id: String(i + 1),
    title: `Объект ${i}`,
    titleEn: `Project ${i}`,
    category: i % 2 ? "oil" : "civil",
    dateTo: `202${i % 5}-01-01`,
  }));
  const call = client(createApi(memory({ projects })));
  const result = await call(
    "/projects?category=oil&q=project&sort=oldest&page=2",
  );
  assert.equal(result.data.total, 15);
  assert.equal(result.data.page, 2);
  assert.equal(result.data.items.length, 6);
  assert.ok(result.data.items.every((p) => p.category === "oil"));
  assert.equal((await call("/projects/missing")).status, 404);
});

test("malformed JSON field types return validation errors rather than a server error", async () => {
  for (const [key, value] of [
    ["patronymic", {}],
    ["birthDate", ["2000-01-01"]],
    ["password", {}],
    ["email", ["ivan@example.test"]],
    ["firstName", ["Иван"]],
    ["nickname", ["ivan_test"]],
    ["agreement", "false"],
  ]) {
    const call = client(createApi(memory()));
    const response = await call("/register", "POST", {
      ...valid,
      [key]: value,
    });
    assert.equal(response.status, 422, key);
    assert.ok(response.data.errors[key], key);
  }
  const call = client(createApi(memory()));
  assert.equal(
    (
      await call("/requests", "POST", {
        type: "question",
        name: "Иван",
        email: valid.email,
        message: "Тестовое обращение.",
        consent: "false",
      })
    ).status,
    422,
  );
});
