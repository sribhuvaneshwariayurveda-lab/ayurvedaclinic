import { Link } from "react-router-dom";
import { clinic, nav } from "../../data/content.js";
import { IconLeaf, IconMapPin, IconPhone, IconWhatsApp } from "../ui/Icons.jsx";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";

export default function Footer() {
  return (
    <>
      <nav className="footer-nav" aria-label="Footer">
        <div className="container">
          <ul className="footer-nav__list">
            {nav.map((item) => (
              <li key={item.to}>
                <Link className="footer-nav__link" to={item.to}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <footer className="site-footer">
        <div className="container">
          <div className="site-footer__grid">
            <div>
              <div className="site-footer__brand">
                <IconLeaf width={64} height={64} aria-hidden="true" />
                <span>
                  <span className="site-footer__clinic">{clinic.name}</span>
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.92)", maxWidth: "36ch" }}>
                Doctor-led classical Ayurvedic care — personalised consultations, authentic herbal
                medicine and traditional therapies in Karur, Tamil Nadu.
              </p>
              <p className="site-footer__since" style={{ marginTop: "0.8rem" }}>
                {clinic.tagline} · Reg. No. {clinic.regNo}
              </p>
            </div>

            <div>
              <h4>Explore</h4>
              <div className="site-footer__links">
                {nav.map((item) => (
                  <Link key={item.to} to={item.to}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4>Visit Us</h4>
              <div className="site-footer__links">
                <span style={{ display: "flex", gap: "0.6rem" }}>
                  <IconMapPin width={17} height={17} style={{ flex: "none", marginTop: 4 }} aria-hidden="true" />
                  <a href={clinic.mapsUrl} target="_blank" rel="noopener noreferrer">
                    {clinic.addressLines.join(", ")}
                  </a>
                </span>
                <span style={{ display: "flex", gap: "0.6rem" }}>
                  <IconPhone width={17} height={17} style={{ flex: "none", marginTop: 4 }} aria-hidden="true" />
                  <a href={`tel:${clinic.phone.replace(/\s/g, "")}`}>{clinic.phoneDisplay}</a>
                </span>
                <span style={{ display: "flex", gap: "0.6rem" }}>
                  <IconWhatsApp width={17} height={17} style={{ flex: "none", marginTop: 4 }} aria-hidden="true" />
                  <a href={buildWhatsAppLink(generalEnquiryMessage())} target="_blank" rel="noopener noreferrer">
                    WhatsApp the clinic
                  </a>
                </span>
              </div>
            </div>
          </div>

          <div className="site-footer__bottom">
            <span>
              &copy; {new Date().getFullYear()} {clinic.name}. All rights reserved.
            </span>
            <span className="site-footer__legal">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/contact">Contact</Link>
            </span>
          </div>

          <p className="site-footer__bottom" style={{ borderTop: "none", paddingTop: 0, display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>
            Botanical photography via Wikimedia Commons: Tulsi garden © Challiyan (CC BY-SA 2.5);
            Tulsi macro © Muhammad Mahdi Karim (CC BY-SA 2.5); mortar © Takeaway (CC BY-SA 3.0);
            Tulsi spike © Vaikoovery (CC BY 3.0); Tulsi sprout © Vengolis (CC BY-SA 4.0); temple lamp
            © BRPever (CC BY-SA 4.0).
          </p>
        </div>
      </footer>
    </>
  );
}
