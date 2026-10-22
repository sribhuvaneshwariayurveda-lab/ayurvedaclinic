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
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateHash } from "./password-hash.mjs";

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

const PASSWORD = "throwaway-content-test-pass-01";
const USERNAME = "contenttest";

function startServer() {
  const child = spawn(process.execPath, [path.join(ROOT, "server.js")], {
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(PORT),
      ADMIN_USERNAME: USERNAME,
      ADMIN_PASSWORD_HASH: generateHash(PASSWORD)
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

let { child, logs } = startServer();
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
  let cookie = (loginRes.headers.get("set-cookie") || "").split(";")[0];
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

  // 6d. the daily slogan keeps drafts private until published
  const sloganDraft = {
    heading: "Draft heading",
    english: "Draft text that visitors must not see.",
    tamil: "வரைவு உரை",
    sanskrit: "",
    meaning: "",
    description: "Working note.",
    visible: true,
    startAt: "",
    endAt: ""
  };
  const draftPut = await putJson(`${BASE}/api/admin/content`, { slogan: { published: null, draft: sloganDraft } }, cookie);
  check("saving a slogan draft succeeds", draftPut.status === 200);
  const pubDraft = await getJson(`${BASE}/api/content`);
  check("an unpublished slogan is not shown publicly", pubDraft.data.slogan && pubDraft.data.slogan.published === null);
  check("the public content never exposes the slogan draft", pubDraft.data.slogan && !("draft" in pubDraft.data.slogan));
  const adminDraft = await getJson(`${BASE}/api/admin/content`, cookie);
  check(
    "the authenticated content endpoint still returns the draft",
    adminDraft.data && adminDraft.data.slogan && adminDraft.data.slogan.draft.english === sloganDraft.english
  );

  const publishedSlogan = {
    heading: "Published <b>test</b>",
    english: "English Unicode – health ✓",
    tamil: "தமிழ் சோதனை",
    sanskrit: "स्वस्थस्य स्वास्थ्य रक्षणं",
    meaning: "To preserve health.",
    description: "First line.\nSecond line.",
    visible: true,
    startAt: "",
    endAt: ""
  };
  const publishPut = await putJson(
    `${BASE}/api/admin/content`,
    { slogan: { published: publishedSlogan, draft: sloganDraft } },
    cookie
  );
  check("publishing a slogan succeeds", publishPut.status === 200);
  const pubPublished = await getJson(`${BASE}/api/content`);
  const live = pubPublished.data.slogan && pubPublished.data.slogan.published;
  check("a published slogan is shown publicly", Boolean(live));
  check("the published status is set by the server", live && live.status === "published");
  check("English Unicode survives publishing", live && live.english === publishedSlogan.english);
  check("Tamil Unicode survives publishing", live && live.tamil === publishedSlogan.tamil);
  check("Sanskrit Unicode survives publishing", live && live.sanskrit === publishedSlogan.sanskrit);
  check("multiline descriptions are preserved", live && live.description.includes("\n"));
  check("markup is stripped from slogan text", live && !/[<>]/.test(live.heading));
  check("the public payload still hides the draft", pubPublished.data.slogan && !("draft" in pubPublished.data.slogan));

  const futurePut = await putJson(
    `${BASE}/api/admin/content`,
    { slogan: { published: { ...publishedSlogan, startAt: "2099-01-01T00:00" }, draft: sloganDraft } },
    cookie
  );
  check("saving a scheduled slogan succeeds", futurePut.status === 200);
  const pubFuture = await getJson(`${BASE}/api/content`);
  check("a future schedule hides the slogan", pubFuture.data.slogan && pubFuture.data.slogan.published === null);

  const expiredPut = await putJson(
    `${BASE}/api/admin/content`,
    { slogan: { published: { ...publishedSlogan, endAt: "2000-01-01T00:00" }, draft: sloganDraft } },
    cookie
  );
  check("saving an ended schedule succeeds", expiredPut.status === 200);
  const pubExpired = await getJson(`${BASE}/api/content`);
  check("an expired schedule hides the slogan", pubExpired.data.slogan && pubExpired.data.slogan.published === null);

  const emptyPublish = await putJson(
    `${BASE}/api/admin/content`,
    { slogan: { published: { heading: "No verse", visible: true }, draft: null } },
    cookie
  );
  check("publishing without any slogan text is rejected", emptyPublish.status === 400);

  const badRange = await putJson(
    `${BASE}/api/admin/content`,
    {
      slogan: {
        published: { ...publishedSlogan, startAt: "2030-01-02T00:00", endAt: "2030-01-01T00:00" },
        draft: sloganDraft
      }
    },
    cookie
  );
  check("an end date before the start date is rejected", badRange.status === 400);

  const finalPublish = await putJson(
    `${BASE}/api/admin/content`,
    { slogan: { published: publishedSlogan, draft: sloganDraft } },
    cookie
  );
  check("republishing the active slogan succeeds", finalPublish.status === 200);

  // 6e. the slogan survives a full server restart
  child.kill();
  await new Promise((r) => setTimeout(r, 350));
  ({ child, logs } = startServer());
  check("server restarted for the persistence check", await waitReady());
  const pubAfterRestart = await getJson(`${BASE}/api/content`);
  check(
    "the published slogan persists across a restart",
    pubAfterRestart.data.slogan &&
      pubAfterRestart.data.slogan.published &&
      pubAfterRestart.data.slogan.published.english === publishedSlogan.english
  );
  const relogin = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password: PASSWORD })
  });
  cookie = (relogin.headers.get("set-cookie") || "").split(";")[0];
  check("login succeeds after the restart", relogin.status === 200 && /^sbap_admin=/.test(cookie));

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
