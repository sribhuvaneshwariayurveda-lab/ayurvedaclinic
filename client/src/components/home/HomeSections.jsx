import { useState } from "react";
import { Link } from "react-router-dom";
import {
  about,
  clinic,
  contact,
  faqs,
  gallery,
  treatments,
  why
} from "../../data/content.js";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";
import {
  IconAward,
  IconCheck,
  IconHeart,
  IconLeaf,
  IconMapPin,
  IconPhone,
  IconShield,
  IconUsers,
  IconWhatsApp
} from "../ui/Icons.jsx";
import Media from "../ui/Media.jsx";
import Reveal from "../ui/Reveal.jsx";
import AppointmentForm from "./AppointmentForm.jsx";

/* Illustrative imagery for each treatment (clinic botanical assets). */
const treatmentImages = [
  "/images/doctor.jpg",
  "/images/mortar-sun.jpg",
  "/images/tulsi-grove.jpg",
  "/images/tulsi-macro.jpg",
  "/images/tulsi-sprout.jpg",
  "/images/tulsi-spike.jpg"
];

/* ---------------------------------------------------------------- Counters */
const counters = [
  { num: "BAMS", title: "Qualified Physician" },
  { num: "2023", title: "Graduated · M.G.R. University" },
  { num: "2 yrs", title: "Clinical Experience" },
  { num: "2366/A", title: "Registered Practitioner" },
  { num: "Karur", title: "Pasupathipalayam, Tamil Nadu" }
];

export function Counters() {
  return (
    <section className="counters-band" aria-label="Clinic credentials at a glance">
      <div className="container">
        <div className="counters-band__grid">
          {counters.map((c, i) => (
            <Reveal key={c.title} delay={i % 5} className="counter">
              <div className="counter__num">{c.num}</div>
              <div className="counter__title">{c.title}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Credentials band */
const credentials = [
  { Icon: IconAward, title: "BAMS", sub: "Bachelor of Ayurvedic Medicine & Surgery" },
  { Icon: IconShield, title: "Reg. 2366/A", sub: "Registered Ayurvedic practitioner" },
  { Icon: IconUsers, title: "M.G.R. University", sub: "Chennai · graduated 2023" },
  { Icon: IconHeart, title: "2 Years", sub: "Clinical experience" },
  { Icon: IconLeaf, title: "Karur", sub: "Pasupathipalayam, Tamil Nadu" }
];

export function Credentials() {
  return (
    <>
      <div className="awards-band">
        <div className="container">
          <h2>Credentials &amp; Registration</h2>
        </div>
      </div>
      <div className="awards-strip">
        <div className="container">
          <div className="awards-strip__grid">
            {credentials.map(({ Icon, title, sub }, i) => (
              <Reveal key={title} delay={i % 5} className="credential">
                <span className="credential__badge">
                  <Icon width={40} height={40} aria-hidden="true" />
                </span>
                <span className="credential__title">{title}</span>
                <span className="credential__sub">{sub}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------- About band */
export function AboutBand() {
  return (
    <section className="about-band">
      <div className="container">
        <div className="about-band__grid">
          <Reveal className="about-band__media" variant="left">
            <Media src={about.photos.clinic.src} alt={about.photos.clinic.alt} label="The clinic" />
          </Reveal>

          <Reveal variant="right">
            <span className="section-sub">About the Clinic</span>
            <h2>Care rooted in tradition, guided by evidence</h2>
            <p>{about.paragraphs[0]}</p>
            <ul className="about-band__list">
              {about.credentials.map((c) => (
                <li key={c}>
                  <IconCheck width={16} height={16} aria-hidden="true" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <Link className="btn btn--brown" to="/about">
              About Us
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ Treatments marquee */
export function TreatmentsMarquee() {
  const rowA = treatments.map((t, i) => ({ ...t, image: treatmentImages[i % treatmentImages.length] }));
  const rowB = [...rowA].reverse();
  const Item = ({ t }) => (
    <div className="marquee__item">
      <Media src={t.image} alt={t.title} label={t.mediaLabel} />
      <span>{t.title}</span>
    </div>
  );
  return (
    <>
      <div className="head-band">
        <div className="container">
          <h2 className="section-title">Treatments Offered</h2>
          <p className="section-sub">Personalised, doctor-led classical care</p>
        </div>
      </div>
      <div className="marquee-band">
        <div className="marquee">
          {rowA.map((t) => (
            <Item key={`a-${t.title}`} t={t} />
          ))}
          {rowA.map((t) => (
            <Item key={`a2-${t.title}`} t={t} />
          ))}
        </div>
        <div className="marquee marquee--reverse">
          {rowB.map((t) => (
            <Item key={`b-${t.title}`} t={t} />
          ))}
          {rowB.map((t) => (
            <Item key={`b2-${t.title}`} t={t} />
          ))}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Why grid */
export function WhyGrid() {
  return (
    <>
      <div className="head-band">
        <div className="container">
          <h2 className="section-title">Why Patients Choose Us</h2>
          <p className="section-sub">Ethical, unhurried, individualised care</p>
        </div>
      </div>
      <section className="why-band">
        <div className="container">
          <div className="why-grid">
            {why.map((item, i) => (
              <Reveal key={item.title} delay={i % 3} className="why-box">
                <span className="why-box__num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ----------------------------------------------------------- Power of Ayurveda */
export function PowerBand() {
  return (
    <section className="power-band">
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 760, marginInline: "auto" }}>
          <span className="section-sub" style={{ color: "var(--green-dark)" }}>
            Materia Medica
          </span>
          <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
            The Power of Ayurveda
          </h2>
          <p className="section-desc" style={{ marginInline: "auto" }}>
            Classical formulations begin with plants — identified, prepared and combined according to
            traditional method. A glimpse of the botanical world behind the clinic&rsquo;s medicine.
          </p>
        </div>
        <div className="power-grid">
          {gallery.images.map((img, i) => (
            <Reveal key={img.src} delay={i % 3} className="power-card">
              <div className="power-card__media">
                <Media src={img.src} alt={img.alt} label={img.caption} />
              </div>
              <div className="power-card__body">
                <h3>{img.caption}</h3>
                <p>{img.alt}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- CTA band */
export function CtaBand() {
  return (
    <section className="cta-band">
      <div className="container">
        <Reveal>
          <h2>Begin your journey to balance</h2>
          <div className="cta-band__actions">
            <Link className="btn btn--green" to="/contact">
              Book a Consultation
            </Link>
            <a
              className="btn btn--ghost-light"
              href={buildWhatsAppLink(generalEnquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp width={18} height={18} />
              WhatsApp the Clinic
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Testimonials */
export function TestimonialsBand() {
  return (
    <section className="testi-band">
      <div className="container">
        <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
          What Our Patients Say
        </h2>
        <Reveal className="testi-note">
          <p style={{ margin: 0 }}>
            Testimonials will be published only with genuine patient consent. No results are
            guaranteed. If you would like to share your experience, please speak with us at the clinic.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- FAQ */
export function HomeFaq() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <div className="head-band">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-sub">Answers before your visit</p>
        </div>
      </div>
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
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

/* ---------------------------------------------------------------- Contact */
export function ContactBand() {
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    clinic.addressLines.join(", ")
  )}&output=embed`;
  return (
    <section className="contact-band" id="contact">
      <div className="container">
        <Reveal style={{ textAlign: "center", marginBottom: "2.4rem" }}>
          <span className="section-sub" style={{ color: "var(--green-dark)" }}>
            {contact.label}
          </span>
          <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
            {contact.title}
          </h2>
          <p className="section-desc" style={{ marginInline: "auto" }}>
            {contact.desc}
          </p>
        </Reveal>

        <div className="contact-band__grid">
          <div>
            <div className="info-card">
              <div className="info-row">
                <span className="info-row__ic">
                  <IconMapPin width={20} height={20} aria-hidden="true" />
                </span>
                <span>
                  <b>Clinic address</b>
                  <a href={clinic.mapsUrl} target="_blank" rel="noopener noreferrer">
                    {clinic.addressLines.join(", ")}
                  </a>
                </span>
              </div>
              <div className="info-row">
                <span className="info-row__ic">
                  <IconPhone width={20} height={20} aria-hidden="true" />
                </span>
                <span>
                  <b>Phone / WhatsApp</b>
                  <a href={`tel:${clinic.phone.replace(/\s/g, "")}`}>{clinic.phoneDisplay}</a>
                </span>
              </div>
              <div className="info-row">
                <span className="info-row__ic">
                  <IconWhatsApp width={20} height={20} aria-hidden="true" />
                </span>
                <span>
                  <b>Consultations</b>
                  {clinic.hoursNote} — send an enquiry and our team will confirm a slot.
                </span>
              </div>
            </div>
            <div className="map" style={{ marginTop: "1.4rem" }}>
              <iframe title="Clinic location map" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>
          <AppointmentForm />
        </div>
      </div>
    </section>
  );
}
