/*
 * Minimal static server for the Sri Bhuvaneshwari Ayurveda Peedam website.
 *
 * This project is a static Vite SPA (React Router). The production build lives
 * in client/dist. Hostinger's Node.js Web App needs a process to start, so this
 * zero-dependency server serves the built files and falls back to index.html for
 * client-side routes. It does not add any API, database or admin behaviour.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

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

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch (e) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
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
});
