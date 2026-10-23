import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useContent } from "../../data/store.js";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";
import BrandLogo from "../ui/BrandLogo.jsx";
import {
  IconHeart,
  IconHome,
  IconLeaf,
  IconMenu,
  IconPhone,
  IconUsers,
  IconWhatsApp,
  IconX
} from "../ui/Icons.jsx";

const mobileNav = [
  { label: "Home", to: "/", Icon: IconHome },
  { label: "About Us", to: "/about", Icon: IconUsers },
  { label: "Diseases", to: "/diseases", Icon: IconHeart },
  { label: "Treatments", to: "/treatments", Icon: IconLeaf },
  { label: "Contact Us", to: "/contact", Icon: IconPhone }
];

export default function Header() {
  const { clinic, nav } = useContent();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const toggleRef = useRef(null);
  const closeRef = useRef(null);

  const telHref = `tel:${String(clinic?.phone || "").replace(/\s/g, "")}`;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      toggleRef.current?.focus();
    };
  }, [open]);

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="brand-center" aria-label={`${clinic?.name} home`}>
            <BrandLogo className="brand-center__mark" priority />
            <span className="nametag">
              <span className="nametag__name">{clinic?.name}</span>
              <span className="nametag__tag">{clinic?.tagline}</span>
            </span>
          </Link>

          <nav className="site-nav" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={isActive(item.to) ? "is-active" : undefined}
                aria-current={isActive(item.to) ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="site-header__actions">
            <a className="call-now" href={telHref} aria-label={`Call ${clinic?.phoneDisplay || ""}`.trim()}>
              <IconPhone width={18} height={18} style={{ color: "var(--forest)" }} aria-hidden="true" />
              <span>
                <span className="call-now__label">Call Now</span>
                <span className="call-now__num">{clinic?.phoneDisplay}</span>
              </span>
            </a>
            <button
              ref={toggleRef}
              className="nav-toggle"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(true)}
            >
              <IconMenu width={22} height={22} />
            </button>
          </div>
        </div>
      </header>

      <div
        id="site-menu"
        className={`offcanvas${open ? " is-open" : ""}`}
        role={open ? "dialog" : undefined}
        aria-modal={open ? "true" : undefined}
        aria-label={open ? "Menu" : undefined}
      >
        <div className="offcanvas__scrim" onClick={() => setOpen(false)} />
        <div className="offcanvas__panel">
          <div className="offcanvas__head">
            <span className="offcanvas__brand">
              <BrandLogo className="offcanvas__mark" />
              {clinic?.name}
            </span>
            <button ref={closeRef} className="offcanvas__close" aria-label="Close menu" onClick={() => setOpen(false)}>
              <IconX width={18} height={18} />
            </button>
          </div>

          <nav className="offcanvas__links" aria-label="Primary">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={isActive(item.to) ? "is-active" : undefined}
                aria-current={isActive(item.to) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="offcanvas__more">
            <Link to="/gallery" onClick={() => setOpen(false)}>Gallery</Link>
            <Link to="/faqs" onClick={() => setOpen(false)}>FAQs</Link>
            <Link to="/case-studies" onClick={() => setOpen(false)}>Case Studies</Link>
          </div>

          <div className="offcanvas__cta">
            <a
              className="btn btn--green btn--block"
              href={buildWhatsAppLink(generalEnquiryMessage())}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp width={18} height={18} />
              Book an Appointment
            </a>
          </div>
        </div>
      </div>

      {location.pathname.startsWith("/admin") ? null : (
        <nav className="mobile-dock" aria-label="Mobile primary">
          {mobileNav.map(({ label, to, Icon }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`mobile-dock__link${active ? " is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <span className="mobile-dock__icon" aria-hidden="true">
                  <Icon width={21} height={21} />
                </span>
                <span className="mobile-dock__label">{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
