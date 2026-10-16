import { useState } from "react";
import { Link } from "react-router-dom";
import { treatmentCategories, treatments } from "../../data/content.js";
import { IconArrowRight } from "../ui/Icons.jsx";
import { CineImage, CineReveal, Parallax } from "../ui/Cine.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

export default function Treatments() {
  const [active, setActive] = useState("All");
  const list = active === "All" ? treatments : treatments.filter((t) => t.cat === active);

  return (
    <section className="section" id="treatments" aria-label="Ayurvedic treatments and services">
      <div className="container">
        <SectionHeading
          center
          label="What We Offer"
          title="Classical Ayurvedic"
          accent="treatments"
          desc="From detailed consultation and Panchakarma to everyday wellness guidance — every plan is tailored to your constitution and reviewed by the physician."
        />

        <CineReveal className="filters">
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
        </CineReveal>

        <div className="tx-layout">
          <div className="tx-index">
            {list.map((t, i) => (
              <CineReveal key={t.title} delay={Math.min(i * 0.06, 0.3)}>
                <Link className="tx-row" to="/treatments" aria-label={`${t.title} — learn more`}>
                  <span className="tx-row__num" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <h3 className="tx-row__title">{t.title}</h3>
                    <p className="tx-row__desc">{t.desc}</p>
                  </span>
                  <span className="tx-row__cat">
                    {t.cat} <IconArrowRight width={14} height={14} style={{ verticalAlign: "-2px" }} />
                  </span>
                </Link>
              </CineReveal>
            ))}
          </div>

          <Parallax className="tx-side" amount={50}>
            <CineImage
              src="/images/mortar-sun.jpg"
              alt="Stone mortar and pestle in warm sunlight"
            />
          </Parallax>
        </div>
      </div>
    </section>
  );
}
