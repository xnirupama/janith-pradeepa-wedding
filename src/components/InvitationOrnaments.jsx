import { Phone } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "./InvitationLanguage";
import { RotatingDecoration } from "./InvitationMotion";

export function Lotus({ className = "", decorative = false }) {
  const [bloom, setBloom] = useState(false);
  const { t } = useLanguage();
  const art = <svg className={`lotus-ornament ${className}`} viewBox="0 0 240 70" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
      <path d="M120 50C103 39 108 22 120 7c12 15 17 32 0 43Z" />
      <path d="M120 50C96 49 91 32 91 20c16 4 28 15 29 30Zm0 0c24-1 29-18 29-30-16 4-28 15-29 30Z" />
      <path d="M120 50c-22 10-37-1-45-14 20-2 34 2 45 14Zm0 0c22 10 37-1 45-14-20-2-34 2-45 14Z" />
      <path d="M91 54c-18 1-32-14-47-9-17 6-25 4-31-1m136 10c18 1 32-14 47-9 17 6 25 4 31-1M78 55c-22 13-28 1-43 5m127-5c22 13 28 1 43 5M96 62c10-5 38-5 48 0M120 55v10" />
      <path d="M48 47c-5-9-12-9-16-6 2 8 8 11 16 6Zm144 0c5-9 12-9 16-6-2 8-8 11-16 6Z" />
    </g>
    <circle cx="8" cy="43" r="1.5" fill="currentColor" /><circle cx="232" cy="43" r="1.5" fill="currentColor" />
  </svg>;
  if (decorative) return art;
  return <button type="button" className={"lotus-touch " + (bloom ? "is-blooming" : "")} aria-label={t("bloomLotus")} onClick={() => { if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setBloom(true); }} onAnimationEnd={() => setBloom(false)}>{art}{[0, 1, 2, 3].map(i => <i key={i} className="bloom-petal" aria-hidden="true" style={{ "--bloom-x": `${(i - 1.5) * 25}px`, "--bloom-rotation": `${i * 60}deg` }} />)}</button>;
}
export function Mandala({ className = "" }) {
  return <svg className={`mandala-ornament ${className}`} viewBox="0 0 400 400" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth=".8">
      <circle cx="200" cy="200" r="50" /><circle cx="200" cy="200" r="93" /><circle cx="200" cy="200" r="146" /><circle cx="200" cy="200" r="181" />
      {Array.from({ length: 24 }, (_, i) => <g key={i} transform={`rotate(${i * 15} 200 200)`}>
        <path d="M200 153c-18-22-19-47 0-67 19 20 18 45 0 67Zm0-66c-23-19-25-56 0-83 25 27 23 64 0 83Z" />
        <path d="m200 53-12-18 12-18 12 18-12 18Zm0 94v-41M193 64l7-6 7 6" />
        <circle cx="200" cy="171" r="3" /><circle cx="200" cy="43" r="2" />
      </g>)}
    </g>
  </svg>;
}
export function DottedRing() {
  return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1" strokeDasharray="1 5" strokeLinecap="round" /><path d="M50 2v5M50 93v5M2 50h5M93 50h5" stroke="currentColor" strokeWidth="1" /></svg>;
}
export function SunburstRing() {
  return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth=".6" />{Array.from({ length: 36 }, (_, index) => <path key={index} d={index % 3 === 0 ? "M50 2v9" : "M50 5v5"} transform={`rotate(${index * 10} 50 50)`} stroke="currentColor" strokeWidth=".85" />)}</svg>;
}
export function MandalaLayers({ className = "" }) {
  return <div className={"mandala-layers " + className} aria-hidden="true"><RotatingDecoration className="mandala-primary" duration={112} large><Mandala /></RotatingDecoration><RotatingDecoration className="mandala-secondary" duration={136} reverse large><Mandala /></RotatingDecoration></div>;
}
export function RingedLotus({ className = "" }) {
  return <div className={"lotus-seal " + className}><RotatingDecoration className="lotus-ring" duration={58} reverse><DottedRing /></RotatingDecoration><Lotus /></div>;
}
export function SectionHeading({ kicker, title, id, ringed = false }) {
  return <header className="section-heading"><p className="section-kicker">{kicker}</p><h2 id={id}>{title}</h2>{ringed ? <RingedLotus /> : <Lotus />}</header>;
}
export function ContactPill({ contact }) {
  const { t } = useLanguage();
  if (!contact) return null;
  return <a className="contact-pill" href={`tel:${contact.phone}`} aria-label={t("callLabel", { phone: contact.display })}><Phone size={16} aria-hidden="true" /><span>{contact.display}</span></a>;
}
