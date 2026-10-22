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

const pathname = new URL(url).pathname;
const isHome = pathname === "/";
const realRoutes = ["/about", "/treatments", "/products", "/gallery", "/faqs", "/contact", "/diseases"];

if (isHome) {
  check("renders clinic name", html.includes("Sri Bhuvaneshwari Ayurveda Peedam"));
  check("renders doctor name", html.includes("Dr. B. Neeraj Kalkin"));
  check("renders BAMS qualification", html.includes("BAMS"));
  check("renders location", html.includes("Pasupathipalayam"));
  check("counters band renders", html.includes("counters-band"));
  check("credentials band renders", html.includes("Credentials &amp; Registration") || html.includes("Credentials & Registration"));
  check("about band renders (brown About Us button)", html.includes("btn--brown") && html.includes("About Us"));
  check("treatments heading renders", html.includes("Treatments Offered"));
  check("treatment marquee renders", html.includes("marquee__item") && html.includes("Panchakarma Detox"));
  check("why grid renders", html.includes("Why Patients Choose Us") && html.includes("why-box"));
  check("power of ayurveda renders", html.includes("The Power of Ayurveda") && html.includes("power-card"));
  check("CTA band renders", html.includes("Begin your journey to balance"));
  check("testimonials note renders", html.includes("genuine patient consent"));
  check("FAQ renders", html.includes("Frequently Asked Questions"));
  check("appointment form renders", html.includes("Send Enquiry on WhatsApp"));
  check("map directions fallback link", html.includes("google.com/maps"));
  check("exact clinic location link present", html.includes("https://maps.app.goo.gl/4nWZfsS9LmrFe2pD9"));
  check("full street address renders", html.includes("87/92A, South Street"));
  check("doctor registration number renders", html.includes("2366/A"));
  check("doctor university renders", html.includes("M.G.R. Medical University"));
  check("doctor photo path wired", html.includes("/images/doctor.jpg"));
  check("clinic photo path wired", html.includes("/images/clinic.jpg"));
  check("books via WhatsApp", html.includes("Book an Appointment"));
  check("products band renders", html.includes("Our Products") && html.includes("product-card"));
  check("diseases carousel band renders", html.includes("carousel__item") && html.includes("dcard"));
  check("condition cards link with Learn More", html.includes("Learn More"));
} else if (pathname === "/admin") {
  check("admin login page renders (not placeholder)", html.includes("Clinic admin panel"));
  check("admin sign-in form renders", html.includes("Sign In"));
  check("not the placeholder page", !html.includes("This page is coming next"));
  check("no secrets in admin page", !html.includes("ADMIN_PASSWORD") && !html.includes("ADMIN_USERNAME"));
} else if (pathname === "/gallery") {
  check("gallery grid renders", html.includes("gallery__grid") && html.includes("gshot"));
  check("gallery botanical image wired", html.includes("/images/hero-diyo.jpg"));
  check("gallery credit renders", html.includes("Wikimedia Commons"));
} else if (pathname === "/products") {
  check("product card renders", html.includes("Kidney Care Syrup") && html.includes("product-card"));
  check("product photo path wired", html.includes("/images/kidney-care-syrup.jpg"));
  check("new product renders", html.includes("Ayurvedic Hair Oil"));
  check("new product photo path wired", html.includes("/images/products/ayurvedic-hair-oil.jpg"));
  check("product filter chips render", html.includes("filter-chip"));
} else if (pathname === "/products/ayurvedic-hair-oil") {
  check("product detail renders", html.includes("Ayurvedic Hair Oil") && html.includes("detail-grid"));
  check("product detail image wired", html.includes("/images/products/ayurvedic-hair-oil.jpg"));
  check("product detail shows usage", html.includes("How it is used"));
  check("product detail shows disclaimer", html.includes("disclaimer__label"));
  check("product detail links to WhatsApp", html.includes("wa.me/919629907763"));
} else if (pathname === "/diseases") {
  check("disease cards render", html.includes("dcard") && html.includes("disease-grid"));
  check("carousel renders", html.includes("carousel__track"));
  check("disease image wired", html.includes("/images/diseases/asthma.jpg"));
  check("filter chips render", html.includes("filter-chip"));
  check("credits render", html.includes("Wikimedia Commons") && html.includes("credit-list"));
  check("medical note renders", html.includes("note"));
  check("condition cards link with Learn More", html.includes("Learn More"));
} else if (pathname === "/diseases/asthma") {
  check("disease detail renders", html.includes("Asthma") && html.includes("detail-grid"));
  check("disease detail image wired", html.includes("/images/diseases/asthma.jpg"));
  check("ayurvedic approach section renders", html.includes("Ayurvedic Approach"));
  check("disclaimer renders", html.includes("disclaimer__label"));
  check("next/prev navigation renders", html.includes("detail-nav"));
  check("no cure claims", !/cures? |guaranteed|guarantee(?!d)/i.test(html));
} else if (realRoutes.includes(pathname)) {
  check("real page renders (heading band / hero)", html.includes("page-hero"));
  check("real page renders clinic name (footer)", html.includes("Sri Bhuvaneshwari Ayurveda Peedam"));
} else {
  check("placeholder page renders heading", html.includes("This page is coming next"));
  check("route path shown", html.includes(new URL(url).pathname));
}

check("floating WhatsApp link correct", html.includes("https://wa.me/919629907763"));
check("no fake placeholder phone", !html.includes("00000 00000"));
check("no fake email shown", !html.includes("hello@example.com"));
check("no invented clinic timings", !html.includes("9:00 AM"));
check("no placeholder patient names", !html.includes("[Patient Name]"));

const motion = window.document.documentElement.getAttribute("data-motion");
check(`data-motion == "${expectMotion}" (got "${motion}")`, motion === expectMotion);

const reveals = [...window.document.querySelectorAll(".reveal")];
check(`reveal elements exist (${reveals.length})`, pathname === "/admin" ? true : reveals.length > 0);
check(
  "all reveals marked visible (jsdom has no IntersectionObserver)",
  reveals.every((el) => el.classList.contains("is-visible"))
);

check("floating WhatsApp button present", !!window.document.querySelector(".wa__btn"));
check("offcanvas menu markup present", !!window.document.querySelector(".offcanvas"));
check("page transition wrapper present", !!window.document.querySelector("main .page"));
check("no runtime errors", errors.length === 0);
if (errors.length) console.log("errors:", errors);

console.log(failures.length === 0 ? "\nALL CHECKS PASSED" : `\n${failures.length} CHECK(S) FAILED`);
process.exit(failures.length ? 1 : 0);
