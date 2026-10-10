"use client";
import { useEffect } from "react";
import { useInvitationMotion } from "./InvitationMotion";

export default function MicroInteractions({ active }) {
  const { reducedMotion, pageVisible } = useInvitationMotion();
  useEffect(() => {
    const targets = [...document.querySelectorAll(".primary-button, .hero-date-row strong")];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const node = entry.target;
        node.dataset.shimmer = String(entry.isIntersecting && pageVisible && !reducedMotion);
        if (entry.isIntersecting && node.matches(".hero-date-row strong") && !node.dataset.glinted && !reducedMotion) {
          node.dataset.glinted = "true";
        }
      }
    }, { threshold: .3 });
    targets.forEach(node => observer.observe(node));
    return () => { observer.disconnect(); targets.forEach(node => { node.dataset.shimmer = "false"; }); };
  }, [active, reducedMotion, pageVisible]);
  return null;
}
