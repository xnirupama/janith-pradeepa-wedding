"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";

export default function InvitationGate({ invitation, open, onOpen }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {!open && (
        <motion.div
          className="invitation-gate"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
          <motion.div
            className="gate-card"
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04, y: -12 }}
            transition={{ duration: 0.55 }}
          >
            <div className="gate-frame" aria-hidden="true" />
            <div className="heritage-mandala gate-mandala" aria-hidden="true"><span /><i /></div>
            <span className="gate-corner gate-corner-tl" aria-hidden="true" />
            <span className="gate-corner gate-corner-tr" aria-hidden="true" />
            <span className="gate-corner gate-corner-bl" aria-hidden="true" />
            <span className="gate-corner gate-corner-br" aria-hidden="true" />
            <p className="blessing">{invitation.blessing}</p>
            <p className="sinhala-blessing" lang="si">{invitation.sinhalaBlessing}</p>
            <span className="ornament"><i /><Heart size={14} fill="currentColor" /><i /></span>
            <h1 className="couple-signature">{invitation.couple}</h1>
            <p className="gate-title">{invitation.gateTitle}</p>
            <div className="gate-date-plaque" aria-label={invitation.date}>
              <span>{invitation.dateParts.weekday}</span>
              <strong>{invitation.dateParts.day}</strong>
              <span>{invitation.dateParts.month} · {invitation.dateParts.year}</span>
            </div>
            <motion.button
              type="button"
              className="primary-button gate-button"
              onClick={onOpen}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
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
