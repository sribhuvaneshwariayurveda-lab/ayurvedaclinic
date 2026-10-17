/* Generate an ADMIN_PASSWORD_HASH value from the ADMIN_PASSWORD env var.
 *
 * Usage (Windows PowerShell):
 *   $env:ADMIN_PASSWORD = "choose-a-long-random-password"
 *   npm run hash-password
 *   Remove-Item Env:\ADMIN_PASSWORD
 *
 * Copy ONLY the printed hash into the host's ADMIN_PASSWORD_HASH variable.
 * The password itself is never printed, logged, or stored in this repo.
 */
import crypto from "node:crypto";

const password = process.env.ADMIN_PASSWORD || "";
if (!password) {
  console.error("Set ADMIN_PASSWORD in the environment first (see script header).");
  process.exit(1);
}
if (password.length < 16) {
  console.error("Password must be at least 16 characters.");
  process.exit(1);
}

const N = 16384;
const r = 8;
const p = 1;
const salt = crypto.randomBytes(16).toString("hex");
crypto.scrypt(password, Buffer.from(salt, "hex"), 64, { N, r, p }, (err, key) => {
  if (err) {
    console.error(`scrypt failed: ${err.message}`);
    process.exit(1);
  }
  console.log(`ADMIN_PASSWORD_HASH=$scrypt$N=${N},r=${r},p=${p}$${salt}$${key.toString("hex")}`);
});
