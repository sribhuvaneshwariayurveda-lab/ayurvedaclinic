import { clinic, contact } from "../../data/content.js";
import { IconClock, IconMapPin, IconPhone } from "../ui/Icons.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

export default function ContactClinic() {
  const fullAddress = clinic.addressLines.join(", ");
  // Exact clinic location link (single source of truth in data/content.js).
  const directions =
    clinic.mapsUrl ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  // Query-based embed of the supplied address (no coordinates invented).
  // A full embed URL in clinic.mapEmbed takes precedence when provided.
  const mapSrc =
    clinic.mapEmbed || `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

  return (
    <section className="section" id="contact">
      <div className="container">
        <SectionHeading
          center
          label={contact.label}
          title="Find the"
          accent="clinic"
          desc={contact.desc}
        />
        <div className="contact__grid">
          <Reveal className="info-card">
            <div className="info-row">
              <span className="info-row__ic">
                <IconMapPin width={19} height={19} />
              </span>
              <span>
                <b>Clinic address</b>
                <span>{clinic.addressLines.join(", ")}</span>
              </span>
            </div>
            <div className="info-row">
              <span className="info-row__ic">
                <IconPhone width={19} height={19} />
              </span>
              <span>
                <b>Phone</b>
                <a href={`tel:${clinic.phone.replace(/\s/g, "")}`}>{clinic.phoneDisplay}</a>
              </span>
            </div>
            {clinic.email ? (
              <div className="info-row">
                <span className="info-row__ic">
                  <IconMail width={19} height={19} />
                </span>
                <span>
                  <b>Email</b>
                  <a href={`mailto:${clinic.email}`}>{clinic.email}</a>
                </span>
              </div>
            ) : null}
            <div className="info-row">
              <span className="info-row__ic">
                <IconClock width={19} height={19} />
              </span>
              <span>
                <b>Opening hours</b>
                {clinic.hours.map((h) => (
                  <span key={h.day} style={{ display: "block" }}>
                    {h.day}: {h.time}
                  </span>
                ))}
              </span>
            </div>
            <a
              className="btn btn--forest"
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Get directions to ${clinic.name} on Google Maps`}
              style={{ marginTop: "1.2rem" }}
            >
              Get Directions
            </a>
          </Reveal>

          <Reveal delay={1} className="map">
            <iframe
              title={`Map — ${clinic.name}, ${fullAddress}`}
              src={mapSrc}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
