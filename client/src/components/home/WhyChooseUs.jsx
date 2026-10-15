import { why } from "../../data/content.js";
import {
  IconAward,
  IconHeart,
  IconLeaf,
  IconShield,
  IconSpa,
  IconUsers
} from "../ui/Icons.jsx";
import Reveal from "../ui/Reveal.jsx";
import SectionHeading from "../ui/SectionHeading.jsx";

const icons = {
  award: IconAward,
  leaf: IconLeaf,
  users: IconUsers,
  shield: IconShield,
  heart: IconHeart,
  spa: IconSpa
};

export default function WhyChooseUs() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          center
          label="Why Choose Us"
          title="Care you can"
          accent="trust"
          desc="Six reasons patients choose our clinic for considered, ethical Ayurvedic treatment."
        />
        <div className="why__grid">
          {why.map((item, i) => {
            const Icon = icons[item.icon] || IconLeaf;
            return (
              <Reveal key={item.title} delay={(i % 3) + 1} className="why-card lift">
                <span className="why-card__ic">
                  <Icon width={24} height={24} />
                </span>
                <b>{item.title}</b>
                <span>{item.text}</span>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
