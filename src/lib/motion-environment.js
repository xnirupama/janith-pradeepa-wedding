"use client";

import { allowsBackgroundVideo } from "./motion-policy";

const serverSnapshot = { pageVisible: true, reducedMotion: true, backgroundVideo: false, lowEnd: false };
let snapshot = serverSnapshot;
const subscribers = new Set();
let teardown;

export function readMotionEnvironment() {
  if (typeof window === "undefined") return serverSnapshot;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    pageVisible: document.visibilityState === "visible",
    reducedMotion,
    lowEnd: (navigator.deviceMemory > 0 && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4),
    backgroundVideo: allowsBackgroundVideo({ reducedMotion, saveData: connection?.saveData, effectiveType: connection?.effectiveType, downlink: connection?.downlink }),
  };
}
const refresh = () => {
  const next = readMotionEnvironment();
  if (Object.keys(next).every(key => next[key] === snapshot[key])) return;
  snapshot = next;
  subscribers.forEach(callback => callback());
};
export function subscribeMotion(callback) {
  subscribers.add(callback);
  if (!teardown) {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    media.addEventListener?.("change", refresh);
    connection?.addEventListener?.("change", refresh);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("online", refresh);
    window.addEventListener("offline", refresh);
    teardown = () => {
      media.removeEventListener?.("change", refresh);
      connection?.removeEventListener?.("change", refresh);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("online", refresh);
      window.removeEventListener("offline", refresh);
      teardown = undefined;
    };
    refresh();
  }
  return () => { subscribers.delete(callback); if (!subscribers.size) teardown?.(); };
}
export const getMotionSnapshot = () => snapshot;
export const getServerMotionSnapshot = () => serverSnapshot;

const playingVideos = new Set();
export function claimBackgroundVideo(video) {
  if (!playingVideos.has(video) && playingVideos.size >= 2) {
    const oldest = playingVideos.values().next().value;
    playingVideos.delete(oldest);
    oldest.pause();
  }
  playingVideos.add(video);
}
export const hasBackgroundVideoSlot = video => playingVideos.has(video);
export function releaseBackgroundVideo(video) { playingVideos.delete(video); video?.pause(); }
export function pauseBackgroundVideos() {
  playingVideos.forEach(video => video.pause());
  playingVideos.clear();
}
