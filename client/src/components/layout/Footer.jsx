import { Link } from "react-router-dom";
import { useContent } from "../../data/store.js";
import { IconMapPin, IconPhone, IconWhatsApp } from "../ui/Icons.jsx";
import BrandLogo from "../ui/BrandLogo.jsx";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";

const secondaryNav = [
  { label: "Gallery", to: "/gallery" },
  { label: "FAQs", to: "/faqs" },
  { label: "Case Studies", to: "/case-studies" }
];

export default function Footer() {
  const { clinic, nav } = useContent();
  const footerNav = [...(nav || []), ...secondaryNav];

  return (
    <>
      <nav className="footer-nav" aria-label="Footer">
        <div className="container">
          <ul className="footer-nav__list">
            {footerNav.map((item) => (
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
                <BrandLogo />
                <span>
                  <span className="site-footer__clinic">{clinic?.name}</span>
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.92)", maxWidth: "36ch" }}>
                Doctor-led classical Ayurvedic care — personalised consultations, authentic herbal
                medicine and traditional therapies in Karur, Tamil Nadu.
              </p>
              {clinic?.regNo ? (
                <p className="site-footer__since" style={{ marginTop: "0.8rem" }}>
                  {clinic?.tagline} · Reg. No. {clinic?.regNo}
                </p>
              ) : null}
            </div>

            <div>
              <h4>Explore</h4>
              <div className="site-footer__links">
                {footerNav.map((item) => (
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
                  <a href={clinic?.mapsUrl} target="_blank" rel="noopener noreferrer">
                    {(clinic?.addressLines || []).join(", ")}
                  </a>
                </span>
                <span style={{ display: "flex", gap: "0.6rem" }}>
                  <IconPhone width={17} height={17} style={{ flex: "none", marginTop: 4 }} aria-hidden="true" />
                  <a href={`tel:${String(clinic?.phone || "").replace(/\s/g, "")}`}>{clinic?.phoneDisplay}</a>
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
              &copy; {new Date().getFullYear()} {clinic?.name}. All rights reserved.
            </span>
            <span className="site-footer__legal">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/contact">Contact</Link>
            </span>
          </div>

          <p
            className="site-footer__bottom"
            style={{ borderTop: "none", paddingTop: 0, display: "block", fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}
          >
            Botanical photography via Wikimedia Commons: Tulsi garden © Challiyan (CC BY-SA 2.5);
            Tulsi macro © Muhammad Mahdi Karim (CC BY-SA 2.5); mortar © Takeaway (CC BY-SA 3.0);
            Tulsi spike © Vaikoovery (CC BY 3.0); Tulsi sprout © Vengolis (CC BY-SA 4.0); temple lamp
            © BRPever (CC BY-SA 4.0). Condition illustrations © their respective authors under the
            licences listed on the <Link to="/diseases">conditions page</Link>.
          </p>
        </div>
      </footer>
    </>
  );
}
