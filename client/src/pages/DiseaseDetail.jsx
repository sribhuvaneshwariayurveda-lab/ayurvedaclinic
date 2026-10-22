import { Link, useParams } from "react-router-dom";
import { useContentSection } from "../data/store.js";
import Media from "../components/ui/Media.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { IconArrowLeft, IconArrowRight, IconWhatsApp } from "../components/ui/Icons.jsx";
import { buildWhatsAppLink, conditionEnquiryMessage } from "../lib/whatsapp.js";

/**
 * Detail page for one condition.
 *
 * The content is educational: it describes the condition, the features people
 * commonly notice, how classical Ayurveda approaches it as supportive care,
 * and the limits of that care. The disclaimer is shown prominently and is
 * part of the page, not a footnote.
 */
export default function DiseaseDetail() {
  const { slug } = useParams();
  const diseases = useContentSection("diseases");
  const items = diseases?.items || [];

  const index = items.findIndex((i) => i.slug === slug);
  const item = index >= 0 ? items[index] : null;
  const previous = index > 0 ? items[index - 1] : null;
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null;

  if (!item) {
    return (
      <section className="content-block" style={{ minHeight: "55vh", display: "grid", placeItems: "center" }}>
        <div className="container center">
          <span className="section-sub" style={{ color: "var(--green-dark)" }}>
            Not found
          </span>
          <h1 className="section-title" style={{ color: "var(--green-dark)" }}>
            We could not find that condition
          </h1>
          <div className="divider-gold" style={{ marginInline: "auto" }} />
          <p className="section-desc" style={{ marginInline: "auto" }}>
            The page you were looking for is not here. Browse the full list of conditions we
            support, or contact the clinic and we will help directly.
          </p>
          <Link className="btn btn--green" to="/diseases" style={{ marginTop: "1.6rem" }}>
            All Conditions
          </Link>
        </div>
      </section>
    );
  }

  const image = item.image || {};

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__label">{item.category}</span>
          <h1>{item.name}</h1>
          <p>{item.summary}</p>
        </div>
      </section>

      <section className="content-block">
        <div className="container">
          <div className="detail-grid">
            <Reveal className="detail-media" variant="left">
              <Media src={image.src} alt={image.alt || item.name} label={item.name} />
              {item.credit ? <span className="detail-credit">{item.credit}</span> : null}
            </Reveal>

            <Reveal variant="right">
              <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                The Condition
              </span>
              <h2 className="section-title" style={{ color: "var(--green-dark)", fontSize: "1.9rem" }}>
                Understanding {item.name}
              </h2>
              <p className="section-desc">{item.summary}</p>

              {Array.isArray(item.symptoms) && item.symptoms.length > 0 ? (
                <>
                  <h3 className="detail-sub">Features people commonly notice</h3>
                  <ul className="about-band__list">
                    {item.symptoms.map((s) => (
                      <li key={s}>
                        <span className="detail-bullet" aria-hidden="true" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </Reveal>
          </div>
        </div>
      </section>

      <section className="content-block" style={{ background: "var(--mint-soft)" }}>
        <div className="container">
          <div className="grid-2">
            <Reveal variant="left">
              <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                Ayurvedic Approach
              </span>
              <h2 className="section-title" style={{ color: "var(--green-dark)", fontSize: "1.9rem" }}>
                How we approach {item.name.toLowerCase()}
              </h2>
              <p className="section-desc">{item.approach}</p>
            </Reveal>

            <Reveal variant="right">
              <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                Daily Support
              </span>
              <h2 className="section-title" style={{ color: "var(--green-dark)", fontSize: "1.9rem" }}>
                Lifestyle and dietary guidance
              </h2>
              <ul className="about-band__list">
                {(item.lifestyle || []).map((l) => (
                  <li key={l}>
                    <span className="detail-bullet" aria-hidden="true" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {item.disclaimer ? (
            <div className="disclaimer">
              <span className="disclaimer__label">Important</span>
              <p>{item.disclaimer}</p>
            </div>
          ) : null}

          <div className="disease-cta">
            <Link className="btn btn--green" to="/contact">
              Book a Consultation
            </Link>
            <a
              className="btn btn--outline"
              href={buildWhatsAppLink(conditionEnquiryMessage(item.name))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp width={17} height={17} />
              Ask about this condition
            </a>
          </div>
        </div>
      </section>

      <nav className="detail-nav" aria-label="Other conditions">
        <div className="container detail-nav__inner">
          {previous ? (
            <Link className="detail-nav__link" to={`/diseases/${previous.slug}`}>
              <IconArrowLeft width={18} height={18} aria-hidden="true" />
              <span>
                <small>Previous</small>
                {previous.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link className="detail-nav__all" to="/diseases">
            All conditions
          </Link>
          {next ? (
            <Link className="detail-nav__link detail-nav__link--next" to={`/diseases/${next.slug}`}>
              <span>
                <small>Next</small>
                {next.name}
              </span>
              <IconArrowRight width={18} height={18} aria-hidden="true" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </nav>
    </>
  );
}
