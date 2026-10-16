import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { clinic } from "../../data/content.js";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";
import { osPrefersReducedMotion } from "../../lib/motionSettings.js";
import { IconLeaf, IconMenu, IconPhone, IconX, IconWhatsApp } from "../ui/Icons.jsx";

const sections = [
  { label: "Home", to: "top" },
  { label: "About", to: "about" },
  { label: "Treatments", to: "treatments" },
  { label: "Products", to: "products" },
  { label: "Gallery", to: "gallery" },
  { label: "Contact", to: "contact" }
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toggleRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const goSection = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    const scroll = () => {
      if (id === "top") {
        window.scrollTo({ top: 0, behavior: osPrefersReducedMotion() ? "auto" : "smooth" });
        return;
      }
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: osPrefersReducedMotion() ? "auto" : "smooth", block: "start" });
    };
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(scroll, 120);
    } else {
      scroll();
    }
  };

  return (
    <>
      <div className="topbar">
        <div className="container topbar__inner">
          <div className="topbar__meta">
            <a href={`tel:${clinic.phone.replace(/\s/g, "")}`}>
              <IconPhone width={14} height={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />
              {clinic.phoneDisplay}
            </a>
            <span className="topbar__meta--hours">
              {clinic.hoursNote || "Consultations by appointment"}
            </span>
          </div>
          <a
            href={buildWhatsAppLink(generalEnquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
          >
            Enquiries on WhatsApp
          </a>
        </div>
      </div>

      <header className={`header${scrolled ? " is-scrolled" : ""}`}>
        <div className="container header__inner">
          <Link to="/" className="brand" aria-label={`${clinic.name} home`}>
            <IconLeaf className="brand__mark" width={42} height={42} style={{ color: "var(--gold-light)" }} />
            <span className="brand__text">
              <span className="brand__name">{clinic.name}</span>
              <span className="brand__tag">{clinic.tagline}</span>
            </span>
          </Link>

          <nav className="nav" aria-label="Primary">
            <ul className="nav__links">
              {sections.map((item) => (
                <li key={item.to}>
                  <a href={item.to === "top" ? "/" : `#${item.to}`} onClick={goSection(item.to)} className="nav-link">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="nav__actions">
              <a
                className="btn btn--gold btn--sm header__cta"
                href={buildWhatsAppLink(generalEnquiryMessage())}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconWhatsApp width={16} height={16} />
                Book Appointment
              </a>
              <button
                ref={toggleRef}
                className="icon-btn nav__toggle"
                aria-label="Open menu"
                aria-expanded={open}
                aria-controls="mobile-drawer"
                onClick={() => setOpen(true)}
              >
                <IconMenu />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div
        id="mobile-drawer"
        className={`drawer${open ? " is-open" : ""}`}
        role={open ? "dialog" : undefined}
        aria-modal={open ? "true" : undefined}
        aria-label={open ? "Menu" : undefined}
        onClick={() => setOpen(false)}
      >
        <div className="drawer__panel" onClick={(e) => e.stopPropagation()}>
          <div className="drawer__head">
            <span className="brand__name">{clinic.name}</span>
            <button
              ref={closeRef}
              className="icon-btn"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <IconX />
            </button>
          </div>
          <nav className="drawer__links" aria-label="Mobile">
            {sections.map((item) => (
              <a key={item.to} href={item.to === "top" ? "/" : `#${item.to}`} onClick={goSection(item.to)}>
                {item.label}
              </a>
            ))}
          </nav>
          <a
            className="btn btn--gold btn--block"
            href={buildWhatsAppLink(generalEnquiryMessage())}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhatsApp width={17} height={17} />
            Book Appointment
          </a>
        </div>
      </div>
    </>
  );
}
