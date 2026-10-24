/*
 * API tests for patient enquiries (database + public submission + admin panel).
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateHash } from "./password-hash.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PORT = 3997;
const BASE = `http://127.0.0.1:${PORT}`;

const failures = [];
function check(name, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures.push(name);
}

const PASSWORD = "throwaway-enquiry-test-pass-01";
const USERNAME = "enqtest";
const TMP_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "sbap-enq-test-"));
const DB_FILE = path.join(TMP_DIR, "enquiries.sqlite");

function startServer() {
  const child = spawn(process.execPath, [path.join(ROOT, "server.js")], {
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(PORT),
      ADMIN_USERNAME: USERNAME,
      ADMIN_PASSWORD_HASH: generateHash(PASSWORD),
      ENQUIRIES_DB_FILE: DB_FILE,
      ENQUIRY_RATE_LIMIT: "100"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const logs = [];
  child.stdout.on("data", (d) => logs.push(d.toString()));
  child.stderr.on("data", (d) => logs.push(d.toString()));
  return { child, logs };
}

async function waitReady() {
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(`${BASE}/api/admin/session`);
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  return false;
}

function readCookie(res) {
  const cookie = res.headers.get("set-cookie") || "";
  return cookie.split(";")[0];
}

let currentChild;
async function run() {
  const srv = startServer();
  currentChild = srv.child;
  try {
    check("enquiry server ready", await waitReady());

    const getPub = await fetch(`${BASE}/api/enquiries`);
    check("GET /api/enquiries is rejected", getPub.status !== 200);

    const listNoAuth = await fetch(`${BASE}/api/admin/enquiries`);
    check("GET /api/admin/enquiries requires auth", listNoAuth.status === 401);

    const bad1 = await fetch(`${BASE}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientName: "", consent: true }) });
    check("POST /api/enquiries requires name", bad1.status === 422);
    const bad2 = await fetch(`${BASE}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientName: "Ravi", consent: true }) });
    check("POST /api/enquiries requires a contact", bad2.status === 422);
    const bad3 = await fetch(`${BASE}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientName: "Ravi", phone: "+91 96299 07763", consent: false }) });
    check("POST /api/enquiries requires consent", bad3.status === 422);
    const bad4 = await fetch(`${BASE}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientName: "Ravi", email: "not-an-email", phone: "", consent: true }) });
    check("POST /api/enquiries rejects invalid email", bad4.status === 422);

    const bot = await fetch(`${BASE}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientName: "Bot", email: "bot@example.com", consent: true, website: "http://spam.example" }) });
    const botJson = await bot.json().catch(() => ({}));
    check("honeypot accepted without creating a record", bot.status === 201 && botJson.ok === true);

    const refId = "12345678-1234-1234-1234-123456789012";
    const res1 = await fetch(`${BASE}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientName: "  Meera  ", email: "meera@example.com", phone: "", locality: "Karur", age: "35", preferredDate: "2026-11-03", healthConcern: "General wellness", consent: true, requestId: refId }) });
    const j1 = await res1.json().catch(() => ({}));
    check("POST /api/enquiries accepts valid submission", (res1.status === 201 || res1.status === 200) && j1.ok === true && typeof j1.reference === "string" && j1.reference.startsWith("ENQ-"));

    const res2 = await fetch(`${BASE}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientName: "Meera", email: "meera@example.com", consent: true, requestId: refId }) });
    const j2 = await res2.json().catch(() => ({}));
    check("duplicate submission returns existing reference", res2.status === 200 && j2.duplicate === true && j2.reference === j1.reference);

    const loginRes = await fetch(`${BASE}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: USERNAME, password: PASSWORD }) });
    const cookie = readCookie(loginRes);
    check("admin login for enquiries", loginRes.status === 200 && cookie.startsWith("sbap_admin="));

    const listRes = await fetch(`${BASE}/api/admin/enquiries`, { headers: { cookie } });
    const listJson = await listRes.json().catch(() => ({}));
    check("authenticated GET /api/admin/enquiries returns items", listRes.status === 200 && Array.isArray(listJson.items));
    const total = listJson.items?.length || 0;
    check("public and bot submissions do not create admin records", total === 1);
    const item = listJson.items?.[0];
    check("enquiry normalises name", item && item.patientName === "Meera");
    check("enquiry excludes request token", item && !("requestToken" in item));

    const searchRes = await fetch(`${BASE}/api/admin/enquiries?q=Meera`, { headers: { cookie } });
    const searchJson = await searchRes.json().catch(() => ({}));
    check("search by name works", searchRes.status === 200 && (searchJson.items?.length || 0) >= 1);

    const detailRes = await fetch(`${BASE}/api/admin/enquiries/${item.id}`, { headers: { cookie } });
    const detailJson = await detailRes.json().catch(() => ({}));
    check("GET /api/admin/enquiries/:id returns detail", detailRes.status === 200 && detailJson.enquiry?.id === item.id);

    const patchRes = await fetch(`${BASE}/api/admin/enquiries/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie }, body: JSON.stringify({ status: "contacted" }) });
    const patchJson = await patchRes.json().catch(() => ({}));
    check("PATCH /api/admin/enquiries/:id updates status", patchRes.status === 200 && patchJson.enquiry?.status === "contacted");

    const csvRes = await fetch(`${BASE}/api/admin/enquiries/export.csv`, { headers: { cookie } });
    const csvText = await csvRes.text();
    check("GET /api/admin/enquiries/export.csv returns CSV", csvRes.status === 200 && (csvText.includes("Reference") || csvText.startsWith("\ufeff")));
    check("CSV contains patient name", csvText.includes("Meera"));

    const delRes = await fetch(`${BASE}/api/admin/enquiries/${item.id}`, { method: "DELETE", headers: { cookie } });
    check("DELETE /api/admin/enquiries/:id removes record", delRes.status === 200);

    currentChild.kill("SIGTERM");
    await new Promise((r) => setTimeout(r, 600));

    const srv2 = startServer();
    currentChild = srv2.child;
    check("server restarted with same DB", await waitReady());
    const loginRes2 = await fetch(`${BASE}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: USERNAME, password: PASSWORD }) });
    const cookie2 = readCookie(loginRes2);
    const listRes2 = await fetch(`${BASE}/api/admin/enquiries`, { headers: { cookie: cookie2 } });
    const listJson2 = await listRes2.json().catch(() => ({}));
    check("enquiries persist after restart", listRes2.status === 200 && (listJson2.items?.length || 0) === 0);

    const res3 = await fetch(`${BASE}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientName: "Kumar", phone: "9876543210", consent: true, requestId: "22345678-1234-1234-1234-123456789012" }) });
    await res3.json().catch(() => ({}));
    const loginRes3 = await fetch(`${BASE}/api/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: USERNAME, password: PASSWORD }) });
    const cookie3 = readCookie(loginRes3);
    const list3 = await fetch(`${BASE}/api/admin/enquiries`, { headers: { cookie: cookie3 } });
    const lj3 = await list3.json().catch(() => ({}));
    const it3 = lj3.items?.[0];
    const badPatch = await fetch(`${BASE}/api/admin/enquiries/${it3.id}`, { method: "PATCH", headers: { "Content-Type": "application/json", cookie: cookie3 }, body: JSON.stringify({ status: "open" }) });
    check("PATCH rejects invalid status", badPatch.status === 400);
  } finally {
    try { if (currentChild) currentChild.kill("SIGTERM"); } catch {}
    try { fs.rmSync(TMP_DIR, { recursive: true, force: true }); } catch {}
  }

  console.log("\n" + (failures.length ? `FAILED: ${failures.join(", ")}` : "ALL ENQUIRIES TESTS PASSED"));
  process.exit(failures.length ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  try { if (currentChild) currentChild.kill("SIGTERM"); } catch {}
  try { fs.rmSync(TMP_DIR, { recursive: true, force: true }); } catch {}
  process.exit(1);
});
