import { useSyncExternalStore } from "react";
import { defaultContent } from "./content.js";

/**
 * Content store.
 *
 * The site ships with a bundled default document (data/content.js). When the
 * Node server (server.js) is running, it also serves the admin-managed
 * document from GET /api/content. Those stored values are merged over the
 * defaults at runtime, so:
 *
 *   - static hosting (Apache, no API) keeps working with the bundled copy;
 *   - the admin panel can edit About / Products / Diseases without a rebuild;
 *   - the server never stores anything the browser cannot fall back from.
 *
 * Merge rules: objects merge key by key, arrays and scalars are replaced
 * wholesale (so an admin can remove a product or a symptom from a list).
 */

const isPlainObject = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function mergeValue(defaultValue, overrideValue) {
  if (overrideValue === undefined) return defaultValue;
  if (!isPlainObject(defaultValue) || !isPlainObject(overrideValue)) return overrideValue;
  const merged = { ...defaultValue };
  for (const key of Object.keys(overrideValue)) {
    merged[key] = mergeValue(defaultValue[key], overrideValue[key]);
  }
  return merged;
}

let overrides = {};
let snapshot = defaultContent;
const listeners = new Set();

function buildSnapshot() {
  const next = { ...defaultContent };
  for (const key of Object.keys(overrides)) {
    next[key] = mergeValue(defaultContent[key], overrides[key]);
  }
  return next;
}

function emit() {
  snapshot = buildSnapshot();
  for (const listener of listeners) listener();
}

/** Subscribe to store changes (used by useSyncExternalStore). */
export function subscribeToContent(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Current merged content document (stable reference between updates). */
export function getContentSnapshot() {
  return snapshot;
}

/** The raw stored overrides, without the bundled defaults merged in. */
export function getContentOverrides() {
  return overrides;
}

/** Replace the stored overrides wholesale (used after loading or saving). */
export function setContentOverrides(next) {
  overrides = isPlainObject(next) ? next : {};
  emit();
}

/** The whole content document. */
export function useContent() {
  return useSyncExternalStore(subscribeToContent, getContentSnapshot, getContentSnapshot);
}

/** One section of the content document (e.g. "about", "products"). */
export function useContentSection(key) {
  return useContent()[key];
}

/**
 * Load the admin-managed document from the server. Resolves to false when the
 * API is not available (static hosting) — the bundled defaults stay in use.
 */
export async function loadContent() {
  try {
    const res = await fetch("/api/content", {
      headers: { Accept: "application/json" },
      credentials: "same-origin"
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!isPlainObject(data)) return false;
    setContentOverrides(data);
    return true;
  } catch {
    // No API (static hosting) or the request was blocked — keep the defaults.
    return false;
  }
}

/**
 * Persist a set of top-level content sections through the admin API.
 * Returns { ok, status, data } — the caller shows the message.
 */
export async function saveContent(patch) {
  if (!isPlainObject(patch)) {
    return { ok: false, status: 0, data: { error: "Nothing to save." } };
  }
  let res;
  try {
    res = await fetch("/api/admin/content", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(patch)
    });
  } catch (err) {
    return { ok: false, status: 0, data: { error: "Could not reach the content API." } };
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) return { ok: false, status: res.status, data };
  overrides = { ...overrides, ...patch };
  emit();
  return { ok: true, status: res.status, data };
}
