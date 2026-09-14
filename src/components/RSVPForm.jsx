"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, LockKeyhole, MessageSquareText, Minus, Phone, Plus, Send, Sparkles, UserRound, UsersRound } from "lucide-react";
import SectionReveal from "./SectionReveal";
import VideoBackdrop from "./VideoBackdrop";

const initial = { fullName: "", phoneNumber: "", attending: "", numberOfGuests: "1", message: "" };

export default function RSVPForm({ invitation, active }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverMessage, setServerMessage] = useState("");

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
    setForm((current) => ({
      ...current,
      numberOfGuests: String(Math.min(20, Math.max(1, Number(current.numberOfGuests || 1) + amount))),
    }));
    setErrors((current) => ({ ...current, numberOfGuests: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Please enter your full name.";
    if (!form.phoneNumber.trim()) next.phoneNumber = "Please enter your phone number.";
    if (!form.attending) next.attending = "Please tell us whether you can attend.";
    if (form.attending === "yes" && (!Number.isInteger(Number(form.numberOfGuests)) || Number(form.numberOfGuests) < 1 || Number(form.numberOfGuests) > 20)) {
      next.numberOfGuests = "Please enter a guest count from 1 to 20.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    setServerMessage("");
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, event: invitation.slug, numberOfGuests: form.attending === "no" ? 0 : Number(form.numberOfGuests) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not send your RSVP. Please try again.");
      setStatus("success");
      setServerMessage(result.message);
    } catch (error) {
      setStatus("error");
      setServerMessage(error.message);
    }
  };

  return (
    <section className="rsvp-section cinematic-section section-shell" aria-labelledby="rsvp-title">
      <VideoBackdrop src={invitation.sectionVideos.rsvp} fallbackSrc={invitation.videos.feature} poster={invitation.backgrounds.section} active={active} tone={invitation.theme} overlay="strong" className="section-video" opacity={.62} />
      <SectionReveal className="section-heading">
        <div className="rsvp-title-seal" aria-hidden="true"><Sparkles size={18} /></div>
        <p className="section-kicker">Kindly Reply</p>
        <h2 id="rsvp-title">Will You Join Us?</h2>
        <p>{invitation.rsvpIntro}</p>
        {invitation.rsvpNote && <p>{invitation.rsvpNote}</p>}
      </SectionReveal>
      <SectionReveal className="rsvp-card">
        <span className="rsvp-corner rsvp-corner-tl" aria-hidden="true" />
        <span className="rsvp-corner rsvp-corner-tr" aria-hidden="true" />
        <span className="rsvp-corner rsvp-corner-bl" aria-hidden="true" />
        <span className="rsvp-corner rsvp-corner-br" aria-hidden="true" />
        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div className="rsvp-success" key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <span><Check size={30} /></span>
              <h3>Thank you, {form.fullName.split(" ")[0]}!</h3>
              <p>{serverMessage || "Your RSVP has been received. We are so happy to share this celebration with you."}</p>
              <button type="button" className="text-button" onClick={() => { setForm(initial); setStatus("idle"); }}>Submit another response</button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="rsvp-form-heading">
                <span className="rsvp-monogram">J <i>&amp;</i> P</span>
                <p>Please share your response below</p>
              </div>
              <div className="rsvp-form-grid">
                <div className="form-field form-field-icon">
                  <label htmlFor={`${invitation.slug}-name`}><span><UserRound size={15} /> Full Name</span><b>*</b></label>
                  <input id={`${invitation.slug}-name`} name="fullName" autoComplete="name" placeholder="Your name" value={form.fullName} onChange={update} aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? `${invitation.slug}-name-error` : undefined} />
                  {errors.fullName && <small id={`${invitation.slug}-name-error`} className="field-error">{errors.fullName}</small>}
                </div>
                <div className="form-field form-field-icon">
                  <label htmlFor={`${invitation.slug}-phone`}><span><Phone size={15} /> Phone Number</span><b>*</b></label>
                  <input id={`${invitation.slug}-phone`} name="phoneNumber" type="tel" inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" value={form.phoneNumber} onChange={update} aria-invalid={!!errors.phoneNumber} aria-describedby={errors.phoneNumber ? `${invitation.slug}-phone-error` : undefined} />
                  {errors.phoneNumber && <small id={`${invitation.slug}-phone-error`} className="field-error">{errors.phoneNumber}</small>}
                </div>
              </div>
              <fieldset className="form-field attendance-field">
                <legend><span><UsersRound size={15} /> Will you be attending?</span><b>*</b></legend>
                <div className="choice-row">
                  <label><input type="radio" name="attending" value="yes" checked={form.attending === "yes"} onChange={update} /><span><Check size={16} />Joyfully Accept</span></label>
                  <label><input type="radio" name="attending" value="no" checked={form.attending === "no"} onChange={update} /><span>Regretfully Decline</span></label>
                </div>
                {errors.attending && <small className="field-error">{errors.attending}</small>}
              </fieldset>
              <div className="form-field guest-field">
                <label htmlFor={`${invitation.slug}-guests`}><span><UsersRound size={15} /> Number of Guests</span><b>*</b></label>
                <div className={`guest-stepper ${form.attending === "no" ? "is-disabled" : ""}`}>
                  <button type="button" onClick={() => adjustGuests(-1)} disabled={form.attending === "no" || Number(form.numberOfGuests) <= 1} aria-label="Decrease number of guests"><Minus size={18} /></button>
                  <input id={`${invitation.slug}-guests`} name="numberOfGuests" type="number" inputMode="numeric" min="1" max="20" readOnly disabled={form.attending === "no"} value={form.numberOfGuests} aria-invalid={!!errors.numberOfGuests} />
                  <button type="button" onClick={() => adjustGuests(1)} disabled={form.attending === "no" || Number(form.numberOfGuests) >= 20} aria-label="Increase number of guests"><Plus size={18} /></button>
                </div>
                {form.attending === "no" && <small>Guest count is set to 0 when not attending.</small>}
                {errors.numberOfGuests && <small className="field-error">{errors.numberOfGuests}</small>}
              </div>
              <div className="form-field message-field">
                <label htmlFor={`${invitation.slug}-message`}><span><MessageSquareText size={15} /> A Note for the Couple</span><em>optional</em></label>
                <textarea id={`${invitation.slug}-message`} name="message" rows="4" placeholder="Share your wishes…" value={form.message} onChange={update} />
              </div>
              {status === "error" && <p className="form-status" role="alert">{serverMessage}</p>}
              <button className="primary-button submit-button" type="submit" disabled={status === "sending"}>
                <Send size={17} aria-hidden="true" />
                {status === "sending" ? "Sending…" : "Send RSVP"}
              </button>
              <p className="rsvp-privacy"><LockKeyhole size={12} /> Your response is shared privately with the couple.</p>
            </motion.form>
          )}
        </AnimatePresence>
      </SectionReveal>
    </section>
  );
}
