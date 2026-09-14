"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Heart, Home, Mail, MapPin } from "lucide-react";

const SECTION_IDS = ["top", "our-story", "event-details", "location", "rsvp"];

export default function SectionNavigator({ invitation }) {
  const [activeSection, setActiveSection] = useState("top");
  const eventLabel = invitation.arrival ? "Arrival" : "Schedule";
  const links = [
    { id: "top", label: "Home", icon: Home },
    { id: "our-story", label: "Our story", icon: Heart },
    { id: "event-details", label: eventLabel, icon: CalendarDays },
    { id: "location", label: "Location", icon: MapPin },
    { id: "rsvp", label: "RSVP", icon: Mail },
  ];

  useEffect(() => {
    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -62%", threshold: [0, 0.1, 0.35] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="section-navigator" aria-label="Invitation sections">
      <div className="section-navigator-inner">
        {links.map(({ id, label, icon: Icon }) => (
          <a
            key={id}
            className={activeSection === id ? "is-active" : ""}
            href={`#${id}`}
            aria-label={label}
            aria-current={activeSection === id ? "location" : undefined}
            data-label={label}
          >
            <Icon size={21} strokeWidth={1.8} aria-hidden="true" />
          </a>
        ))}
      </div>
    </nav>
  );
}
