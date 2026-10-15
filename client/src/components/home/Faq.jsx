import { useState } from "react";
import { faqs } from "../../data/content.js";
import { IconPlus, IconWhatsApp } from "../ui/Icons.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";

export default function Faq() {
  const [open, setOpen] = useState(0);

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
        <div className="faq">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} className={`faq__item${isOpen ? " is-open" : ""}`}>
                <button
                  className="faq__q"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                >
                  {item.q}
                  <span className="faq__ic">
                    <IconPlus width={15} height={15} />
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
