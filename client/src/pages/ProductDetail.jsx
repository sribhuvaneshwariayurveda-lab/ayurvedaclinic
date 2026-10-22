import { Link, useParams } from "react-router-dom";
import { useContentSection } from "../data/store.js";
import Media from "../components/ui/Media.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { IconArrowLeft, IconArrowRight, IconWhatsApp } from "../components/ui/Icons.jsx";
import { buildWhatsAppLink, productEnquiryMessage } from "../lib/whatsapp.js";

/**
 * Detail page for one clinic product.
 *
 * Copy is deliberately claim-free: it describes what the product is, how it
 * is dispensed and how it is used, and it states plainly that no product
 * cures a condition or replaces prescribed treatment.
 */
export default function ProductDetail() {
  const { slug } = useParams();
  const products = useContentSection("products");
  const items = products?.items || [];

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
            We could not find that product
          </h1>
          <div className="divider-gold" style={{ marginInline: "auto" }} />
          <p className="section-desc" style={{ marginInline: "auto" }}>
            The product you were looking for is not listed. View everything available at the clinic,
            or send us an enquiry and we will guide you.
          </p>
          <Link className="btn btn--green" to="/products" style={{ marginTop: "1.6rem" }}>
            All Products
          </Link>
        </div>
      </section>
    );
  }

  const image = item.image || {};
  const gallery = Array.isArray(item.gallery) && item.gallery.length > 0 ? item.gallery : [image];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__label">{item.category || item.tag}</span>
          <h1>{item.name}</h1>
          <p>{item.text}</p>
        </div>
      </section>

      <section className="content-block">
        <div className="container">
          <div className="detail-grid">
            <Reveal className="detail-media" variant="left">
              <Media src={image.src} alt={image.alt || item.name} label={item.name} />
              {gallery.length > 1 ? (
                <div className="product-thumbs">
                  {gallery.map((g) => (
                    <span className="product-thumb" key={g.src}>
                      <img src={g.src} alt={g.alt || item.name} loading="lazy" decoding="async" />
                    </span>
                  ))}
                </div>
              ) : null}
            </Reveal>

            <Reveal variant="right">
              <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                {item.tag}
              </span>
              <h2 className="section-title" style={{ color: "var(--green-dark)", fontSize: "1.9rem" }}>
                {item.name}
              </h2>
              {item.price ? (
                <p className="product-card__price product-card__price--detail">{item.price}</p>
              ) : null}
              <p className="section-desc">{item.details || item.text}</p>

              {Array.isArray(item.highlights) && item.highlights.length > 0 ? (
                <>
                  <h3 className="detail-sub">At a glance</h3>
                  <ul className="about-band__list">
                    {item.highlights.map((h) => (
                      <li key={h}>
                        <span className="detail-bullet" aria-hidden="true" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {item.usage ? (
                <>
                  <h3 className="detail-sub">How it is used</h3>
                  <p className="section-desc">{item.usage}</p>
                </>
              ) : null}
            </Reveal>
          </div>

          {item.disclaimer ? (
            <div className="disclaimer">
              <span className="disclaimer__label">Important</span>
              <p>{item.disclaimer}</p>
            </div>
          ) : null}

          <p className="product-note">{products?.note}</p>

          <div className="disease-cta">
            <Link className="btn btn--green" to="/contact">
              Request a Consultation
            </Link>
            <a
              className="btn btn--outline"
              href={buildWhatsAppLink(productEnquiryMessage(item.name))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp width={17} height={17} />
              Ask about this product
            </a>
          </div>
        </div>
      </section>

      <nav className="detail-nav" aria-label="Other products">
        <div className="container detail-nav__inner">
          {previous ? (
            <Link className="detail-nav__link" to={`/products/${previous.slug}`}>
              <IconArrowLeft width={18} height={18} aria-hidden="true" />
              <span>
                <small>Previous</small>
                {previous.name}
              </span>
            </Link>
          ) : (
            <span />
          )}
          <Link className="detail-nav__all" to="/products">
            All products
          </Link>
          {next ? (
            <Link className="detail-nav__link detail-nav__link--next" to={`/products/${next.slug}`}>
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
