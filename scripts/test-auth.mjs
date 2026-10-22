/*
 * Local authentication test for the admin API in server.js.
 *
 * Spins up the real server on a throwaway port with a THROWAWAY password
 * (generated here, never a production secret) and exercises login/session.
 * It never prints passwords, hashes, cookies or tokens.
 *
 * It also checks the ADMIN_PASSWORD_HASH configuration handling: a usable
 * hash, the common paste mistakes, and an outright malformed value. Every
 * misconfigured value must produce a clear 503 that names the problem
 * without revealing the credential.
 *
 * Usage:  node scripts/test-auth.mjs
 */
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateHash, parseHash, verifyHash } from "./password-hash.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const failures = [];
function check(name, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures.push(name);
}

/** Build a hash with non-default parameters (for the weak-cost scenario). */
function makeHashWithParams(password, { N, r, p }) {
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

async function scenario(label, { username, hash, password, loginUser, loginPass, expectStatus, expectCode, expectReason, expectLog }) {
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
    if (expectReason) {
      check(`${label}: reason==${expectReason} (got ${r.data && r.data.reason})`, !!r.data && r.data.reason === expectReason);
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
    if (hash) {
      check(`${label}: hash not present in logs`, !logs.join("").includes(hash));
      check(`${label}: hash not present in the response body`, !JSON.stringify(r.data || {}).includes(hash));
    }
    if (expectLog) {
      check(`${label}: startup log warns about config`, logs.join("").includes(expectLog));
    }
  } finally {
    child.kill();
  }
}

const PASSWORD = "throwaway-local-test-pass-0001";
/* The hash comes from the shared generator — the same code the
 * `npm run hash-password` command uses — so this test also proves that the
 * shipped generator produces a value the server accepts. */
const GOOD_HASH = generateHash(PASSWORD);

console.log("== scenario: correctly configured ==");
check("the generated hash has the expected format", !!parseHash(GOOD_HASH));
check("the generated hash verifies against the password", verifyHash(PASSWORD, GOOD_HASH));
await scenario("good", { username: "testadmin", hash: GOOD_HASH, password: PASSWORD, expectStatus: 200 });
await scenario("wrong-password", { username: "testadmin", hash: GOOD_HASH, password: "not-the-password-9999", expectStatus: 401, expectCode: "invalid_credentials" });
await scenario("wrong-username", { username: "testadmin", hash: GOOD_HASH, loginUser: "someoneelse", password: PASSWORD, expectStatus: 401, expectCode: "invalid_credentials" });

console.log("\n== scenario: hash pasted with the variable name prefix (common error) ==");
await scenario("prefixed-hash", { username: "testadmin", hash: "ADMIN_PASSWORD_HASH=" + GOOD_HASH, password: PASSWORD, expectStatus: 503, expectCode: "config_invalid", expectReason: "prefixed", expectLog: 'starts with "ADMIN_PASSWORD_HASH="' });

console.log("\n== scenario: hash has a trailing newline (common paste error) ==");
await scenario("trailing-newline", { username: "testadmin", hash: GOOD_HASH + "\n", password: PASSWORD, expectStatus: 503, expectCode: "config_invalid", expectReason: "whitespace", expectLog: "leading/trailing whitespace" });

console.log("\n== scenario: hash wrapped in quotes (common paste error) ==");
await scenario("quoted-hash", { username: "testadmin", hash: `"${GOOD_HASH}"`, password: PASSWORD, expectStatus: 503, expectCode: "config_invalid", expectReason: "quoted" });

console.log("\n== scenario: hash is not an scrypt hash ==");
await scenario("not-scrypt-hash", { username: "testadmin", hash: "not-a-scrypt-hash", password: PASSWORD, expectStatus: 503, expectCode: "config_invalid", expectReason: "not_scrypt" });

console.log("\n== scenario: hash is truncated ==");
await scenario("short-hash", { username: "testadmin", hash: GOOD_HASH.slice(0, -20), password: PASSWORD, expectStatus: 503, expectCode: "config_invalid", expectReason: "short_hash" });

console.log("\n== scenario: hash uses weak scrypt parameters ==");
await scenario("weak-params", { username: "testadmin", hash: makeHashWithParams(PASSWORD, { N: 1024, r: 8, p: 1 }), password: PASSWORD, expectStatus: 503, expectCode: "config_invalid", expectReason: "weak_params" });

console.log("\n== scenario: not configured (no env) ==");
await scenario("missing-config", { username: "", hash: "", password: PASSWORD, expectStatus: 503, expectCode: "config_missing", expectReason: null });

console.log("\n== scenario: username set but hash missing ==");
await scenario("missing-hash", { username: "testadmin", hash: "", password: PASSWORD, expectStatus: 503, expectCode: "config_missing" });

console.log("\n== scenario: the hash-password command output is usable ==");
{
  const CLI_PASSWORD = "throwaway-cli-generated-pass-02";
  const result = await new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(ROOT, "scripts", "hash-password.mjs")], {
      env: { ...process.env, ADMIN_PASSWORD: CLI_PASSWORD },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("close", (code) => resolve({ code, out, err }));
  });
  check("hash-password: exits successfully", result.code === 0);
  check("hash-password: prints only the hash value (no variable name)", !result.out.includes("ADMIN_PASSWORD_HASH="));
  check("hash-password: prints no trailing whitespace", result.out === result.out.trim());
  check("hash-password: output is a usable scrypt hash", !!parseHash(result.out.trim()));
  check("hash-password: never prints the password", !result.out.includes(CLI_PASSWORD) && !result.err.includes(CLI_PASSWORD));

  const PORT = 3998;
  const { child, logs } = startServer({
    PORT: String(PORT),
    ADMIN_USERNAME: "testadmin",
    ADMIN_PASSWORD_HASH: result.out.trim(),
  });
  try {
    check("hash-password: server accepts the generated hash", await waitReady(PORT));
    const r = await login(PORT, "testadmin", CLI_PASSWORD);
    check("hash-password: login with the generated hash succeeds", r.status === 200);
    check("hash-password: the generated hash is not logged", !logs.join("").includes(result.out.trim()));
  } finally {
    child.kill();
  }
}

console.log(failures.length === 0 ? "\nALL CHECKS PASSED" : `\nFAILURES: ${failures.join(", ")}`);
process.exit(failures.length === 0 ? 0 : 1);
