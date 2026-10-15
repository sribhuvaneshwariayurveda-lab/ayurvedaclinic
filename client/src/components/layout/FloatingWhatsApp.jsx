import { useState } from "react";
import { buildWhatsAppLink, generalEnquiryMessage } from "../../lib/whatsapp.js";
import { IconWhatsApp, IconX } from "../ui/Icons.jsx";

export default function FloatingWhatsApp() {
  const [showTip, setShowTip] = useState(true);

  return (
    <div className="wa">
      {showTip ? (
        <span className="wa__tooltip">
          Chat with us
          <button
            aria-label="Dismiss"
            onClick={() => setShowTip(false)}
            style={{ marginLeft: 8, color: "var(--ink-muted)", verticalAlign: "middle" }}
          >
            <IconX width={13} height={13} />
          </button>
        </span>
      ) : null}
      <a
        className="wa__btn"
        href={buildWhatsAppLink(generalEnquiryMessage())}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <IconWhatsApp width={28} height={28} />
      </a>
    </div>
  );
}
