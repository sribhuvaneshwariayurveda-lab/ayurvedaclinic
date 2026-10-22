/*
 * Check the admin configuration without revealing any secret.
 *
 * Verifies that the ADMIN_PASSWORD_HASH in the environment is a usable
 * scrypt hash and that ADMIN_USERNAME is set. The value itself is never
 * printed — only its shape (length and a leading/trailing character check)
 * and, when something is wrong, the reason and how to fix it.
 *
 * Usage (Windows PowerShell):
 *   $env:ADMIN_USERNAME = "your-admin-name"
 *   $env:ADMIN_PASSWORD_HASH = "<the value pasted into Hostinger>"
 *   npm run check-admin-config
 *   Remove-Item Env:\ADMIN_PASSWORD_HASH
 *
 * Exit code 0 = the configuration is usable, 1 = it is not.
 */
import { describeProblem, REASON_MESSAGES, parseHash, SCRYPT_PARAMS } from "./password-hash.mjs";

const username = process.env.ADMIN_USERNAME || "";
const hash = process.env.ADMIN_PASSWORD_HASH || "";
const problems = [];

if (!username) {
  problems.push("ADMIN_USERNAME is not set (the admin login name).");
} else if (username !== username.trim()) {
  problems.push("ADMIN_USERNAME has leading/trailing whitespace.");
}

const reason = describeProblem(hash);
if (reason) {
  problems.push(REASON_MESSAGES[reason] || `ADMIN_PASSWORD_HASH is not usable (${reason}).`);
} else {
  const parsed = parseHash(hash);
  if (parsed.N !== SCRYPT_PARAMS.N || parsed.r !== SCRYPT_PARAMS.r || parsed.p !== SCRYPT_PARAMS.p) {
    problems.push(
      `ADMIN_PASSWORD_HASH uses different scrypt parameters (N=${parsed.N}, r=${parsed.r}, p=${parsed.p}); the server accepts any floor-compliant set, so this is only a note.`
    );
  }
}

console.log("Admin configuration check (no secret values are printed)\n");
console.log(`  ADMIN_USERNAME set        : ${username ? "yes" : "no"}`);
console.log(`  ADMIN_PASSWORD_HASH set   : ${hash ? "yes" : "no"}`);
console.log(`  ADMIN_PASSWORD_HASH length: ${hash ? `${hash.length} characters` : "n/a"}`);

if (problems.length === 0) {
  console.log("\nOK — the admin configuration is usable. Restart the Node.js application if you just changed these values.");
  process.exit(0);
}

console.log("\nNOT USABLE:");
for (const p of problems) console.log(`  - ${p}`);
console.log("\nFix: set ADMIN_PASSWORD_HASH to the value printed by `npm run hash-password` (the value only — no variable name, no quotes, no trailing newline), then restart the application.");
process.exit(1);
