import AboutDoctor from "../components/home/AboutDoctor.jsx";
import ConsultBand from "../components/home/ConsultBand.jsx";
import ContactClinic from "../components/home/ContactClinic.jsx";
import { clinic } from "../data/content.js";

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label" style={{ color: "var(--gold-light)" }}>About</span>
          <h1>About {clinic.name}</h1>
          <p>
            Classical Ayurvedic care in Pasupathipalayam, Karur — led personally by{" "}
            {clinic.doctor}, {clinic.qualifications} (Reg. No. {clinic.regNo}),{" "}
            {clinic.university} ({clinic.graduationYear}), with {clinic.experience}.
          </p>
        </div>
      </section>
      <AboutDoctor />
      <ContactClinic />
      <ConsultBand />
    </>
  );
}
