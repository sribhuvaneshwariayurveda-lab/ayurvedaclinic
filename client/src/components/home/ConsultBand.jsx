import { Link } from "react-router-dom";
import { clinic } from "../../data/content.js";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";
import { IconArrowRight, IconWhatsApp } from "../ui/Icons.jsx";
import Reveal from "../ui/Reveal.jsx";

export default function ConsultBand() {
  return (
    <section className="section" style={{ paddingBlock: "0" }}>
      <div className="container">
        <Reveal className="band">
          <div>
            <h2 className="band__title">
              Not sure where to begin?{" "}
              <span className="italic-serif" style={{ color: "var(--gold-light)" }}>
                Speak to the physician.
              </span>
            </h2>
            <p className="band__desc">
              Share your concern and we will guide you to the right consultation. Enquiries are
              answered during clinic hours.
            </p>
          </div>
          <div className="band__actions">
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
              WhatsApp us
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
