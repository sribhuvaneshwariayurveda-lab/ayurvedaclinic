import { Link } from "react-router-dom";
import { useContentSection } from "../data/store.js";
import { IconWhatsApp } from "../components/ui/Icons.jsx";
import Media from "../components/ui/Media.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { buildWhatsAppLink, generalEnquiryMessage } from "../lib/whatsapp.js";

const treatmentImages = [
  "/images/doctor.jpg",
  "/images/mortar-sun.jpg",
  "/images/tulsi-grove.jpg",
  "/images/tulsi-macro.jpg",
  "/images/tulsi-sprout.jpg",
  "/images/tulsi-spike.jpg"
];

export default function TreatmentsPage() {
  const treatments = useContentSection("treatments") || [];
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
          <div className="treatments-grid">
            {treatments.map((t, i) => (
              <Reveal key={t.title} delay={i % 3} className="tcard">
                <div className="tcard__media">
                  <Media
                    src={treatmentImages[i % treatmentImages.length]}
                    alt={t.title}
                    label={t.mediaLabel}
                  />
                </div>
                <div className="tcard__body">
                  <span className="tcard__cat">{t.cat}</span>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

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
