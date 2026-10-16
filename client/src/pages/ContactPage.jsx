import AppointmentCta from "../components/home/AppointmentCta.jsx";
import ContactClinic from "../components/home/ContactClinic.jsx";

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label" style={{ color: "var(--gold-light)" }}>Contact</span>
          <h1>Visit the clinic &amp; book</h1>
          <p>
            Find us in Pasupathipalayam, Karur. Send an appointment enquiry through the
            form or on WhatsApp — our team will confirm your slot.
          </p>
        </div>
      </section>
      <ContactClinic />
      <AppointmentCta />
    </>
  );
}
