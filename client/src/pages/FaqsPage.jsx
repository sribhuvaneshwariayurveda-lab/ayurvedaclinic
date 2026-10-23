import { useContentSection } from "../data/store.js";
import { IconWhatsApp } from "../components/ui/Icons.jsx";
import FaqAccordion from "../components/ui/FaqAccordion.jsx";
import { buildWhatsAppLink, generalEnquiryMessage } from "../lib/whatsapp.js";

export default function FaqsPage() {
  const faqs = useContentSection("faqs") || [];
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__label">Got Questions</span>
          <h1>Frequently Asked Questions</h1>
          <p>Have something not listed here? Reach out on WhatsApp and our team will be glad to help.</p>
        </div>
      </section>

      <section className="content-block">
        <div className="container">
          <FaqAccordion items={faqs} />
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <a
              className="btn btn--green"
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
