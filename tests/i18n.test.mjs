import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  translate,
  localizedText,
  hasBelarusian,
  toBelarusian,
  nextLanguage,
  languageInfo,
} from "../js/i18n.js";
import {
  categories,
  navigation,
  licenses,
  regions,
  agreementRU,
  homeProjects,
} from "../js/content.js";
import { validationMessages, registrationErrors } from "../js/validation.js";

test("Belarusian covers catalogue data, agreements, navigation and form errors", async () => {
  const seed = JSON.parse(
    await readFile(new URL("../data/seed.json", import.meta.url), "utf8"),
  );
  const texts = [
    ...categories.flatMap((c) => [c.ru, c.short]),
    ...navigation.map((n) => n[1]),
    ...licenses.map((l) => l.ru),
    ...regions.map((r) => r[0]),
    ...agreementRU,
    ...Object.values(validationMessages).map((m) => m[0]),
    ...[...homeProjects, ...seed.projects].flatMap((p) =>
      ["title", "description", "location", "client"].map((k) => p[k]),
    ),
  ];
  for (const text of texts) assert.ok(hasBelarusian(text), text);
  assert.equal(
    translate("Настройки сайта", "Site settings", "be"),
    "Налады сайта",
  );
  assert.equal(
    translate("Настройки сайта", "Site settings", "en"),
    "Site settings",
  );
  assert.equal(
    translate("Настройки сайта", "Site settings", "ru"),
    "Настройки сайта",
  );
  assert.equal(
    toBelarusian("Реализованные объекты на\u00a0территориях:"),
    "Рэалізаваныя аб’екты на тэрыторыях:",
  );
  assert.equal(
    localizedText({ title: "Назва карыстальніка" }, "title", "be"),
    "Назва карыстальніка",
  );
  assert.deepEqual(
    ["ru", "be", "en"].map((code) => nextLanguage(code).code),
    ["be", "en", "ru"],
  );
  assert.equal(languageInfo("be").locale, "be-BY");
  assert.equal(languageInfo("invalid").code, "ru");
});

test("Belarusian uppercase and lowercase letters satisfy password case rules", () => {
  assert.equal(
    registrationErrors({ password: "Іў123456!" }).password,
    undefined,
  );
  assert.equal(
    registrationErrors({ password: "іў123456!" }).password,
    "password",
  );
  assert.equal(
    registrationErrors({ password: "ІЎ123456!" }).password,
    "password",
  );
});
