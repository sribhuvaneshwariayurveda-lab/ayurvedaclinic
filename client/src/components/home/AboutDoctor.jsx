import { about, clinic } from "../../data/content.js";
import { IconAward } from "../ui/Icons.jsx";
import { CineReveal } from "../ui/Cine.jsx";

export default function AboutDoctor() {
  return (
    <section className="section section--ivory" id="about" aria-label={`About ${clinic.doctor}`}>
      <div className="container doc__grid">
        <CineReveal className="doc-card">
          <span className="section-label" style={{ color: "var(--gold-light)" }}>
            {about.label}
          </span>
          <div className="doc-card__mono" aria-hidden="true">BN</div>
          <h3>{clinic.doctor}</h3>
          <div className="doc-card__qual">
            {clinic.qualifications} · Registered Medical Practitioner
          </div>
          <span className="doc-card__reg">Reg. No. {clinic.regNo}</span>
          <p style={{ marginTop: "1.4rem" }}>
            {clinic.doctor}, {clinic.qualifications} (Reg. No. {clinic.regNo}), leads every
            consultation personally — from the first assessment to each review visit.
          </p>
        </CineReveal>

        <div>
          <CineReveal>
            <h2 className="intro__title">
              {about.title} <em>{about.titleAccent}</em>
            </h2>
            <hr className="rule-gold" />
          </CineReveal>

          {about.paragraphs.map((p, i) => (
            <CineReveal key={p.slice(0, 20)} delay={0.08 * i}>
              <p className="lede" style={{ marginBottom: "1rem" }}>
                {p}
              </p>
            </CineReveal>
          ))}

          <CineReveal>
            <ul className="cred-list">
              {about.credentials.map((c) => (
                <li key={c}>
                  <IconAward width={18} height={18} />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </CineReveal>

          <CineReveal>
            <blockquote className="about__quote">
              “{about.quote}”
              <span
                style={{
                  display: "block",
                  marginTop: "0.7rem",
                  fontFamily: "var(--font-sans)",
                  fontStyle: "normal",
                  fontSize: "0.82rem",
                  letterSpacing: "0.06em",
                  color: "var(--gold-dark)"
                }}
              >
                {clinic.doctor} — {clinic.qualifications}
              </span>
            </blockquote>
          </CineReveal>
        </div>
      </div>
    </section>
  );
}
