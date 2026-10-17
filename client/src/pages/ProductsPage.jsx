import { products } from "../data/content.js";
import Media from "../components/ui/Media.jsx";
import Reveal from "../components/ui/Reveal.jsx";

export default function ProductsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__label">{products.label}</span>
          <h1>{products.title}</h1>
          <p>{products.desc}</p>
        </div>
      </section>

      <section className="content-block">
        <div className="container">
          <div className="product-grid">
            {products.items.map((item, i) => (
              <Reveal key={item.name} delay={i % 3} className="product-card">
                <div className="product-card__media">
                  <Media src={item.image.src} alt={item.image.alt} label={item.name} />
                </div>
                <div className="product-card__body">
                  <span className="product-card__tag">{item.tag}</span>
                  <h3>{item.name}</h3>
                  <p>{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="product-note">{products.note}</p>
        </div>
      </section>
    </>
  );
}
