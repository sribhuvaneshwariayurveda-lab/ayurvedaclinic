import { useState } from "react";
import { treatments } from "../../data/content.js";
import { appointmentEnquiryMessage, buildWhatsAppLink } from "../../lib/whatsapp.js";
import { IconWhatsApp } from "../ui/Icons.jsx";

const empty = { name: "", phone: "", date: "", time: "", treatment: "" };

export default function AppointmentForm() {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    setError("");
    const url = buildWhatsAppLink(appointmentEnquiryMessage(form));
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form className="appt-form" onSubmit={onSubmit} noValidate>
      <div className="appt-form__grid">
        <label className="field">
          <span>Full name *</span>
          <input value={form.name} onChange={set("name")} type="text" autoComplete="name" placeholder="Your name" required />
        </label>
        <label className="field">
          <span>Phone number *</span>
          <input value={form.phone} onChange={set("phone")} type="tel" autoComplete="tel" placeholder="+91" required />
        </label>
        <label className="field">
          <span>Preferred date</span>
          <input value={form.date} onChange={set("date")} type="date" />
        </label>
        <label className="field">
          <span>Preferred time</span>
          <input value={form.time} onChange={set("time")} type="time" />
        </label>
        <label className="field field--full">
          <span>Treatment of interest</span>
          <select value={form.treatment} onChange={set("treatment")}>
            <option value="">Select a treatment</option>
            {treatments.map((t) => (
              <option key={t.title} value={t.title}>
                {t.title}
              </option>
            ))}
            <option value="General enquiry">General enquiry</option>
          </select>
        </label>
      </div>

      {error ? <p className="appt-form__error">{error}</p> : null}

      <button className="btn btn--gold btn--block" type="submit">
        <IconWhatsApp width={18} height={18} />
        Send Enquiry on WhatsApp
      </button>

      <p className="appt-form__note">
        This sends an <strong>appointment enquiry</strong> on WhatsApp. It is <strong>not a confirmed
        appointment</strong> — our team will contact you to confirm a slot.
      </p>
    </form>
  );
}
