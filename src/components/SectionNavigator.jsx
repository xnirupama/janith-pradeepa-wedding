"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { CalendarDays, Heart, Home, Mail, MapPin } from "lucide-react";

const SECTION_IDS = ["top", "our-story", "event-details", "location", "rsvp"];

export default function SectionNavigator({ invitation }) {
  const [activeSection, setActiveSection] = useState("top");
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 135, damping: 26, mass: .24 });
  const navigatingRef = useRef(false);
  const navigationTimerRef = useRef(null);
  const eventLabel = invitation.arrival ? "Arrival" : "Schedule";
  const links = [
    { id: "top", label: "Home", icon: Home },
    { id: "our-story", label: "Our Story", icon: Heart },
    { id: "event-details", label: eventLabel, icon: CalendarDays },
    { id: "location", label: "Location", icon: MapPin },
    { id: "rsvp", label: "RSVP", icon: Mail },
  ];

  const finishNavigation = useCallback(() => {
    navigatingRef.current = false;
    if (navigationTimerRef.current) window.clearTimeout(navigationTimerRef.current);

    const focusLine = window.innerHeight * 0.28;
    const closest = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .sort((a, b) => Math.abs(a.getBoundingClientRect().top - focusLine) - Math.abs(b.getBoundingClientRect().top - focusLine))[0];
    if (closest) setActiveSection(closest.id);
  }, []);

  const handleNavigate = useCallback((event, id) => {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    navigatingRef.current = true;
    setActiveSection(id);
    const targetTop = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 16);
    window.scrollTo({ top: targetTop, behavior: reduceMotion ? "auto" : "smooth" });
    window.history.replaceState(null, "", `#${id}`);

    window.removeEventListener("scrollend", finishNavigation);
    if (navigationTimerRef.current) window.clearTimeout(navigationTimerRef.current);
    if (!reduceMotion && "onscrollend" in window) {
      window.addEventListener("scrollend", finishNavigation, { once: true });
    }
    navigationTimerRef.current = window.setTimeout(finishNavigation, reduceMotion ? 80 : 1400);
  }, [finishNavigation, reduceMotion]);

  useEffect(() => {
    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        if (navigatingRef.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -62%", threshold: [0, 0.1, 0.35] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      observer.disconnect();
      window.removeEventListener("scrollend", finishNavigation);
      if (navigationTimerRef.current) window.clearTimeout(navigationTimerRef.current);
    };
  }, [finishNavigation]);

  return (
    <nav className="section-navigator" aria-label="Invitation sections">
      <span className="section-progress-track" aria-hidden="true">
        <motion.span className="section-progress-fill" style={{ scaleX: reduceMotion ? scrollYProgress : smoothProgress }} />
      </span>
      <div className="section-navigator-inner">
        {links.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            className={activeSection === id ? "is-active" : ""}
            href={`#${id}`}
            aria-label={label}
            aria-current={activeSection === id ? "location" : undefined}
            data-label={label}
            onClick={(event) => handleNavigate(event, id)}
          >
            <span className="section-nav-icon"><Icon size={21} strokeWidth={1.8} aria-hidden="true" /></span>
            <span className="section-nav-label" aria-hidden="true">{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
