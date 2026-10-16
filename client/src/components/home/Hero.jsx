import { hero, clinic } from "../../data/content.js";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";
import { IconArrowRight, IconCalendar } from "../ui/Icons.jsx";
import { BotanicalSprig } from "../ui/Botanical.jsx";
import { CineFade, CineLines, Grain, Parallax } from "../ui/Cine.jsx";

export default function Hero() {
  return (
    <section className="hero-cine" id="top" aria-label={`${clinic.name} — introduction`}>
      <Parallax className="hero-cine__bg" amount={70}>
        <img
          src="/images/hero-diyo.jpg"
          alt="Flame of a traditional brass Ayurvedic oil lamp in soft darkness"
          fetchpriority="high"
          decoding="async"
          onError={(e) => {
            e.currentTarget.remove();
          }}
        />
      </Parallax>
      <div className="hero-cine__shade" aria-hidden="true" />
      <Grain />

      <div className="container hero-cine__inner">
        <CineFade delay={0.1} className="hero-anim">
          <span className="hero-cine__eyebrow">{hero.label}</span>
        </CineFade>

        <h1 className="hero-cine__title">
          <CineLines
            lines={[hero.title, hero.titleAccent]}
            lineClassName=""
            delay={0.25}
          />
          <noscript>
            {hero.title} {hero.titleAccent}
          </noscript>
        </h1>

        <CineFade delay={0.7}>
          <p className="hero-cine__desc">{hero.desc}</p>
        </CineFade>

        <CineFade delay={0.9} className="hero-anim hero-cine__actions">
          <a
            className="btn btn--gold"
            href={buildWhatsAppLink(generalEnquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconCalendar width={18} height={18} />
            Book an Appointment
          </a>
          <a className="btn btn--ghost-gold" href="#treatments">
            Explore Treatments
            <IconArrowRight width={18} height={18} />
          </a>
        </CineFade>

        <CineFade delay={1.1} className="hero-anim hero-cine__stats">
          {hero.stats.map((s) => (
            <div key={s.label}>
              <div className="stat__num">{s.value}</div>
              <div className="stat__label">{s.label}</div>
            </div>
          ))}
        </CineFade>

        <CineFade delay={1.25}>
          <p className="hero-cine__badge">
            <BotanicalSprig className="hero__botanical" aria-hidden="true" />
            <span>
              <b>{hero.badge.title}</b> — {hero.badge.text}
            </span>
          </p>
        </CineFade>
      </div>

      <span className="hero-cine__cue" aria-hidden="true">Scroll</span>
    </section>
  );
}
