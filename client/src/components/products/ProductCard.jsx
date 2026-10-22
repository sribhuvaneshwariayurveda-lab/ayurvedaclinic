import { Link } from "react-router-dom";
import Media from "../ui/Media.jsx";

/**
 * Product card — links to the product's detail page.
 * Product copy never claims a cure; the card shows the short clinic
 * description and the category tag only.
 */
export default function ProductCard({ item }) {
  const image = item.image || {};
  return (
    <Link className="product-card product-card--link" to={`/products/${item.slug}`}>
      <span className="product-card__media">
        <Media src={image.src} alt={image.alt || item.name} label={item.name} />
      </span>
      <div className="product-card__body">
        <span className="product-card__tag">{item.tag}</span>
        <h3>{item.name}</h3>
        {item.price ? <span className="product-card__price">{item.price}</span> : null}
        <p>{item.text}</p>
        <span className="product-card__more">View details</span>
      </div>
    </Link>
  );
}
