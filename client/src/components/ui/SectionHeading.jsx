import Reveal from "./Reveal.jsx";

export default function SectionHeading({
  label,
  title,
  accent,
  desc,
  center = false,
  light = false,
  children
}) {
  return (
    <Reveal className={`section-head${center ? " section-head--center" : ""}`}>
      {label ? <span className="section-label">{label}</span> : null}
      <h2 className="section-title">
        {title}
        {accent ? (
          <>
            {" "}
            <span className="italic-serif" style={{ color: light ? "var(--gold-light)" : "var(--gold-dark)" }}>
              {accent}
            </span>
          </>
        ) : null}
      </h2>
      <div className="divider-gold" />
      {desc ? <p className="section-desc">{desc}</p> : null}
      {children}
    </Reveal>
  );
}
