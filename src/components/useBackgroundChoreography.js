"use client";

import { useEffect } from "react";

// One scroll listener and one scheduled frame for the entire invitation.
// Geometry is cached at setup/resize; the animation frame only writes transforms.
export default function useBackgroundChoreography(ref, active, running) {
  useEffect(() => {
    const root = ref.current, main = root?.closest(".event-page");
    if (!main || !active) return;
    const atmospheres = [...main.querySelectorAll(".section-atmosphere")];
    const tracks = [...main.querySelectorAll("[data-parallax-rate]")];
    const primary = root.querySelector(".page-mandala-primary"), secondary = root.querySelector(".page-mandala-secondary");
    let records = [], height = window.innerHeight, frame = 0, disposed = false;
    const visible = new Set();
    const measure = () => {
      height = window.innerHeight;
      records = tracks.map(node => ({ node, section: node.closest(".section-atmosphere").parentElement, top: node.parentElement.getBoundingClientRect().top + window.scrollY, rate: Number(node.dataset.parallaxRate) }));
    };
    const paint = () => {
      frame = 0;
      const scroll = window.scrollY;
      // Direct transforms avoid invalidating inherited CSS variables across
      // every SVG path and particle on each scroll frame.
      primary.style.transform = `rotate(${scroll / height * 4}deg)`;
      secondary.style.transform = `rotate(${-scroll / height * 3}deg)`;
      for (const { node, section, top, rate } of records) {
        if (visible.has(section)) node.style.transform = `translate3d(0,${Math.max(-32, Math.min(32, (scroll - top) * (1 - rate)))}px,0)`;
      }
    };
    const schedule = () => { if (running && !frame) frame = requestAnimationFrame(paint); };
    const resize = () => { measure(); schedule(); };
    measure();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const section = entry.target;
        if (entry.isIntersecting) visible.add(section); else visible.delete(section);
        section.querySelector(".section-atmosphere").dataset.backgroundRunning = String(entry.isIntersecting && running);
        if (section.classList.contains("hero-section")) root.dataset.heroVisible = String(entry.isIntersecting && running);
      }
      schedule();
    }, { threshold: .01 });
    atmospheres.forEach(node => observer.observe(node.parentElement));
    const entryObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.atmosphereEntered = "true";
        entryObserver.unobserve(entry.target);
      });
    }, { threshold: .2 });
    main.querySelectorAll(".hero-names, .section-heading h2, .closing-content h2, .lotus-touch, .closing-divider").forEach(node => entryObserver.observe(node));
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(main);
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    document.fonts.ready.then(() => { if (!disposed && main.isConnected) resize(); });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame); observer.disconnect(); entryObserver.disconnect(); resizeObserver.disconnect();
      window.removeEventListener("resize", resize); window.removeEventListener("scroll", schedule);
      atmospheres.forEach(node => { node.dataset.backgroundRunning = "false"; });
      root.dataset.heroVisible = "false";
    };
  }, [ref, active, running]);
}
