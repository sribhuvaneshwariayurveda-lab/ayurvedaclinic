const LOGO_SRC = "/images/clinic-logo.jpeg";
const LOGO_ALT = "Sri Bhuvaneshwari Ayurveda Peedam logo";

export default function BrandLogo({ className = "", title = "", priority = false }) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src={LOGO_SRC}
      alt={title || LOGO_ALT}
      width="1184"
      height="234"
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
    />
  );
}
