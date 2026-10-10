"use client";

import { useEffect, useImperativeHandle, useRef } from "react";
import { claimBackgroundVideo, releaseBackgroundVideo } from "@/lib/motion-environment";

// A requested film starts inside the tap handler, rather than in an effect or
// a canplaythrough callback. Decorative autoplay policies do not apply to it.
export default function useOpeningVideo({ enabled, ref, videoRef, sources, poster, setStatus, setProgress, setFailure, lastError, onPlaybackState, onEnded }) {
  const controller = useRef(null);
  useImperativeHandle(ref, () => ({
    play: () => controller.current?.play(),
    stop: () => controller.current?.stop(),
  }), []);

  useEffect(() => {
    if (!enabled) return;
    const video = videoRef.current;
    const mp4 = sources.find(source => source.type === "video/mp4");
    let requested = false, playing = false, blocked = false, resumeAfterVisibility = false, disposed = false, generation = 0;
    let startTimer, stallTimer, lastTime = 0, lastAdvance = 0;
    const clearTimers = () => { clearTimeout(startTimer); clearTimeout(stallTimer); };
    const report = state => { setStatus(state); onPlaybackState?.(state); };
    const fail = reason => {
      if (disposed || !requested) return;
      generation++; clearTimers(); playing = false; blocked = true; resumeAfterVisibility = false;
      lastError.current = reason; setFailure(reason); report("fallback"); releaseBackgroundVideo(video);
    };
    const buffered = () => {
      if (Number.isFinite(video.duration) && video.buffered.length) setProgress(Math.min(1, video.buffered.end(video.buffered.length - 1) / video.duration));
    };
    const play = () => {
      requested = true; playing = false; blocked = false; resumeAfterVisibility = false;
      clearTimers(); setFailure(""); report("loading");
      video.muted = true; video.defaultMuted = true; video.playsInline = true;
      video.preload = "auto"; video.poster = poster.src;
      if (video.getAttribute("src") !== mp4.src || video.error) {
        video.src = mp4.src;
        video.load();
      } else if (video.readyState >= 1) video.currentTime = 0;
      claimBackgroundVideo(video);
      const current = ++generation;
      startTimer = setTimeout(() => fail("Opening video did not start within 12 seconds"), 12000);
      try {
        // Keep this call synchronous with Open/Replay/Play's trusted gesture.
        const promise = video.play();
        promise?.catch(error => {
          if (error.name === "AbortError" && document.visibilityState !== "visible") return;
          if (!disposed && current === generation) fail(`${error.name}: ${error.message}`);
        });
      } catch (error) { fail(`${error.name}: ${error.message}`); }
    };
    const stop = () => {
      requested = false; playing = false; resumeAfterVisibility = false; generation++;
      clearTimers(); releaseBackgroundVideo(video);
      video.removeAttribute("src"); video.removeAttribute("poster"); video.load();
    };
    const began = () => {
      if (!requested || document.visibilityState !== "visible") { video.pause(); return; }
      claimBackgroundVideo(video); playing = true; blocked = false; lastTime = video.currentTime; lastAdvance = performance.now();
      clearTimers(); setFailure(""); report("playing"); buffered();
    };
    const wait = () => {
      if (!requested || blocked || video.ended || document.visibilityState !== "visible") return;
      report("ready");
      if (!stallTimer && playing) stallTimer = setTimeout(() => fail("Opening playback stalled for 8 seconds"), 8000);
    };
    const tick = () => {
      if (video.currentTime !== lastTime) {
        lastTime = video.currentTime; lastAdvance = performance.now();
        if (playing && !video.paused && video.readyState >= 2) { clearTimeout(stallTimer); stallTimer = undefined; report("playing"); }
      }
    };
    const ended = () => {
      if (!requested) return;
      requested = false; playing = false; clearTimers(); releaseBackgroundVideo(video);
      onEnded?.();
    };
    const visibility = () => {
      if (document.visibilityState !== "visible") {
        resumeAfterVisibility = requested && !video.paused; clearTimers(); releaseBackgroundVideo(video);
      } else if (resumeAfterVisibility && requested) {
        resumeAfterVisibility = false; claimBackgroundVideo(video); lastAdvance = performance.now();
        try { video.play()?.catch(error => fail(`${error.name}: ${error.message}`)); } catch (error) { fail(`${error.name}: ${error.message}`); }
      }
    };
    const events = {
      playing: began, progress: buffered, durationchange: buffered, timeupdate: tick,
      waiting: wait, stalled: wait,
      loadeddata: () => { if (requested && !playing && !blocked) report("ready"); },
      suspend: buffered, ended,
      error: () => { if (video.getAttribute("src")) fail(`Opening media error ${video.error?.code ?? "unknown"}`); },
    };
    for (const [event, handler] of Object.entries(events)) video.addEventListener(event, handler);
    document.addEventListener("visibilitychange", visibility);
    const watchdog = setInterval(() => {
      if (playing && !video.paused && document.visibilityState === "visible" && performance.now() - lastAdvance > 8000) fail("Opening video clock stopped for 8 seconds");
    }, 500);
    controller.current = { play, stop };
    return () => {
      disposed = true; controller.current = null; clearInterval(watchdog);
      for (const [event, handler] of Object.entries(events)) video.removeEventListener(event, handler);
      document.removeEventListener("visibilitychange", visibility); stop();
    };
  }, [enabled, videoRef, sources, poster, setStatus, setProgress, setFailure, lastError, onPlaybackState, onEnded]);
}
