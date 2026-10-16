import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import FloatingWhatsApp from "./components/layout/FloatingWhatsApp.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import TreatmentsPage from "./pages/TreatmentsPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import FaqsPage from "./pages/FaqsPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import { initMotion, watchMotionPreference } from "./lib/motionSettings.js";

/** Instant scroll reset on route change (smooth scrolling would feel odd). */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    initMotion();
    return watchMotionPreference(() => {});
  }, []);

  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        {/* Keyed wrapper = lightweight CSS page transition per route */}
        <div className="page" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/treatments" element={<TreatmentsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/faqs" element={<FaqsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Routes awaiting verified content (no invented cases, reviews or
                legal text) — honest placeholder until supplied. */}
            <Route path="/case-studies" element={<Placeholder />} />
            <Route path="/testimonials" element={<Placeholder />} />
            <Route path="/privacy-policy" element={<Placeholder />} />
            <Route path="*" element={<Placeholder />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
