import { clinic } from "../../data/content.js";
import { IconCalendar, IconWhatsApp } from "../ui/Icons.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import AppointmentForm from "./AppointmentForm.jsx";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";

export default function AppointmentCta() {
  return (
    <section className="section section--champagne" id="appointment">
      <div className="container contact__grid">
        <div>
          <SectionHeading
            label="Appointments"
            title="Request your"
            accent="consultation"
            desc="Send an enquiry with your preferred date and time. The fastest way to reach us is WhatsApp — our team responds during clinic hours."
          />
          <Reveal style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.6rem" }}>
            <a
              className="btn btn--forest"
              href={buildWhatsAppLink(generalEnquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp width={17} height={17} />
              Chat on WhatsApp
            </a>
            <a className="btn btn--outline" href={`tel:${clinic.phone.replace(/\s/g, "")}`}>
              <IconCalendar width={17} height={17} />
              {clinic.phoneDisplay}
            </a>
          </Reveal>
          <Reveal className="pillar" style={{ maxWidth: 420 }}>
            <b>Clinic hours</b>
            {clinic.hours.map((h) => (
              <span key={h.day} style={{ display: "block" }}>
                {h.day}: {h.time}
              </span>
            ))}
          </Reveal>
        </div>

        <Reveal delay={1}>
          <AppointmentForm />
        </Reveal>
      </div>
    </section>
  );
}
