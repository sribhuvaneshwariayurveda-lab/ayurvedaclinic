import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useContentSection } from "../data/store.js";
import { IconWhatsApp } from "../components/ui/Icons.jsx";
import Media from "../components/ui/Media.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import {
  buildWhatsAppLink,
  generalEnquiryMessage,
  treatmentEnquiryMessage
} from "../lib/whatsapp.js";

const treatmentImages = [
  "/images/doctor.jpg",
  "/images/mortar-sun.jpg",
  "/images/tulsi-grove.jpg",
  "/images/tulsi-macro.jpg",
  "/images/tulsi-sprout.jpg",
  "/images/tulsi-spike.jpg"
];

const groupNotes = {
  Consultation: "Understanding the person before planning the prescription.",
  Panchakarma: "Classical cleansing and soothing therapies, used only where indicated.",
  "Women's Health": "Supportive care shaped around each stage of a woman's life.",
  "Lifestyle & Metabolism": "Everyday food, movement and routine for longer-term balance.",
  Wellness: "Preventive habits and seasonal care for staying well."
};

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function TreatmentsPage() {
  const treatments = useContentSection("treatments") || [];

  const groups = useMemo(() => {
    const order = [];
    const map = new Map();
    treatments.forEach((item) => {
      if (!map.has(item.cat)) {
        map.set(item.cat, []);
        order.push(item.cat);
      }
      map.get(item.cat).push(item);
    });
    return order.map((cat) => ({ cat, items: map.get(cat) }));
  }, [treatments]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__label">Treatments</span>
          <h1>Treatments Offered</h1>
          <p>
            Classical Ayurvedic consultation and therapies, planned for your constitution and
            delivered with clear, honest guidance. Every treatment is recommended only after assessment.
          </p>
        </div>
      </section>

      <section className="content-block">
        <div className="container">
          <nav className="treatment-index" aria-label="Treatment areas">
            {groups.map((group) => (
              <a key={group.cat} href={`#treatment-${slugify(group.cat)}`}>
                {group.cat}
              </a>
            ))}
          </nav>

          {groups.map((group, groupIndex) => (
            <section
              key={group.cat}
              className="treatment-group"
              id={`treatment-${slugify(group.cat)}`}
              aria-labelledby={`treatment-title-${slugify(group.cat)}`}
            >
              <Reveal className="treatment-group__head">
                <span className="treatment-group__index">
                  {String(groupIndex + 1).padStart(2, "0")}
                </span>
                <h2 id={`treatment-title-${slugify(group.cat)}`}>{group.cat}</h2>
                <p>{groupNotes[group.cat] || "Planned after an individual assessment."}</p>
              </Reveal>

              <div className="treatment-group__cards">
                <div className="treatments-grid">
                  {group.items.map((treatment) => {
                    const imageIndex = Math.max(0, treatments.indexOf(treatment));
                    return (
                      <Reveal key={treatment.title} delay={imageIndex % 3} className="tcard">
                        <div className="tcard__media">
                          <Media
                            src={treatmentImages[imageIndex % treatmentImages.length]}
                            alt={treatment.title}
                            label={treatment.mediaLabel}
                          />
                        </div>
                        <div className="tcard__body">
                          <span className="tcard__cat">{treatment.cat}</span>
                          <h3>{treatment.title}</h3>
                          <p>{treatment.desc}</p>

                          {treatment.includes?.length ? (
                            <div className="tcard__includes">
                              {treatment.includes.map((item) => (
                                <span key={item}>{item}</span>
                              ))}
                            </div>
                          ) : null}

                          {treatment.details ? (
                            <details className="tcard__more">
                              <summary>What to expect</summary>
                              <p>{treatment.details}</p>
                            </details>
                          ) : null}

                          <div className="tcard__actions">
                            <a
                              className="btn btn--sm btn--outline"
                              href={buildWhatsAppLink(treatmentEnquiryMessage(treatment.title))}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <IconWhatsApp width={15} height={15} aria-hidden="true" />
                              Enquire
                            </a>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}

          <p className="treatment-footnote">
            Ayurvedic care is planned after an individual assessment. Not every therapy is suitable
            for every person, and treatment may be advised alongside your existing medical care.
          </p>

          <div style={{ textAlign: "center", marginTop: "2.6rem" }}>
            <Link className="btn btn--green" to="/contact">
              Book a Consultation
            </Link>{" "}
            <a
              className="btn btn--outline"
              href={buildWhatsAppLink(generalEnquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp width={17} height={17} />
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
