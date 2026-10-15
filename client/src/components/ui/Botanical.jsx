/**
 * Decorative botanical line-art.
 *
 * Purely ornamental (aria-hidden). Paths use pathLength="1" so the CSS
 * stroke-dash draw-in animation (motion.css) works at any size without
 * measuring. Hidden-initial stroke state only applies while [data-motion]
 * is set, so it is fully drawn without JavaScript.
 */
export function BotanicalSprig({ className = "", style }) {
  return (
    <svg
      className={`botanical ${className}`.trim()}
      style={style}
      viewBox="0 0 220 320"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path className="draw" pathLength="1" d="M110 316C110 240 108 168 96 108 88 66 70 34 44 10" />
      <path className="draw" pathLength="1" d="M96 108C74 92 52 88 30 92" />
      <path className="draw draw--late" pathLength="1" d="M30 92c14-16 22-36 22-58-16 10-28 24-34 42" />
      <path className="draw" pathLength="1" d="M102 142c22-10 44-12 66-6" />
      <path className="draw draw--late" pathLength="1" d="M168 136c-10-18-12-40-6-60 14 14 22 32 22 52" />
      <path className="draw" pathLength="1" d="M106 186c-20-8-42-8-62 2" />
      <path className="draw draw--late" pathLength="1" d="M44 188c12-14 28-24 46-28-4 18-16 32-32 40" />
      <path className="draw" pathLength="1" d="M110 230c20-6 42-4 60 6" />
      <path className="draw draw--late" pathLength="1" d="M170 236c-14-12-30-20-48-22 6 16 20 28 38 32" />
    </svg>
  );
}

/** A single elegant leaf motif for small accents. */
export function BotanicalLeaf({ className = "", style }) {
  return (
    <svg
      className={`botanical ${className}`.trim()}
      style={style}
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path className="draw" pathLength="1" d="M60 112C60 78 44 46 14 26 52 22 84 38 100 70c8 16 10 30 8 42" />
      <path className="draw draw--late" pathLength="1" d="M60 112C56 74 42 44 20 24" />
    </svg>
  );
}
