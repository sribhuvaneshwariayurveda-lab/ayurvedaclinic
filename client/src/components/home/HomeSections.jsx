import { useState } from "react";
import { Link } from "react-router-dom";
import { useContentSection } from "../../data/store.js";
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
import Carousel from "../ui/Carousel.jsx";
import DiseaseCard from "../diseases/DiseaseCard.jsx";
import ProductCard from "../products/ProductCard.jsx";
import CountUp from "../ui/CountUp.jsx";
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

/* ------------------------------------------------------------- Home stats */
const fallbackStats = [
  { value: "2K+", label: "Patients Treated" },
  { value: "2+ Decades", label: "Years of Trusted Service" },
  { value: "1.8K+", label: "In-house Herbal Medicines" },
  { value: "46K+", label: "Treatments & Therapies Offered" }
];

export function StatsBand() {
  const stats = useContentSection("stats");
  const items = Array.isArray(stats?.items) && stats.items.length ? stats.items : fallbackStats;
  return (
    <section className="counters-band stats-band" aria-label="The clinic at a glance">
      <div className="container">
        <Reveal className="stats-band__head">
          <span className="section-sub">{stats?.label || "The clinic at a glance"}</span>
          <p>{stats?.title || "Care measured in experience, tradition and trust."}</p>
        </Reveal>
        <div className="counters-band__grid stats-band__grid">
          {items.map((item, i) => (
            <Reveal key={`${item.value}-${item.label}`} delay={i % 4} className="counter stats-band__item">
              <div className="counter__num">
                <CountUp value={item.value} />
              </div>
              <div className="counter__title">{item.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------- Credentials band */
export function Credentials() {
  const clinic = useContentSection("clinic");
  const credentials = [
    { Icon: IconAward, title: "BAMS", sub: "Bachelor of Ayurvedic Medicine & Surgery" },
    { Icon: IconShield, title: `Reg. ${clinic?.regNo || ""}`.trim(), sub: "Registered Ayurvedic practitioner" },
    { Icon: IconUsers, title: "M.G.R. University", sub: "Chennai · graduated 2023" },
    { Icon: IconHeart, title: "2 Years", sub: "Clinical experience" },
    { Icon: IconLeaf, title: "Karur", sub: "Pasupathipalayam, Tamil Nadu" }
  ];
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
  const about = useContentSection("about");
  const clinic = useContentSection("clinic");
  const pillars = about?.pillars || [];

  return (
    <section className="about-band about-band--revamp">
      <div className="container">
        <div className="about-band__grid">
          <div className="about-band__visual">
            <Reveal className="about-band__media" variant="left">
              <Media src={about?.photos?.clinic?.src} alt={about?.photos?.clinic?.alt} label="The clinic" />
            </Reveal>
            <Reveal className="about-band__portrait" variant="zoom" delay={1}>
              <Media src={about?.photos?.doctor?.src} alt={about?.photos?.doctor?.alt} label="The physician" />
            </Reveal>
            <span className="about-band__seal">
              <b>{clinic?.qualifications || "BAMS"}</b>
              <span>Reg. {clinic?.regNo}</span>
            </span>
          </div>

          <Reveal variant="right" className="about-band__copy">
            <span className="section-sub">About the Clinic</span>
            <h2>
              {about?.title} <span className="italic-serif">{about?.titleAccent}</span>
            </h2>
            <p>{about?.paragraphs?.[0]}</p>

            {pillars.length ? (
              <div className="about-band__pillars">
                {pillars.map((pillar) => (
                  <div key={pillar.title} className="about-band__pillar">
                    <b>{pillar.title}</b>
                    <span>{pillar.text}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <ul className="about-band__list">
              {(about?.credentials || []).slice(0, 3).map((c) => (
                <li key={c}>
                  <IconCheck width={16} height={16} aria-hidden="true" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <div className="about-band__actions">
              <Link className="btn btn--brown" to="/about">
                About Us
              </Link>
              <Link className="btn btn--outline" to="/treatments">
                Our Treatments
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ Treatments marquee */
export function TreatmentsMarquee() {
  const treatments = useContentSection("treatments") || [];
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
      <div className="container">
        <div className="disease-cta">
          <Link className="btn btn--forest" to="/treatments">
            Explore All Treatments
          </Link>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------- Products band */
export function ProductsBand() {
  const products = useContentSection("products");
  const items = products?.items || [];
  return (
    <>
      <div className="head-band">
        <div className="container">
          <h2 className="section-title">Our Medicines</h2>
          <p className="section-sub">Classical herbal preparations, dispensed after consultation</p>
        </div>
      </div>
      <section className="section section--ivory" id="products" aria-label="Clinic herbal medicines">
        <div className="container">
          <div className="product-grid">
            {items.slice(0, 6).map((item, i) => (
              <Reveal key={item.slug || item.name} delay={i % 3} className="product-grid__item">
                <ProductCard item={item} />
              </Reveal>
            ))}
          </div>

          <p className="product-note">{products?.note}</p>

          <div className="disease-cta">
            <Link className="btn btn--forest" to="/products">
              View All Medicines
            </Link>
            <a
              className="btn btn--gold"
              href={buildWhatsAppLink(generalEnquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp width={17} height={17} />
              Ask About Medicines
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------- Diseases carousel band */
export function DiseasesCarouselBand() {
  const diseases = useContentSection("diseases");
  const items = diseases?.items || [];
  return (
    <>
      <div className="head-band">
        <div className="container">
          <h2 className="section-title">Diseases We Specialise In</h2>
          <p className="section-sub">Educational overview — always alongside your doctor&rsquo;s care</p>
        </div>
      </div>
      <section className="section section--soft" id="diseases" aria-label="Diseases we specialise in">
        <div className="container">
          {items.length > 0 ? (
            <Carousel label="Diseases we specialise in" className="disease-carousel">
              {items.map((item, i) => (
                <Reveal key={item.slug} delay={i % 3} className="carousel__item">
                  <DiseaseCard item={item} />
                </Reveal>
              ))}
            </Carousel>
          ) : (
            <p className="section-desc">Condition information will appear here shortly.</p>
          )}

          <p className="product-note">{diseases?.note}</p>

          <div className="disease-cta">
            <Link className="btn btn--green" to="/diseases">
              See All Conditions
            </Link>
            <Link className="btn btn--outline" to="/contact">
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- Why grid */
export function WhyGrid() {
  const why = useContentSection("why") || [];
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
  const gallery = useContentSection("gallery");
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
          {(gallery?.images || []).map((img, i) => (
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
  const note = useContentSection("testimonialsNote");
  const items = useContentSection("testimonials") || [];
  const published = items.filter((t) => t && String(t.quote || "").trim());
  return (
    <section className="testi-band">
      <div className="container">
        <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
          What Our Patients Say
        </h2>

        {published.length > 0 ? (
          <>
            <div className="testi-grid">
              {published.map((t, i) => (
                <Reveal key={`${t.name || "anonymous"}-${i}`} delay={i % 3} className="testi-card">
                  <blockquote className="testi-card__quote">{t.quote}</blockquote>
                  <p className="testi-card__name">
                    {t.name ? t.name : "Anonymous"}
                    {t.treatment ? <span className="testi-card__meta"> — {t.treatment}</span> : null}
                  </p>
                </Reveal>
              ))}
            </div>
            <Reveal className="testi-note">
              <p style={{ margin: 0 }}>
                {note ||
                  "Testimonials will be published only with genuine patient consent. No results are guaranteed."}
              </p>
            </Reveal>
          </>
        ) : (
          <Reveal className="testi-note">
            <p style={{ margin: 0 }}>
              {note ||
                "Testimonials will be published only with genuine patient consent. No results are guaranteed."}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- FAQ */
export function HomeFaq() {
  const faqs = useContentSection("faqs") || [];
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
  const clinic = useContentSection("clinic");
  const contact = useContentSection("contact");
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    (clinic?.addressLines || []).join(", ")
  )}&output=embed`;
  return (
    <section className="contact-band" id="contact">
      <div className="container">
        <Reveal style={{ textAlign: "center", marginBottom: "2.4rem" }}>
          <span className="section-sub" style={{ color: "var(--green-dark)" }}>
            {contact?.label}
          </span>
          <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
            {contact?.title}
          </h2>
          <p className="section-desc" style={{ marginInline: "auto" }}>
            {contact?.desc}
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
                  <a href={clinic?.mapsUrl} target="_blank" rel="noopener noreferrer">
                    {(clinic?.addressLines || []).join(", ")}
                  </a>
                </span>
              </div>
              <div className="info-row">
                <span className="info-row__ic">
                  <IconPhone width={20} height={20} aria-hidden="true" />
                </span>
                <span>
                  <b>Phone / WhatsApp</b>
                  <a href={`tel:${String(clinic?.phone || "").replace(/\s/g, "")}`}>{clinic?.phoneDisplay}</a>
                </span>
              </div>
              <div className="info-row">
                <span className="info-row__ic">
                  <IconWhatsApp width={20} height={20} aria-hidden="true" />
                </span>
                <span>
                  <b>Consultations</b>
                  {clinic?.hoursNote} — send an enquiry and our team will confirm a slot.
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
