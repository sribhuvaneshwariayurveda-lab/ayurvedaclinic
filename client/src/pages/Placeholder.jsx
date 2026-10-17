import { Link, useLocation } from "react-router-dom";
import Reveal from "../components/ui/Reveal.jsx";

export default function Placeholder() {
  const { pathname } = useLocation();
  return (
    <section className="content-block" style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
      <div className="container center">
        <Reveal>
          <span className="section-sub" style={{ color: "var(--green-dark)" }}>
            Next Phase
          </span>
          <h1 className="section-title" style={{ color: "var(--green-dark)" }}>
            This page is coming next
          </h1>
          <div className="divider-gold" style={{ marginInline: "auto" }} />
          <p className="section-desc" style={{ marginInline: "auto" }}>
            <code>{pathname}</code> is part of the remaining pages, which are built after the
            homepage visual direction is approved.
          </p>
          <Link className="btn btn--green" to="/" style={{ marginTop: "1.8rem" }}>
            Back to Home
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
