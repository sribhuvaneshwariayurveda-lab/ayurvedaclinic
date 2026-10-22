import { Link } from "react-router-dom";
import Media from "../ui/Media.jsx";

/**
 * Disease card — used in the diseases carousel and the diseases grid.
 * The whole card is a link to the condition's detail page.
 */
export default function DiseaseCard({ item, className = "" }) {
  const image = item.image || {};
  return (
    <Link className={`dcard ${className}`.trim()} to={`/diseases/${item.slug}`}>
      <span className="dcard__media">
        <Media src={image.src} alt={image.alt || item.name} label={item.name} />
      </span>
      <span className="dcard__body">
        <span className="dcard__cat">{item.category}</span>
        <span className="dcard__title">{item.name}</span>
        <span className="dcard__text">{item.summary}</span>
        <span className="dcard__more">Learn More</span>
      </span>
    </Link>
  );
}
