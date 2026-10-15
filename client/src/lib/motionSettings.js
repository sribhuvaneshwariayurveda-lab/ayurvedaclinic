import { siteSettings } from "../data/content.js";

/**
 * Global animation preset system.
 *
 * The effective preset is resolved in priority order:
 *   1. OS "prefers-reduced-motion"  -> always "off" (non-essential motion only)
 *   2. Runtime override (setMotionPreset) / ?motion= URL param (QA / admin preview)
 *   3. Persisted choice in localStorage (visitor preference, future CMS preview)
 *   4. CMS/admin setting (siteSettings.animations)
 *   5. Default "full"
 *
 * Only the three supported presets are accepted — no arbitrary values, so the
 * CMS can never inject anything beyond "full" | "subtle" | "off".
 *
 * The resolved preset is written to <html data-motion="...">. All animation CSS
 * is scoped behind [data-motion], which means:
 *   - No JavaScript  -> attribute never set -> fully visible, static content
 *   - Bundle failure -> the failsafe timer in index.html removes the attribute
 */

export const MOTION_PRESETS = ["full", "subtle", "off"];
const ATTR = "data-motion";
const STORAGE_KEY = "sbap:motion";

let current = null;

function normalise(value) {
  const v = String(value == null ? "" : value).trim().toLowerCase();
  return MOTION_PRESETS.indexOf(v) !== -1 ? v : null;
}

function readStored() {
  try {
    return normalise(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStored(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* storage unavailable (private mode) — in-memory only */
  }
}

export function osPrefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function resolveMotionPreset() {
  if (osPrefersReducedMotion()) return "off";
  if (typeof window !== "undefined") {
    const param = normalise(
      new URLSearchParams(window.location.search).get("motion") ||
        new URLSearchParams(window.location.search).get("motionPreset")
    );
    if (param) return param;
    const stored = readStored();
    if (stored) return stored;
  }
  return normalise(siteSettings.animations) || "full";
}

export function getMotionPreset() {
  return current || resolveMotionPreset();
}

export function isMotionEnabled() {
  return getMotionPreset() !== "off";
}

/** Apply a preset to <html>. Returns the applied (validated) value. */
export function applyMotionPreset(preset) {
  const valid = normalise(preset) || "full";
  current = valid;
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute(ATTR, valid);
  }
  return valid;
}

/** Resolve from environment (OS + URL + storage + CMS) and apply. */
export function initMotion() {
  return applyMotionPreset(resolveMotionPreset());
}

/** Persist + apply a visitor/admin override. */
export function setMotionPreset(preset, { persist = true } = {}) {
  const valid = normalise(preset);
  if (!valid) return getMotionPreset();
  if (persist) writeStored(valid);
  return applyMotionPreset(valid);
}

/**
 * Watch the OS reduced-motion preference and re-resolve when it changes
 * (e.g. the user toggles the setting while the site is open).
 */
export function watchMotionPreference(onChange) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = () => {
    onChange(initMotion());
  };
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }
  return () => {};
}
