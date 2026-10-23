import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useContentSection } from "../../data/store.js";
import { isMotionEnabled } from "../../lib/motionSettings.js";
import { IconArrowRight } from "../ui/Icons.jsx";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const fallbackSteps = [
  { title: "Enquiry", text: "Send a WhatsApp or web enquiry with your preferred date." },
  { title: "Assessment", text: "A detailed consultation covering history, pulse, constitution and routine." },
  { title: "Your Plan", text: "A written plan combining medicines, diet and appropriate therapies." },
  { title: "Follow-up", text: "Scheduled reviews to assess progress and adjust the plan." }
];

/**
 * Scroll-linked tree drawing. The SVG is decorative; the adjacent list carries
 * the same information in text.
 *
 * Progress is measured from the tree stage on mobile (where it is not sticky)
 * and from the whole section on desktop (where the stage is sticky). Updates are
 * throttled with requestAnimationFrame, and growth is one-way so scrolling back
 * up can never shrink or reset the tree. Reduced-motion visitors see it fully
 * grown immediately.
 */
export default function GrowingTree() {
  const about = useContentSection("about");
  const steps = about?.journey?.steps?.length ? about.journey.steps : fallbackSteps;
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const progressRef = useRef(isMotionEnabled() ? 0 : 1);
  const [progress, setProgress] = useState(() => (isMotionEnabled() ? 0 : 1));

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section) return undefined;

    let frame = 0;
    let observer = null;
    const mobileQuery =
      typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 820px)") : null;

    const commit = (next) => {
      if (next <= progressRef.current + 0.001) return;
      progressRef.current = next;
      setProgress(next);
    };

    const finish = () => {
      if (progressRef.current === 1) return;
      progressRef.current = 1;
      setProgress(1);
    };

    const update = () => {
      frame = 0;

      if (!isMotionEnabled()) {
        finish();
        return;
      }

      const viewport =
        window.visualViewport?.height ||
        window.innerHeight ||
        document.documentElement?.clientHeight ||
        800;
      const stageRect = (stage || section).getBoundingClientRect();

      let ratio;
      if (mobileQuery?.matches) {
        // The stage sits at the top of the section on mobile. Start as it
        // enters from the bottom and finish while it is still comfortably in
        // view, so the trunk and leaves complete on screen.
        const startLine = viewport * 0.92;
        const endLine = viewport * 0.2;
        const travel = Math.max(1, startLine - endLine);
        ratio = (startLine - stageRect.top) / travel;
      } else {
        // On desktop the stage is sticky, so the section's own travel is the
        // meaningful progress measure.
        const sectionRect = section.getBoundingClientRect();
        const startLine = viewport * 0.9;
        const stageHeight = Math.max(1, stageRect.height);
        const travel = Math.max(1, sectionRect.height - viewport * 0.55, stageHeight * 0.9);
        ratio = (startLine - sectionRect.top) / travel;
      }

      commit(clamp(ratio));
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("touchmove", requestUpdate, { passive: true });
    window.addEventListener("touchstart", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("orientationchange", requestUpdate);
    window.visualViewport?.addEventListener("resize", requestUpdate);
    window.visualViewport?.addEventListener("scroll", requestUpdate);
    mobileQuery?.addEventListener?.("change", requestUpdate);

    if (typeof MutationObserver !== "undefined") {
      observer = new MutationObserver(requestUpdate);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    }

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("touchmove", requestUpdate);
      window.removeEventListener("touchstart", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("orientationchange", requestUpdate);
      window.visualViewport?.removeEventListener("resize", requestUpdate);
      window.visualViewport?.removeEventListener("scroll", requestUpdate);
      mobileQuery?.removeEventListener?.("change", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      if (observer) observer.disconnect();
    };
  }, []);

  const draw = (start, end = 1) => 1 - clamp((progress - start) / (end - start));
  const leafIn = clamp((progress - 0.58) / 0.42);
  const activeStep = Math.min(steps.length - 1, Math.floor(progress * steps.length));

  return (
    <section className="growth-band" ref={sectionRef} aria-labelledby="growth-title">
      <div className="container growth-band__inner">
        <div className="growth-tree-stage" ref={stageRef} aria-hidden="true">
          <span className="growth-tree-stage__sun" style={{ opacity: 0.35 + leafIn * 0.65 }} />
          <svg className="growth-tree" viewBox="0 0 440 540" fill="none">
            <ellipse cx="220" cy="484" rx="145" ry="20" fill="rgba(20, 78, 31, 0.09)" />

            <g
              className="growth-tree__roots"
              stroke="var(--green-dark)"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.55"
            >
              <path d="M220 470c-21 11-38 24-53 39" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.02, 0.36) }} />
              <path d="M220 470c20 11 37 23 51 38" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.05, 0.4) }} />
              <path d="M220 474c-9 14-13 27-14 42" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.08, 0.44) }} />
              <path d="M220 474c9 14 14 27 16 41" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.11, 0.46) }} />
              <path d="M170 435c-19 13-34 19-53 22M270 435c19 13 34 19 53 22" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.1, 0.42) }} />
            </g>

            <g
              className="growth-tree__wood"
              stroke="var(--green-dark)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M220 472V271" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.12, 0.62) }} />
              <path d="M220 390c-26-22-45-48-54-77" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.27, 0.73) }} />
              <path d="M220 364c29-23 52-52 61-84" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.32, 0.78) }} />
              <path d="M220 330c-24-21-39-44-43-69" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.4, 0.84) }} />
              <path d="M220 314c22-19 37-40 42-64" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.44, 0.88) }} />
              <path d="M220 292c-10-22-12-42-8-61" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.48, 0.92) }} />
              <path d="M166 313c-13-10-22-24-26-40M280 280c13-8 23-19 29-33" pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: draw(0.55, 0.96) }} />
            </g>

            <g
              className="growth-tree__leaves"
              fill="var(--green)"
              style={{ opacity: leafIn, transform: `scale(${0.84 + leafIn * 0.16})`, transformOrigin: "220px 280px" }}
            >
              <path d="M220 207c-17 1-30-9-37-26 16-5 30 2 37 26Z" />
              <path d="M220 207c16 0 29-11 34-28-16-4-29 4-34 28Z" opacity="0.82" />
              <path d="M152 280c-20-4-33-17-36-36 18-1 31 10 36 36Z" />
              <path d="M158 236c-15-10-22-24-20-41 16 5 24 19 20 41Z" opacity="0.86" />
              <path d="M280 244c17-12 25-28 22-46-17 7-25 22-22 46Z" />
              <path d="M297 205c14-12 18-27 12-43-14 8-19 23-12 43Z" opacity="0.8" />
              <path d="M196 174c-14-10-20-24-16-40 15 6 21 20 16 40Z" />
              <path d="M238 170c15-11 21-26 16-43-16 7-22 22-16 43Z" opacity="0.84" />
              <path d="M220 144c-11-11-13-24-6-38 12 9 14 22 6 38Z" />
              <path d="M224 144c12-10 15-23 9-37-13 8-16 21-9 37Z" opacity="0.8" />
              <path d="M116 323c-17-2-29-12-33-28 15-3 28 6 33 28Z" opacity="0.85" />
              <path d="M307 291c16-1 28-10 33-25-15-4-28 4-33 25Z" />
              <path d="M172 216c-9-13-9-27 0-40 10 12 10 26 0 40Z" opacity="0.72" />
              <path d="M263 210c10-13 10-27 1-40-11 12-11 26-1 40Z" opacity="0.76" />
              <path d="M220 108c-8-12-6-24 4-35 8 12 7 24-4 35Z" />
            </g>

            <g stroke="var(--gold-dark)" strokeWidth="1.4" opacity={0.35 + leafIn * 0.4}>
              <circle cx="321" cy="126" r="27" fill="var(--gold-1)" fillOpacity="0.25" />
              <circle cx="321" cy="126" r="35" strokeDasharray="2 6" />
            </g>
          </svg>
          <span className="growth-tree-stage__caption">Roots in tradition · growth through care</span>
        </div>

        <div className="growth-copy">
          <span className="section-sub">Our approach</span>
          <h2 id="growth-title" className="section-title">
            Care that grows <span className="italic-serif">from the roots up.</span>
          </h2>
          <p className="section-desc">
            Health is not a single prescription. It is a living balance of constitution, routine,
            nourishment and time. Scroll through the way a plan takes shape at the clinic.
          </p>

          <ol className="growth-steps">
            {steps.map((step, index) => (
              <li
                key={step.title}
                className={`growth-step${index <= activeStep ? " is-grown" : ""}`}
              >
                <span className="growth-step__marker">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <b>{step.title}</b>
                  <span>{step.text}</span>
                </span>
              </li>
            ))}
          </ol>

          <Link className="btn btn--brown" to="/about">
            Read our story
            <IconArrowRight width={17} height={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
