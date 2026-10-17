import { contact } from "../data/content.js";
import { ContactBand } from "../components/home/HomeSections.jsx";

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__label">{contact.label}</span>
          <h1>{contact.title}</h1>
          <p>{contact.desc}</p>
        </div>
      </section>
      <ContactBand />
    </>
  );
}
