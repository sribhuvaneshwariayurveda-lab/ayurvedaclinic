import {
  AboutBand,
  ContactBand,
  Counters,
  Credentials,
  CtaBand,
  HomeFaq,
  PowerBand,
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
      <WhyGrid />
      <PowerBand />
      <CtaBand />
      <TestimonialsBand />
      <HomeFaq />
      <ContactBand />
    </>
  );
}
