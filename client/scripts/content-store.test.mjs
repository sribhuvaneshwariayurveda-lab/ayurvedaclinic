/*
 * Unit test for the content store merge rules (client/src/data/store.js).
 *
 * The admin panel stores a partial document; the site must merge it over the
 * bundled defaults so that:
 *   - sections the admin never touched keep working;
 *   - objects merge key by key (a changed paragraph does not drop the rest);
 *   - arrays and scalars are replaced wholesale (an admin can remove a
 *     product, a symptom or a whole section).
 *
 * Usage:  node scripts/content-store.test.mjs
 */
import {
  getContentSnapshot,
  setContentOverrides,
  subscribeToContent
} from "../src/data/store.js";

const failures = [];
function check(name, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}`);
  if (!cond) failures.push(name);
}

const defaults = getContentSnapshot();

check("defaults expose clinic info", Boolean(defaults.clinic && defaults.clinic.name));
check("defaults expose products", Array.isArray(defaults.products.items) && defaults.products.items.length > 0);
check("defaults expose diseases", Array.isArray(defaults.diseases.items) && defaults.diseases.items.length > 0);
check("defaults expose about", Boolean(defaults.about && defaults.about.title));

// --- untouched sections survive an override -------------------------------
setContentOverrides({ about: { title: "Edited headline" } });
let snapshot = getContentSnapshot();
check("override replaces the edited field", snapshot.about.title === "Edited headline");
check("override keeps sibling fields of the same object", snapshot.about.titleAccent === defaults.about.titleAccent);
check("untouched section is unchanged", snapshot.products.items.length === defaults.products.items.length);
check("untouched disease list is unchanged", snapshot.diseases.items.length === defaults.diseases.items.length);

// --- arrays are replaced wholesale ----------------------------------------
setContentOverrides({ diseases: { items: [{ slug: "only-one", name: "Only One" }] } });
snapshot = getContentSnapshot();
check("array override replaces the whole list", snapshot.diseases.items.length === 1);
check("array override item is used", snapshot.diseases.items[0].slug === "only-one");
check("sibling array still intact", snapshot.products.items.length === defaults.products.items.length);

// --- empty arrays are honoured (an admin can clear a list) ----------------
setContentOverrides({ diseases: { items: [] } });
snapshot = getContentSnapshot();
check("an emptied list stays empty", snapshot.diseases.items.length === 0);

// --- deep merge inside one object ----------------------------------------
setContentOverrides({
  products: { items: [{ slug: "p1", name: "Renamed" }] }
});
snapshot = getContentSnapshot();
check("product list replaced", snapshot.products.items.length === 1);
check("product name replaced", snapshot.products.items[0].name === "Renamed");
check("array items are used verbatim (no field-level merge)", snapshot.products.items[0].image === undefined);
check("product section label kept from defaults", snapshot.products.label === defaults.products.label);

// --- non-object overrides are ignored -------------------------------------
setContentOverrides("not-an-object");
snapshot = getContentSnapshot();
check("a non-object override resets to the defaults", snapshot.about.title === defaults.about.title);

// --- subscribers are notified ---------------------------------------------
let notified = 0;
const unsubscribe = subscribeToContent(() => {
  notified += 1;
});
setContentOverrides({ about: { title: "Another headline" } });
unsubscribe();
check("subscribers are notified on change", notified > 0);

setContentOverrides({});
check("resetting the overrides restores the defaults", getContentSnapshot().about.title === defaults.about.title);

console.log(failures.length === 0 ? "\nALL CHECKS PASSED" : `\nFAILURES: ${failures.join(", ")}`);
process.exit(failures.length === 0 ? 0 : 1);
