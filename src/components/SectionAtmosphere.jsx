"use client";

import { useEffect, useRef } from "react";
import { useInvitationMotion } from "./InvitationMotion";
import { Lotus } from "./InvitationOrnaments";

function Corner({ reverse = false }) {
  return <svg className={"background-corner" + (reverse ? " background-corner--reverse" : "")} viewBox="0 0 120 120" fill="none" focusable="false"><g stroke="currentColor" strokeWidth=".8" strokeLinecap="round"><path d="M8 108V24C8 14 14 8 24 8h84M16 97V30c0-8 6-14 14-14h67M8 58c18 0 35-18 35-35M16 64c28-1 48-23 48-48" /><path d="M29 49c-1-17 7-25 15-30 5 15 0 26-15 30ZM41 58c18-1 27-8 32-18-16-3-26 3-32 18Z" /><circle cx="84" cy="8" r="2" /></g></svg>;
}
function Vine() {
  return <svg className="background-vine" viewBox="0 0 80 400" fill="none" focusable="false"><g stroke="currentColor" strokeWidth=".8" strokeLinecap="round"><path d="M38 398C13 339 65 312 38 257S64 161 38 112 48 44 38 2" /><path d="M37 352c-23-5-27-20-27-32 20 5 29 15 27 32ZM40 294c22-6 27-20 27-33-20 5-29 17-27 33ZM37 227c-23-6-27-20-27-33 20 5 29 17 27 33ZM40 168c22-6 27-20 27-33-20 5-29 17-27 33ZM37 94C16 86 13 73 13 60c19 7 27 18 24 34ZM40 39c18-6 22-17 22-28-17 5-25 15-22 28Z" /></g></svg>;
}

export default function SectionAtmosphere({ tone = "calm" }) {
  const ref = useRef(null);
  const { decorativeMotion, pageVisible, suspended } = useInvitationMotion();
  useEffect(() => {
    const node = ref.current, section = node?.parentElement;
    if (!section) return;
    let visible = false;
    const update = () => { node.dataset.backgroundRunning = String(visible && decorativeMotion && pageVisible && !suspended); };
    update();
    if (!("IntersectionObserver" in window)) { visible = true; update(); return; }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: .01 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [decorativeMotion, pageVisible, suspended]);
  return <div ref={ref} className="section-atmosphere" data-background-tone={tone} data-background-running="false" aria-hidden="true">
    <span className="section-tone" />
    <span className="section-halo" />
    <div className="section-watermarks"><Corner /><Corner reverse />{["message", "portrait", "timeline"].includes(tone) && <Lotus decorative className="background-lotus" />}{tone === "timeline" && <><Vine /><span className="background-vine-mirror"><Vine /></span></>}</div>
    {tone === "hero" && <span className="hero-light-sweep" />}
  </div>;
}
