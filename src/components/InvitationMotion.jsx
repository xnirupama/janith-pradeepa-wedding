"use client";

import { createContext, useContext, useEffect, useRef, useSyncExternalStore } from "react";
import { getMotionSnapshot, getServerMotionSnapshot, subscribeMotion } from "@/lib/motion-environment";

const MotionContext = createContext({ pageVisible: true, reducedMotion: true, backgroundVideo: false, suspended: false });
export function InvitationMotionProvider({ children, suspended = false }) {
  const environment = useSyncExternalStore(subscribeMotion, getMotionSnapshot, getServerMotionSnapshot);
  return <MotionContext.Provider value={{ ...environment, suspended }}>{children}</MotionContext.Provider>;
}
export const useInvitationMotion = () => useContext(MotionContext);

// Position this frame without rotating it. Only the inner decoration turns.
export function RotatingDecoration({ children, className = "", duration = 120, reverse = false, large = false }) {
  const ref = useRef(null);
  const { pageVisible, reducedMotion, suspended } = useInvitationMotion();
  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;
    let inView = false;
    const update = () => { layer.dataset.motionRunning = String(inView && pageVisible && !reducedMotion && !suspended); };
    update();
    if (!("IntersectionObserver" in window)) { inView = true; update(); return; }
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
    observer.observe(layer.parentElement);
    return () => observer.disconnect();
  }, [pageVisible, reducedMotion, suspended]);
  return <span className={"rotation-frame " + className} aria-hidden="true"><span ref={ref} className={"rotation-layer" + (large ? " rotation-layer--large" : "")} data-motion-running="false" style={{ "--rotation-duration": duration + "s", "--rotation-direction": reverse ? "reverse" : "normal" }}>{children}</span></span>;
}
