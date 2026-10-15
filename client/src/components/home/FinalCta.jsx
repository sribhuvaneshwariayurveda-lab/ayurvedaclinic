import { Link } from "react-router-dom";
import { clinic } from "../../data/content.js";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";
import { IconArrowRight, IconWhatsApp } from "../ui/Icons.jsx";
import Reveal from "../ui/Reveal.jsx";

export default function FinalCta() {
  return (
    <section className="section section--ivory">
      <div className="container">
        <Reveal className="final">
          <span className="section-label" style={{ color: "var(--gold-light)" }}>
            Begin Today
          </span>
          <h2 className="section-title">
            Your wellbeing deserves{" "}
            <span className="italic-serif" style={{ color: "var(--gold-light)" }}>
              considered care.
            </span>
          </h2>
          <div className="divider-gold" style={{ marginInline: "auto" }} />
          <p className="section-desc" style={{ marginInline: "auto", color: "rgba(247,243,234,0.78)" }}>
            Book a consultation with {clinic.doctor} and receive a personalised, honest Ayurvedic
            plan tailored to you.
          </p>
          <div className="final__actions">
            <Link className="btn btn--gold" to="/contact">
              Book Consultation
              <IconArrowRight width={17} height={17} />
            </Link>
            <a
              className="btn btn--ghost-light"
              href={buildWhatsAppLink(generalEnquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp width={17} height={17} />
              WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
