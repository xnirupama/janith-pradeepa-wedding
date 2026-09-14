"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const PETALS = [
  [4, -8, 11.5, 0, ".24rem", ".62rem"],
  [14, -2, 13.2, -5.4, ".3rem", ".72rem"],
  [25, 13, 10.8, -2.6, ".36rem", ".84rem"],
  [36, 31, 15.1, -9.7, ".26rem", ".68rem"],
  [47, 48, 12.4, -7.2, ".32rem", ".78rem"],
  [59, 67, 14.3, -11.8, ".24rem", ".65rem"],
  [69, 84, 11.9, -4.1, ".35rem", ".82rem"],
  [79, 106, 15.6, -13.2, ".28rem", ".7rem"],
  [89, 132, 12.8, -8.5, ".33rem", ".76rem"],
  [96, 159, 14.8, -1.7, ".25rem", ".64rem"],
];

function ArtworkImage({ src, alt = "", sizes, onError }) {
  return <Image src={src} alt={alt} fill sizes={sizes} onError={onError} loading="eager" />;
}

export default function WeddingGateArtwork({ artwork }) {
  const reduceMotion = useReducedMotion();
  const [missing, setMissing] = useState({ mandala: false, lotus: false, procession: false });
  const markMissing = (key) => setMissing((current) => ({ ...current, [key]: true }));

  return (
    <div className="wedding-gate-artwork" aria-hidden="true">
      <motion.div
        className="wedding-gate-mandala"
        animate={reduceMotion ? undefined : { rotate: [-1, 1, -1], scale: [1, 1.018, 1] }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.035 }}
        transition={reduceMotion ? undefined : { duration: 28, ease: "easeInOut", repeat: Infinity }}
      >
        {!missing.mandala && artwork?.mandala ? (
          <ArtworkImage src={artwork.mandala} sizes="(max-width: 520px) 110vw, 620px" onError={() => markMissing("mandala")} />
        ) : (
          <div className="wedding-gate-mandala-fallback"><span /><i /></div>
        )}
      </motion.div>

      <motion.div
        className="wedding-gate-lotus"
        animate={reduceMotion ? undefined : { y: [0, -4, 0], rotate: [-1, .8, -1] }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
        transition={reduceMotion ? undefined : { duration: 8, ease: "easeInOut", repeat: Infinity }}
      >
        {!missing.lotus && artwork?.lotus ? (
          <ArtworkImage src={artwork.lotus} sizes="(max-width: 520px) 48vw, 280px" onError={() => markMissing("lotus")} />
        ) : (
          <div className="wedding-gate-lotus-fallback"><span /><i /><b /></div>
        )}
      </motion.div>

      <div className="wedding-gate-petals">
        {PETALS.map(([left, angle, duration, delay, width, height], index) => (
          <i
            key={index}
            style={{
              "--petal-left": `${left}%`,
              "--petal-angle": `${angle}deg`,
              "--petal-duration": `${duration}s`,
              "--petal-delay": `${delay}s`,
              "--petal-width": width,
              "--petal-height": height,
            }}
          />
        ))}
      </div>

      <motion.div
        className="wedding-gate-procession"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: [0, -2, 0] }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
        transition={reduceMotion ? { duration: .2 } : { opacity: { duration: 1.45 }, y: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
      >
        {!missing.procession && artwork?.procession ? (
          <ArtworkImage src={artwork.procession} sizes="(max-width: 700px) 118vw, 760px" onError={() => markMissing("procession")} />
        ) : (
          <div className="wedding-gate-procession-fallback">
            <span /><i /><b /><i /><span />
          </div>
        )}
      </motion.div>
    </div>
  );
}
