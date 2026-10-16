import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { isMotionEnabled } from "../../lib/motionSettings.js";

/**
 * Cinematic motion helpers (framer-motion), layered on the site's existing
 * motion-preset system:
 * - If the preset is "off" (OS reduced-motion, ?motion=off, CMS setting) or
 *   the OS requests reduced motion, everything renders static immediately.
 * - Otherwise: masked line reveals, scroll parallax and staggered entrances.
 * - All helpers render plain markup when motion is off, so content, SEO and
 *   jsdom smoke tests see the same text either way.
 * - In-view detection uses our own IntersectionObserver wrapper with a
 *   visible-by-default fallback, so content never stays hidden where the
 *   observer API is unavailable (old browsers, jsdom, bundle edge cases).
 */

export function useCineEnabled() {
  const osReduced = useReducedMotion();
  return isMotionEnabled() && !osReduced;
}

/** Own one-shot in-view hook — true immediately when IO is unavailable. */
export function useInViewOnce() {
  const ref = useRef(null);
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === "undefined"
  );
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView];
}

const EASE = [0.22, 0.61, 0.36, 1];

/** Fade-and-rise reveal on scroll into view (once). */
export function CineReveal({ children, delay = 0, y = 28, className = "", ...rest }) {
  const enabled = useCineEnabled();
  const [ref, inView] = useInViewOnce();
  if (!enabled) return <div className={className} {...rest}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Staggered masked-line headline reveal (page-load introduction). */
export function CineLines({ lines, className = "", lineClassName = "", delay = 0.15, step = 0.12 }) {
  const enabled = useCineEnabled();
  if (!enabled) {
    return (
      <span className={className}>
        {lines.map((l, i) => (
          <span key={i} className={lineClassName}>{l} </span>
        ))}
      </span>
    );
  }
  return (
    <span className={className} aria-label={lines.join(" ")}>
      {lines.map((l, i) => (
        <span key={i} className="cine-mask" aria-hidden="true">
          <motion.span
            className={`cine-mask__inner ${lineClassName}`.trim()}
            initial={{ yPercent: 110 }}
            animate={{ yPercent: 0 }}
            transition={{ duration: 1.1, delay: delay + i * step, ease: EASE }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Slow content fade for hero supporting copy and CTAs. */
export function CineFade({ children, delay = 0.6, className = "", ...rest }) {
  const enabled = useCineEnabled();
  if (!enabled) return <div className={className} {...rest}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll parallax wrapper — drifts its child vertically as the section
 * scrolls through the viewport. Expects an oversized child (image).
 */
export function Parallax({ children, amount = 60, className = "", ...rest }) {
  const ref = useRef(null);
  const enabled = useCineEnabled();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount]);
  if (!enabled) return <div ref={ref} className={className} {...rest}>{children}</div>;
  return (
    <motion.div ref={ref} className={className} style={{ y }} {...rest}>
      {children}
    </motion.div>
  );
}

/** Image with mask-reveal transition + graceful fallback if it fails to load. */
export function CineImage({ src, alt, className = "", imgClassName = "", eager = false, ...rest }) {
  const enabled = useCineEnabled();
  const [ref, inView] = useInViewOnce();
  const img = (
    <img
      src={src}
      alt={alt}
      className={imgClassName}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchpriority={eager ? "high" : undefined}
      onError={(e) => {
        e.currentTarget.closest(".cine-img")?.classList.add("is-fallback");
        e.currentTarget.remove();
      }}
    />
  );
  if (!enabled) return <div className={`cine-img ${className}`.trim()} {...rest}>{img}</div>;
  return (
    <motion.div
      ref={ref}
      className={`cine-img ${className}`.trim()}
      initial={{ clipPath: "inset(8% 6% 8% 6% round 18px)", opacity: 0.4 }}
      animate={inView ? { clipPath: "inset(0% 0% 0% 0% round 18px)", opacity: 1 } : {}}
      transition={{ duration: 1.2, ease: EASE }}
      {...rest}
    >
      {img}
    </motion.div>
  );
}

/** Film-grain overlay (pure SVG turbulence, no assets, GPU-cheap). */
export function Grain({ opacity = 0.07 }) {
  return (
    <span className="grain" aria-hidden="true" style={{ opacity }}>
      <svg>
        <filter id="cine-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cine-grain)" />
      </svg>
    </span>
  );
}
