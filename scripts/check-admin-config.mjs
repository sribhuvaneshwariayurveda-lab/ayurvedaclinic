/*
 * Check the admin configuration without revealing any secret.
 *
 * Mirrors server.js: a valid ADMIN_PASSWORD_HASH takes precedence, otherwise
 * a plain-text ADMIN_PASSWORD is accepted (the server hashes it in memory at
 * startup with a random salt). The password and hash values themselves are
 * never printed — only their presence, the hash shape and, when something is
 * wrong, the reason and how to fix it.
 *
 * Usage (Windows PowerShell):
 *   $env:ADMIN_USERNAME = "your-admin-name"
 *   $env:ADMIN_PASSWORD = "your-admin-password"
 *   npm run check-admin-config
 *   Remove-Item Env:\ADMIN_PASSWORD
 *
 * Exit code 0 = the configuration is usable, 1 = it is not.
 */
import {
  describeProblem,
  REASON_MESSAGES,
  parseHash,
  configFingerprint,
  SCRYPT_PARAMS,
} from "./password-hash.mjs";

const username = process.env.ADMIN_USERNAME || "";
const hash = process.env.ADMIN_PASSWORD_HASH || "";
const password = process.env.ADMIN_PASSWORD || "";
const problems = [];
const notes = [];

if (!username) {
  problems.push("ADMIN_USERNAME is not set (the admin login name).");
} else if (username !== username.trim()) {
  problems.push("ADMIN_USERNAME has leading/trailing whitespace.");
}

const hashReason = hash ? describeProblem(hash) : "missing";
let source = null;
let ignoredHashReason = null;

if (hash) {
  if (!hashReason) {
    source = "hash";
  } else if (password) {
    ignoredHashReason = hashReason;
    source = "password";
  } else {
    problems.push(REASON_MESSAGES[hashReason] || `ADMIN_PASSWORD_HASH is not usable (${hashReason}).`);
  }
}

if (!source && password) source = "password";

if (!source && !problems.length) {
  problems.push(
    "Neither ADMIN_PASSWORD nor ADMIN_PASSWORD_HASH is set. Set ADMIN_PASSWORD to the plain-text admin password (recommended on Hostinger) or ADMIN_PASSWORD_HASH to a value from `npm run hash-password`."
  );
}

if (source === "hash") {
  const parsed = parseHash(hash);
  if (parsed.N !== SCRYPT_PARAMS.N || parsed.r !== SCRYPT_PARAMS.r || parsed.p !== SCRYPT_PARAMS.p) {
    notes.push(
      `ADMIN_PASSWORD_HASH uses different scrypt parameters (N=${parsed.N}, r=${parsed.r}, p=${parsed.p}); the server accepts any floor-compliant set, so this is only a note.`
    );
  }
}

if (ignoredHashReason) {
  notes.push(
    `ADMIN_PASSWORD_HASH is not usable (${ignoredHashReason}); at startup the server ignores it and uses ADMIN_PASSWORD instead.`
  );
}

if (source === "hash" && password) {
  notes.push("ADMIN_PASSWORD is also set but ADMIN_PASSWORD_HASH takes precedence; the password value is ignored.");
}

console.log("Admin configuration check (no secret values are printed)\n");
console.log(`  ADMIN_USERNAME set        : ${username ? "yes" : "no"}`);
console.log(`  ADMIN_PASSWORD set        : ${password ? "yes" : "no"}`);
console.log(`  ADMIN_PASSWORD_HASH set   : ${hash ? "yes" : "no"}`);
console.log(`  ADMIN_PASSWORD_HASH length: ${hash ? `${hash.length} characters` : "n/a"}`);
console.log(`  Credential source         : ${source === "hash" ? "ADMIN_PASSWORD_HASH (takes precedence)" : source === "password" ? "ADMIN_PASSWORD (hashed in memory at startup)" : "none"}`);

if (problems.length === 0) {
  if (source === "hash") {
    console.log(`  ADMIN_PASSWORD_HASH fingerprint: ${configFingerprint(hash)}`);
    console.log(
      "\nOK — the admin configuration is usable. Restart the Node.js application if you just changed these values (no rebuild is needed)."
    );
    console.log(
      `After the restart the app log must show "config fingerprint ${configFingerprint(hash)}"; a different value means the old environment is still loaded.`
    );
  } else {
    console.log(
      "\nOK — the admin configuration is usable. ADMIN_PASSWORD is hashed with a random salt when the app starts, so no hash needs to be copied."
    );
    console.log(
      "Restart the Node.js application after changing ADMIN_PASSWORD (no rebuild is needed). The startup log will confirm ADMIN_PASSWORD was accepted."
    );
  }
  for (const n of notes) console.log(`  Note: ${n}`);
  process.exit(0);
}

console.log("\nNOT USABLE:");
for (const p of problems) console.log(`  - ${p}`);
for (const n of notes) console.log(`  Note: ${n}`);
console.log(
  "\nFix: set ADMIN_USERNAME plus either ADMIN_PASSWORD (plain text) or a valid ADMIN_PASSWORD_HASH from `npm run hash-password`, then restart the application."
);
process.exit(1);
