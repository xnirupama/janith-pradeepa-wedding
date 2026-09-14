"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Heart } from "lucide-react";
import ShareInvitation from "./ShareInvitation";
import VideoBackdrop from "./VideoBackdrop";

const closingVariants = {
  hidden: {},
  visible: { transition: { delayChildren: .08, staggerChildren: .13 } },
};

const closingItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: .68, ease: [0.22, 1, 0.36, 1] } },
};

export default function ClosingSection({ invitation, active }) {
  const reduceMotion = useReducedMotion();
  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    window.history.replaceState(null, "", "#top");
  };

  return (
    <section className="closing-section">
      <VideoBackdrop src={invitation.videos.closing} poster={invitation.videoPosters?.closing} fallbackPoster={invitation.backgrounds.section} active={active} tone={invitation.theme} overlay="none" className="closing-video" />
      <div className="closing-scrim" />
      <div className="closing-petals" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <i key={index} style={{ "--petal-index": index }} />)}</div>
      <motion.div
        className="closing-content"
        variants={closingVariants}
        initial={reduceMotion ? false : "hidden"}
        whileInView={reduceMotion ? undefined : "visible"}
        viewport={{ once: true, amount: .22 }}
      >
        <motion.p className="blessing" variants={closingItem}>{invitation.blessing}</motion.p>
        <motion.p className="sinhala-blessing" lang="si" variants={closingItem}>{invitation.sinhalaBlessing}</motion.p>
        <motion.div variants={closingItem}><Heart className="closing-heart" size={17} fill="currentColor" aria-hidden="true" /></motion.div>
        <motion.h2 variants={closingItem}>{invitation.couple}</motion.h2>
        <motion.span className="closing-divider" aria-hidden="true" variants={closingItem}><i /><Heart size={11} fill="currentColor" /><i /></motion.span>
        {invitation.closingLead && <motion.p className="closing-lead" variants={closingItem}>{invitation.closingLead}</motion.p>}
        <motion.div className="closing-copy" variants={closingItem}>
          {invitation.closing.map((line) => <p key={line}>{line}</p>)}
        </motion.div>
        <motion.div className="closing-actions" variants={closingItem}>
          <ShareInvitation invitation={invitation} />
          <button type="button" className="back-to-top" onClick={backToTop}>
            <ArrowUp size={16} aria-hidden="true" />
            Back to top
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
