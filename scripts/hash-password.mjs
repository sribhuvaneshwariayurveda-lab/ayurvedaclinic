/* Generate an ADMIN_PASSWORD_HASH value from the admin password.
 *
 * Usage (Windows PowerShell) — recommended: the password is read from the
 * terminal with the echo turned off, so it never touches your shell history:
 *   npm run hash-password
 *
 * Non-interactive use (CI, scripts): set ADMIN_PASSWORD in the environment
 * and clear it afterwards:
 *   $env:ADMIN_PASSWORD = "choose-a-long-random-password"
 *   npm run hash-password
 *   Remove-Item Env:\ADMIN_PASSWORD
 *
 * The password is never accepted as a command-line argument: arguments are
 * visible to other processes and land in the shell history.
 *
 * What is printed:
 *   stdout  ONLY the hash value, with no variable name, no quotes and no
 *           trailing newline — paste exactly this into the host's
 *           ADMIN_PASSWORD_HASH environment variable.
 *   stderr  the hash format, a short config fingerprint and next steps. The
 *           password is never printed, logged or stored, and it is never
 *           written to disk by this script.
 *
 * Format: $scrypt$N=16384,r=8,p=1$<32-hex salt>$<128-hex key>
 *
 * The salt is a cryptographically secure random 16-byte value and the
 * output is re-verified against the password before it is printed, so the
 * value is always accepted by server.js.
 */
import crypto from "node:crypto";
import {
  generateHash,
  parseHash,
  verifyHash,
  configFingerprint,
  MIN_PASSWORD_LENGTH,
} from "./password-hash.mjs";

const forcedPrompt = process.argv.includes("--prompt");
const guidance = [];

/** Read a line from the TTY with the echo turned off. */
function readHiddenPassword() {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      reject(
        new Error(
          "The hidden password prompt needs an interactive terminal. Run `npm run hash-password` directly in a terminal, or set ADMIN_PASSWORD for non-interactive use."
        )
      );
      return;
    }
    let value = "";
    const cleanup = () => {
      try {
        stdin.setRawMode(false);
      } catch {
        /* terminal already closed */
      }
      stdin.pause();
      stdin.removeListener("data", onData);
    };
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          cleanup();
          resolve(value);
          return;
        }
        if (ch === "\u0003") {
          cleanup();
          reject(new Error("cancelled"));
          return;
        }
        if (ch === "\u007f") {
          value = value.slice(0, -1);
          continue;
        }
        if (ch < " ") continue;
        value += ch;
      }
    };
    process.stderr.write("Admin password (input hidden): ");
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    stdin.on("data", onData);
  });
}

let password = process.env.ADMIN_PASSWORD || "";
const fromEnv = Boolean(password);
const usePrompt = forcedPrompt || !password;
if (usePrompt) {
  try {
    password = await readHiddenPassword();
    process.stderr.write("\n");
  } catch (e) {
    console.error(`Could not read the password: ${e.message}`);
    process.exit(1);
  }
}

if (!password) {
  console.error(
    "No password supplied. Run `npm run hash-password` in a terminal, or set ADMIN_PASSWORD for non-interactive use."
  );
  process.exit(1);
}
if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  process.exit(1);
}

const hash = generateHash(password);

/* Self-check: the value must parse and must verify against the password. */
if (!parseHash(hash) || !verifyHash(password, hash)) {
  console.error("Generated hash failed its own verification — nothing was printed.");
  process.exit(1);
}

/* The value only — no variable name, no quotes, no trailing newline. */
process.stdout.write(hash);

guidance.push(
  "",
  `Format: $scrypt$N=16384,r=8,p=1$<32-hex salt>$<128-hex key>`,
  `Config fingerprint: ${configFingerprint(hash)}`,
  "Copy the value above into the ADMIN_PASSWORD_HASH environment variable (value only).",
  "Restart the Node.js application so the new value is read at startup; its log must show the same fingerprint."
);
if (fromEnv && !forcedPrompt) {
  guidance.push("Clear the password from your shell afterwards: Remove-Item Env:\\ADMIN_PASSWORD");
} else {
  guidance.push("The password was read from the terminal with echo off and was not stored anywhere.");
}
process.stderr.write(guidance.join("\n") + "\n");
