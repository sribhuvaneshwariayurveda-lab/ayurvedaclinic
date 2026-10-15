import { about, clinic } from "../../data/content.js";
import { IconAward } from "../ui/Icons.jsx";
import Media from "../ui/Media.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

export default function AboutDoctor() {
  return (
    <section className="section" id="about">
      <div className="container about__grid">
        <Reveal className="about__media">
          <div className="about__figure">
            <Media label={about.mediaLabel} />
          </div>
          <div className="about__figure--small float-anim">
            <Media label={about.mediaLabelSmall} />
          </div>
        </Reveal>

        <div>
          <SectionHeading
            label={about.label}
            title={about.title}
            accent={about.titleAccent}
          />

          {about.paragraphs.map((p) => (
            <Reveal key={p.slice(0, 20)}>
              <p className="section-desc" style={{ marginBottom: "1rem" }}>
                {p}
              </p>
            </Reveal>
          ))}

          <Reveal>
            <ul className="cred-list">
              {about.credentials.map((c) => (
                <li key={c}>
                  <IconAward width={18} height={18} />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="pillars">
            {about.pillars.map((p) => (
              <div className="pillar" key={p.title}>
                <b>{p.title}</b>
                <span>{p.text}</span>
              </div>
            ))}
          </Reveal>

          <Reveal>
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
          </Reveal>
        </div>
      </div>
    </section>
  );
}
