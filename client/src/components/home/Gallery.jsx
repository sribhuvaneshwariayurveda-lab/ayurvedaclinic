import { gallery } from "../../data/content.js";
import { CineReveal } from "../ui/Cine.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

export default function Gallery() {
  return (
    <section className="section" id="gallery" aria-label="Clinic botanical gallery">
      <div className="container">
        <SectionHeading
          center
          label={gallery.label}
          title={gallery.title}
          accent={gallery.titleAccent}
          desc={gallery.desc}
        />

        <div className="gallery__grid">
          {gallery.images.map((img, i) => (
            <CineReveal key={img.src} delay={0.08 * (i % 3)} className="gshot-wrap">
              <figure className="gshot" tabIndex={0}>
                <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
                <figcaption>{img.caption}</figcaption>
              </figure>
            </CineReveal>
          ))}
        </div>

        <CineReveal>
          <p className="gallery__credit">
            Botanical photography via Wikimedia Commons:{" "}
            {gallery.images.map((img) => img.credit).join(" · ")}. These photographs
            depict medicinal plants and traditional objects; they are not images of
            the clinic premises, staff or patients.
          </p>
        </CineReveal>
      </div>
    </section>
  );
}
