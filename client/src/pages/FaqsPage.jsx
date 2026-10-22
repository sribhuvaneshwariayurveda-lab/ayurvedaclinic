import { useState } from "react";
import { useContentSection } from "../data/store.js";
import { IconWhatsApp } from "../components/ui/Icons.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { buildWhatsAppLink, generalEnquiryMessage } from "../lib/whatsapp.js";

export default function FaqsPage() {
  const faqs = useContentSection("faqs") || [];
  const [open, setOpen] = useState(0);
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
          <div className="faq">
            {faqs.map((item, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={item.q} className={`faq__item${isOpen ? " is-open" : ""}`}>
                  <button className="faq__q" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}>
                    {item.q}
                    <span className="faq__ic" aria-hidden="true">
                      +
                    </span>
                  </button>
                  <div className="faq__a">
                    <div className="faq__a-inner">{item.a}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
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
