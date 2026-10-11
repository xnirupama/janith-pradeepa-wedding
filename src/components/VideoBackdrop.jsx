"use client";
import { useMemo } from "react";
import BackgroundVideo, { clipSources } from "./BackgroundVideo";
export default function VideoBackdrop({ clip, cover = false, hero = false, className = "" }) {
  const sources = useMemo(() => clip ? clipSources(clip) : [], [clip]);
  if (!clip) return null;
  return <BackgroundVideo sources={sources} poster={clip.poster} priority={cover ? "cover" : hero ? "hero" : "ambient"} objectPosition={clip.position} className={(cover ? "" : "ambient-backdrop ") + className} style={cover ? undefined : { "--ambient-opacity": clip.opacity, "--ambient-blend": clip.blend }} />;
}
