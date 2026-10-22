/*
 * Local authentication test for the admin API in server.js.
 *
 * Spins up the real server on a throwaway port with a THROWAWAY password
 * (generated here, never a production secret) and exercises login/session.
 * It never prints passwords, hashes, cookies or tokens.
 *
 * Usage:  node scripts/test-auth.mjs
 */
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const failures = [];
function check(name, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures.push(name);
}

/** Build a hash in the exact format scripts/hash-password.mjs prints. */
function makeHash(password) {
  const N = 16384, r = 8, p = 1;
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password, Buffer.from(salt, "hex"), 64, { N, r, p });
  return `$scrypt$N=${N},r=${r},p=${p}$${salt}$${key.toString("hex")}`;
}

function startServer(env) {
  const child = spawn(process.execPath, [path.join(ROOT, "server.js")], {
    env: { ...process.env, HOST: "127.0.0.1", ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const logs = [];
  child.stdout.on("data", (d) => logs.push(d.toString()));
  child.stderr.on("data", (d) => logs.push(d.toString()));
  return { child, logs };
}

async function waitReady(port) {
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(`http://127.0.0.1:${port}/api/admin/session`);
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return false;
}

async function login(port, username, password) {
  const res = await fetch(`http://127.0.0.1:${port}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  const cookie = res.headers.get("set-cookie") || "";
  return { status: res.status, data, cookie };
}

async function scenario(label, { username, hash, password, loginUser, loginPass, expectStatus, expectCode, expectLog }) {
  const PORT = 3999;
  const { child, logs } = startServer({
    PORT: String(PORT),
    ADMIN_USERNAME: username,
    ADMIN_PASSWORD_HASH: hash,
  });
  try {
    if (!(await waitReady(PORT))) {
      check(`${label}: server became ready`, false);
      return;
    }
    const r = await login(PORT, loginUser || username, loginPass || password);
    check(`${label}: login status ${expectStatus} (got ${r.status})`, r.status === expectStatus);
    check(`${label}: response is JSON`, r.data !== null);
    if (expectCode) {
      check(`${label}: code==${expectCode} (got ${r.data && r.data.code})`, !!r.data && r.data.code === expectCode);
    }
    if (expectStatus === 200) {
      check(`${label}: sets session cookie`, /sbap_admin=/.test(r.cookie));
      const res2 = await fetch(`http://127.0.0.1:${PORT}/api/admin/session`, {
        headers: { cookie: r.cookie.split(";")[0] },
      });
      check(`${label}: session valid with cookie`, res2.status === 200);
    } else {
      check(`${label}: has error field`, !!(r.data && r.data.error));
      check(`${label}: no cookie on failure`, !/sbap_admin=\w/.test(r.cookie));
    }
    // Sanity: the test must never leak the password/hash in server logs.
    check(`${label}: password not present in logs`, !logs.join("").includes(password));
    if (expectLog) {
      check(`${label}: startup log warns about config`, logs.join("").includes(expectLog));
    }
  } finally {
    child.kill();
  }
}

const PASSWORD = "throwaway-local-test-pass-0001";
const GOOD_HASH = makeHash(PASSWORD);

console.log("== scenario: correctly configured ==");
await scenario("good", { username: "testadmin", hash: GOOD_HASH, password: PASSWORD, expectStatus: 200 });
await scenario("wrong-password", { username: "testadmin", hash: GOOD_HASH, password: "not-the-password-9999", expectStatus: 401, expectCode: "invalid_credentials" });
await scenario("wrong-username", { username: "testadmin", hash: GOOD_HASH, loginUser: "someoneelse", password: PASSWORD, expectStatus: 401, expectCode: "invalid_credentials" });

console.log("\n== scenario: hash pasted with the variable name prefix (common error) ==");
await scenario("prefixed-hash", { username: "testadmin", hash: "ADMIN_PASSWORD_HASH=" + GOOD_HASH, password: PASSWORD, expectStatus: 503, expectCode: "config_invalid", expectLog: 'starts with "ADMIN_PASSWORD_HASH="' });

console.log("\n== scenario: hash has a trailing newline (common paste error) ==");
await scenario("trailing-newline", { username: "testadmin", hash: GOOD_HASH + "\n", password: PASSWORD, expectStatus: 503, expectCode: "config_invalid", expectLog: "leading/trailing whitespace" });

console.log("\n== scenario: not configured (no env) ==");
await scenario("missing-config", { username: "", hash: "", password: PASSWORD, expectStatus: 503, expectCode: "config_missing" });

console.log(failures.length === 0 ? "\nALL CHECKS PASSED" : `\nFAILURES: ${failures.join(", ")}`);
process.exit(failures.length === 0 ? 0 : 1);
