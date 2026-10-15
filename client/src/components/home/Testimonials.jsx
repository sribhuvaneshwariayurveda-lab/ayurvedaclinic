import { testimonials, testimonialsNote } from "../../data/content.js";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

export default function Testimonials() {
  return (
    <section className="section section--ivory">
      <div className="container">
        <SectionHeading
          center
          label="Patient Voices"
          title="What patients"
          accent="say"
        />
        <div className="quotes">
          {testimonials.map((t, i) => (
            <Reveal key={t.name + i} delay={(i % 3) + 1} className="quote lift">
              <span className="quote__stars" aria-label="5 out of 5">
                ★★★★★
              </span>
              <p className="quote__text">“{t.text}”</p>
              <div className="quote__who">
                <span className="quote__avatar" aria-hidden="true">
                  {t.name.replace(/[^A-Za-z]/g, "").charAt(0) || "P"}
                </span>
                <span>
                  <b>{t.name}</b>
                  <span>{t.meta}</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="quote__note">{testimonialsNote}</p>
      </div>
    </section>
  );
}
