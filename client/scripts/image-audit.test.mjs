/* Image audit — every image path referenced by the site must exist.
 *
 * Checks:
 *   - every "/images/..." path in the bundled content document exists in
 *     client/public/images;
 *   - every "/images/..." path hard-coded in a component exists too;
 *   - each condition has its own image (no image reused across conditions);
 *   - every product image slot on disk is referenced by a product;
 *   - every image has an alt text.
 *
 * Usage (from client/):  node scripts/image-audit.test.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defaultContent } from "../src/data/content.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(__dirname, "..", "src");
const publicDir = path.join(__dirname, "..", "public");

const failures = [];
function check(name, cond, extra) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? ` — ${extra}` : ""}`);
  if (!cond) failures.push(name);
}

/** Walk a JS value and collect every { src, alt } pair it contains. */
function collectImages(value, found = []) {
  if (Array.isArray(value)) {
    value.forEach((v) => collectImages(v, found));
  } else if (value && typeof value === "object") {
    if (typeof value.src === "string" && value.src.startsWith("/images/")) {
      found.push({ src: value.src, alt: value.alt });
    }
    Object.values(value).forEach((v) => collectImages(v, found));
  }
  return found;
}

/** All image paths hard-coded inside the component sources. */
function scanSources(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scanSources(full, acc);
    else if (/\.(jsx|js)$/.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8");
      const matches = text.match(/\/images\/[A-Za-z0-9._/-]+/g) || [];
      for (const m of matches) acc.push({ src: m, file: path.relative(srcDir, full) });
    }
  }
  return acc;
}

const contentImages = collectImages(defaultContent);
const sourceImages = scanSources(srcDir);

/* ---- 1. every referenced image exists on disk --------------------------- */
const missing = new Map();
for (const { src } of [...contentImages, ...sourceImages]) {
  const file = path.join(publicDir, src.replace(/^\//, ""));
  if (!fs.existsSync(file)) {
    if (!missing.has(src)) missing.set(src, []);
    missing.get(src).push("content" );
  }
}
check(
  "every referenced image exists in client/public",
  missing.size === 0,
  missing.size ? `missing: ${[...missing.keys()].join(", ")}` : `${contentImages.length + sourceImages.length} references checked`
);

/* ---- 2. no condition reuses another condition's image ------------------ */
const diseaseItems = defaultContent.diseases.items || [];
const diseaseImages = diseaseItems.map((d) => (d.image || {}).src);
const uniqueDiseaseImages = new Set(diseaseImages);
check(
  `all ${diseaseItems.length} conditions have their own image`,
  uniqueDiseaseImages.size === diseaseItems.length,
  uniqueDiseaseImages.size === diseaseItems.length
    ? "no image is reused"
    : `only ${uniqueDiseaseImages.size} unique images`
);
check("all 18 conditions are present", diseaseItems.length === 18, `found ${diseaseItems.length}`);

/* ---- 3. every condition image is a real file ---------------------------- */
const missingDiseaseImages = diseaseItems.filter(
  (d) => !fs.existsSync(path.join(publicDir, (d.image || {}).src.replace(/^\//, "")))
);
check(
  "every condition image file is present",
  missingDiseaseImages.length === 0,
  missingDiseaseImages.map((d) => d.name).join(", ")
);

/* ---- 4. every condition image has an alt text --------------------------- */
const noAlt = contentImages.filter((i) => !i.alt || !String(i.alt).trim());
check("every content image has an alt text", noAlt.length === 0, noAlt.map((i) => i.src).join(", "));

/* ---- 5. product image slots --------------------------------------------- */
const productItems = defaultContent.products.items || [];
const productImages = productItems.flatMap((p) => [
  (p.image || {}).src,
  ...(p.gallery || []).map((g) => g.src)
]);
const productSlotsDir = path.join(publicDir, "images", "products");
const onDisk = fs.existsSync(productSlotsDir)
  ? fs.readdirSync(productSlotsDir).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
  : [];
check("every product image path exists", productImages.every((src) => src && fs.existsSync(path.join(publicDir, src.replace(/^\//, "")))));
check(
  `every product image slot on disk is used (${onDisk.length} files)`,
  onDisk.every((f) => productImages.some((src) => src.endsWith(`/products/${f}`))),
  onDisk.filter((f) => !productImages.some((src) => src.endsWith(`/products/${f}`))).join(", ")
);
check("no product shares another product's poster", new Set(productItems.map((p) => (p.image || {}).src)).size === productItems.length);

/* ---- 6. the gallery images exist ---------------------------------------- */
const galleryImages = (defaultContent.gallery.images || []).map((i) => i.src);
check(
  "every gallery image exists",
  galleryImages.every((src) => fs.existsSync(path.join(publicDir, src.replace(/^\//, "")))),
  galleryImages.filter((src) => !fs.existsSync(path.join(publicDir, src.replace(/^\//, "")))).join(", ")
);

/* ---- 7. no leftover placeholder image paths in the markup ---------------- */
const jsxFiles = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".jsx")) jsxFiles.push(full);
  }
})(srcDir);
const brokenPlaceholder = jsxFiles.filter((f) => {
  const text = fs.readFileSync(f, "utf8");
  const paths = text.match(/\/images\/[A-Za-z0-9._/-]+/g) || [];
  return paths.some((p) => /placeholder|coming[-_]?next|lorem/i.test(p));
});
check("no placeholder image paths left in the components", brokenPlaceholder.length === 0);

console.log(failures.length === 0 ? "\nALL CHECKS PASSED" : `\n${failures.length} CHECK(S) FAILED`);
process.exit(failures.length ? 1 : 0);
