import jsonServer from "json-server";
import { existsSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createApi } from "./api.js";

const databasePath =
  process.env.DATA_FILE ||
  fileURLToPath(new URL("../data/runtime.json", import.meta.url));
if (!existsSync(databasePath))
  copyFileSync(new URL("../data/seed.json", import.meta.url), databasePath);
const router = jsonServer.router(databasePath),
  db = router.db;
const store = {
  async all(table) {
    return db.get(table).value() || [];
  },
  async get(table, id) {
    return db.get(table).find({ id }).value() || null;
  },
  async insert(table, row) {
    const rows = db.get(table).value() || [];
    if (
      rows.some(
        (r) =>
          r.id === row.id ||
          (table === "users" &&
            (r.email.toLowerCase() === row.email.toLowerCase() ||
              r.nickname.toLowerCase() === row.nickname.toLowerCase())),
      )
    )
      throw Object.assign(new Error("Duplicate record"), { code: "CONFLICT" });
    db.get(table).push(row).write();
  },
  async put(table, row) {
    const existing = db.get(table).find({ id: row.id });
    if (existing.value()) existing.assign(row).write();
    else db.get(table).push(row).write();
  },
  async remove(table, id) {
    db.get(table).remove({ id }).write();
  },
};
const handle = createApi(store),
  app = jsonServer.create();
// Serve only browser files. The database, sessions and server code stay private.
app.get(["/", "/index.html"], (req, res) =>
  res.sendFile(fileURLToPath(new URL("../index.html", import.meta.url))),
);
for (const directory of ["assets", "fonts", "css", "js", "qa"]) {
  app.use(
    `/${directory}`,
    jsonServer.defaults({
      static: fileURLToPath(new URL(`../${directory}/`, import.meta.url)),
      noCors: true,
      logger: false,
    }),
  );
}
// All database access goes through validation and role checks in the API.
app.use(async (req, res) => {
  if (!req.path.startsWith("/api/")) return res.sendStatus(404);
  try {
    let size = 0;
    const parts = [];
    for await (const part of req) {
      size += part.length;
      if (size > 64000) {
        res
          .status(413)
          .json({
            messageRu: "Запрос слишком большой.",
            messageEn: "Request too large.",
          });
        return;
      }
      parts.push(part);
    }
    const proto =
      req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
    const request = new Request(`${proto}://${req.headers.host}${req.url}`, {
      method: req.method,
      headers: req.headers,
      ...(!["GET", "HEAD"].includes(req.method)
        ? { body: Buffer.concat(parts) }
        : {}),
    });
    const response = await handle(request);
    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (error) {
    console.error("Request failed:", error.message);
    if (!res.headersSent)
      res
        .status(500)
        .json({ messageRu: "Ошибка сервера.", messageEn: "Server error." });
  }
});
const port = Number(process.env.PORT ?? 3000);
const listener = app.listen(port, "127.0.0.1", () =>
  console.log(`Руф Профи: http://127.0.0.1:${listener.address().port}`),
);
