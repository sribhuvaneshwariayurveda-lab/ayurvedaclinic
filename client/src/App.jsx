import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import FloatingWhatsApp from "./components/layout/FloatingWhatsApp.jsx";
import Home from "./pages/Home.jsx";
import Placeholder from "./pages/Placeholder.jsx";
import { nav } from "./data/content.js";
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

  const otherRoutes = nav
    .map((n) => n.to)
    .filter((to) => to !== "/")
    .concat(["/testimonials", "/privacy-policy"]);

  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        {/* Keyed wrapper = lightweight CSS page transition per route */}
        <div className="page" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            {otherRoutes.map((path) => (
              <Route key={path} path={path} element={<Placeholder />} />
            ))}
            <Route path="*" element={<Placeholder />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
