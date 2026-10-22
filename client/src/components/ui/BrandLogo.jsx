/**
 * Original clinic mark: a temple arch, a growing leaf and a lamp flame inside
 * a sun ring. Current-colour artwork so it works on the dark header and the
 * green footer without a second asset.
 */
export default function BrandLogo({ className = "", title = "" }) {
  return (
    <svg
      className={`brand-logo ${className}`.trim()}
      viewBox="0 0 96 96"
      fill="none"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : "true"}
    >
      <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="1.6" opacity="0.75" />
      <circle cx="48" cy="48" r="36.5" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
      <path d="M20 68h56" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M29 68V46.5C29 36 35.1 26.3 48 19c12.9 7.3 19 17 19 27.5V68"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M38.5 68V51.5c0-6.2 3.3-11.2 9.5-14.8 6.2 3.6 9.5 8.6 9.5 14.8V68"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <path
        d="M48 54c-5.7-4.8-8.2-10.2-7.4-16.2 5.9.6 10.1 4.2 12.4 10.7-1.4 2.2-3.1 4-5 5.5Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M48.2 53.8c5.4-4.6 7.8-9.7 7.1-15.4-5.6.6-9.7 4-11.9 10.2 1.3 2.1 2.9 3.8 4.8 5.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.75"
      />
      <path
        d="M48 40.5c-2.6-3.7-2.5-7.4.4-11.1 2.9 3.7 3 7.4.4 11.1-.3.4-.5.4-.8 0Z"
        fill="currentColor"
      />
      <path
        d="M33 68c3.2-2.6 6.7-4 10.5-4.2M63 68c-3.2-2.6-6.7-4-10.5-4.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
