import { strip } from "../../data/content.js";

export default function TrustStrip() {
  const items = [...strip, ...strip];
  return (
    <div className="strip" aria-hidden="true">
      <div className="strip__track">
        {items.map((item, i) => (
          <span className="strip__item" key={`${item}-${i}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
