"use client";
import { useEffect } from "react";
import { useInvitationMotion } from "./InvitationMotion";

export default function MicroInteractions({ active }) {
  const { decorativeMotion, pageVisible, suspended } = useInvitationMotion();
  useEffect(() => {
    const targets = [...document.querySelectorAll(active ? ".primary-button, .hero-date-row strong" : ".primary-button")];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const node = entry.target;
        node.dataset.shimmer = String(entry.isIntersecting && pageVisible && decorativeMotion && !suspended);
        if (entry.isIntersecting && node.matches(".hero-date-row strong") && !node.dataset.glinted && decorativeMotion && !suspended) {
          node.dataset.glinted = "true";
        }
      }
    }, { threshold: .3 });
    targets.forEach(node => observer.observe(node));
    return () => { observer.disconnect(); targets.forEach(node => { node.dataset.shimmer = "false"; }); };
  }, [active, decorativeMotion, pageVisible, suspended]);
  return null;
}
