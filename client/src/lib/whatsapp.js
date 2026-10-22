import { getContentSnapshot } from "../data/store.js";

/** The clinic details currently in use (admin-editable, with bundled defaults). */
function clinicInfo() {
  return getContentSnapshot().clinic || {};
}

/**
 * Normalise a phone number for use in a wa.me link (digits only, no +, spaces
 * or dashes). The number ultimately comes from the CMS/admin settings.
 */
export function normaliseNumber(raw) {
  return String(raw || "").replace(/[^\d]/g, "");
}

/**
 * Build a wa.me link with a correctly URL-encoded, pre-filled message.
 */
export function buildWhatsAppLink(message, number) {
  const n = normaliseNumber(number || clinicInfo().whatsapp);
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${n}${text}`;
}

/** A short general enquiry message used by the floating button. */
export function generalEnquiryMessage() {
  return `Hello ${clinicInfo().name}, I would like to book an Ayurvedic consultation.`;
}

/** An enquiry about one of the conditions listed on the site. */
export function conditionEnquiryMessage(condition) {
  return `Hello ${clinicInfo().name}, I would like to know more about Ayurvedic care for ${condition}.`;
}

/** An enquiry about one of the clinic products. */
export function productEnquiryMessage(product) {
  return `Hello ${clinicInfo().name}, I would like to know more about the ${product} available at the clinic.`;
}

/**
 * Build the appointment enquiry message. This is an ENQUIRY, not a confirmed
 * appointment — the label is intentionally explicit.
 */
export function appointmentEnquiryMessage({ name, phone, date, time, treatment }) {
  const lines = [
    `Hello ${clinicInfo().name}, I would like to enquire about an appointment.`,
    "",
    `Name: ${name || "-"}`,
    `Phone: ${phone || "-"}`,
    `Preferred date: ${date || "-"}`,
    `Preferred time: ${time || "-"}`,
    `Treatment of interest: ${treatment || "-"}`,
    "",
    "This is an appointment enquiry, not a confirmed booking."
  ];
  return lines.join("\n");
}

export function openWhatsApp(message) {
  const url = buildWhatsAppLink(message);
  window.open(url, "_blank", "noopener,noreferrer");
  return url;
}
