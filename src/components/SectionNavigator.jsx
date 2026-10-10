"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, Home, Images, MapPin, Phone } from "lucide-react";
import { useLanguage } from "./InvitationLanguage";

const SECTION_IDS = ["top", "event-details", "gallery", "location", "contact"];

export default function SectionNavigator() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState("top");
  const navigatingRef = useRef(false);
  const navigationTimerRef = useRef(null);
  const links = [
    { id: "top", label: t("navHome"), icon: Home },
    { id: "event-details", label: t("navEvents"), icon: CalendarDays },
    { id: "gallery", label: t("navGallery"), icon: Images },
    { id: "location", label: t("navLocation"), icon: MapPin },
    { id: "contact", label: t("navContact"), icon: Phone },
  ];

  const finishNavigation = useCallback(() => {
    navigatingRef.current = false;
    window.clearTimeout(navigationTimerRef.current);
    const focusLine = window.innerHeight * 0.28;
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    const containing = sections.find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= focusLine && rect.bottom > focusLine;
    });
    const closest = containing || sections.sort((a, b) => Math.abs(a.getBoundingClientRect().top - focusLine) - Math.abs(b.getBoundingClientRect().top - focusLine))[0];
    if (closest) setActiveSection(closest.id);
  }, []);

  const handleNavigate = (event, id) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) { try { navigator.vibrate?.(8); } catch { /* Unsupported browser policy. */ } }
    navigatingRef.current = true;
    setActiveSection(id);
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", "#" + id);
    window.removeEventListener("scrollend", finishNavigation);
    window.clearTimeout(navigationTimerRef.current);
    if (!reduceMotion && "onscrollend" in window) window.addEventListener("scrollend", finishNavigation, { once: true });
    navigationTimerRef.current = window.setTimeout(finishNavigation, reduceMotion ? 80 : 1400);
  };

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!("IntersectionObserver" in window)) return;
    const visible = new Map();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.set(entry.target.id, entry.target);
        else visible.delete(entry.target.id);
      }
      if (navigatingRef.current) return;
      const focusLine = window.innerHeight * 0.28;
      const closest = [...visible.values()].sort((a, b) => Math.abs(a.getBoundingClientRect().top - focusLine) - Math.abs(b.getBoundingClientRect().top - focusLine))[0];
      if (closest) setActiveSection(closest.id);
    }, { rootMargin: "-16% 0px -60% 0px", threshold: [0, 0.01, 0.2] });
    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      window.removeEventListener("scrollend", finishNavigation);
      window.clearTimeout(navigationTimerRef.current);
    };
  }, [finishNavigation]);

  return (
    <nav className="section-navigator" aria-label={t("navLabel")}>
      <div className="section-navigator-inner" style={{ "--active-index": SECTION_IDS.indexOf(activeSection) }}>
        <span className="nav-active-indicator" aria-hidden="true" />
        {links.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            className={activeSection === id ? "is-active" : ""}
            href={"#" + id}
            aria-label={label}
            aria-current={activeSection === id ? "location" : undefined}
            onClick={(event) => handleNavigate(event, id)}
          >
            <span className="section-nav-icon"><Icon size={21} strokeWidth={1.65} aria-hidden="true" /></span>
            <span className="section-nav-label" aria-hidden="true">{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
