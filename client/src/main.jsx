import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { initMotion } from "./lib/motionSettings.js";
import "./styles/global.css";
import "./styles/motion.css";
import "./styles/components.css";
import "./styles/cinema.css";

window.__SBAP_BOOTED__ = true;
initMotion();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
