"use client";
import { useMemo } from "react";
import BackgroundVideo, { clipSources } from "./BackgroundVideo";
export default function VideoBackdrop({ clip, cover = false, className = "" }) {
  const sources = useMemo(() => clip ? clipSources(clip) : [], [clip]);
  if (!clip) return null;
  return <BackgroundVideo sources={sources} poster={clip.poster} priority={cover ? "cover" : "ambient"} objectPosition={clip.position} className={className} />;
}
