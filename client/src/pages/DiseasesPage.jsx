import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useContentSection } from "../data/store.js";
import DiseaseCard from "../components/diseases/DiseaseCard.jsx";
import Carousel from "../components/ui/Carousel.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import SectionHeading from "../components/ui/SectionHeading.jsx";
import { IconWhatsApp } from "../components/ui/Icons.jsx";
import { buildWhatsAppLink, generalEnquiryMessage } from "../lib/whatsapp.js";

/**
 * "Diseases We Specialise In" — an educational overview of the conditions
 * the clinic sees most often, with a carousel, a filterable grid and a link
 * to each condition's detail page.
 *
 * Nothing on this page is a medical claim: each condition links to its own
 * page carrying the full disclaimer.
 */
export default function DiseasesPage() {
  const diseases = useContentSection("diseases");
  const credits = useContentSection("credits");
  const [filter, setFilter] = useState("All");

  const items = diseases?.items || [];
  const categories = diseases?.categories || ["All"];

  const visible = useMemo(
    () => (filter === "All" ? items : items.filter((i) => i.category === filter)),
    [items, filter]
  );

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__label">{diseases?.label}</span>
          <h1>
            {diseases?.title} <span className="italic-serif">{diseases?.titleAccent}</span>
          </h1>
          <p>{diseases?.desc}</p>
        </div>
      </section>

      {/* ---- Carousel ---------------------------------------------------- */}
      <section className="section section--soft disease-carousel-band">
        <div className="container">
          <SectionHeading
            center
            label="Browse by condition"
            title="Conditions we"
            accent="support."
            desc="Swipe or use the arrows to move through the conditions we see most often."
          />
          <Carousel label="Conditions we support" className="disease-carousel">
            {items.map((item, i) => (
              <Reveal key={item.slug} delay={i % 3} className="carousel__item">
                <DiseaseCard item={item} />
              </Reveal>
            ))}
          </Carousel>
        </div>
      </section>

      {/* ---- Filterable grid --------------------------------------------- */}
      <section className="content-block">
        <div className="container">
          <div className="filter-row" role="group" aria-label="Filter conditions by area">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`filter-chip${filter === c ? " is-active" : ""}`}
                onClick={() => setFilter(c)}
                aria-pressed={filter === c}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="disease-grid">
            {visible.map((item, i) => (
              <Reveal key={item.slug} delay={i % 3} className="disease-grid__item">
                <DiseaseCard item={item} />
              </Reveal>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="section-desc center" style={{ marginInline: "auto" }}>
              No conditions in this category yet. Please check back soon or contact the clinic.
            </p>
          ) : null}

          <p className="product-note">{diseases?.note}</p>

          <div className="disease-cta">
            <Link className="btn btn--green" to="/contact">
              Book a Consultation
            </Link>
            <a
              className="btn btn--outline"
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

      {/* ---- Credits ------------------------------------------------------ */}
      <section className="content-block section--soft">
        <div className="container">
          <h2 className="section-title" style={{ fontSize: "1.5rem" }}>
            {credits?.label}
          </h2>
          <p className="gallery__credit">{credits?.note}</p>
          <ul className="credit-list">
            {(credits?.items || []).map((c) => (
              <li key={c.name}>
                {c.name} — {c.author}, {c.license}, via Wikimedia Commons
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
