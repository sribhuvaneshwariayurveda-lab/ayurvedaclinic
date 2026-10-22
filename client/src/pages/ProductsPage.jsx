import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useContentSection } from "../data/store.js";
import ProductCard from "../components/products/ProductCard.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { IconWhatsApp } from "../components/ui/Icons.jsx";
import { buildWhatsAppLink, generalEnquiryMessage } from "../lib/whatsapp.js";

/**
 * "Our Products" — every preparation dispensed at the clinic, with a filter
 * by category and a detail page for each one.
 *
 * The copy describes what a product is and how it is dispensed. It makes no
 * claim that any product cures a condition or replaces prescribed treatment.
 */
export default function ProductsPage() {
  const products = useContentSection("products");
  const items = products?.items || [];
  const [filter, setFilter] = useState("All");

  const categories = useMemo(() => {
    const found = [];
    for (const item of items) {
      const c = item.category || item.tag;
      if (c && !found.includes(c)) found.push(c);
    }
    return ["All", ...found];
  }, [items]);

  const visible = useMemo(
    () => (filter === "All" ? items : items.filter((i) => (i.category || i.tag) === filter)),
    [items, filter]
  );

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__label">{products?.label}</span>
          <h1>
            {products?.title} <span className="italic-serif">{products?.titleAccent}</span>
          </h1>
          <p>{products?.desc}</p>
        </div>
      </section>

      <section className="content-block">
        <div className="container">
          {categories.length > 2 ? (
            <div className="filter-row" role="group" aria-label="Filter products by type">
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
          ) : null}

          <div className="product-grid">
            {visible.map((item, i) => (
              <Reveal key={item.slug || item.name} delay={i % 3} className="product-grid__item">
                <ProductCard item={item} />
              </Reveal>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="section-desc center" style={{ marginInline: "auto" }}>
              No products in this category yet. Please check back soon or contact the clinic.
            </p>
          ) : null}

          <p className="product-note">{products?.note}</p>

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
    </>
  );
}
