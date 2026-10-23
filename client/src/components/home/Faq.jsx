import { faqs } from "../../data/content.js";
import { IconWhatsApp } from "../ui/Icons.jsx";
import FaqAccordion from "../ui/FaqAccordion.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";

export default function Faq() {
  return (
    <section className="section section--ivory">
      <div className="container">
        <SectionHeading
          center
          label="Got Questions"
          title="Frequently asked"
          accent="questions"
          desc="Have something not listed here? Reach out on WhatsApp and our team will be glad to help."
        />
        <FaqAccordion items={faqs} />
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <a
            className="btn btn--forest"
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
  );
}
