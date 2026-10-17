import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { clinic, nav } from "../../data/content.js";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";
import { IconLeaf, IconMenu, IconPhone, IconWhatsApp, IconX } from "../ui/Icons.jsx";

const telHref = `tel:${clinic.phone.replace(/\s/g, "")}`;

export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const toggleRef = useRef(null);
  const closeRef = useRef(null);

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
      <header className="site-header">
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

        <div className="site-header__inner">
          <Link to="/" className="brand-center" aria-label={`${clinic.name} home`}>
            <IconLeaf className="brand-center__mark" width={84} height={84} aria-hidden="true" />
            <span className="nametag">
              <span className="nametag__name">{clinic.name}</span>
              <span className="nametag__tag">{clinic.tagline}</span>
            </span>
          </Link>
        </div>

        <a className="call-now" href={telHref}>
          <IconPhone width={18} height={18} style={{ color: "var(--forest)" }} aria-hidden="true" />
          <span>
            <span className="call-now__label">Call Now</span>
            <span className="call-now__num">{clinic.phoneDisplay}</span>
          </span>
        </a>
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
            <span className="offcanvas__brand">{clinic.name}</span>
            <button ref={closeRef} className="offcanvas__close" aria-label="Close menu" onClick={() => setOpen(false)}>
              <IconX width={18} height={18} />
            </button>
          </div>

          <nav className="offcanvas__links" aria-label="Primary">
            {nav.map((item) => (
              <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </nav>

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
    </>
  );
}
