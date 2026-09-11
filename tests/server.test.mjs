import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, unlink, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { once } from "node:events";

test(
  "one server serves the site and API without exposing private files",
  { timeout: 20000 },
  async () => {
    const directory = await mkdtemp(join(tmpdir(), "roof-server-test-"));
    const database = join(directory, "db.json");
    const child = spawn(
      process.execPath,
      [fileURLToPath(new URL("../server/index.js", import.meta.url))],
      {
        cwd: directory,
        env: { ...process.env, PORT: "0", DATA_FILE: database },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let errors = "";
    child.stderr.on("data", (chunk) => (errors += chunk));
    try {
      const base = await new Promise((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error(`Server did not start: ${errors}`)),
          10000,
        );
        child.once("error", (error) => {
          clearTimeout(timer);
          reject(error);
        });
        child.once("exit", (code) => {
          clearTimeout(timer);
          reject(new Error(`Server exited ${code}: ${errors}`));
        });
        child.stdout.on("data", (chunk) => {
          const address = chunk
            .toString()
            .match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
          if (address) {
            clearTimeout(timer);
            resolve(address);
          }
        });
      });
      const home = await fetch(base);
      assert.equal(home.status, 200);
      assert.match(await home.text(), /src="\/js\/app.js"/);
      for (const [path, type] of [
        ["/js/app.js", "javascript"],
        ["/js/common-passwords.js", "javascript"],
        ["/css/style.css", "css"],
        ["/assets/imgLogo.png", "image/png"],
        ["/fonts/Golos_Text_Regular.woff2", "font/woff2"],
        ["/qa/compare.html", "html"],
      ]) {
        const response = await fetch(base + path);
        assert.equal(response.status, 200, path);
        assert.ok(response.headers.get("content-type").includes(type), path);
        await response.arrayBuffer();
      }
      for (const path of [
        "/data/seed.json",
        "/data/runtime.json",
        "/server/security.js",
        "/.git/config",
        "/package.json",
        "/js/%2e%2e%2fdata/seed.json",
        "/assets/%2e%2e%5cdata/seed.json",
      ]) {
        const response = await fetch(base + path);
        assert.ok(
          [403, 404].includes(response.status),
          `${path}: ${response.status}`,
        );
        assert.doesNotMatch(await response.text(), /passwordHash|RoofAdmin/);
      }
      const catalog = await fetch(base + "/api/projects");
      assert.equal(catalog.status, 200);
      assert.equal((await catalog.json()).total, 30);
      const login = await fetch(base + "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: base },
        body: JSON.stringify({
          email: "user1@example.test",
          password: "RoofUser!2025",
        }),
      });
      assert.equal(login.status, 200);
      const cookie = login.headers.get("set-cookie").split(";")[0];
      const me = await fetch(base + "/api/me", { headers: { Cookie: cookie } });
      assert.equal((await me.json()).user.email, "user1@example.test");
    } finally {
      if (child.exitCode === null) {
        const closed = once(child, "close");
        child.kill();
        await closed;
      }
      await unlink(database).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
      await rmdir(directory);
    }
  },
);
