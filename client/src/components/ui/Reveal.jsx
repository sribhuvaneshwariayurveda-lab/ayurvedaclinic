import { useEffect, useRef } from "react";
import { getMotionPreset, isMotionEnabled } from "../../lib/motionSettings.js";

/**
 * Reveal-on-scroll wrapper.
 *
 * - One shared IntersectionObserver for the whole page (elements unobserve
 *   themselves after firing, so nothing replays).
 * - Hidden-initial styles only apply when [data-motion] is set (motion.css),
 *   so content is fully visible if JS or the observer fails.
 * - When the motion preset is "off" (admin toggle or OS reduced-motion),
 *   elements render immediately visible and are never observed.
 *
 * Variants: "fade-up" (default) | "fade" | "zoom" | "left" | "right".
 * `delay` (0-5) maps to a stagger step of 0.09s.
 */

let sharedObserver = null;

function getSharedObserver() {
  if (sharedObserver) return sharedObserver;
  sharedObserver = new IntersectionObserver(
    (entries) => {
      for (let i = 0; i < entries.length; i += 1) {
        const entry = entries[i];
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          sharedObserver.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
  );
  return sharedObserver;
}

export default function Reveal({
  as: Tag = "div",
  delay = 0,
  variant = "fade-up",
  className = "",
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const enabled = isMotionEnabled();

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (!isMotionEnabled()) {
      el.classList.add("is-visible");
      return undefined;
    }

    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return undefined;
    }

    const observer = getSharedObserver();
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  const classes = ["reveal", `reveal--${variant}`, className];
  if (!enabled) classes.push("is-visible");

  const mergedStyle = delay
    ? { "--reveal-delay": `${(delay * 0.09).toFixed(2)}s`, ...style }
    : style;

  return (
    <Tag
      ref={ref}
      className={classes.filter(Boolean).join(" ")}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Current preset accessor for components that branch on it. */
export { getMotionPreset };
