import { clinic, contact } from "../../data/content.js";
import { IconClock, IconMapPin, IconPhone } from "../ui/Icons.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

export default function ContactClinic() {
  const directions = clinic.mapEmbed
    ? null
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        clinic.addressLines.join(", ")
      )}`;

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
            {directions ? (
              <a
                className="btn btn--outline btn--sm"
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginTop: "1.2rem" }}
              >
                Get Directions
              </a>
            ) : null}
          </Reveal>

          <Reveal delay={1} className="map">
            {clinic.mapEmbed ? (
              <iframe
                title="Clinic location"
                src={clinic.mapEmbed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  minHeight: 380,
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  padding: "2rem",
                  color: "var(--ink-muted)"
                }}
              >
                <span>
                  Map embed placeholder.
                  <br />
                  The clinic’s Google Maps embed will appear here once the address is supplied.
                </span>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
