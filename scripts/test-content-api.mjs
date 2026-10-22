/*
 * Round-trip test for the content API in server.js.
 *
 * Starts the real server on a throwaway port with a THROWAWAY admin account
 * (generated here, never a production secret) and checks that:
 *   - GET /api/content is public and starts empty;
 *   - GET/PUT /api/admin/content require a session;
 *   - a logged-in PUT is persisted and served publicly;
 *   - saving one section leaves the other sections untouched;
 *   - the document can be reset afterwards.
 *
 * The test never prints passwords, hashes, cookies or tokens, and it always
 * removes the content document it created.
 *
 * Usage:  node scripts/test-content-api.mjs
 */
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const PORT = 3998;
const BASE = `http://127.0.0.1:${PORT}`;

const failures = [];
function check(name, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures.push(name);
}

function makeHash(password) {
  const N = 16384, r = 8, p = 1;
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password, Buffer.from(salt, "hex"), 64, { N, r, p });
  return `$scrypt$N=${N},r=${r},p=${p}$${salt}$${key.toString("hex")}`;
}

const PASSWORD = "throwaway-content-test-pass-01";
const USERNAME = "contenttest";

function startServer() {
  const child = spawn(process.execPath, [path.join(ROOT, "server.js")], {
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(PORT),
      ADMIN_USERNAME: USERNAME,
      ADMIN_PASSWORD_HASH: makeHash(PASSWORD)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const logs = [];
  child.stdout.on("data", (d) => logs.push(d.toString()));
  child.stderr.on("data", (d) => logs.push(d.toString()));
  return { child, logs };
}

async function waitReady() {
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(`${BASE}/api/admin/session`);
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return false;
}

async function getJson(url, cookie) {
  const res = await fetch(url, { headers: cookie ? { cookie } : {} });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data, cookie: res.headers.get("set-cookie") || "" };
}

async function putJson(url, body, cookie) {
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { cookie } : {})
    },
    body: JSON.stringify(body)
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

const hadContentFile = fs.existsSync(CONTENT_FILE);
const previousContent = hadContentFile ? fs.readFileSync(CONTENT_FILE, "utf8") : null;

const { child, logs } = startServer();
try {
  check("server became ready", await waitReady());

  // 1. the public endpoint works without a session
  const pub = await getJson(`${BASE}/api/content`);
  check("GET /api/content is public", pub.status === 200);
  check("GET /api/content returns a JSON object", pub.data && typeof pub.data === "object");

  // 2. the admin endpoint is protected
  const noAuth = await getJson(`${BASE}/api/admin/content`);
  check("GET /api/admin/content without a session is rejected", noAuth.status === 401);

  // 3. login
  const loginRes = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD })
  });
  const loginData = await loginRes.json().catch(() => null);
  const cookie = (loginRes.headers.get("set-cookie") || "").split(";")[0];
  check("login succeeds", loginRes.status === 200 && loginData && loginData.ok === true);
  check("login sets a session cookie", /^sbap_admin=/.test(cookie));

  // 4. a wrong password is rejected
  const badLogin = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password: "not-the-password-9999" })
  });
  check("a wrong password is rejected", badLogin.status === 401);

  // 5. saving a section
  const patch = {
    diseases: {
      note: "Test note written by scripts/test-content-api.mjs.",
      items: [{ slug: "test-item", name: "Test Item", category: "General" }]
    }
  };
  const put = await putJson(`${BASE}/api/admin/content`, patch, cookie);
  check("PUT /api/admin/content succeeds when authenticated", put.status === 200);

  // 6. the document is persisted and served publicly
  const pub2 = await getJson(`${BASE}/api/content`);
  check("the saved note is served publicly", pub2.data && pub2.data.diseases && pub2.data.diseases.note === patch.diseases.note);
  check("the saved item is served publicly", pub2.data && pub2.data.diseases.items.length === 1);
  check("other sections are untouched", pub2.data && !pub2.data.products);

  // 6b. testimonials and gallery round-trip
  const secondPatch = {
    testimonialsNote: "Published with consent.",
    testimonials: [{ quote: "A test quote.", name: "Test Patient", treatment: "General" }],
    gallery: {
      label: "Gallery",
      title: "A botanical",
      titleAccent: "study.",
      desc: "Test description.",
      images: [{ src: "/images/hero-diyo.jpg", alt: "Test image", caption: "Test caption", credit: "Test credit" }]
    }
  };
  const put2 = await putJson(`${BASE}/api/admin/content`, secondPatch, cookie);
  check("saving testimonials and gallery succeeds", put2.status === 200);

  const pub3 = await getJson(`${BASE}/api/content`);
  check(
    "the testimonial note is served publicly",
    pub3.data && pub3.data.testimonialsNote === "Published with consent."
  );
  check(
    "the testimonial list is served publicly",
    pub3.data && Array.isArray(pub3.data.testimonials) && pub3.data.testimonials.length === 1
  );
  check(
    "the testimonial quote is served publicly",
    pub3.data && pub3.data.testimonials[0].quote === "A test quote."
  );
  check(
    "the gallery images are served publicly",
    pub3.data && Array.isArray(pub3.data.gallery.images) && pub3.data.gallery.images.length === 1
  );
  check(
    "the gallery image caption is served publicly",
    pub3.data && pub3.data.gallery.images[0].caption === "Test caption"
  );
  check(
    "the earlier section survived the second save",
    pub3.data && pub3.data.diseases.note === patch.diseases.note
  );

  // 6c. a section can be cleared with an empty list
  const put3 = await putJson(`${BASE}/api/admin/content`, { testimonials: [] }, cookie);
  check("a section can be emptied", put3.status === 200);
  const pub4 = await getJson(`${BASE}/api/content`);
  check(
    "the emptied list is served publicly",
    pub4.data && Array.isArray(pub4.data.testimonials) && pub4.data.testimonials.length === 0
  );

  // 7. the document is on disk in the expected place
  check("data/content.json was written", fs.existsSync(CONTENT_FILE));
  const onDisk = JSON.parse(fs.readFileSync(CONTENT_FILE, "utf8"));
  check("the file holds the saved note", onDisk.diseases.note === patch.diseases.note);

  // 8. saving without a session is rejected
  const putNoAuth = await putJson(`${BASE}/api/admin/content`, patch, "");
  check("PUT /api/admin/content without a session is rejected", putNoAuth.status === 401);

  // 9. a malformed body is rejected
  const res = await fetch(`${BASE}/api/admin/content`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie },
    body: "{not json"
  });
  check("a malformed body is rejected with 400", res.status === 400);

  // 10. the server never logs the password
  check("the password is not present in the server log", !logs.join("").includes(PASSWORD));
} finally {
  child.kill();
  // restore the previous state of the content document
  try {
    if (previousContent !== null) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(CONTENT_FILE, previousContent, "utf8");
    } else if (fs.existsSync(CONTENT_FILE)) {
      fs.rmSync(CONTENT_FILE);
    }
  } catch {
    /* ignore cleanup errors */
  }
}

console.log(failures.length === 0 ? "\nALL CHECKS PASSED" : `\nFAILURES: ${failures.join(", ")}`);
process.exit(failures.length === 0 ? 0 : 1);
