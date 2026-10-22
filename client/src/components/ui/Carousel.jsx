import { useCallback, useEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "./Icons.jsx";

/**
 * Horizontal snap carousel.
 *
 * Native scroll-snap drives the movement, so touch, trackpad and keyboard all
 * work without any JavaScript animation loop. Previous/next buttons are
 * provided for mouse users and disable themselves at either end of the track.
 *
 * Smooth scrolling is skipped when the visitor prefers reduced motion.
 */
export default function Carousel({ children, label = "Carousel", className = "" }) {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    let observer = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(onScroll);
      observer.observe(el);
    }
    update();
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (observer) observer.disconnect();
    };
  }, [update]);

  const scrollBy = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild;
    const step = first ? first.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    const reduce =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * step, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className={`carousel ${className}`.trim()}>
      <div className="carousel__track" ref={trackRef} role="group" aria-label={label}>
        {children}
      </div>
      <div className="carousel__controls">
        <button
          className="carousel__btn"
          type="button"
          onClick={() => scrollBy(-1)}
          disabled={atStart}
          aria-label="Show previous items"
        >
          <IconChevronLeft width={20} height={20} aria-hidden="true" />
        </button>
        <button
          className="carousel__btn"
          type="button"
          onClick={() => scrollBy(1)}
          disabled={atEnd}
          aria-label="Show more items"
        >
          <IconChevronRight width={20} height={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
