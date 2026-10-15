import Hero from "../components/home/Hero.jsx";
import TrustStrip from "../components/home/TrustStrip.jsx";
import AboutDoctor from "../components/home/AboutDoctor.jsx";
import Treatments from "../components/home/Treatments.jsx";
import ConsultBand from "../components/home/ConsultBand.jsx";
import WhyChooseUs from "../components/home/WhyChooseUs.jsx";
import Testimonials from "../components/home/Testimonials.jsx";
import AppointmentCta from "../components/home/AppointmentCta.jsx";
import Faq from "../components/home/Faq.jsx";
import ContactClinic from "../components/home/ContactClinic.jsx";
import FinalCta from "../components/home/FinalCta.jsx";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <AboutDoctor />
      <Treatments />
      <ConsultBand />
      <WhyChooseUs />
      <Testimonials />
      <AppointmentCta />
      <Faq />
      <ContactClinic />
      <FinalCta />
    </>
  );
}
