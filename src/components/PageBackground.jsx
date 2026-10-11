"use client";

import { useEffect, useMemo, useRef } from "react";
import textures from "@/data/background-textures.json";
import videos from "@/data/background-videos.json";
import { backgroundFeatures } from "@/data/themes";
import { useInvitationMotion } from "./InvitationMotion";
import BackgroundVideo, { clipSources } from "./BackgroundVideo";
import { Mandala } from "./InvitationOrnaments";
import useBackgroundChoreography from "./useBackgroundChoreography";

const DUST = Array.from({ length: 15 }, (_, index) => ({
  left: index % 2 ? 89 + (index * 7 % 10) : 1 + (index * 5 % 11),
  size: 1 + index % 3,
  duration: 18 + index * 7 % 23,
  delay: -(index * 11 % 37),
  drift: (index % 2 ? -1 : 1) * (4 + index % 9),
  opacity: .3 + index % 4 * .05,
}));

export default function PageBackground({ theme, active }) {
  const ref = useRef(null);
  const { sceneMotion, pageVisible, suspended } = useInvitationMotion();
  const running = active && sceneMotion && pageVisible && !suspended;
  const clip = videos[theme].page;
  const sources = useMemo(() => clipSources(clip), [clip]);
  useBackgroundChoreography(ref, active, running);
  useEffect(() => {
    if (!backgroundFeatures.musicReactiveGlow) return;
    const node = ref.current, audio = document.getElementById("invitation-music");
    if (!audio || !node) return;
    const update = () => { node.dataset.musicPlaying = String(!audio.paused && !audio.ended); };
    update();
    ["play", "pause", "ended"].forEach(event => audio.addEventListener(event, update));
    return () => ["play", "pause", "ended"].forEach(event => audio.removeEventListener(event, update));
  }, []);
  return <div ref={ref} className="page-background" data-background-version="immersive-v2" data-background-motion={running ? "running" : "paused"} data-background-static={String(!sceneMotion)} data-background-active={String(active)} data-music-playing="false" style={{ "--background-grain": `url("${textures[theme].src}")` }} aria-hidden="true">
    <span className="page-background-base" />
    {active && <div className="page-film"><div className="page-film-zoom"><BackgroundVideo sources={sources} poster={clip.poster} priority="page" className="page-video" /></div></div>}
    <span className="page-background-grain" />
    <div className="page-mandalas"><span className="page-mandala-scroll page-mandala-primary"><span className="page-mandala-turn"><Mandala /></span></span><span className="page-mandala-scroll page-mandala-secondary"><span className="page-mandala-turn"><Mandala /></span></span></div>
    <span className="page-background-vignette" />
    <div className="background-air">
      {[0, 1].map(index => <i key={index} className={`background-bokeh background-bokeh-${index}`} />)}
      <div className="background-dust">{DUST.map((particle, index) => <i key={index} className="gold-speck" style={{ "--dust-left": `${particle.left}%`, "--dust-size": `${particle.size}px`, "--dust-duration": `${particle.duration}s`, "--dust-delay": `${particle.delay}s`, "--dust-drift": `${particle.drift}px`, "--dust-opacity": particle.opacity }} />)}</div>
      {backgroundFeatures.musicReactiveGlow && <i className="background-music-glow" />}
    </div>
  </div>;
}
