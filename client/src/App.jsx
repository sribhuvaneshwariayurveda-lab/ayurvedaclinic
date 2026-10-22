import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import FloatingWhatsApp from "./components/layout/FloatingWhatsApp.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import TreatmentsPage from "./pages/TreatmentsPage.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import DiseasesPage from "./pages/DiseasesPage.jsx";
import DiseaseDetail from "./pages/DiseaseDetail.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import FaqsPage from "./pages/FaqsPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import Admin from "./pages/Admin.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import { initMotion, watchMotionPreference } from "./lib/motionSettings.js";
import { loadContent } from "./data/store.js";

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
    const stopWatching = watchMotionPreference(() => {});
    // Fetch the admin-managed content document. On a static host (no API)
    // this simply fails and the bundled defaults stay in use.
    loadContent().then((loaded) => {
      // The animation preset can come from the content document, so re-resolve
      // it once the stored copy has been merged in.
      if (loaded) initMotion();
    });
    return stopWatching;
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
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/diseases" element={<DiseasesPage />} />
            <Route path="/diseases/:slug" element={<DiseaseDetail />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/faqs" element={<FaqsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            {/* Admin panel (unlinked from public navigation; server-enforced auth). */}
            <Route path="/admin" element={<Admin />} />
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
