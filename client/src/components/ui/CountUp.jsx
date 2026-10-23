import { useEffect, useRef, useState } from "react";
import { isMotionEnabled } from "../../lib/motionSettings.js";

const NUMBER_PATTERN = /-?\d[\d,]*(?:\.\d+)?/;

function splitValue(value) {
  const text = String(value == null ? "" : value);
  const match = text.match(NUMBER_PATTERN);
  if (!match) return null;
  const raw = match[0].replace(/,/g, "");
  const target = Number(raw);
  if (!Number.isFinite(target)) return null;
  return {
    prefix: text.slice(0, match.index),
    target,
    suffix: text.slice(match.index + match[0].length),
    decimals: (raw.split(".")[1] || "").length,
    grouped: match[0].includes(",")
  };
}

function formatValue(parts, amount) {
  const rounded = parts.decimals
    ? amount.toFixed(parts.decimals)
    : String(Math.round(amount));
  const grouped = parts.grouped
    ? Number(rounded).toLocaleString("en-IN", {
        minimumFractionDigits: parts.decimals,
        maximumFractionDigits: parts.decimals
      })
    : rounded;
  return `${parts.prefix}${grouped}${parts.suffix}`;
}

export default function CountUp({ value, duration = 1500, className = "" }) {
  const parts = splitValue(value);
  const nodeRef = useRef(null);
  const finishedRef = useRef(false);
  const [display, setDisplay] = useState(() => {
    if (!parts) return value;
    return isMotionEnabled() && typeof IntersectionObserver !== "undefined"
      ? formatValue(parts, 0)
      : value;
  });

  useEffect(() => {
    if (!parts) {
      setDisplay(value);
      return undefined;
    }

    if (finishedRef.current) {
      setDisplay(value);
      return undefined;
    }

    let frame = 0;

    const finish = () => {
      finishedRef.current = true;
      setDisplay(value);
    };

    if (!isMotionEnabled() || typeof IntersectionObserver === "undefined") {
      finish();
      return undefined;
    }

    const node = nodeRef.current;
    if (!node) return undefined;

    const start = () => {
      finishedRef.current = true;
      const startedAt = performance.now();
      const step = (now) => {
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(formatValue(parts, parts.target * eased));
        if (progress < 1) {
          frame = requestAnimationFrame(step);
        } else {
          setDisplay(value);
        }
      };
      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          start();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [duration, value]);

  return (
    <span ref={nodeRef} className={`countup ${className}`.trim()}>
      <span aria-hidden="true">{display}</span>
      <span className="visually-hidden">{value}</span>
    </span>
  );
}
