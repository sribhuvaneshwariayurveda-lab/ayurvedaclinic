function LeafBranch({ className = "" }) {
  return (
    <svg
      className={`slogan-leaf ${className}`.trim()}
      viewBox="0 0 130 150"
      fill="none"
      aria-hidden="true"
    >
      <path d="M18 138C40 109 63 80 105 29" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M42 105c-15-2-25-10-30-24 14-3 25 5 30 24Z" fill="currentColor" opacity="0.5" />
      <path d="M57 83c10-12 22-16 36-12-4 14-16 20-36 12Z" fill="currentColor" opacity="0.6" />
      <path d="M71 63c-14-1-23-9-28-22 13-3 23 4 28 22Z" fill="currentColor" opacity="0.46" />
      <path d="M88 43c9-10 20-14 33-10-4 13-15 18-33 10Z" fill="currentColor" opacity="0.58" />
      <circle cx="55" cy="122" r="3" fill="currentColor" opacity="0.55" />
      <circle cx="83" cy="70" r="2.4" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

/**
 * Presentational scroll used on the homepage and in the admin preview.
 * The text is real DOM text (not an image), so every language remains
 * selectable, searchable and editable.
 */
export default function SloganScroll({ slogan, headingId }) {
  if (!slogan) return null;

  const showMeaning = slogan.meaning && slogan.meaning !== slogan.english;
  const heading = slogan.heading || "Our Philosophy of Wellness";

  return (
    <div className="slogan-scroll">
      <span className="slogan-roller slogan-roller--top" aria-hidden="true">
        <span className="slogan-roller__cap slogan-roller__cap--left" />
        <span className="slogan-roller__cap slogan-roller__cap--right" />
      </span>

      <div className="slogan-parchment">
        <LeafBranch className="slogan-leaf--left" />
        <LeafBranch className="slogan-leaf--right" />

        <span className="slogan-eyebrow">Daily Ayurveda Slogan</span>
        <h2 id={headingId} className="slogan-heading">
          {heading}
        </h2>

        <div className="slogan-ornament" aria-hidden="true">
          <span />
          <svg viewBox="0 0 26 26" width="20" height="20">
            <path
              d="M13 3c4 4.5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6.5 6-11Z"
              fill="currentColor"
              opacity="0.8"
            />
          </svg>
          <span />
        </div>

        {slogan.sanskrit ? (
          <p className="slogan-sanskrit" lang="sa">
            {slogan.sanskrit}
          </p>
        ) : null}

        {slogan.english ? (
          <p className="slogan-english" lang="en">
            {slogan.english}
          </p>
        ) : null}

        {slogan.tamil ? (
          <p className="slogan-tamil" lang="ta">
            {slogan.tamil}
          </p>
        ) : null}

        {showMeaning ? <p className="slogan-meaning">{slogan.meaning}</p> : null}
        {slogan.description ? <p className="slogan-description">{slogan.description}</p> : null}

        <span className="slogan-endmark" aria-hidden="true">
          ॥
        </span>
      </div>

      <span className="slogan-roller slogan-roller--bottom" aria-hidden="true">
        <span className="slogan-roller__cap slogan-roller__cap--left" />
        <span className="slogan-roller__cap slogan-roller__cap--right" />
      </span>
    </div>
  );
}
