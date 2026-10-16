import { herbs } from "../../data/content.js";
import { CineImage, CineReveal, Grain } from "../ui/Cine.jsx";

export default function Herbs() {
  return (
    <section className="section herbs" id="herbs" aria-label="Ayurvedic herbs and treatment philosophy">
      <Grain opacity={0.05} />
      <div className="container" style={{ position: "relative", zIndex: 2 }}>
        <CineReveal>
          <span className="section-label">{herbs.label}</span>
          <h2 className="herbs__title">
            {herbs.title} <em>{herbs.titleAccent}</em>
          </h2>
          <p className="herbs__desc">{herbs.desc}</p>
        </CineReveal>

        <div className="herbs__grid">
          {herbs.cards.map((card, i) => (
            <CineReveal key={card.title} delay={0.12 * i} className="herb-card">
              <CineImage src={card.image.src} alt={card.image.alt} />
              <div className="herb-card__body">
                <span className="herb-card__latin">{card.latin}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            </CineReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
