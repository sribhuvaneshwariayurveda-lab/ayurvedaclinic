/* Test for the admin panel UI (client/src/pages/Admin.jsx).
 *
 * Renders the production bundle in jsdom with the admin API stubbed, then
 * checks that the signed-in panel exposes the content editors and that the
 * editors load the bundled content.
 *
 * Usage (from client/):  npm run build && node scripts/admin-panel.test.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, "..", "dist", "assets");

if (!fs.existsSync(assetsDir)) {
  console.error("dist/assets not found — run `npm run build` first.");
  process.exit(1);
}

const failures = [];
function check(name, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures.push(name);
}

const bundleFile = fs.readdirSync(assetsDir).find((f) => f.endsWith(".js"));

const dom = new JSDOM(`<!doctype html><html><head></head><body><div id="root"></div></body></html>`, {
  url: "http://localhost/admin",
  pretendToBeVisual: true
});
const { window } = dom;
window.scrollTo = () => {};
const errors = [];
window.addEventListener("error", (e) => errors.push(e.message || String(e.error)));

for (const [key, value] of Object.entries({
  window,
  document: window.document,
  navigator: window.navigator,
  location: window.location,
  history: window.history,
  localStorage: window.localStorage,
  HTMLElement: window.HTMLElement,
  Element: window.Element,
  Node: window.Node,
  CustomEvent: window.CustomEvent,
  Event: window.Event,
  MutationObserver: window.MutationObserver,
  getComputedStyle: window.getComputedStyle,
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window)
})) {
  try {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  } catch {
    /* leave native global in place */
  }
}

/* --- stub the admin + content API --------------------------------------- */
const calls = { contentPut: null };
globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  const json = (status, body) =>
    Promise.resolve({
      status,
      ok: status >= 200 && status < 300,
      json: async () => body,
      headers: { get: () => null }
    });
  if (url.includes("/api/admin/session")) {
    return json(200, { authenticated: true, username: "paneltest" });
  }
  if (url.includes("/api/admin/login")) {
    return json(200, { ok: true, username: "paneltest" });
  }
  if (url.includes("/api/admin/content")) {
    if ((init.method || "GET").toUpperCase() === "PUT") {
      calls.contentPut = JSON.parse(init.body);
      return json(200, { ok: true });
    }
    return json(200, {});
  }
  if (url.includes("/api/admin/uploads")) {
    return json(200, { files: [] });
  }
  if (url.includes("/api/content")) {
    return json(200, {});
  }
  return json(404, { error: "Not found" });
};

await import(pathToFileURL(path.join(assetsDir, bundleFile)).href);
await new Promise((r) => setTimeout(r, 400));

const doc = window.document;
const root = doc.getElementById("root");

check("admin panel renders the signed-in view", root.innerHTML.includes("Signed in as"));
check("the Images tab is present", root.innerHTML.includes("Upload an image"));
check("the About Us tab is present", root.innerHTML.includes("About Us"));
check("the Products tab is present", root.innerHTML.includes("Products"));
check("the Diseases tab is present", root.innerHTML.includes("Diseases"));
check("the Testimonials tab is present", root.innerHTML.includes("Testimonials"));
check("the Gallery tab is present", root.innerHTML.includes("Gallery"));
check("no secrets are rendered", !root.innerHTML.includes("ADMIN_PASSWORD"));

/* --- switch tabs and check the editors load the bundled content ---------- */
function clickTab(label) {
  const button = [...doc.querySelectorAll(".admin-tab")].find(
    (b) => b.textContent.trim() === label
  );
  if (!button) return false;
  button.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  return true;
}

await new Promise((r) => setTimeout(r, 150));

check("the About Us tab opens", clickTab("About Us"));
await new Promise((r) => setTimeout(r, 150));
check("the About editor loads the bundled copy", root.innerHTML.includes("Our story"));
check("the About editor lists the focus areas", root.innerHTML.includes("Respiratory health"));

check("the Products tab opens", clickTab("Products"));
await new Promise((r) => setTimeout(r, 150));
check("the product editor lists the bundled products", root.innerHTML.includes("Kidney Care Syrup"));
check("the product editor lists the new products", root.innerHTML.includes("Ayurvedic Hair Oil"));
check("the product editor shows the poster image field", root.innerHTML.includes("/images/products/ayurvedic-hair-oil.jpg"));
check("the product editor has a save button", root.innerHTML.includes("Save Products"));

check("the Diseases tab opens", clickTab("Diseases"));
await new Promise((r) => setTimeout(r, 150));
check("the condition editor lists the bundled conditions", root.innerHTML.includes("Asthma"));
check("the condition editor shows the illustration path", root.innerHTML.includes("/images/diseases/asthma.jpg"));
check("the condition editor has a save button", root.innerHTML.includes("Save Conditions"));

check("the Testimonials tab opens", clickTab("Testimonials"));
await new Promise((r) => setTimeout(r, 150));
check("the testimonial editor shows the consent note field", root.innerHTML.includes("Consent note"));
check("the testimonial editor has an add button", root.innerHTML.includes("Add testimonial"));
check("the testimonial editor has a save button", root.innerHTML.includes("Save Testimonials"));
check("no testimonial is published by default", !root.innerHTML.includes("testi-card"));

check("the Gallery tab opens", clickTab("Gallery"));
await new Promise((r) => setTimeout(r, 150));
check("the gallery editor shows the bundled images", root.innerHTML.includes("/images/hero-diyo.jpg"));
check("the gallery editor has an add button", root.innerHTML.includes("Add image"));
check("the gallery editor has a save button", root.innerHTML.includes("Save Gallery"));

/* --- saving ------------------------------------------------------------- */
check("the Diseases tab opens for saving", clickTab("Diseases"));
await new Promise((r) => setTimeout(r, 150));
const saveButton = [...doc.querySelectorAll("button")].find(
  (b) => b.textContent.trim() === "Save Conditions"
);
check("the save button can be found", Boolean(saveButton));
if (saveButton) {
  saveButton.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  await new Promise((r) => setTimeout(r, 250));
  check("saving sends the diseases section to the API", Boolean(calls.contentPut));
  check("saving sends the whole diseases section", Boolean(calls.contentPut && calls.contentPut.diseases && Array.isArray(calls.contentPut.diseases.items)));
  check("the save confirmation is shown", root.innerHTML.includes("now live on the site"));
}

/* --- saving testimonials and gallery ------------------------------------- */
function clickButton(label) {
  const button = [...doc.querySelectorAll("button")].find(
    (b) => b.textContent.trim() === label
  );
  if (!button) return false;
  button.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
  return true;
}

check("the Testimonials tab opens for saving", clickTab("Testimonials"));
await new Promise((r) => setTimeout(r, 150));
check("the testimonial save button can be found", clickButton("Save Testimonials"));
await new Promise((r) => setTimeout(r, 250));
check(
  "saving testimonials sends the note and the list",
  Boolean(calls.contentPut && "testimonialsNote" in calls.contentPut && "testimonials" in calls.contentPut)
);

check("the Gallery tab opens for saving", clickTab("Gallery"));
await new Promise((r) => setTimeout(r, 150));
check("the gallery save button can be found", clickButton("Save Gallery"));
await new Promise((r) => setTimeout(r, 250));
check(
  "saving the gallery sends the gallery section",
  Boolean(calls.contentPut && calls.contentPut.gallery && Array.isArray(calls.contentPut.gallery.images))
);

check("no runtime errors", errors.length === 0);
if (errors.length) console.log("errors:", errors);

console.log(failures.length === 0 ? "\nALL CHECKS PASSED" : `\n${failures.length} CHECK(S) FAILED`);
process.exit(failures.length ? 1 : 0);
