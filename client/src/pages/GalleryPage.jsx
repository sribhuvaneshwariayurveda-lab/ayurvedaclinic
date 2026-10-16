import ConsultBand from "../components/home/ConsultBand.jsx";
import Gallery from "../components/home/Gallery.jsx";

export default function GalleryPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label" style={{ color: "var(--gold-light)" }}>Gallery</span>
          <h1>Photo gallery</h1>
          <p>
            Botanical photography alongside space reserved for the clinic&apos;s own
            photographs. Clinic photographs will appear here once the supplied images
            are added to the site.
          </p>
        </div>
      </section>
      <Gallery />
      <ConsultBand />
    </>
  );
}
