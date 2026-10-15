import { useState } from "react";
import { Link } from "react-router-dom";
import { treatmentCategories, treatments } from "../../data/content.js";
import { IconArrowRight } from "../ui/Icons.jsx";
import Media from "../ui/Media.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

export default function Treatments() {
  const [active, setActive] = useState("All");
  const list = active === "All" ? treatments : treatments.filter((t) => t.cat === active);

  return (
    <section className="section section--ivory" id="treatments">
      <div className="container">
        <SectionHeading
          center
          label="What We Offer"
          title="Classical Ayurvedic"
          accent="treatments"
          desc="From detailed consultation and Panchakarma to everyday wellness guidance — every plan is tailored to your constitution and reviewed by the physician."
        />

        <Reveal className="filters">
          {treatmentCategories.map((cat) => (
            <button
              key={cat}
              className={`chip${active === cat ? " is-active" : ""}`}
              onClick={() => setActive(cat)}
              aria-pressed={active === cat}
            >
              {cat}
            </button>
          ))}
        </Reveal>

        <div className="treatments__grid">
          {list.map((t, i) => (
            <Reveal key={t.title} delay={(i % 3) + 1} className="tcard lift">
              <div className="tcard__media">
                <Media label={t.mediaLabel} />
              </div>
              <div className="tcard__body">
                <span className="tcard__cat">{t.cat}</span>
                <h3 className="tcard__title">{t.title}</h3>
                <p className="tcard__desc">{t.desc}</p>
                <Link className="tcard__link" to="/treatments">
                  Learn more
                  <IconArrowRight width={16} height={16} />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
