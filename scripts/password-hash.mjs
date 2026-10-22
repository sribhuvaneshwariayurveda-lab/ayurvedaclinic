/*
 * Shared helpers for the ADMIN_PASSWORD_HASH format.
 *
 * The server (server.js) owns the authoritative parser and verifier; it stays
 * self-contained on purpose so the deployed app has no import to resolve.
 * This module holds the same format definition for the local tooling
 * (hash-password.mjs, check-admin-config.mjs and the tests) so a hash
 * generated here is always accepted by the server.
 *
 * Format (must stay in sync with parsePasswordHash() in server.js):
 *
 *   $scrypt$N=<n>,r=<r>,p=<p>$<saltHex>$<hashHex>
 *
 *   - the salt is a cryptographically secure random 16-byte value (32 hex chars)
 *   - the key is a 64-byte scrypt output (128 hex chars)
 *   - the recommended parameters are N=16384, r=8, p=1
 *
 * Nothing in this module ever prints or stores a password.
 */
import crypto from "node:crypto";

/** The scrypt parameters the server expects (also the minimum we accept). */
export const SCRYPT_PARAMS = Object.freeze({ N: 16384, r: 8, p: 1 });

/** Reject parameter sets that are weaker than the floor or unsafe above it. */
export const SCRYPT_MIN = Object.freeze({ N: 16384, r: 8, p: 1 });
export const SCRYPT_MAX_N = 1048576;

export const SALT_BYTES = 16;
export const KEY_BYTES = 64;
export const MIN_PASSWORD_LENGTH = 16;

/** Same pattern as server.js parsePasswordHash(). */
export const HASH_PATTERN = /^\$scrypt\$N=(\d+),r=(\d+),p=(\d+)\$([0-9a-f]+)\$([0-9a-f]+)$/;

/**
 * Hash a password with a fresh cryptographically secure salt.
 * Returns the hash string only — never the password.
 */
export function generateHash(password) {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("A password is required.");
  }
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const key = crypto.scryptSync(password, Buffer.from(salt, "hex"), KEY_BYTES, { ...SCRYPT_PARAMS });
  return formatHash(salt, key.toString("hex"));
}

/** Assemble the storage string from its parts. */
export function formatHash(saltHex, hashHex) {
  const { N, r, p } = SCRYPT_PARAMS;
  return `$scrypt$N=${N},r=${r},p=${p}$${saltHex}$${hashHex}`;
}

/** Parse a stored hash (null when it does not match the expected format). */
export function parseHash(stored) {
  const m = HASH_PATTERN.exec(String(stored || ""));
  if (!m) return null;
  return { N: Number(m[1]), r: Number(m[2]), p: Number(m[3]), salt: m[4], hash: m[5] };
}

/**
 * Constant-time verification, mirroring verifyPassword() in server.js.
 * Returns false for a malformed hash instead of throwing.
 */
export function verifyHash(password, stored) {
  const parsed = parseHash(stored);
  const salt = parsed ? parsed.salt : crypto.randomBytes(SALT_BYTES).toString("hex");
  const opts = parsed ? { N: parsed.N, r: parsed.r, p: parsed.p } : { ...SCRYPT_PARAMS };
  try {
    const key = crypto.scryptSync(String(password || ""), Buffer.from(salt, "hex"), KEY_BYTES, opts);
    if (!parsed) return false;
    const expected = Buffer.from(parsed.hash, "hex");
    return key.length === expected.length && crypto.timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}

/**
 * Classify a misconfigured value.
 *
 * Returns a short reason code, or null when the value is usable.
 * The reason never contains any part of the value itself.
 *
 *   missing      empty value
 *   whitespace   leading/trailing whitespace or newline
 *   prefixed     the variable name was pasted along with the value
 *   quoted       the value is wrapped in quotes
 *   not_scrypt   does not start with "$scrypt$"
 *   malformed    does not match the expected shape
 *   short_salt   salt shorter than 16 bytes
 *   short_hash   key shorter than 64 bytes
 *   weak_params  scrypt parameters below the accepted floor
 *   unsafe_params N above the accepted ceiling
 */
export function describeProblem(stored) {
  const raw = String(stored || "");
  if (!raw) return "missing";
  if (raw !== raw.trim()) return "whitespace";
  if (/^ADMIN_PASSWORD_HASH\s*=/i.test(raw)) return "prefixed";
  if (/^["'].*["']$/.test(raw)) return "quoted";
  if (!raw.startsWith("$scrypt$")) return "not_scrypt";

  const parsed = parseHash(raw);
  if (!parsed) return "malformed";
  if (parsed.salt.length < SALT_BYTES * 2) return "short_salt";
  if (parsed.hash.length < KEY_BYTES * 2) return "short_hash";
  if (parsed.N < SCRYPT_MIN.N || parsed.r < SCRYPT_MIN.r || parsed.p < SCRYPT_MIN.p) return "weak_params";
  if (parsed.N > SCRYPT_MAX_N) return "unsafe_params";
  return null;
}

/** Human-readable, credential-free explanation for each reason code. */
export const REASON_MESSAGES = Object.freeze({
  missing:
    "ADMIN_PASSWORD_HASH is empty — set it to the hash printed by `npm run hash-password`.",
  whitespace:
    "ADMIN_PASSWORD_HASH has leading/trailing whitespace or a trailing newline — paste the value with no spaces around it.",
  prefixed:
    'ADMIN_PASSWORD_HASH starts with "ADMIN_PASSWORD_HASH=" — paste ONLY the value that begins with "$scrypt$".',
  quoted:
    "ADMIN_PASSWORD_HASH is wrapped in quotes — paste the bare value, with no quotes.",
  not_scrypt:
    'ADMIN_PASSWORD_HASH is not an scrypt hash — generate one with `npm run hash-password` (it must begin with "$scrypt$").',
  malformed:
    'ADMIN_PASSWORD_HASH is malformed — expected "$scrypt$N=16384,r=8,p=1$<saltHex>$<hashHex>".',
  short_salt:
    "ADMIN_PASSWORD_HASH has a salt shorter than 16 bytes — regenerate it with `npm run hash-password`.",
  short_hash:
    "ADMIN_PASSWORD_HASH has a key shorter than 64 bytes — regenerate it with `npm run hash-password`.",
  weak_params:
    "ADMIN_PASSWORD_HASH uses weak scrypt parameters (N must be >= 16384, r >= 8, p >= 1) — regenerate it with `npm run hash-password`.",
  unsafe_params:
    "ADMIN_PASSWORD_HASH uses an scrypt cost above the accepted ceiling — regenerate it with `npm run hash-password`.",
});
