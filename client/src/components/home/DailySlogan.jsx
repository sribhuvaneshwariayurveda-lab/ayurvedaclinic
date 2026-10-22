import { useContentSection } from "../../data/store.js";
import { isSloganActive } from "../../lib/slogan.js";
import Reveal from "../ui/Reveal.jsx";
import SloganScroll from "../slogan/SloganScroll.jsx";

export default function DailySlogan() {
  const section = useContentSection("slogan");
  const published = section?.published;

  if (!isSloganActive(published)) return null;

  return (
    <section className="slogan-band" aria-labelledby="daily-slogan-title">
      <div className="container slogan-band__inner">
        <Reveal variant="zoom" className="slogan-reveal">
          <SloganScroll slogan={published} headingId="daily-slogan-title" />
        </Reveal>
      </div>
    </section>
  );
}
