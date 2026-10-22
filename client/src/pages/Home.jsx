import {
  AboutBand,
  ContactBand,
  Counters,
  Credentials,
  CtaBand,
  DiseasesCarouselBand,
  HomeFaq,
  PowerBand,
  ProductsBand,
  TestimonialsBand,
  TreatmentsMarquee,
  WhyGrid
} from "../components/home/HomeSections.jsx";

export default function Home() {
  return (
    <>
      <Counters />
      <Credentials />
      <AboutBand />
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
