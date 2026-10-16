/* Smoke test — renders the production bundle in jsdom and asserts content,
   routing and the motion preset system.

   Usage (from client/):  npm run build && npm run test:smoke
   Or with arguments:     node scripts/smoke.mjs <url> <expected-motion> <label> */
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

const url = process.argv[2] || "http://localhost/";
const expectMotion = process.argv[3] || "full";
const label = process.argv[4] || url;

const failures = [];
function check(name, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures.push(name);
}

const bundleFile = fs.readdirSync(assetsDir).find((f) => f.endsWith(".js"));

const dom = new JSDOM(`<!doctype html><html><head></head><body><div id="root"></div></body></html>`, {
  url,
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

await import(pathToFileURL(path.join(assetsDir, bundleFile)).href);
await new Promise((r) => setTimeout(r, 300));

const html = window.document.getElementById("root").innerHTML;
console.log(`\n=== ${label} ===`);

const isHome = new URL(url).pathname === "/";
if (isHome) {
  check("renders clinic name", html.includes("Sri Bhuvaneshwari Ayurveda Peedam"));
  check("renders doctor name", html.includes("Dr. B. Neeraj Kalkin"));
  check("renders BAMS qualification", html.includes("BAMS"));
  check("renders location", html.includes("Pasupathipalayam"));
  check("treatment cards render", html.includes("Panchakarma Detox"));
  check("hero heading renders", html.includes("Restoring balance with"));
  check("appointment form renders", html.includes("Send Enquiry on WhatsApp"));
  check("map directions fallback link", html.includes("google.com/maps"));
  check("exact clinic location link present", html.includes("https://maps.app.goo.gl/4nWZfsS9LmrFe2pD9"));
  check("full street address renders", html.includes("87/92A, South Street"));
  check("botanical decorative SVG present", html.includes("botanical"));
  check("hero entrance classes present", html.includes("hero-anim"));
  check("cinematic hero image present", html.includes("/images/hero-diyo.jpg"));
  check("doctor registration number renders", html.includes("2366/A"));
  check("intro section renders", html.includes("The Science of Life"));
  check("herbs section renders", html.includes("Materia Medica"));
  check("gallery renders", html.includes('id="gallery"'));
  check("hero books via WhatsApp", html.includes("Book an Appointment"));
} else {
  check("placeholder page renders heading", html.includes("This page is coming next"));
  check("route path shown", html.includes(new URL(url).pathname));
}
check("floating WhatsApp link correct", html.includes("https://wa.me/919629907763"));
check("no fake placeholder phone", !html.includes("00000 00000"));
check("no fake email shown", !html.includes("hello@example.com"));

const motion = window.document.documentElement.getAttribute("data-motion");
check(`data-motion == "${expectMotion}" (got "${motion}")`, motion === expectMotion);

const reveals = [...window.document.querySelectorAll(".reveal")];
check(`reveal elements exist (${reveals.length})`, reveals.length > 0);
check(
  "all reveals marked visible (jsdom has no IntersectionObserver)",
  reveals.every((el) => el.classList.contains("is-visible"))
);

check("floating WhatsApp button present", !!window.document.querySelector(".wa__btn"));
check("mobile drawer markup present", !!window.document.querySelector(".drawer"));
check("page transition wrapper present", !!window.document.querySelector("main .page"));
check("no runtime errors", errors.length === 0);
if (errors.length) console.log("errors:", errors);

console.log(failures.length === 0 ? "\nALL CHECKS PASSED" : `\n${failures.length} CHECK(S) FAILED`);
process.exit(failures.length ? 1 : 0);
