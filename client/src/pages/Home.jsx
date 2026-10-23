import DailySlogan from "../components/home/DailySlogan.jsx";
import GrowingTree from "../components/home/GrowingTree.jsx";
import HomeHero from "../components/home/HomeHero.jsx";
import {
  AboutBand,
  ContactBand,
  Credentials,
  CtaBand,
  DiseasesCarouselBand,
  HomeFaq,
  PowerBand,
  ProductsBand,
  StatsBand,
  TestimonialsBand,
  TreatmentsMarquee,
  WhyGrid
} from "../components/home/HomeSections.jsx";

export default function Home() {
  return (
    <>
      <HomeHero />
      <StatsBand />
      <GrowingTree />
      <AboutBand />
      <DailySlogan />
      <Credentials />
      <ProductsBand />
      <TreatmentsMarquee />
      <DiseasesCarouselBand />
      <WhyGrid />
      <PowerBand />
      <CtaBand />
      <TestimonialsBand />
      <HomeFaq />
      <ContactBand />
    </>
  );
}
