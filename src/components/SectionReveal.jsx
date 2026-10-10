"use client";

import { useEffect, useRef } from "react";

export default function SectionReveal({ children, className = "", delay = 0, as: Component = "div", ...props }) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.classList.add("reveal-pending");
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { element.classList.remove("reveal-pending"); observer.disconnect(); }
    }, { threshold: .08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <Component ref={ref} className={"section-reveal " + className} style={{ "--reveal-delay": Math.min(delay, .3) + "s" }} {...props}>{children}</Component>;
}
