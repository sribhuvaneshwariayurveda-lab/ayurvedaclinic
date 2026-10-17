import { gallery } from "../data/content.js";
import Reveal from "../components/ui/Reveal.jsx";

export default function GalleryPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__label">{gallery.label}</span>
          <h1>A botanical study</h1>
          <p>{gallery.desc}</p>
        </div>
      </section>

      <section className="content-block">
        <div className="container">
          <div className="gallery__grid">
            {gallery.images.map((img, i) => (
              <Reveal key={img.src} delay={i % 3} className="gshot-wrap">
                <figure className="gshot">
                  <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
                  <figcaption>{img.caption}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
          <p className="gallery__credit">
            Botanical photography via Wikimedia Commons: {gallery.images.map((img) => img.credit).join(" · ")}.
            These photographs depict medicinal plants and traditional objects; they are not images of the
            clinic premises, staff or patients.
          </p>
        </div>
      </section>
    </>
  );
}
