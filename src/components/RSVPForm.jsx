"use client";

import { useEffect, useRef, useState } from "react";
import { Check, LockKeyhole, Minus, Plus, Send } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { SectionHeading } from "./InvitationOrnaments";
import { useLanguage } from "./InvitationLanguage";

const initial = { fullName: "", phoneNumber: "", attending: "", numberOfGuests: "1", message: "", website: "" };
const SUBMISSION_COOLDOWN = 15;
const errorKeys = {
  fullName: "rsvpNameError",
  phoneNumber: "rsvpPhoneError",
  attending: "rsvpAttendanceError",
  numberOfGuests: "rsvpGuestsError",
  message: "rsvpMessageError",
};

export default function RSVPForm({ invitation }) {
  const { language, t } = useLanguage();
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [serverErrorKey, setServerErrorKey] = useState("rsvpError");
  const [successKey, setSuccessKey] = useState("rsvpAccepted");
  const [cooldown, setCooldown] = useState(0);
  const successRef = useRef(null);
  const id = (field) => `${invitation.slug}-rsvp-${field}`;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (status === "success") successRef.current?.focus({ preventScroll: true });
  }, [status]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "attending" && value === "no" ? { numberOfGuests: "0" } : {}),
      ...(name === "attending" && value === "yes" && current.numberOfGuests === "0" ? { numberOfGuests: "1" } : {}),
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const adjustGuests = (amount) => {
    setForm((current) => ({ ...current, numberOfGuests: String(Math.min(20, Math.max(1, Number(current.numberOfGuests || 1) + amount))) }));
    setErrors((current) => ({ ...current, numberOfGuests: "" }));
  };

  const validate = () => {
    const next = {};
    if (form.fullName.trim().length < 2) next.fullName = errorKeys.fullName;
    if (!/^[+()\-\s\d]{7,40}$/.test(form.phoneNumber.trim())) next.phoneNumber = errorKeys.phoneNumber;
    if (!form.attending) next.attending = errorKeys.attending;
    if (form.message.trim().length > 800) next.message = errorKeys.message;
    if (form.attending === "yes" && (!Number.isInteger(Number(form.numberOfGuests)) || Number(form.numberOfGuests) < 1 || Number(form.numberOfGuests) > 20)) {
      next.numberOfGuests = errorKeys.numberOfGuests;
    }
    setErrors(next);
    if (Object.keys(next).length) {
      window.requestAnimationFrame(() => document.getElementById(id(Object.keys(next)[0]))?.focus());
      return false;
    }
    return true;
  };

  const fireConfetti = async () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      const confetti = (await import("canvas-confetti")).default;
      const burst = (originX) => confetti({
        particleCount: 70, spread: 80, startVelocity: 38, decay: 0.92,
        origin: { x: originX, y: 0.78 },
        colors: ["#d6a759", "#f1cd8d", "#8f2736", "#fff8e9", "#e8c97a", "#fce4ec"],
        shapes: ["circle", "square"], scalar: 0.95,
      });
      burst(0.28);
      window.setTimeout(() => burst(0.72), 180);
    } catch {
      // Decorative confetti never affects a saved RSVP.
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (status === "sending" || cooldown > 0 || !validate()) return;
    setStatus("sending");
    setServerMessage("");
    setServerErrorKey("rsvpError");
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, event: invitation.slug, numberOfGuests: form.attending === "no" ? 0 : Number(form.numberOfGuests) }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if (result?.errors) {
          setErrors(Object.fromEntries(Object.keys(result.errors).filter((field) => errorKeys[field]).map((field) => [field, errorKeys[field]])));
        }
        if (response.status === 503) setServerErrorKey("rsvpUnavailable");
        throw new Error(result?.error || t("rsvpError"));
      }
      setSuccessKey(result.updated ? "rsvpUpdated" : form.attending === "yes" ? "rsvpAccepted" : "rsvpDeclined");
      setStatus("success");
      setCooldown(SUBMISSION_COOLDOWN);
      if (form.attending === "yes") fireConfetti();
    } catch (error) {
      setStatus("error");
      setServerMessage(error.message);
    }
  };

  const reset = () => {
    setForm(initial);
    setErrors({});
    setServerMessage("");
    setCooldown(0);
    setStatus("idle");
    window.requestAnimationFrame(() => document.getElementById(id("fullName"))?.focus({ preventScroll: true }));
  };

  const fieldError = (field) => errors[field] ? <small id={id(`${field}-error`)} className="field-error">{t(errors[field])}</small> : null;
  const description = (field) => errors[field] ? id(`${field}-error`) : undefined;

  return (
    <section className="rsvp-section section-shell" id="rsvp" aria-labelledby="rsvp-title">
      <SectionHeading kicker={t("rsvpKicker")} title={t("rsvpTitle")} id="rsvp-title" />
      <p className="section-description">{invitation.rsvpIntro}</p>
      {invitation.rsvpNote && <p className="section-description">{invitation.rsvpNote}</p>}
      <SectionReveal className="rsvp-card">
        {status === "success" ? (
          <div className="rsvp-success" role="status" tabIndex={-1} ref={successRef}>
            <span className="rsvp-success-icon" aria-hidden="true"><Check size={28} /></span>
            <h3>{t("rsvpThankYou", { name: form.fullName.trim().split(/\s+/)[0] })}{form.attending === "no" ? "." : "!"}</h3>
            <p>{t(successKey)}</p>
            <button type="button" className="text-button" onClick={reset}>{t("rsvpAnother")}</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate aria-busy={status === "sending"}>
            <div className="honeypot-field" aria-hidden="true" hidden>
              <label htmlFor={id("website")}>Website</label>
              <input id={id("website")} name="website" value={form.website} onChange={update} tabIndex={-1} autoComplete="off" />
            </div>
            <p className="rsvp-form-intro">{t("rsvpFormIntro")}</p>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor={id("fullName")}>{t("rsvpFullName")} <span aria-hidden="true">*</span></label>
                <input id={id("fullName")} name="fullName" type="text" required autoComplete="name" maxLength={120} placeholder={t("rsvpNamePlaceholder")} value={form.fullName} onChange={update} aria-invalid={!!errors.fullName} aria-describedby={description("fullName")} />
                {fieldError("fullName")}
              </div>
              <div className="form-field">
                <label htmlFor={id("phoneNumber")}>{t("rsvpPhone")} <span aria-hidden="true">*</span></label>
                <input id={id("phoneNumber")} name="phoneNumber" type="tel" required inputMode="tel" autoComplete="tel" maxLength={40} placeholder={t("rsvpPhonePlaceholder")} value={form.phoneNumber} onChange={update} aria-invalid={!!errors.phoneNumber} aria-describedby={description("phoneNumber")} />
                {fieldError("phoneNumber")}
              </div>
            </div>
            <fieldset className="form-field attendance-field" aria-describedby={description("attending")}>
              <legend>{t("rsvpAttendance")} <span aria-hidden="true">*</span></legend>
              <div className="choice-row">
                <label><input id={id("attending")} type="radio" name="attending" value="yes" required checked={form.attending === "yes"} onChange={update} aria-describedby={description("attending")} /><span>{t("rsvpAccept")}</span></label>
                <label><input type="radio" name="attending" value="no" checked={form.attending === "no"} onChange={update} aria-describedby={description("attending")} /><span>{t("rsvpDecline")}</span></label>
              </div>
              {fieldError("attending")}
            </fieldset>
            <div className="form-field guest-field">
              <label htmlFor={id("numberOfGuests")}>{t("rsvpGuests")} <span aria-hidden="true">*</span></label>
              <div className="guest-stepper">
                <button type="button" onClick={() => adjustGuests(-1)} disabled={form.attending === "no" || Number(form.numberOfGuests) <= 1} aria-label={t("rsvpDecreaseGuests")}><Minus size={18} /></button>
                <input id={id("numberOfGuests")} name="numberOfGuests" type="number" inputMode="numeric" min="1" max="20" readOnly disabled={form.attending === "no"} value={form.numberOfGuests} aria-invalid={!!errors.numberOfGuests} aria-describedby={description("numberOfGuests")} />
                <button type="button" onClick={() => adjustGuests(1)} disabled={form.attending === "no" || Number(form.numberOfGuests) >= 20} aria-label={t("rsvpIncreaseGuests")}><Plus size={18} /></button>
              </div>
              {form.attending === "no" && <small>{t("rsvpZeroGuests")}</small>}
              {fieldError("numberOfGuests")}
            </div>
            <div className="form-field">
              <label htmlFor={id("message")}>{t("rsvpMessage")} <small>{t("rsvpOptional")}</small></label>
              <textarea id={id("message")} name="message" rows={4} maxLength={800} placeholder={t("rsvpMessagePlaceholder")} value={form.message} onChange={update} aria-invalid={!!errors.message} aria-describedby={description("message")} />
              {fieldError("message")}
            </div>
            {status === "error" && <p className="form-status" role="alert">{language === "si" ? t(serverErrorKey) : serverMessage}</p>}
            <button className="primary-button submit-button" type="submit" disabled={status === "sending" || cooldown > 0}>
              <Send size={17} aria-hidden="true" />
              {status === "sending" ? t("rsvpSending") : cooldown > 0 ? t("rsvpWait", { seconds: cooldown }) : t("rsvpSend")}
            </button>
            <p className="rsvp-privacy"><LockKeyhole size={14} aria-hidden="true" />{t("rsvpPrivacy")}</p>
          </form>
        )}
      </SectionReveal>
    </section>
  );
}
