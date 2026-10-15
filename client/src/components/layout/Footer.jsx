import { Link } from "react-router-dom";
import { clinic, nav } from "../../data/content.js";
import {
  IconFacebook,
  IconInstagram,
  IconLeaf,
  IconMail,
  IconMapPin,
  IconPhone,
  IconYoutube
} from "../ui/Icons.jsx";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Link to="/" className="brand">
              <IconLeaf className="brand__mark" width={40} height={40} style={{ color: "var(--gold-light)" }} />
              <span className="brand__text">
                <span className="brand__name">{clinic.name}</span>
                <span className="brand__tag">{clinic.tagline}</span>
              </span>
            </Link>
            <p className="footer__brand-desc">
              Doctor-led classical Ayurvedic care — personalised consultations, authentic herbal
              medicine and traditional therapies.
            </p>
            <div className="socials">
              {clinic.socials.instagram ? (
                <a href={clinic.socials.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                  <IconInstagram />
                </a>
              ) : (
                <a href="#" aria-label="Instagram (to be supplied)" onClick={(e) => e.preventDefault()}>
                  <IconInstagram />
                </a>
              )}
              {clinic.socials.facebook ? (
                <a href={clinic.socials.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                  <IconFacebook />
                </a>
              ) : (
                <a href="#" aria-label="Facebook (to be supplied)" onClick={(e) => e.preventDefault()}>
                  <IconFacebook />
                </a>
              )}
              {clinic.socials.youtube ? (
                <a href={clinic.socials.youtube} aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                  <IconYoutube />
                </a>
              ) : (
                <a href="#" aria-label="YouTube (to be supplied)" onClick={(e) => e.preventDefault()}>
                  <IconYoutube />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4>Explore</h4>
            <div className="footer__links">
              {nav.map((item) => (
                <Link key={item.to} to={item.to}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4>Care</h4>
            <div className="footer__links">
              <Link to="/treatments">Treatments</Link>
              <Link to="/case-studies">Patient Results</Link>
              <Link to="/testimonials">Testimonials</Link>
              <Link to="/contact">Book Appointment</Link>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </div>
          </div>

          <div>
            <h4>Visit Us</h4>
            <div className="footer__links">
              <span style={{ display: "flex", gap: "0.6rem" }}>
                <IconMapPin width={17} height={17} style={{ flex: "none", marginTop: 3, color: "var(--gold-light)" }} />
                <span>{clinic.addressLines.join(", ")}</span>
              </span>
              <span style={{ display: "flex", gap: "0.6rem" }}>
                <IconPhone width={17} height={17} style={{ flex: "none", marginTop: 3, color: "var(--gold-light)" }} />
                <a href={`tel:${clinic.phone.replace(/\s/g, "")}`}>{clinic.phoneDisplay}</a>
              </span>
              {clinic.email ? (
                <span style={{ display: "flex", gap: "0.6rem" }}>
                  <IconMail width={17} height={17} style={{ flex: "none", marginTop: 3, color: "var(--gold-light)" }} />
                  <a href={`mailto:${clinic.email}`}>{clinic.email}</a>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            &copy; {new Date().getFullYear()} {clinic.name}. All rights reserved.
          </span>
          <span className="footer__legal">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/contact">Contact</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
