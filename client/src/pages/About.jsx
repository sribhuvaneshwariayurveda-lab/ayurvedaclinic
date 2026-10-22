import { Link } from "react-router-dom";
import { useContentSection } from "../data/store.js";
import { IconCheck } from "../components/ui/Icons.jsx";
import Media from "../components/ui/Media.jsx";
import Reveal from "../components/ui/Reveal.jsx";

/**
 * About Us — the physician, the clinic's story, how a visit works, the values
 * behind the practice and the areas of health it focuses on.
 */
export default function About() {
  const about = useContentSection("about");
  const clinic = useContentSection("clinic");

  const story = about?.story || { title: "Our Story", paragraphs: [] };
  const journey = about?.journey || { title: "Your Visit, Step by Step", steps: [] };
  const values = about?.values || [];
  const specialities = about?.specialities || [];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="page-hero__label">About Us</span>
          <h1>
            {about?.title} <span className="italic-serif">{about?.titleAccent}</span>
          </h1>
          <p>{about?.paragraphs?.[0]}</p>
        </div>
      </section>

      {/* ---- The physician ---------------------------------------------- */}
      <section className="content-block">
        <div className="container">
          <div className="grid-2">
            <Reveal className="media-frame" variant="left">
              <Media src={about?.photos?.doctor?.src} alt={about?.photos?.doctor?.alt} label="The physician" />
            </Reveal>
            <Reveal variant="right">
              <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                The Physician
              </span>
              <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
                {clinic?.doctor}, {clinic?.qualifications}
              </h2>
              <p className="section-desc">{about?.paragraphs?.[1]}</p>
              <ul className="about-band__list">
                {(about?.credentials || []).map((c) => (
                  <li key={c}>
                    <IconCheck width={16} height={16} aria-hidden="true" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
              <Link className="btn btn--green" to="/contact">
                Book a Consultation
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Our story --------------------------------------------------- */}
      {story.paragraphs?.length ? (
        <section className="content-block" style={{ background: "var(--mint-soft)" }}>
          <div className="container">
            <div className="grid-2">
              <Reveal variant="left">
                <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                  {story.title}
                </span>
                <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
                  A clinic built on careful listening
                </h2>
              </Reveal>
              <Reveal variant="right">
                <div className="prose">
                  {story.paragraphs.map((p, i) => (
                    <p key={i} className="section-desc">
                      {p}
                    </p>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Journey ----------------------------------------------------- */}
      {journey.steps?.length ? (
        <section className="content-block">
          <div className="container">
            <div className="center" style={{ marginBottom: "2.4rem" }}>
              <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                How a visit works
              </span>
              <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
                {journey.title}
              </h2>
              <div className="divider-gold" style={{ marginInline: "auto" }} />
            </div>
            <ol className="journey-grid">
              {journey.steps.map((s, i) => (
                <Reveal key={s.title} delay={i % 4} className="journey-step">
                  <span className="journey-step__num">{String(i + 1).padStart(2, "0")}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ---- Values ------------------------------------------------------ */}
      {values.length ? (
        <section className="content-block" style={{ background: "var(--cream)" }}>
          <div className="container">
            <div className="center" style={{ marginBottom: "2.4rem" }}>
              <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                What we stand for
              </span>
              <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
                Our values
              </h2>
              <div className="divider-gold" style={{ marginInline: "auto" }} />
            </div>
            <div className="value-grid">
              {values.map((v, i) => (
                <Reveal key={v.title} delay={i % 3} className="pillar value-card">
                  <b style={{ display: "block", color: "var(--forest)", marginBottom: "0.35rem" }}>{v.title}</b>
                  <span style={{ fontSize: "0.92rem" }}>{v.text}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Focus areas -------------------------------------------------- */}
      {specialities.length ? (
        <section className="content-block">
          <div className="container">
            <div className="center" style={{ marginBottom: "1.8rem" }}>
              <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                Areas of focus
              </span>
              <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
                What we focus on
              </h2>
            </div>
            <ul className="chip-list">
              {specialities.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
            <div style={{ textAlign: "center", marginTop: "2.2rem" }}>
              <Link className="btn btn--green" to="/diseases">
                See the conditions we support
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ---- Our clinic ---------------------------------------------------- */}
      <section className="content-block" style={{ background: "var(--mint-soft)" }}>
        <div className="container">
          <div className="grid-2">
            <Reveal variant="left">
              <span className="section-sub" style={{ color: "var(--green-dark)" }}>
                Our Clinic
              </span>
              <h2 className="section-title" style={{ color: "var(--green-dark)" }}>
                A calm space for classical care
              </h2>
              <p className="section-desc">
                At {clinic?.name}, every visit begins with careful listening. Consultations are
                unhurried, treatment plans are explained clearly, and expectations are kept honest —
                no exaggerated promises, only individualised care.
              </p>
              <div className="grid-2" style={{ marginTop: "1.4rem", gap: "1rem" }}>
                {(about?.pillars || []).map((p) => (
                  <div className="pillar" key={p.title}>
                    <b style={{ display: "block", color: "var(--forest)", marginBottom: "0.3rem" }}>{p.title}</b>
                    <span style={{ fontSize: "0.9rem" }}>{p.text}</span>
                  </div>
                ))}
              </div>
              <p className="section-desc" style={{ marginTop: "1.4rem", fontStyle: "italic" }}>
                &ldquo;{about?.quote}&rdquo;
              </p>
            </Reveal>
            <Reveal className="media-frame" variant="right">
              <Media src={about?.photos?.clinic?.src} alt={about?.photos?.clinic?.alt} label="The clinic" />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
