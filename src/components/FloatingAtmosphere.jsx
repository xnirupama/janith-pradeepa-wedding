"use client";

import { useInvitationMotion } from "./InvitationMotion";

// Petal shapes: 0 = round orb, 1 = petal, 2 = star sparkle
const PARTICLES = [
  { shape: 1, size: 7,  left: 8,  dur: 18, delay: 0,    drift: -18, opacity: 0.38 },
  { shape: 0, size: 4,  left: 16, dur: 22, delay: -4,   drift:  12, opacity: 0.28 },
  { shape: 2, size: 6,  left: 27, dur: 16, delay: -9,   drift: -22, opacity: 0.42 },
  { shape: 0, size: 3,  left: 38, dur: 25, delay: -2,   drift:  16, opacity: 0.22 },
  { shape: 1, size: 9,  left: 49, dur: 20, delay: -14,  drift: -10, opacity: 0.32 },
  { shape: 2, size: 5,  left: 58, dur: 17, delay: -7,   drift:  20, opacity: 0.36 },
  { shape: 0, size: 4,  left: 67, dur: 23, delay: -11,  drift: -15, opacity: 0.24 },
  { shape: 1, size: 8,  left: 75, dur: 19, delay: -5,   drift:  18, opacity: 0.34 },
  { shape: 2, size: 5,  left: 84, dur: 21, delay: -16,  drift: -12, opacity: 0.30 },
  { shape: 0, size: 3,  left: 92, dur: 24, delay: -3,   drift:  22, opacity: 0.20 },
  { shape: 1, size: 6,  left: 22, dur: 27, delay: -19,  drift: -8,  opacity: 0.26 },
  { shape: 2, size: 4,  left: 44, dur: 15, delay: -8,   drift:  14, opacity: 0.40 },
  { shape: 0, size: 5,  left: 63, dur: 26, delay: -13,  drift: -20, opacity: 0.22 },
  { shape: 1, size: 7,  left: 81, dur: 18, delay: -6,   drift:  10, opacity: 0.36 },
  { shape: 2, size: 3,  left: 4,  dur: 22, delay: -17,  drift: -24, opacity: 0.30 },
];

export default function FloatingAtmosphere() {
  const { pageVisible, reducedMotion, suspended } = useInvitationMotion();
  return (
    <div className="atmosphere" aria-hidden="true" data-motion-running={pageVisible && !reducedMotion && !suspended}>
      {PARTICLES.slice(0, 6).map((p, i) => (
        <i
          key={i}
          className={`atm-particle atm-shape-${p.shape}`}
          style={{
            "--atm-size": `${p.size}px`,
            "--atm-left": `${p.left}%`,
            "--atm-dur": `${p.dur}s`,
            "--atm-delay": `${p.delay}s`,
            "--atm-drift": `${p.drift}px`,
            "--atm-opacity": p.opacity,
          }}
        />
      ))}
    </div>
  );
}
