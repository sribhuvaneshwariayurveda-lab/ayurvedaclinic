import AppointmentCta from "../components/home/AppointmentCta.jsx";
import Faq from "../components/home/Faq.jsx";

export default function FaqsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label" style={{ color: "var(--gold-light)" }}>FAQs</span>
          <h1>Frequently asked questions</h1>
          <p>
            What to expect from consultation, treatment timelines, safety alongside
            current medication, and how WhatsApp booking works.
          </p>
        </div>
      </section>
      <Faq />
      <AppointmentCta />
    </>
  );
}
