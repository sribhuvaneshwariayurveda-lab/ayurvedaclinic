/**
 * Media renders a real image when `src` is supplied, otherwise a tasteful
 * on-brand placeholder. This keeps the layout honest while real clinic
 * photography is not yet available and makes swapping in CMS images trivial.
 */
export default function Media({ src, alt = "", label = "", className = "", style }) {
  return (
    <div className={`media ${className}`.trim()} style={style}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      ) : (
        <div className="media__placeholder" role="img" aria-label={alt || label || "placeholder"}>
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <linearGradient id="mp" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" style={{ stopColor: "#1b3a2f" }} />
                <stop offset="1" style={{ stopColor: "#2a4a3c" }} />
              </linearGradient>
            </defs>
            <rect width="200" height="200" fill="url(#mp)" />
            <g
              fill="none"
              stroke="#c9a24b"
              strokeWidth="1.4"
              opacity="0.5"
              transform="translate(100 100)"
            >
              <path d="M0 46C0 20 14-6 44-22 30 6 24 26 0 46Z" />
              <path d="M0 46C0 20-14-6-44-22-30 6-24 26 0 46Z" />
              <path d="M0 46V-18" />
              <path d="M0 8C8 0 18-4 28-2M0 20c-8-8-18-12-28-10" />
            </g>
          </svg>
          {label ? <span className="media__label">{label}</span> : null}
        </div>
      )}
    </div>
  );
}
