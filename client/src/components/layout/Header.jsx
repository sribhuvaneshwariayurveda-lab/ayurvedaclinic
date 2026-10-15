import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { clinic, nav } from "../../data/content.js";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";
import { IconLeaf, IconMenu, IconPhone, IconX, IconWhatsApp } from "../ui/Icons.jsx";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
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
              {clinic.hours[0].day}: {clinic.hours[0].time}
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
            <IconLeaf className="brand__mark" width={42} height={42} style={{ color: "var(--forest)" }} />
            <span className="brand__text">
              <span className="brand__name">{clinic.name}</span>
              <span className="brand__tag">{clinic.tagline}</span>
            </span>
          </Link>

          <nav className="nav" aria-label="Primary">
            <ul className="nav__links">
              {nav.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
                  >
                    {item.label}
                  </NavLink>
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
            {nav.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
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
