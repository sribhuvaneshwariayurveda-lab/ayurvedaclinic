import { Link } from "react-router-dom";
import { products } from "../../data/content.js";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";
import { CineReveal } from "../ui/Cine.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";
import { IconWhatsApp } from "../ui/Icons.jsx";

/**
 * Products section — displays the clinic's herbal product photograph only as
 * a product display. No claim is made that any product cures kidney disease
 * or any other condition.
 */
export default function Products() {
  return (
    <section className="section section--ivory" id="products" aria-label="Clinic herbal products">
      <div className="container">
        <SectionHeading
          center
          label={products.label}
          title={products.title}
          accent={products.titleAccent}
          desc={products.desc}
        />

        <div className="product-grid">
          {products.items.map((item, i) => (
            <CineReveal key={item.name} delay={0.08 * i}>
              <article className="product-card">
                <div className="product-card__media">
                  <img
                    src={item.image.src}
                    alt={item.image.alt}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.remove();
                    }}
                  />
                  <span style={{ position: "relative" }}>Product photograph</span>
                </div>
                <div className="product-card__body">
                  <span className="product-card__tag">{item.tag}</span>
                  <h3>{item.name}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            </CineReveal>
          ))}
        </div>

        <CineReveal>
          <p className="product-note">{products.note}</p>
        </CineReveal>

        <CineReveal>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
            <a
              className="btn btn--forest"
              href={buildWhatsAppLink(generalEnquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp width={17} height={17} />
              Ask About Products
            </a>
            <Link className="btn btn--gold" to="/products">
              View Products
            </Link>
          </div>
        </CineReveal>
      </div>
    </section>
  );
}
