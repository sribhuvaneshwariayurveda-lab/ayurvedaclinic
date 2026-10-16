import { intro } from "../../data/content.js";
import { CineImage, CineReveal, Parallax } from "../ui/Cine.jsx";

export default function Intro() {
  return (
    <section className="section" id="intro" aria-label="About Ayurveda and the clinic">
      <div className="container intro__grid">
        <div className="intro__media">
          <Parallax amount={40}>
            <CineImage
              src={intro.image.src}
              alt={intro.image.alt}
            />
          </Parallax>
          <CineReveal delay={0.35} className="intro__seal">
            <small>Est. practice</small>
            Classical Ayurveda
          </CineReveal>
        </div>

        <div>
          <CineReveal>
            <span className="section-label">{intro.label}</span>
            <h2 className="intro__title">
              {intro.title} <em>{intro.titleAccent}</em>
            </h2>
            <hr className="rule-gold" />
          </CineReveal>
          {intro.paragraphs.map((p, i) => (
            <CineReveal key={i} delay={0.1 * (i + 1)}>
              <p className="lede">{p}</p>
            </CineReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
