/*
 * Static server + minimal admin API for the Sri Bhuvaneshwari Ayurveda Peedam website.
 *
 * This project is a static Vite SPA (React Router). The production build lives
 * in client/dist. Hostinger's Node.js Web App needs a process to start, so this
 * zero-dependency server serves the built files and falls back to index.html for
 * client-side routes.
 *
 * The admin API below is strictly additive: every pre-existing static route
 * behaves exactly as before. When the ADMIN_* environment variables are not
 * set, all /api/admin/* endpoints answer 503 and nothing else changes.
 *
 * Admin credentials are NEVER hardcoded here and never leave the server:
 * the credential comes from ADMIN_PASSWORD_HASH (scrypt) or from a plain-text
 * ADMIN_PASSWORD that is hashed in memory at startup with a random salt.
 * Sessions are opaque random tokens in an HttpOnly cookie, and no secret is
 * logged or returned.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const DIST_DIR = path.join(__dirname, "client", "dist");
const INDEX_FILE = path.join(DIST_DIR, "index.html");
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
};

function sendFile(res, filePath, stats, method) {
  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "Content-Length": stats.size,
  };
  if (filePath.includes(`${path.sep}assets${path.sep}`)) {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  } else {
    headers["Cache-Control"] = "no-cache";
  }
  res.writeHead(200, headers);
  if (method === "HEAD") {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
}

function notFound(res) {
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
}

/* ---------------------------------------------------------------------------
 * Minimal admin API.
 *
 * Environment (production secrets live ONLY in the host's env panel):
 *   ADMIN_USERNAME       admin login name (plain text, not secret)
 *   ADMIN_PASSWORD       plain-text admin password. When set, the server
 *                        derives an scrypt hash at startup using a fresh
 *                        cryptographically random salt, then removes the
 *                        variable from its own environment. No hash needs to
 *                        be generated or copied by hand.
 *   ADMIN_PASSWORD_HASH  optional pre-computed scrypt hash from
 *                        `npm run hash-password`
 *                        format: $scrypt$N=<n>,r=<r>,p=<p>$<saltHex>$<hashHex>
 *                        paste the VALUE ONLY — no variable name, no quotes,
 *                        no leading/trailing whitespace or newline
 *   If both are set, a valid ADMIN_PASSWORD_HASH takes precedence. If the
 *   hash is present but unusable, ADMIN_PASSWORD is used instead. With
 *   neither set the admin API fails closed with 503.
 *   COOKIE_SECURE       set to "1" in production (HTTPS) so the session
 *                        cookie carries the Secure flag; leave unset for
 *                        local http testing.
 *
 * These variables are read once, at startup: restart the application after
 * changing them (no rebuild is needed — server.js is not bundled). Run
 * `npm run check-admin-config` to validate a value locally before pasting it
 * into the host's env panel.
 *
 * Endpoints (all JSON except the served upload files):
 *   POST   /api/admin/login    {username, password} -> sets session cookie
 *   POST   /api/admin/logout   -> clears the session
 *   GET    /api/admin/session  -> {authenticated, username} or 401
 *   GET    /api/admin/uploads  -> list uploaded images (auth)
 *   POST   /api/admin/uploads  -> raw image bytes, Content-Type: image/* (auth)
 *   DELETE /api/admin/uploads/<name> (auth)
 * Uploaded files are served publicly (read-only) at /uploads/<name>.
 * ------------------------------------------------------------------------- */

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "";
let ADMIN_PASSWORD_HASH = "";
let ADMIN_CONFIG = null;
const COOKIE_SECURE = process.env.COOKIE_SECURE === "1";
const UPLOADS_DIR = path.join(__dirname, "uploads");
const DATA_DIR = path.join(__dirname, "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const MAX_CONTENT_BYTES = 512 * 1024;
const SLOGAN_LIMITS = {
  heading: 120,
  english: 500,
  tamil: 500,
  sanskrit: 500,
  meaning: 700,
  description: 1200,
};
const SESSION_COOKIE = "sbap_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const UPLOAD_NAME_RE = /^[0-9a-f]{32}\.(jpg|png|webp)$/;

const sessions = new Map(); // token -> { username, expires }
const loginAttempts = new Map(); // ip -> { count, reset }

try {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (e) {
  console.error(`[ayurveda-clinic] cannot create uploads dir: ${e.message}`);
}

try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
} catch (e) {
  console.error(`[ayurveda-clinic] cannot create data dir: ${e.message}`);
}

setInterval(() => {
  const now = Date.now();
  for (const [token, s] of sessions) {
    if (s.expires <= now) sessions.delete(token);
  }
  for (const [ip, a] of loginAttempts) {
    if (a.reset <= now) loginAttempts.delete(ip);
  }
}, 15 * 60 * 1000).unref();

function sendJson(res, status, obj, extraHeaders) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "X-Content-Type-Options": "nosniff",
    ...(extraHeaders || {}),
  });
  res.end(body);
}

/** Parse "$scrypt$N=<n>,r=<r>,p=<p>$<saltHex>$<hashHex>" (null when malformed). */
function parsePasswordHash(stored) {
  const m = /^\$scrypt\$N=(\d+),r=(\d+),p=(\d+)\$([0-9a-f]+)\$([0-9a-f]+)$/.exec(stored || "");
  if (!m) return null;
  return { N: Number(m[1]), r: Number(m[2]), p: Number(m[3]), salt: m[4], hash: m[5] };
}

/* The weakest scrypt parameters the server accepts, the cost ceiling and the
 * expected salt/key sizes. A value below the floor is refused outright so a
 * weak hash can never be used to log in. */
const SCRYPT_MIN = { N: 16384, r: 8, p: 1 };
const SCRYPT_MAX_N = 1048576;
const SALT_HEX_LENGTH = 32; // 16 bytes
const KEY_HEX_LENGTH = 128; // 64 bytes

/**
 * Short label derived from the stored hash (first 8 hex of SHA-256). It lets
 * an administrator confirm that a restarted app loaded the value they just
 * pasted, without revealing the hash. Mirrors configFingerprint() in
 * scripts/password-hash.mjs.
 */
function adminHashFingerprint(stored) {
  return crypto.createHash("sha256").update(String(stored || "")).digest("hex").slice(0, 8);
}

/**
 * Classify the ADMIN_PASSWORD_HASH value without revealing any of it.
 * Returns a short reason code, or null when the value is usable.
 * The reason never contains any part of the credential itself.
 */
function describeAdminHashProblem(stored) {
  const raw = String(stored || "");
  if (!raw) return "missing";
  if (raw !== raw.trim()) return "whitespace";
  if (/^ADMIN_PASSWORD_HASH\s*=/i.test(raw)) return "prefixed";
  if (/^["'].*["']$/.test(raw)) return "quoted";
  if (!raw.startsWith("$scrypt$")) return "not_scrypt";
  const parsed = parsePasswordHash(raw);
  if (!parsed) return "malformed";
  if (parsed.salt.length < SALT_HEX_LENGTH) return "short_salt";
  if (parsed.hash.length < KEY_HEX_LENGTH) return "short_hash";
  if (parsed.N < SCRYPT_MIN.N || parsed.r < SCRYPT_MIN.r || parsed.p < SCRYPT_MIN.p) return "weak_params";
  if (parsed.N > SCRYPT_MAX_N) return "unsafe_params";
  return null;
}

/* Credential-free explanation for every reason code. */
const ADMIN_HASH_PROBLEMS = {
  missing: "ADMIN_PASSWORD_HASH is empty — set it to the hash printed by `npm run hash-password`.",
  whitespace:
    "ADMIN_PASSWORD_HASH has leading/trailing whitespace or a trailing newline — paste the value with no spaces around it.",
  prefixed:
    'ADMIN_PASSWORD_HASH starts with "ADMIN_PASSWORD_HASH=" — paste ONLY the value that begins with "$scrypt$".',
  quoted: "ADMIN_PASSWORD_HASH is wrapped in quotes — paste the bare value, with no quotes.",
  not_scrypt:
    'ADMIN_PASSWORD_HASH is not an scrypt hash — generate one with `npm run hash-password` (it must begin with "$scrypt$").',
  malformed: 'ADMIN_PASSWORD_HASH is malformed — expected "$scrypt$N=16384,r=8,p=1$<saltHex>$<hashHex>".',
  short_salt:
    "ADMIN_PASSWORD_HASH has a salt shorter than 16 bytes — regenerate it with `npm run hash-password`.",
  short_hash:
    "ADMIN_PASSWORD_HASH has a key shorter than 64 bytes — regenerate it with `npm run hash-password`.",
  weak_params:
    "ADMIN_PASSWORD_HASH uses weak scrypt parameters (N must be >= 16384, r >= 8, p >= 1) — regenerate it with `npm run hash-password`.",
  unsafe_params:
    "ADMIN_PASSWORD_HASH uses an scrypt cost above the accepted ceiling — regenerate it with `npm run hash-password`.",
};

/** Passwords shorter than this are accepted but flagged in the startup log. */
const MIN_ADMIN_PASSWORD_LENGTH = 16;

/**
 * Derive the in-memory scrypt hash for ADMIN_PASSWORD.
 * A fresh cryptographically secure salt is used; the plain text is never
 * stored, logged or compared directly. The output uses the same format as
 * `npm run hash-password`, so verification below is unchanged.
 */
function derivePasswordHash(password) {
  const salt = crypto.randomBytes(SALT_HEX_LENGTH / 2).toString("hex");
  const key = crypto.scryptSync(password, Buffer.from(salt, "hex"), KEY_HEX_LENGTH / 2, { ...SCRYPT_MIN });
  return `$scrypt$N=${SCRYPT_MIN.N},r=${SCRYPT_MIN.r},p=${SCRYPT_MIN.p}$${salt}$${key.toString("hex")}`;
}

/**
 * Resolve the admin credential once, at startup.
 *
 * Precedence:
 *   1. ADMIN_PASSWORD_HASH when present and valid.
 *   2. ADMIN_PASSWORD — hashed in memory right now with a random salt; the
 *      plain-text variable is removed from the process environment afterwards.
 *   3. Neither -> config_missing. An unusable hash with no password ->
 *      config_invalid. Both fail closed (every admin endpoint answers 503).
 *
 * Returns { ok, code, reason, message, source, hash, ignoredHashReason,
 *           passwordTooShort }. Credential material is never included in the
 * result or in any message.
 */
function resolveAdminConfig() {
  const rawHash = process.env.ADMIN_PASSWORD_HASH || "";
  const rawPassword = process.env.ADMIN_PASSWORD || "";
  let hash = "";
  let source = null;
  let ignoredHashReason = null;

  try {
    if (rawHash) {
      const hashProblem = describeAdminHashProblem(rawHash);
      if (!hashProblem) {
        hash = rawHash;
        source = "hash";
      } else if (rawPassword) {
        /* A mistyped hash must not lock out an admin who also set a password. */
        ignoredHashReason = hashProblem;
      } else {
        return {
          ok: false,
          code: "config_invalid",
          reason: hashProblem,
          message: ADMIN_HASH_PROBLEMS[hashProblem],
          source: null,
          hash: "",
          ignoredHashReason: null,
          passwordTooShort: false,
        };
      }
    }

    if (!hash && rawPassword) {
      try {
        hash = derivePasswordHash(rawPassword);
        source = "password";
      } catch (e) {
        return {
          ok: false,
          code: "config_invalid",
          reason: "derive_failed",
          message: "ADMIN_PASSWORD could not be hashed at startup — use a shorter password or set ADMIN_PASSWORD_HASH.",
          source: null,
          hash: "",
          ignoredHashReason: null,
          passwordTooShort: false,
        };
      }
    }
  } finally {
    /* Do not keep the plain-text secret in the process environment. */
    delete process.env.ADMIN_PASSWORD;
  }

  if (!ADMIN_USERNAME) {
    return {
      ok: false,
      code: "config_missing",
      reason: "missing_username",
      message: "ADMIN_USERNAME is not set — set the admin login name.",
      source: null,
      hash: "",
      ignoredHashReason: null,
      passwordTooShort: false,
    };
  }

  if (!hash) {
    return {
      ok: false,
      code: "config_missing",
      reason: "missing_password",
      message:
        "Neither ADMIN_PASSWORD nor ADMIN_PASSWORD_HASH is set — set ADMIN_PASSWORD to the admin password (the server hashes it at startup).",
      source: null,
      hash: "",
      ignoredHashReason: null,
      passwordTooShort: false,
    };
  }

  return {
    ok: true,
    code: null,
    reason: null,
    message: null,
    source,
    hash,
    ignoredHashReason,
    passwordTooShort: source === "password" && rawPassword.length < MIN_ADMIN_PASSWORD_LENGTH,
  };
}

/** Cached startup configuration (resolved once, before the server listens). */
function validateAdminConfig() {
  return ADMIN_CONFIG;
}

/* Startup diagnostics — presence, shape and flags only. Never prints values. */
function logAdminConfig() {
  const tag = "[ayurveda-clinic] admin";
  const config = validateAdminConfig();
  if (config.code === "config_missing") {
    console.warn(
      `${tag}: DISABLED — set ADMIN_USERNAME and ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH). Admin API answers 503.`
    );
    console.warn(`${tag}: environment variables are read at startup — restart the application after changing them.`);
    return;
  }
  console.log(
    `${tag}: enabled — using ${
      config.source === "password" ? "ADMIN_PASSWORD (hashed in memory at startup)" : "ADMIN_PASSWORD_HASH"
    } from the environment.`
  );
  if (ADMIN_USERNAME !== ADMIN_USERNAME.trim()) {
    console.warn(`${tag}: ADMIN_USERNAME has leading/trailing whitespace — remove it or logins will fail.`);
  }
  if (config.ignoredHashReason) {
    console.warn(
      `${tag}: ADMIN_PASSWORD_HASH is not usable (${config.ignoredHashReason}) — ignoring it and using ADMIN_PASSWORD instead.`
    );
  }
  if (config.ok) {
    if (config.source === "hash") {
      console.log(
        `${tag}: ADMIN_PASSWORD_HASH format OK (scrypt), config fingerprint ${adminHashFingerprint(ADMIN_PASSWORD_HASH)}.`
      );
      console.log(
        `${tag}: that fingerprint must match the one printed by \`npm run check-admin-config\`; if it does not, the old value is still loaded.`
      );
    } else {
      console.log(
        `${tag}: ADMIN_PASSWORD accepted — in-memory scrypt hash derived with a random salt; the plain-text password is not stored or logged.`
      );
      if (config.passwordTooShort) {
        console.warn(
          `${tag}: note — ADMIN_PASSWORD is shorter than ${MIN_ADMIN_PASSWORD_LENGTH} characters; a longer password is safer.`
        );
      }
    }
  } else {
    console.warn(`${tag}: ${config.message}`);
    console.warn(`${tag}: the admin API answers 503 (config_invalid) until this is fixed.`);
  }
  console.log(`${tag}: COOKIE_SECURE ${COOKIE_SECURE ? "=1 (session cookie is Secure; requires HTTPS)" : "unset (session cookie is not Secure — set =1 in production HTTPS)"}.`);
  console.log(`${tag}: environment variables are read at startup — restart the application after changing them.`);
}

/* Resolve the credential once, before any request can arrive. */
ADMIN_CONFIG = resolveAdminConfig();
ADMIN_PASSWORD_HASH = ADMIN_CONFIG.hash || "";


function scryptAsync(password, saltHex, opts) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, Buffer.from(saltHex, "hex"), 64, opts, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

/** Constant-time password check. Runs even for unknown users (dummy salt). */
async function verifyPassword(password, stored) {
  const parsed = parsePasswordHash(stored);
  const salt = parsed ? parsed.salt : crypto.randomBytes(16).toString("hex");
  const opts = parsed ? { N: parsed.N, r: parsed.r, p: parsed.p } : { N: 16384, r: 8, p: 1 };
  try {
    const key = await scryptAsync(String(password || ""), salt, opts);
    if (!parsed) return false;
    const expected = Buffer.from(parsed.hash, "hex");
    return key.length === expected.length && crypto.timingSafeEqual(key, expected);
  } catch (e) {
    return false;
  }
}

function parseCookies(req) {
  const out = {};
  const header = req.headers.cookie;
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

function getSession(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  const s = sessions.get(token);
  if (!s) return null;
  if (s.expires <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { token, ...s };
}

function sessionCookieHeader(token, maxAge) {
  let c = `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
  if (COOKIE_SECURE) c += "; Secure";
  return c;
}

/** Reject cross-site POST/DELETE attempts (browsers send Origin/Referer). */
function badOrigin(req) {
  const origin = req.headers.origin || req.headers.referer;
  if (!origin) return false;
  try {
    return new URL(origin).host !== (req.headers.host || "");
  } catch (e) {
    return true;
  }
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        req.destroy();
        reject(new Error("too large"));
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function clientIp(req) {
  return (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "unknown";
}

function loginBlocked(ip) {
  const a = loginAttempts.get(ip);
  if (!a) return false;
  if (a.reset <= Date.now()) {
    loginAttempts.delete(ip);
    return false;
  }
  return a.count >= LOGIN_LIMIT;
}

function recordFailedLogin(ip) {
  const now = Date.now();
  const a = loginAttempts.get(ip);
  if (!a || a.reset <= now) loginAttempts.set(ip, { count: 1, reset: now + LOGIN_WINDOW_MS });
  else a.count += 1;
}

function uploadTarget(contentType) {
  const type = String(contentType || "").split(";")[0].trim().toLowerCase();
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return null;
}

/** Reject non-image bytes even when the Content-Type claims otherwise. */
function magicMatches(buf, ext) {
  if (buf.length < 12) return false;
  if (ext === "jpg") return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (ext === "png")
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  if (ext === "webp")
    return buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP";
  return false;
}

/**
 * Read the admin-managed content document.
 * Returns {} when the file is missing, unreadable or not a JSON object — the
 * client then falls back to the copy bundled with the site.
 */
async function readContentDoc() {
  try {
    const raw = await fs.promises.readFile(CONTENT_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    return {};
  }
}

/** Write the content document atomically (temp file, then rename). */
async function writeContentDoc(doc) {
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${CONTENT_FILE}.${process.pid}.tmp`;
  await fs.promises.writeFile(tmp, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  await fs.promises.rename(tmp, CONTENT_FILE);
}

/* ---------------------------------------------------------------------------
 * Daily slogan. The published entry and the working draft live in the same
 * content document, but GET /api/content only ever receives the active
 * published entry — the draft is never exposed to public visitors.
 * ------------------------------------------------------------------------- */

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Trim, normalise, strip markup/control characters and cap one text field. */
function cleanSloganText(value, maxLength, multiline = false) {
  if (typeof value !== "string") return "";
  let text = value.normalize("NFC");
  text = multiline
    ? text.replace(/\r\n?/g, "\n").replace(/\t/g, "  ")
    : text.replace(/[\r\n\t]+/g, " ");
  text = text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  // Slogans are plain text: never accept markup from the admin form.
  text = text.replace(/[<>]/g, "");
  return text.trim().slice(0, maxLength);
}

/** Accept a browser datetime-local value only when it is a real date. */
function cleanSloganDate(value) {
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(text)) return "";
  return Number.isNaN(new Date(text).getTime()) ? "" : text;
}

function cleanSloganTimestamp(value) {
  if (typeof value !== "string" || !value.trim()) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function sloganHasVerse(entry) {
  return Boolean(entry && (entry.english || entry.tamil || entry.sanskrit || entry.meaning));
}

function cleanSloganEntry(entry, wantPublished) {
  if (!isPlainObject(entry)) return null;
  const cleaned = {
    heading: cleanSloganText(entry.heading, SLOGAN_LIMITS.heading),
    english: cleanSloganText(entry.english, SLOGAN_LIMITS.english),
    tamil: cleanSloganText(entry.tamil, SLOGAN_LIMITS.tamil),
    sanskrit: cleanSloganText(entry.sanskrit, SLOGAN_LIMITS.sanskrit),
    meaning: cleanSloganText(entry.meaning, SLOGAN_LIMITS.meaning),
    description: cleanSloganText(entry.description, SLOGAN_LIMITS.description, true),
    visible: entry.visible !== false,
    status: wantPublished ? "published" : "draft",
    startAt: cleanSloganDate(entry.startAt),
    endAt: cleanSloganDate(entry.endAt),
    publishedAt: cleanSloganTimestamp(entry.publishedAt),
  };
  if (wantPublished && !cleaned.publishedAt) cleaned.publishedAt = new Date().toISOString();
  return cleaned;
}

/** Validate and normalise an entire slogan section before it is persisted. */
function sanitizeSloganSection(section) {
  if (!isPlainObject(section)) {
    return { ok: false, error: "Invalid slogan section." };
  }
  const published = section.published ? cleanSloganEntry(section.published, true) : null;
  const draft = section.draft ? cleanSloganEntry(section.draft, false) : null;
  if (published && !sloganHasVerse(published)) {
    return { ok: false, error: "Add a slogan in at least one language before publishing." };
  }
  if (published) {
    const start = published.startAt ? new Date(published.startAt).getTime() : null;
    const end = published.endAt ? new Date(published.endAt).getTime() : null;
    if (start !== null && end !== null && end <= start) {
      return { ok: false, error: "The end date must be after the start date." };
    }
  }
  return {
    ok: true,
    value: {
      published,
      draft,
      updatedAt: new Date().toISOString(),
    },
  };
}

function sloganIsActive(published, now = Date.now()) {
  if (!isPlainObject(published) || published.status !== "published" || published.visible === false) {
    return false;
  }
  if (!sloganHasVerse(published)) return false;
  if (published.startAt) {
    const start = new Date(published.startAt).getTime();
    if (!Number.isNaN(start) && now < start) return false;
  }
  if (published.endAt) {
    const end = new Date(published.endAt).getTime();
    if (!Number.isNaN(end) && now > end) return false;
  }
  return true;
}

/** Public projection: active published slogan only, never the draft. */
function publicSloganSection(section) {
  const published = isPlainObject(section) ? section.published : null;
  return {
    published: sloganIsActive(published) ? published : null,
    updatedAt: isPlainObject(section) ? section.updatedAt || "" : "",
  };
}

/**
 * Public, read-only access to the admin-managed content document.
 * Always available (it does not depend on the admin account being set up) so
 * the site can read its content from a plain `npm start` deployment.
 */
async function handleContent(req, res) {
  const doc = await readContentDoc();
  if (Object.prototype.hasOwnProperty.call(doc, "slogan")) {
    doc.slogan = publicSloganSection(doc.slogan);
  }
  sendJson(res, 200, doc, { "Cache-Control": "no-cache" });
}

async function handleAdmin(req, res, pathname) {
  const config = validateAdminConfig();
  if (config.code === "config_missing") {
    sendJson(res, 503, { error: "Admin panel is not configured on this server.", code: "config_missing" });
    return;
  }
  if (!config.ok) {
    // `reason` is a short diagnostic (e.g. "prefixed", "whitespace"); it never
    // contains any part of the credential itself.
    sendJson(res, 503, {
      error: "Admin credential is misconfigured on the server.",
      code: "config_invalid",
      reason: config.reason,
    });
    return;
  }
  const sub = pathname === "/api/admin" ? "/" : pathname.slice("/api/admin".length);

  if (req.method === "POST" && sub === "/login") {
    if (badOrigin(req)) {
      console.warn("[ayurveda-clinic] admin: login rejected — Origin/Referer host does not match Host header.");
      sendJson(res, 403, { error: "Forbidden.", code: "origin_rejected" });
      return;
    }
    const ip = clientIp(req);
    if (loginBlocked(ip)) {
      sendJson(res, 429, { error: "Too many attempts. Try again later.", code: "rate_limited" }, { "Retry-After": "600" });
      return;
    }
    let body;
    try {
      body = await readBody(req, 10 * 1024);
    } catch (e) {
      sendJson(res, 413, { error: "Request too large.", code: "request_too_large" });
      return;
    }
    let creds;
    try {
      creds = JSON.parse(body.toString("utf8"));
    } catch (e) {
      sendJson(res, 400, { error: "Invalid request.", code: "invalid_request" });
      return;
    }
    const okUser = typeof creds.username === "string" && creds.username === ADMIN_USERNAME;
    const okPass = await verifyPassword(creds.password, ADMIN_PASSWORD_HASH);
    if (!okUser || !okPass) {
      recordFailedLogin(ip);
      console.warn(`[ayurveda-clinic] admin: login rejected — ${okUser ? "wrong password" : "unknown username"}.`);
      // Deliberately identical response for unknown user vs wrong password.
      sendJson(res, 401, { error: "Invalid username or password.", code: "invalid_credentials" });
      return;
    }
    loginAttempts.delete(ip);
    // Safe cookie diagnostic: a Secure cookie is dropped by browsers over http.
    const proto = req.headers["x-forwarded-proto"] || (req.socket.encrypted ? "https" : "http");
    if (COOKIE_SECURE && proto !== "https") {
      console.warn("[ayurveda-clinic] admin: COOKIE_SECURE=1 but request was not HTTPS — browsers will drop the session cookie (login won't persist).");
    }
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, { username: ADMIN_USERNAME, expires: Date.now() + SESSION_TTL_MS });
    sendJson(
      res,
      200,
      { ok: true, username: ADMIN_USERNAME },
      { "Set-Cookie": sessionCookieHeader(token, SESSION_TTL_MS / 1000), "Cache-Control": "no-store" }
    );
    return;
  }

  if (req.method === "POST" && sub === "/logout") {
    const s = getSession(req);
    if (s) sessions.delete(s.token);
    sendJson(res, 200, { ok: true }, { "Set-Cookie": sessionCookieHeader("", 0), "Cache-Control": "no-store" });
    return;
  }

  if (req.method === "GET" && sub === "/session") {
    const s = getSession(req);
    if (!s) {
      sendJson(res, 401, { authenticated: false, code: "no_session" }, { "Cache-Control": "no-store" });
      return;
    }
    sendJson(res, 200, { authenticated: true, username: s.username }, { "Cache-Control": "no-store" });
    return;
  }

  /* -------------------------------------------------------------------------
   * Content document (admin-managed About / Products / Diseases copy).
   *   GET /api/admin/content -> the stored document ({} when nothing saved)
   *   PUT /api/admin/content -> merge the supplied top-level sections into
   *                              the stored document and persist it
   * ---------------------------------------------------------------------- */
  if (sub === "/content" && (req.method === "GET" || req.method === "PUT")) {
    const s = getSession(req);
    if (!s) {
      sendJson(res, 401, { error: "Not authenticated.", code: "no_session" });
      return;
    }
    if (req.method === "GET") {
      sendJson(res, 200, await readContentDoc(), { "Cache-Control": "no-store" });
      return;
    }
    if (badOrigin(req)) {
      sendJson(res, 403, { error: "Forbidden.", code: "origin_rejected" });
      return;
    }
    let body;
    try {
      body = await readBody(req, MAX_CONTENT_BYTES);
    } catch (e) {
      sendJson(res, 413, { error: "Content document is too large.", code: "request_too_large" });
      return;
    }
    let patch;
    try {
      patch = JSON.parse(body.toString("utf8"));
    } catch (e) {
      sendJson(res, 400, { error: "Invalid content document.", code: "invalid_request" });
      return;
    }
    if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
      sendJson(res, 400, { error: "Invalid content document.", code: "invalid_request" });
      return;
    }
    if (Object.prototype.hasOwnProperty.call(patch, "slogan")) {
      const slogan = sanitizeSloganSection(patch.slogan);
      if (!slogan.ok) {
        sendJson(res, 400, { error: slogan.error, code: "invalid_slogan" });
        return;
      }
      patch = { ...patch, slogan: slogan.value };
    }
    const next = { ...(await readContentDoc()), ...patch };
    try {
      await writeContentDoc(next);
    } catch (e) {
      console.error(`[ayurveda-clinic] admin: could not write content document: ${e.message}`);
      sendJson(res, 500, { error: "Could not save the content document." });
      return;
    }
    sendJson(res, 200, { ok: true, content: next }, { "Cache-Control": "no-store" });
    return;
  }

  if (req.method === "GET" && sub === "/uploads") {
    const s = getSession(req);
    if (!s) {
      sendJson(res, 401, { error: "Not authenticated.", code: "no_session" });
      return;
    }
    let names = [];
    try {
      names = await fs.promises.readdir(UPLOADS_DIR);
    } catch (e) {
      names = [];
    }
    const files = [];
    for (const name of names) {
      if (!UPLOAD_NAME_RE.test(name)) continue;
      try {
        const st = await fs.promises.stat(path.join(UPLOADS_DIR, name));
        if (st.isFile()) files.push({ name, url: `/uploads/${name}`, size: st.size, mtime: st.mtime.toISOString() });
      } catch (e) {
        /* skip unreadable entries */
      }
    }
    files.sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
    sendJson(res, 200, { files }, { "Cache-Control": "no-store" });
    return;
  }

  if (req.method === "POST" && sub === "/uploads") {
    const s = getSession(req);
    if (!s) {
      sendJson(res, 401, { error: "Not authenticated.", code: "no_session" });
      return;
    }
    if (badOrigin(req)) {
      sendJson(res, 403, { error: "Forbidden." });
      return;
    }
    const ext = uploadTarget(req.headers["content-type"]);
    if (!ext) {
      sendJson(res, 415, { error: "Only JPEG, PNG or WebP images are accepted." });
      return;
    }
    const declared = Number(req.headers["content-length"] || "0");
    if (declared > MAX_UPLOAD_BYTES) {
      sendJson(res, 413, { error: "Image must be 5 MB or smaller." });
      return;
    }
    let buf;
    try {
      buf = await readBody(req, MAX_UPLOAD_BYTES + 1024);
    } catch (e) {
      sendJson(res, 413, { error: "Image must be 5 MB or smaller." });
      return;
    }
    if (buf.length === 0 || buf.length > MAX_UPLOAD_BYTES || !magicMatches(buf, ext)) {
      sendJson(res, 422, { error: "File is not a valid image." });
      return;
    }
    const name = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
    try {
      await fs.promises.writeFile(path.join(UPLOADS_DIR, name), buf, { flag: "wx" });
    } catch (e) {
      sendJson(res, 500, { error: "Could not store the image." });
      return;
    }
    sendJson(res, 201, { ok: true, name, url: `/uploads/${name}`, size: buf.length });
    return;
  }

  if (req.method === "DELETE" && sub.startsWith("/uploads/")) {
    const s = getSession(req);
    if (!s) {
      sendJson(res, 401, { error: "Not authenticated.", code: "no_session" });
      return;
    }
    if (badOrigin(req)) {
      sendJson(res, 403, { error: "Forbidden." });
      return;
    }
    const name = sub.slice("/uploads/".length);
    if (!UPLOAD_NAME_RE.test(name)) {
      sendJson(res, 404, { error: "Not found." });
      return;
    }
    try {
      await fs.promises.unlink(path.join(UPLOADS_DIR, name));
    } catch (e) {
      sendJson(res, 404, { error: "Not found." });
      return;
    }
    sendJson(res, 200, { ok: true, name });
    return;
  }

  sendJson(res, 404, { error: "Not found." });
}

/** Public read-only serving of admin-uploaded images (no listing, no fallback). */
function handleUploads(req, res, pathname) {
  const name = pathname === "/uploads" ? "" : pathname.slice("/uploads/".length);
  if (!UPLOAD_NAME_RE.test(name)) {
    notFound(res);
    return;
  }
  const filePath = path.normalize(path.join(UPLOADS_DIR, name));
  if (filePath !== path.join(UPLOADS_DIR, name) || !filePath.startsWith(UPLOADS_DIR + path.sep)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      notFound(res);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Content-Length": stats.size,
      "Cache-Control": "public, max-age=86400",
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch (e) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return;
  }

  // Public read-only content document (the admin-managed site copy).
  if (pathname === "/api/content") {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Method Not Allowed" }));
      return;
    }
    handleContent(req, res).catch((err) => {
      console.error(`[ayurveda-clinic] content error: ${err.message}`);
      sendJson(res, 500, { error: "Internal error." });
    });
    return;
  }

  // Admin API (server-side authenticated; 503 when not configured).
  if (pathname === "/api/admin" || pathname.startsWith("/api/admin/")) {
    handleAdmin(req, res, pathname).catch((err) => {
      console.error(`[ayurveda-clinic] admin error: ${err.message}`);
      sendJson(res, 500, { error: "Internal error." });
    });
    return;
  }

  // Public read-only access to admin-uploaded images.
  if (pathname === "/uploads" || pathname.startsWith("/uploads/")) {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Method Not Allowed");
      return;
    }
    handleUploads(req, res, pathname);
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return;
  }

  const filePath = path.normalize(path.join(DIST_DIR, pathname));
  if (filePath !== DIST_DIR && !filePath.startsWith(DIST_DIR + path.sep)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, filePath, stats, req.method);
      return;
    }
    // Missing file: real assets 404, client routes fall back to index.html.
    if (path.extname(pathname) !== "") {
      notFound(res);
      return;
    }
    fs.stat(INDEX_FILE, (ierr, istats) => {
      if (ierr || !istats.isFile()) {
        notFound(res);
        return;
      }
      sendFile(res, INDEX_FILE, istats, req.method);
    });
  });
});

server.on("error", (err) => {
  console.error(`[ayurveda-clinic] server error: ${err.message}`);
});

server.listen(PORT, HOST, () => {
  console.log(`[ayurveda-clinic] serving ${DIST_DIR} at http://${HOST}:${PORT}`);
  logAdminConfig();
});
