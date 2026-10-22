/* Generate an ADMIN_PASSWORD_HASH value from the admin password.
 *
 * Usage (Windows PowerShell):
 *   $env:ADMIN_PASSWORD = "choose-a-long-random-password"
 *   npm run hash-password
 *   Remove-Item Env:\ADMIN_PASSWORD
 *
 * Or type the password without it being echoed:
 *   npm run hash-password -- --prompt
 *
 * What is printed:
 *   stdout  ONLY the hash value, with no variable name, no quotes and no
 *           trailing newline — paste exactly this into the host's
 *           ADMIN_PASSWORD_HASH environment variable.
 *   stderr  short guidance. The password is never printed, logged or stored,
 *           and it is never written to disk by this script.
 *
 * The salt is a cryptographically secure random 16-byte value and the
 * output is re-verified against the password before it is printed, so the
 * value is always accepted by server.js.
 */
import crypto from "node:crypto";
import { generateHash, parseHash, verifyHash, MIN_PASSWORD_LENGTH } from "./password-hash.mjs";

const usePrompt = process.argv.includes("--prompt");
const guidance = [];

/** Read a line from the TTY with the echo turned off. */
function readHiddenPassword() {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      reject(new Error("--prompt needs an interactive terminal. Set ADMIN_PASSWORD instead."));
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
    "No password supplied. Set ADMIN_PASSWORD in the environment first, or run `npm run hash-password -- --prompt`."
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
  "Copy the value above into the ADMIN_PASSWORD_HASH environment variable (value only).",
  "Then restart the Node.js application so the new value is read at startup.",
  "Clear the password from your shell afterwards: Remove-Item Env:\\ADMIN_PASSWORD"
);
process.stderr.write(guidance.join("\n") + "\n");
