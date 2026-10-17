import { Link } from "react-router-dom";
import { about, clinic } from "../data/content.js";
import { IconCheck } from "../components/ui/Icons.jsx";
import Media from "../components/ui/Media.jsx";
import Reveal from "../components/ui/Reveal.jsx";

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__label">About Us</span>
          <h1>Care rooted in tradition, guided by evidence</h1>
          <p>{about.paragraphs[0]}</p>
        </div>
      </section>

      <section className="content-block">
        <div className="container">
          <div className="grid-2">
            <Reveal className="media-frame" variant="left">
              <Media src={about.photos.doctor.src} alt={about.photos.doctor.alt} label="The physician" />
            </Reveal>
            <Reveal variant="right">
              <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                The Physician
              </span>
              <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
                {clinic.doctor}, {clinic.qualifications}
              </h2>
              <p className="section-desc">{about.paragraphs[1]}</p>
              <ul className="about-band__list">
                {about.credentials.map((c) => (
                  <li key={c}>
                    <IconCheck width={16} height={16} aria-hidden="true" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
              <Link className="btn btn--green" to="/contact">
                Book a Consultation
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="content-block" style={{ background: "var(--mint-soft)" }}>
        <div className="container">
          <div className="grid-2">
            <Reveal variant="left">
              <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                Our Clinic
              </span>
              <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
                A calm space for classical care
              </h2>
              <p className="section-desc">
                At {clinic.name}, every visit begins with careful listening. Consultations are unhurried,
                treatment plans are explained clearly, and expectations are kept honest — no exaggerated
                promises, only individualised care.
              </p>
              <div className="grid-2" style={{ marginTop: "1.4rem", gap: "1rem" }}>
                {about.pillars.map((p) => (
                  <div className="pillar" key={p.title}>
                    <b style={{ display: "block", color: "var(--forest)", marginBottom: "0.3rem" }}>{p.title}</b>
                    <span style={{ fontSize: "0.9rem" }}>{p.text}</span>
                  </div>
                ))}
              </div>
              <p className="section-desc" style={{ marginTop: "1.4rem", fontStyle: "italic" }}>
                &ldquo;{about.quote}&rdquo;
              </p>
            </Reveal>
            <Reveal className="media-frame" variant="right">
              <Media src={about.photos.clinic.src} alt={about.photos.clinic.alt} label="The clinic" />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
