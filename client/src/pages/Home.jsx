import DailySlogan from "../components/home/DailySlogan.jsx";
import GrowingTree from "../components/home/GrowingTree.jsx";
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
      <StatsBand />
      <GrowingTree />
      <AboutBand />
      <DailySlogan />
      <Credentials />
      <TreatmentsMarquee />
      <ProductsBand />
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
