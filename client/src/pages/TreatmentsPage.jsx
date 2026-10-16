import AppointmentCta from "../components/home/AppointmentCta.jsx";
import ConsultBand from "../components/home/ConsultBand.jsx";
import Treatments from "../components/home/Treatments.jsx";

export default function TreatmentsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label" style={{ color: "var(--gold-light)" }}>Treatments</span>
          <h1>Ayurveda treatments &amp; services</h1>
          <p>
            Consultation-led care — from detailed Prakriti assessment to Panchakarma and
            everyday wellness guidance. Every plan is tailored to the individual and
            reviewed by the physician.
          </p>
        </div>
      </section>
      <Treatments />
      <ConsultBand />
      <AppointmentCta />
    </>
  );
}
