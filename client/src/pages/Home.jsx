import Hero from "../components/home/Hero.jsx";
import TrustStrip from "../components/home/TrustStrip.jsx";
import Intro from "../components/home/Intro.jsx";
import AboutDoctor from "../components/home/AboutDoctor.jsx";
import Treatments from "../components/home/Treatments.jsx";
import Herbs from "../components/home/Herbs.jsx";
import Products from "../components/home/Products.jsx";
import Gallery from "../components/home/Gallery.jsx";
import ConsultBand from "../components/home/ConsultBand.jsx";
import WhyChooseUs from "../components/home/WhyChooseUs.jsx";
import AppointmentCta from "../components/home/AppointmentCta.jsx";
import Faq from "../components/home/Faq.jsx";
import ContactClinic from "../components/home/ContactClinic.jsx";
import FinalCta from "../components/home/FinalCta.jsx";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Intro />
      <AboutDoctor />
      <Treatments />
      <Herbs />
      <Products />
      <Gallery />
      <ConsultBand />
      <WhyChooseUs />
      <AppointmentCta />
      <Faq />
      <ContactClinic />
      <FinalCta />
    </>
  );
}
