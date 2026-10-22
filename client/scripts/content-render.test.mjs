/* Test for the public pages (client/src/pages/*.jsx and the home sections).
 *
 * Renders the production bundle in jsdom with GET /api/content stubbed so the
 * store receives an admin-managed document. It then checks that the values an
 * admin can set in the panel — a product price and a patient testimonial —
 * actually reach the page, and that nothing appears when the fields are empty.
 *
 * Each route is rendered in its own process (the bundle can only be imported
 * once per process), so this file re-executes itself per route.
 *
 * Usage (from client/):  npm run build && node scripts/content-render.test.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
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

/* The document an administrator might have saved through the panel. */
const STORED_CONTENT = {
  products: {
    label: "Products",
    title: "Our",
    titleAccent: "Products",
    desc: "Clinic preparations.",
    items: [
      {
        slug: "kidney-care-syrup",
        name: "Kidney Care Syrup",
        price: "Rs. 450",
        image: { src: "/images/kidney-care-syrup.jpg", alt: "Kidney Care Syrup" },
        gallery: [{ src: "/images/kidney-care-syrup.jpg", alt: "Kidney Care Syrup" }]
      },
      {
        slug: "no-price-product",
        name: "No Price Product",
        price: "",
        image: { src: "/images/kidney-care-syrup.jpg", alt: "No Price Product" },
        gallery: [{ src: "/images/kidney-care-syrup.jpg", alt: "No Price Product" }]
      }
    ]
  },
  testimonialsNote: "Shared with the patient's written consent.",
  testimonials: [
    { quote: "My knee pain settled down after the course of oils.", name: "S. Ramasamy", treatment: "Joint care" },
    { quote: "The clinic explained every step of the treatment.", name: "", treatment: "" }
  ]
};

/* --- one route ------------------------------------------------------------ */
async function runRoute(route) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body><div id="root"></div></body></html>`, {
    url: `http://localhost${route}`,
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

  /* The content API returns the stored document. */
  globalThis.fetch = async (input) => {
    const url = String(input);
    const json = (status, body) =>
      Promise.resolve({
        status,
        ok: status >= 200 && status < 300,
        json: async () => body,
        headers: { get: () => null }
      });
    if (url.includes("/api/content")) return json(200, STORED_CONTENT);
    return json(404, { error: "Not found" });
  };

  await import(pathToFileURL(path.join(assetsDir, bundleFile)).href);
  await new Promise((r) => setTimeout(r, 400));
  const html = window.document.getElementById("root").innerHTML;

  if (route === "/products") {
    check("the products page renders the stored product list", html.includes("Kidney Care Syrup"));
    check("a product price set by the admin is rendered", html.includes("Rs. 450"));
    check("the price is marked up as a price", html.includes("product-card__price"));
    const priceBlocks = html.split("product-card__price").length - 1;
    check("only the priced product shows a price", priceBlocks === 1);
    check("no runtime errors on the products page", errors.length === 0);
  } else if (route === "/products/kidney-care-syrup") {
    check("the product detail page renders the product", html.includes("Kidney Care Syrup"));
    check("the detail page shows the price", html.includes("Rs. 450"));
    check("the detail price uses the detail style", html.includes("product-card__price--detail"));
    check("no runtime errors on the product detail page", errors.length === 0);
  } else if (route === "/") {
    check("the home page renders the testimonial quotes", html.includes("My knee pain settled down"));
    check("the testimonial name is rendered", html.includes("S. Ramasamy"));
    check("an unnamed testimonial is shown as anonymous", html.includes("Anonymous"));
    check("the consent note is rendered", html.includes("written consent"));
    check("the testimonial card is styled", html.includes("testi-card"));
    check("no runtime errors on the home page", errors.length === 0);
  }
}

/* --- driver --------------------------------------------------------------- */
const route = process.argv[2];

if (route) {
  await runRoute(route);
  console.log(failures.length === 0 ? "\nALL CHECKS PASSED" : `\n${failures.length} CHECK(S) FAILED`);
  process.exit(failures.length ? 1 : 0);
}

let failed = 0;
for (const r of ["/products", "/products/kidney-care-syrup", "/"]) {
  console.log(`\n=== ${r} ===`);
  const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), r], {
    stdio: "inherit",
    cwd: path.join(__dirname, "..")
  });
  if (result.status !== 0) failed += 1;
}
console.log(failed === 0 ? "\nALL CHECKS PASSED" : `\n${failed} ROUTE(S) FAILED`);
process.exit(failed ? 1 : 0);
