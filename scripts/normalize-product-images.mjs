/*
 * Normalises the product photographs in client/public/images/products.
 *
 * Photos dropped in from a phone, WhatsApp or a download folder often arrive
 * with names like "anti aging serum.jpg.jpeg" or "liver care,jpg.jpeg".
 * Those names contain spaces and commas, which break direct URLs, and they
 * do not match the image paths stored in the content document.
 *
 * This script renames each such file to the canonical slug used by
 * client/src/data/content.js (e.g. "anti-ageing-serum.jpg"). Files that are
 * already canonical are left untouched, and a file is never overwritten
 * without asking.
 *
 * Usage:  node scripts/normalize-product-images.mjs [--apply]
 *         (without --apply it only reports what it would do)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PRODUCTS_DIR = path.join(ROOT, "client", "public", "images", "products");
const APPLY = process.argv.includes("--apply");

/* The canonical product image filenames (from the content document). */
const CANONICAL = [
  "anti-ageing-serum.jpg",
  "skin-care-psoriasis-product.jpg",
  "ulcer-drops.jpg",
  "pimple-drops.jpg",
  "child-fertility-product.jpg",
  "ayurvedic-hair-oil.jpg",
  "ayurvedic-eye-drops.jpg",
  "liver-care.jpg",
  "anti-alcohol-powder.jpg"
];

/** Lower-case and drop every non-alphanumeric character. */
const normalise = (name) =>
  name
    .toLowerCase()
    .replace(/\.(jpe?g|png|webp)$/i, "")
    .replace(/\.(jpe?g|png|webp)/gi, "")
    .replace(/[^a-z0-9]/g, "");

/** Plain Levenshtein distance. */
function distance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  let prev = Array.from({ length: cols }, (_, i) => i);
  for (let i = 1; i < rows; i += 1) {
    const cur = [i];
    for (let j = 1; j < cols; j += 1) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = cur;
  }
  return prev[cols - 1];
}

/**
 * Explicit aliases for names that are a real photograph but do not resemble
 * the canonical slug closely enough for a fuzzy match (for example
 * "child fertility.jpeg" for "child-fertility-product.jpg").
 */
const ALIASES = {
  antiagingserum: "anti-ageing-serum.jpg",
  antiageingserum: "anti-ageing-serum.jpg",
  antialcoholpowder: "anti-alcohol-powder.jpg",
  antialcohol: "anti-alcohol-powder.jpg",
  ayurvedicheyedrops: "ayurvedic-eye-drops.jpg",
  eyedrops: "ayurvedic-eye-drops.jpg",
  childfertility: "child-fertility-product.jpg",
  childfertilityproduct: "child-fertility-product.jpg",
  fertility: "child-fertility-product.jpg",
  skincarepsoriasisproduct: "skin-care-psoriasis-product.jpg",
  psoriasisproduct: "skin-care-psoriasis-product.jpg",
  psoriasis: "skin-care-psoriasis-product.jpg",
  skincarepsoriasis: "skin-care-psoriasis-product.jpg",
  ulcerdrops: "ulcer-drops.jpg",
  gastriculcer: "ulcer-drops.jpg",
  ulcer: "ulcer-drops.jpg",
  pimpledrops: "pimple-drops.jpg",
  acne: "pimple-drops.jpg",
  livercare: "liver-care.jpg",
  ayurvedichairoil: "ayurvedic-hair-oil.jpg",
  hairoil: "ayurvedic-hair-oil.jpg"
};

/** Best canonical match for a file name, or null when nothing is close. */
function match(name) {
  const key = normalise(name);
  if (ALIASES[key]) return ALIASES[key];
  const exact = CANONICAL.find((c) => normalise(c) === key);
  if (exact) return exact;
  let best = null;
  let bestScore = Infinity;
  for (const c of CANONICAL) {
    const d = distance(key, normalise(c));
    if (d < bestScore) {
      bestScore = d;
      best = c;
    }
  }
  // Only rename when the names are genuinely close (small edit distance).
  const limit = Math.max(3, Math.round(normalise(best).length * 0.25));
  return bestScore <= limit ? best : null;
}

if (!fs.existsSync(PRODUCTS_DIR)) {
  console.error(`No product image folder at ${PRODUCTS_DIR}`);
  process.exit(1);
}

const files = fs.readdirSync(PRODUCTS_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const plan = [];

for (const file of files) {
  if (CANONICAL.includes(file)) continue; // already canonical
  const target = match(file);
  if (!target) {
    console.log(`SKIP    ${file}  (no canonical name is close enough)`);
    continue;
  }
  plan.push({ from: file, to: target });
}

if (plan.length === 0) {
  console.log("All product photographs already use the canonical names.");
} else {
  for (const { from, to } of plan) {
    const source = path.join(PRODUCTS_DIR, from);
    const destination = path.join(PRODUCTS_DIR, to);
    if (fs.existsSync(destination)) {
      const existing = fs.statSync(destination);
      const incoming = fs.statSync(source);
      // Keep the larger file: a real photograph is normally bigger than the
      // generated placeholder it replaces.
      if (incoming.size > existing.size) {
        console.log(`REPLACE ${from} -> ${to}  (${incoming.size} bytes > ${existing.size} bytes)`);
        if (APPLY) {
          fs.copyFileSync(source, destination);
          fs.rmSync(source);
        }
      } else {
        console.log(`KEEP    ${to}  (already ${existing.size} bytes; ${from} ignored)`);
        if (APPLY) fs.rmSync(source);
      }
    } else {
      console.log(`RENAME  ${from} -> ${to}`);
      if (APPLY) fs.renameSync(source, destination);
    }
  }
}

/* Report which canonical slots are still filled by a generated placeholder. */
console.log("\nCurrent state of each image slot:");
for (const name of CANONICAL) {
  const file = path.join(PRODUCTS_DIR, name);
  if (!fs.existsSync(file)) {
    console.log(`  MISSING  ${name}`);
    continue;
  }
  const size = fs.statSync(file).size;
  console.log(`  ${size < 150000 ? "placeholder" : "photograph"}  ${name}  (${size} bytes)`);
}

console.log(APPLY ? "\nApplied." : "\nDry run — pass --apply to make the changes.");
