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
 * the password hash comes from ADMIN_PASSWORD_HASH, sessions are opaque
 * random tokens in an HttpOnly cookie, and no secret is logged or returned.
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
 *   ADMIN_PASSWORD_HASH  scrypt hash from `npm run hash-password`
 *                        format: $scrypt$N=<n>,r=<r>,p=<p>$<saltHex>$<hashHex>
 *   COOKIE_SECURE       set to "1" in production (HTTPS) so the session
 *                        cookie carries the Secure flag; leave unset for
 *                        local http testing.
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
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const COOKIE_SECURE = process.env.COOKIE_SECURE === "1";
const ADMIN_ENABLED = Boolean(ADMIN_USERNAME && ADMIN_PASSWORD_HASH);
const UPLOADS_DIR = path.join(__dirname, "uploads");
const DATA_DIR = path.join(__dirname, "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const MAX_CONTENT_BYTES = 512 * 1024;
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

/* Startup diagnostics — presence, shape and flags only. Never prints values. */
function logAdminConfig() {
  const tag = "[ayurveda-clinic] admin";
  if (!ADMIN_ENABLED) {
    console.warn(`${tag}: DISABLED — set ADMIN_USERNAME and ADMIN_PASSWORD_HASH. Admin API answers 503.`);
    return;
  }
  console.log(`${tag}: enabled — reading ADMIN_USERNAME + ADMIN_PASSWORD_HASH from the environment.`);
  if (ADMIN_USERNAME !== ADMIN_USERNAME.trim()) {
    console.warn(`${tag}: ADMIN_USERNAME has leading/trailing whitespace — remove it or logins will fail.`);
  }
  if (ADMIN_PASSWORD_HASH !== ADMIN_PASSWORD_HASH.trim()) {
    console.warn(`${tag}: ADMIN_PASSWORD_HASH has leading/trailing whitespace/newline — remove it or logins will fail.`);
  }
  if (ADMIN_PASSWORD_HASH.startsWith("ADMIN_PASSWORD_HASH=")) {
    console.warn(`${tag}: ADMIN_PASSWORD_HASH starts with "ADMIN_PASSWORD_HASH=" — paste ONLY the value that begins with "$scrypt$".`);
  }
  if (parsePasswordHash(ADMIN_PASSWORD_HASH)) {
    console.log(`${tag}: ADMIN_PASSWORD_HASH format OK (scrypt).`);
  } else {
    console.warn(`${tag}: ADMIN_PASSWORD_HASH is malformed — expected "$scrypt$N=16384,r=8,p=1$<saltHex>$<hashHex>". Logins will fail until fixed.`);
  }
  console.log(`${tag}: COOKIE_SECURE ${COOKIE_SECURE ? "=1 (session cookie is Secure; requires HTTPS)" : "unset (cookie not Secure — set =1 in production HTTPS)"}.`);
}

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

/**
 * Public, read-only access to the admin-managed content document.
 * Always available (it does not depend on the admin account being set up) so
 * the site can read its content from a plain `npm start` deployment.
 */
async function handleContent(req, res) {
  const doc = await readContentDoc();
  sendJson(res, 200, doc, { "Cache-Control": "no-cache" });
}

async function handleAdmin(req, res, pathname) {
  if (!ADMIN_ENABLED) {
    sendJson(res, 503, { error: "Admin panel is not configured on this server.", code: "config_missing" });
    return;
  }
  if (!parsePasswordHash(ADMIN_PASSWORD_HASH)) {
    sendJson(res, 503, { error: "Admin credential is misconfigured on the server.", code: "config_invalid" });
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
