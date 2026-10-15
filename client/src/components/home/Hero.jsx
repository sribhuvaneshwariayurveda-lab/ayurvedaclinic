import { Link } from "react-router-dom";
import { hero } from "../../data/content.js";
import { IconArrowRight, IconCalendar, IconLeaf } from "../ui/Icons.jsx";
import { BotanicalSprig } from "../ui/Botanical.jsx";
import Media from "../ui/Media.jsx";

const step = (n) => ({ "--d": `${n}s` });

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero__grid">
        <div>
          <div className="hero-anim" style={step(0.05)}>
            <span className="section-label">{hero.label}</span>
            <h1 className="hero__title">
              {hero.title}{" "}
              <span className="italic-serif gold-gradient-text">{hero.titleAccent}</span>
            </h1>
            <p className="hero__desc">{hero.desc}</p>
          </div>

          <div className="hero-anim hero__actions" style={step(0.35)}>
            <Link className="btn btn--gold" to={hero.primaryCta.to}>
              <IconCalendar width={18} height={18} />
              {hero.primaryCta.label}
            </Link>
            <Link className="btn btn--outline" to={hero.secondaryCta.to}>
              {hero.secondaryCta.label}
              <IconArrowRight width={18} height={18} />
            </Link>
          </div>

          <div className="hero-anim hero__stats" style={step(0.5)}>
            {hero.stats.map((s) => (
              <div key={s.label}>
                <div className="stat__num">{s.value}</div>
                <div className="stat__label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero__media">
          <BotanicalSprig className="hero__botanical" />
          <div className="hero__figure">
            <Media label={hero.mediaLabel} />
          </div>

          <div className="hero__float-card float-anim">
            <IconLeaf width={15} height={15} style={{ color: "var(--gold-dark)", marginRight: 6 }} />
            Prakriti assessment
          </div>

          <div className="hero__badge">
            <span className="hero__badge-ic">
              <IconCalendar width={19} height={19} />
            </span>
            <span>
              <b>{hero.badge.title}</b>
              <span>{hero.badge.text}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
