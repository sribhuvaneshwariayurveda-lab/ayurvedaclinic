import AppointmentCta from "../components/home/AppointmentCta.jsx";
import Products from "../components/home/Products.jsx";

export default function ProductsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-label" style={{ color: "var(--gold-light)" }}>Products</span>
          <h1>Herbal products at the clinic</h1>
          <p>
            Classical herbal products dispensed at the clinic as part of a doctor-led
            treatment plan. Products are shown here as a display only — use only as
            directed by the physician after consultation.
          </p>
        </div>
      </section>
      <Products />
      <AppointmentCta />
    </>
  );
}
