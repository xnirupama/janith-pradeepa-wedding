"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import WeddingGateArtwork from "./WeddingGateArtwork";

const weddingCopyVariants = {
  hidden: {},
  visible: { transition: { delayChildren: .38, staggerChildren: .18 } },
};

const weddingItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: .62, ease: [0.22, 1, 0.36, 1] } },
};

export default function InvitationGate({ invitation, open, onOpen }) {
  const reduceMotion = useReducedMotion();
  const isWedding = invitation.theme === "wedding";
  const [firstName, secondName] = invitation.couple.split(" & ");

  return (
    <AnimatePresence>
      {!open && (
        <motion.div
          className={`invitation-gate invitation-gate--${invitation.theme}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, pointerEvents: "none" }}
          transition={{ duration: reduceMotion ? 0.2 : 1.05, delay: reduceMotion ? 0 : 0.5 }}
        >
          <motion.div
            className="gate-panel gate-panel-left"
            exit={reduceMotion ? { opacity: 0 } : { x: "-102%" }}
            transition={{ duration: 1.25, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="gate-panel gate-panel-right"
            exit={reduceMotion ? { opacity: 0 } : { x: "102%" }}
            transition={{ duration: 1.25, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="gate-light"
            exit={reduceMotion ? { opacity: 0 } : { opacity: [0.35, 1, 0], scaleX: [0.2, 2.5, 4] }}
            transition={{ duration: 1.1 }}
          />
          {isWedding && <WeddingGateArtwork artwork={invitation.gateArtwork} />}
          <motion.div
            className={`gate-card ${isWedding ? "wedding-gate-card" : ""}`}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: isWedding ? .985 : 1.04, y: isWedding ? -4 : -12 }}
            transition={{ duration: isWedding ? 0.72 : 0.55 }}
          >
            <div className="gate-frame" aria-hidden="true" />
            {!isWedding && <div className="heritage-mandala gate-mandala" aria-hidden="true"><span /><i /></div>}
            <span className="gate-corner gate-corner-tl" aria-hidden="true" />
            <span className="gate-corner gate-corner-tr" aria-hidden="true" />
            <span className="gate-corner gate-corner-bl" aria-hidden="true" />
            <span className="gate-corner gate-corner-br" aria-hidden="true" />
            {isWedding ? (
              <motion.div
                className="wedding-gate-copy"
                variants={weddingCopyVariants}
                initial={reduceMotion ? false : "hidden"}
                animate="visible"
              >
                <motion.p className="blessing" variants={weddingItemVariants}>{invitation.blessing}</motion.p>
                <motion.p className="sinhala-blessing" lang="si" variants={weddingItemVariants}>{invitation.sinhalaBlessing}</motion.p>
                <motion.p className="wedding-gate-eyebrow" variants={weddingItemVariants}>{invitation.eyebrow}</motion.p>
                <motion.h1 className="couple-signature" variants={weddingItemVariants}>
                  <span>{firstName}</span><i>&amp;</i><span>{secondName}</span>
                </motion.h1>
                <motion.span className="wedding-gate-divider" variants={weddingItemVariants}><i /><Heart size={11} fill="currentColor" /><i /></motion.span>
                <motion.div className="wedding-gate-date" aria-label={invitation.date} variants={weddingItemVariants}>
                  <span>{invitation.dateParts.weekday}</span>
                  <strong>{invitation.dateParts.day}</strong>
                  <span>{invitation.dateParts.month} {invitation.dateParts.year}</span>
                </motion.div>
              </motion.div>
            ) : (
              <div className="gate-copy">
                <p className="blessing">{invitation.blessing}</p>
                <p className="sinhala-blessing" lang="si">{invitation.sinhalaBlessing}</p>
                <>
                  <span className="ornament"><i /><Heart size={14} fill="currentColor" /><i /></span>
                  <h1 className="couple-signature">{invitation.couple}</h1>
                  <p className="gate-title">{invitation.gateTitle}</p>
                  <div className="gate-date-plaque" aria-label={invitation.date}>
                    <span>{invitation.dateParts.weekday}</span>
                    <strong>{invitation.dateParts.day}</strong>
                    <span>{invitation.dateParts.month} · {invitation.dateParts.year}</span>
                  </div>
                </>
              </div>
            )}
            <motion.button
              type="button"
              className={`primary-button gate-button ${isWedding ? "wedding-gate-button" : ""}`}
              onClick={onOpen}
              initial={isWedding && !reduceMotion ? { opacity: 0, y: 10 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={isWedding && !reduceMotion ? { duration: .62, delay: 2.05, ease: [0.22, 1, 0.36, 1] } : undefined}
              whileHover={{ y: -2, transition: { duration: .2, delay: 0 } }}
              whileTap={{ scale: .98, transition: { duration: .12, delay: 0 } }}
            >
              <span>Open Invitation</span>
              <Heart size={16} aria-hidden="true" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
