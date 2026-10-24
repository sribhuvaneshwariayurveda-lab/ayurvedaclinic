import { useCallback, useEffect, useId, useRef, useState } from "react";
import BrandLogo from "./BrandLogo.jsx";
import { BotanicalLeaf } from "./Botanical.jsx";
import { IconArrowRight, IconCheck, IconLeaf, IconWhatsApp, IconX } from "./Icons.jsx";
import { useContentSection } from "../../data/store.js";

const SEEN_KEY = "sbap.enquiryPopup.seen";
const SHOW_DELAY_MS = 2500;

const EMPTY_FORM = {
  patientName: "",
  email: "",
  phone: "",
  locality: "",
  age: "",
  preferredDate: "",
  healthConcern: "",
  consent: false,
  website: "",
};

function wasShown() {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberShown() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* private mode / disabled storage: still show once in this page load */
  }
}

function makeRequestId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function validate(form) {
  const errors = {};
  const name = form.patientName.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();

  if (!name) errors.patientName = "Please enter the patient's name.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (phone && !/^\+?[\d\s().-]{7,22}$/.test(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (!email && !phone) {
    errors.contact = "Enter a phone number or email address so we can respond.";
  }
  if (form.age !== "") {
    const age = Number(form.age);
    if (!Number.isInteger(age) || age < 0 || age > 120) {
      errors.age = "Enter an age between 0 and 120, or leave it blank.";
    }
  }
  if (!form.consent) {
    errors.consent = "Please confirm that we may contact you about this enquiry.";
  }
  return errors;
}

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <span className="enquiry-field__error" id={id} role="alert">
      {children}
    </span>
  );
}

export default function EnquiryPopup() {
  const clinic = useContentSection("clinic") || {};
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const dialogRef = useRef(null);
  const nameRef = useRef(null);
  const lastFocusRef = useRef(null);
  const requestIdRef = useRef("");
  const titleId = useId();
  const descId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setFormError("");
  }, []);

  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return undefined;
    if (wasShown()) return undefined;

    const timer = window.setTimeout(() => {
      if (window.location.pathname.startsWith("/admin") || wasShown()) return;
      rememberShown();
      setOpen(true);
    }, SHOW_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    lastFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => nameRef.current?.focus(), 80);

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), a[href]'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      if (lastFocusRef.current && typeof lastFocusRef.current.focus === "function") {
        lastFocusRef.current.focus();
      }
    };
  }, [open, close]);

  if (!open) return null;

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      const touchesContact = field === "email" || field === "phone";
      if (!current[field] && !current.form && !(touchesContact && current.contact)) return current;
      const next = { ...current };
      delete next[field];
      delete next.form;
      if (touchesContact) delete next.contact;
      return next;
    });
    setFormError("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) {
      const firstField = ["patientName", "email", "phone", "age", "consent"].find((key) => nextErrors[key]);
      if (firstField) dialogRef.current?.querySelector(`[name="${firstField}"]`)?.focus();
      return;
    }

    if (!requestIdRef.current) requestIdRef.current = makeRequestId();
    setSubmitting(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        signal: controller.signal,
        body: JSON.stringify({
          patientName: form.patientName,
          email: form.email,
          phone: form.phone,
          locality: form.locality,
          age: form.age,
          preferredDate: form.preferredDate,
          healthConcern: form.healthConcern,
          consent: form.consent,
          requestId: requestIdRef.current,
          website: form.website,
        }),
      });
      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }
      if (!response.ok) {
        if (data.fields && typeof data.fields === "object") setErrors(data.fields);
        setFormError(data.error || "We could not send your enquiry. Please try again or contact the clinic.");
        if (response.status === 429) {
          setFormError("Too many enquiries were sent from this connection. Please try again later or contact us on WhatsApp.");
        }
        return;
      }
      requestIdRef.current = "";
      setSuccess(data.reference || "ENQ-RECEIVED");
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (error) {
      if (error.name === "AbortError") {
        setFormError("The request timed out. Please check your connection and try again.");
      } else {
        setFormError("We could not send your enquiry. Please try again or contact the clinic.");
      }
    } finally {
      window.clearTimeout(timeout);
      setSubmitting(false);
    }
  };

  const phoneHref = clinic.phone ? `tel:${String(clinic.phone).replace(/[^\d+]/g, "")}` : "";
  const whatsappHref = clinic.whatsapp ? `https://wa.me/${clinic.whatsapp}` : "";

  return (
    <div
      className="enquiry-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className="enquiry-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        ref={dialogRef}
      >
        <button type="button" className="enquiry-close" onClick={close} aria-label="Close enquiry form">
          <IconX width="20" height="20" />
        </button>

        <aside className="enquiry-aside">
          <BotanicalLeaf className="enquiry-aside__leaf" />
          <div className="enquiry-aside__logo">
            <BrandLogo title="Sri Bhuvaneshwari Ayurveda Peedam" priority />
          </div>
          <p className="enquiry-aside__eyebrow">Personalised Ayurvedic care</p>
          <h3 className="enquiry-aside__heading">Begin with a conversation.</h3>
          <p className="enquiry-aside__copy">
            Share a few details and our team will help you find the right next step, at your pace.
          </p>
          <ul className="enquiry-aside__points">
            <li>
              <IconLeaf width="15" height="15" /> Classical Ayurvedic guidance
            </li>
            <li>
              <IconLeaf width="15" height="15" /> Personalised diet, routine &amp; therapies
            </li>
            <li>
              <IconLeaf width="15" height="15" /> Karur, Tamil Nadu
            </li>
          </ul>
          {(phoneHref || whatsappHref) && (
            <div className="enquiry-aside__contact">
              <span>Prefer to speak directly?</span>
              {phoneHref && <a href={phoneHref}>{clinic.phoneDisplay || clinic.phone}</a>}
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noreferrer">
                  <IconWhatsApp width="15" height="15" /> WhatsApp
                </a>
              )}
            </div>
          )}
        </aside>

        <div className="enquiry-body">
          {success ? (
            <div className="enquiry-success" aria-live="polite">
              <span className="enquiry-success__mark">
                <IconCheck width="26" height="26" />
              </span>
              <p className="enquiry-eyebrow">Enquiry received</p>
              <h2 id={titleId}>Thank you.</h2>
              <p id={descId} className="enquiry-success__copy">
                Our team will contact you using the details you shared. If your concern is urgent, please call or
                message us on WhatsApp.
              </p>
              <p className="enquiry-success__ref">
                Reference <strong>{success}</strong>
              </p>
              <button type="button" className="enquiry-submit" onClick={close}>
                Continue browsing <IconArrowRight width="17" height="17" />
              </button>
            </div>
          ) : (
            <>
              <header className="enquiry-head">
                <p className="enquiry-eyebrow">Patient enquiry</p>
                <h2 id={titleId}>
                  Book a Consultation <span>/ Patient Enquiry</span>
                </h2>
                <p id={descId}>
                  Tell us how to reach you. Only the patient&apos;s name, one contact method and consent are required;
                  every other field is optional.
                </p>
              </header>

              <form className="enquiry-form" onSubmit={onSubmit} noValidate>
                <div className="enquiry-form__grid">
                  <label className={`enquiry-field enquiry-field--full${errors.patientName ? " is-invalid" : ""}`}>
                    <span>
                      Patient name <em>*</em>
                    </span>
                    <input
                      ref={nameRef}
                      name="patientName"
                      value={form.patientName}
                      onChange={(event) => setField("patientName", event.target.value)}
                      autoComplete="name"
                      maxLength={120}
                      aria-invalid={Boolean(errors.patientName)}
                      aria-describedby={errors.patientName ? "enquiry-error-name" : undefined}
                    />
                    <FieldError id="enquiry-error-name">{errors.patientName}</FieldError>
                  </label>

                  <label className={`enquiry-field${errors.email ? " is-invalid" : ""}`}>
                    <span>Email address</span>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => setField("email", event.target.value)}
                      autoComplete="email"
                      maxLength={254}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "enquiry-error-email" : undefined}
                    />
                    <FieldError id="enquiry-error-email">{errors.email}</FieldError>
                  </label>

                  <label className={`enquiry-field${errors.phone ? " is-invalid" : ""}`}>
                    <span>Phone number</span>
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(event) => setField("phone", event.target.value)}
                      autoComplete="tel"
                      inputMode="tel"
                      maxLength={24}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "enquiry-error-phone" : undefined}
                    />
                    <FieldError id="enquiry-error-phone">{errors.phone}</FieldError>
                  </label>

                  {errors.contact && (
                    <p className="enquiry-form__error enquiry-field--full" id="enquiry-contact-hint" role="alert">
                      {errors.contact}
                    </p>
                  )}

                  <label className="enquiry-field">
                    <span>Locality / city</span>
                    <input
                      name="locality"
                      value={form.locality}
                      onChange={(event) => setField("locality", event.target.value)}
                      autoComplete="address-level2"
                      maxLength={120}
                    />
                  </label>

                  <label className={`enquiry-field${errors.age ? " is-invalid" : ""}`}>
                    <span>
                      Age <small>optional</small>
                    </span>
                    <input
                      name="age"
                      type="number"
                      min="0"
                      max="120"
                      value={form.age}
                      onChange={(event) => setField("age", event.target.value)}
                      inputMode="numeric"
                      aria-invalid={Boolean(errors.age)}
                    />
                    <FieldError id="enquiry-error-age">{errors.age}</FieldError>
                  </label>

                  <label className="enquiry-field enquiry-field--full">
                    <span>
                      Preferred consultation date <small>optional</small>
                    </span>
                    <input
                      name="preferredDate"
                      type="date"
                      value={form.preferredDate}
                      onChange={(event) => setField("preferredDate", event.target.value)}
                    />
                  </label>

                  <label className="enquiry-field enquiry-field--full">
                    <span>
                      Health concern / reason for enquiry <small>optional</small>
                    </span>
                    <textarea
                      name="healthConcern"
                      value={form.healthConcern}
                      onChange={(event) => setField("healthConcern", event.target.value)}
                      rows={3}
                      maxLength={2000}
                      placeholder="A brief note is enough. Please avoid sharing detailed medical records here."
                    />
                  </label>

                  <label className={`enquiry-consent enquiry-field--full${errors.consent ? " is-invalid" : ""}`}>
                    <input
                      name="consent"
                      type="checkbox"
                      checked={form.consent}
                      onChange={(event) => setField("consent", event.target.checked)}
                      aria-invalid={Boolean(errors.consent)}
                    />
                    <span>
                      I agree to be contacted by phone, email or WhatsApp about this enquiry. <em>*</em>
                    </span>
                    <FieldError id="enquiry-error-consent">{errors.consent}</FieldError>
                  </label>

                  <div className="enquiry-honeypot" aria-hidden="true">
                    <label>
                      Website
                      <input
                        name="website"
                        value={form.website}
                        onChange={(event) => setField("website", event.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </label>
                  </div>
                </div>

                {formError && (
                  <p className="enquiry-form__error" role="alert">
                    {formError}
                  </p>
                )}

                <div className="enquiry-form__actions">
                  <button type="submit" className="enquiry-submit" disabled={submitting}>
                    {submitting ? "Sending…" : "Send enquiry"}
                    {!submitting && <IconArrowRight width="17" height="17" />}
                  </button>
                  <p>
                    Your details are used only to respond to your enquiry. Please do not include sensitive medical
                    records.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
