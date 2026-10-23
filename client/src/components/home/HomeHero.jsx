import { Link } from "react-router-dom";
import { useContentSection } from "../../data/store.js";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";
import { IconArrowRight, IconCalendar, IconCheck } from "../ui/Icons.jsx";
import Reveal from "../ui/Reveal.jsx";

export default function HomeHero() {
  const hero = useContentSection("hero");
  const clinic = useContentSection("clinic");
  const about = useContentSection("about");
  const photo = about?.photos?.clinic || {};
  const points = Array.isArray(hero?.stats) ? hero.stats : [];

  return (
    <section className="home-hero" aria-label={`${clinic?.name || "Clinic"} introduction`}>
      <div className="container home-hero__grid">
        <Reveal className="home-hero__copy">
          <span className="section-sub">{hero?.label}</span>
          <h1>
            {hero?.title} <span className="italic-serif">{hero?.titleAccent}</span>
          </h1>
          <p>{hero?.desc}</p>

          <div className="home-hero__actions">
            <a
              className="btn btn--green"
              href={buildWhatsAppLink(generalEnquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconCalendar width={18} height={18} aria-hidden="true" />
              Book an Appointment
            </a>
            <Link className="btn btn--outline" to="/treatments">
              Explore Treatments
              <IconArrowRight width={18} height={18} aria-hidden="true" />
            </Link>
          </div>

          {points.length ? (
            <ul className="home-hero__points">
              {points.map((point) => (
                <li key={point.label}>
                  <IconCheck width={16} height={16} aria-hidden="true" />
                  <span>
                    <b>{point.value}</b> {point.label}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </Reveal>

        <Reveal variant="right" delay={1} className="home-hero__visual">
          <div className="home-hero__media">
            {photo.src ? (
              <img
                src={photo.src}
                alt={photo.alt || "Sri Bhuvaneshwari Ayurveda Peedam clinic"}
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            ) : null}
          </div>
          <div className="home-hero__card">
            <span className="home-hero__card-mark">
              <IconCheck width={20} height={20} aria-hidden="true" />
            </span>
            <span>
              <b>{clinic?.qualifications || "BAMS"}</b>
              <span>
                Reg. {clinic?.regNo || "2366/A"} · Doctor-led classical Ayurveda
              </span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
