"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { claimBackgroundVideo, hasBackgroundVideoSlot, releaseBackgroundVideo } from "@/lib/motion-environment";
import { useInvitationMotion } from "./InvitationMotion";
import { useLanguage } from "./InvitationLanguage";
import LotusLoader from "./LotusLoader";

export function clipSources(clip) {
  return [...(clip.webm ? [{ src: clip.webm.src, type: 'video/webm; codecs="vp9"' }] : []), { src: clip.src, type: "video/mp4" }];
}

export default function BackgroundVideo({ sources, poster, priority = "ambient", objectPosition = "50% 50%", className = "" }) {
  const containerRef = useRef(null), videoRef = useRef(null), retryUsed = useRef(false);
  const [nearby, setNearby] = useState(false), [inView, setInView] = useState(false);
  const [status, setStatus] = useState("loading"), [progress, setProgress] = useState(0);
  const [attempt, setAttempt] = useState(0), [failure, setFailure] = useState("");
  const [debug, setDebug] = useState(null);
  const { backgroundVideo, pageVisible, suspended, lowEnd } = useInvitationMotion();
  const { t } = useLanguage();
  const important = priority !== "ambient";
  const allowed = backgroundVideo && (!lowEnd || priority === "cover");
  const eligible = allowed && pageVisible && nearby && inView && (!suspended || priority === "opening");

  useEffect(() => {
    if (priority !== "cover" || !allowed || failure) return;
    const candidate = sources.find(source => source.type.startsWith("video/webm") && videoRef.current.canPlayType(source.type)) ?? sources.find(source => source.type === "video/mp4");
    const link = document.createElement("link");
    link.rel = "preload"; link.as = "fetch"; link.type = candidate.type.split(";")[0]; link.href = candidate.src; link.crossOrigin = "anonymous";
    document.head.appendChild(link);
    // Consume the fetch preload explicitly: media preload is unsupported by
    // Chromium, and WebKit otherwise treats a fetch hint as unused by <video>.
    const controller = new AbortController();
    fetch(candidate.src, { mode: "cors", credentials: "same-origin", signal: controller.signal }).then(response => response.arrayBuffer()).catch(() => {});
    return () => { controller.abort(); link.remove(); };
  }, [priority, allowed, sources, failure]);

  useEffect(() => {
    const node = containerRef.current;
    if (!("IntersectionObserver" in window)) {
      const timer = setTimeout(() => { setNearby(true); setInView(true); }, 0);
      return () => clearTimeout(timer);
    }
    const near = new IntersectionObserver(([e]) => setNearby(e.isIntersecting), { rootMargin: `${window.innerHeight}px 0px` });
    const visible = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: .01 });
    near.observe(node); visible.observe(node);
    return () => { near.disconnect(); visible.disconnect(); };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const reset = () => {
      releaseBackgroundVideo(video); video.removeAttribute("src");
      video.querySelectorAll("source").forEach(source => source.remove()); video.load();
    };
    if (!eligible || failure) {
      releaseBackgroundVideo(video);
      if (!nearby || !allowed || failure) reset();
      const timer = setTimeout(() => setStatus(failure || !allowed ? "fallback" : "ready"), 0);
      return () => clearTimeout(timer);
    }
    let cancelled = false, started = false, bufferReady = !important, mp4Only = attempt > 0;
    let startTimer, stallTimer, bufferTimer, decoderTimer;
    const began = performance.now();
    let lastTime = 0, lastAdvance = began;
    const clearTimers = () => [startTimer, stallTimer, bufferTimer, decoderTimer].forEach(clearTimeout);
    const fail = reason => {
      if (cancelled) return;
      clearTimers(); setFailure(reason); setStatus("fallback"); setProgress(1); reset();
    };
    const reveal = () => {
      if (cancelled || !started || !bufferReady) return;
      clearTimeout(startTimer); clearTimeout(stallTimer); setStatus("playing"); setProgress(1);
    };
    const play = async () => {
      if (cancelled) return;
      claimBackgroundVideo(video); video.muted = true; video.defaultMuted = true;
      try { await video.play(); } catch (error) {
        if (!cancelled && error.name !== "AbortError") fail(`${error.name}: ${error.message}`);
      }
    };
    const attach = () => {
      started = false;
      reset(); claimBackgroundVideo(video);
      for (const candidate of sources) {
        if (candidate.type.startsWith("video/webm") && (mp4Only || !video.canPlayType(candidate.type))) continue;
        const source = document.createElement("source"); source.src = candidate.src; source.type = candidate.type; video.appendChild(source);
      }
      video.muted = true; video.defaultMuted = true; video.load(); setStatus("loading");
    };
    const playing = () => {
      if (!hasBackgroundVideoSlot(video)) { video.pause(); return; }
      started = true; reveal();
    };
    const ready = () => { if (!started) setStatus("ready"); };
    const buffered = () => {
      if (Number.isFinite(video.duration) && video.buffered.length) setProgress(Math.min(1, video.buffered.end(video.buffered.length - 1) / video.duration));
    };
    const canPlayThrough = () => { bufferReady = true; play(); reveal(); };
    const wait = () => {
      if (!started || video.ended) return;
      setStatus("ready"); clearTimeout(stallTimer);
      stallTimer = setTimeout(() => fail("Playback stalled for 4 seconds"), 4000);
    };
    const tick = () => {
      if (video.currentTime !== lastTime) { lastTime = video.currentTime; lastAdvance = performance.now(); }
      if (started && !video.paused && video.readyState >= 2 && hasBackgroundVideoSlot(video)) reveal();
    };
    const error = () => {
      if (!video.querySelector("source")) return;
      if (!mp4Only && video.querySelector('source[type^="video/webm"]')) { mp4Only = true; attach(); play(); }
      else fail(`Media error ${video.error?.code ?? "unknown"}: ${video.error?.message ?? "decode/network failure"}`);
    };
    const pause = () => { if (!cancelled) setStatus("ready"); };
    const events = { playing, loadeddata: ready, canplaythrough: canPlayThrough, progress: buffered, durationchange: buffered, waiting: wait, stalled: wait, suspend: () => { buffered(); if (started && video.readyState < 2) wait(); }, timeupdate: tick, error, pause };
    for (const [event, handler] of Object.entries(events)) video.addEventListener(event, handler);
    attach();
    startTimer = setTimeout(() => { if (!started) fail("Playback did not start within 6 seconds"); else { bufferReady = true; reveal(); } }, 6000);
    if (important) bufferTimer = setTimeout(() => { bufferReady = true; play(); reveal(); }, 5000);
    else play();
    decoderTimer = setTimeout(() => {
      if (!started && !mp4Only && video.querySelector('source[type^="video/webm"]')) { mp4Only = true; attach(); play(); }
    }, 2000);
    const ticker = setInterval(() => {
      if (!started) setProgress(current => Math.max(current, Math.min(.95, (performance.now() - began) / 6000)));
      else if (!video.paused && performance.now() - lastAdvance >= 4000) fail("Video clock stopped for 4 seconds");
    }, 150);
    return () => {
      cancelled = true; clearTimers(); clearInterval(ticker);
      for (const [event, handler] of Object.entries(events)) video.removeEventListener(event, handler);
      reset();
    };
  }, [eligible, nearby, allowed, sources, attempt, failure, important]);

  useEffect(() => {
    if (!failure || retryUsed.current || !allowed) return;
    const events = ["touchstart", "pointerdown", "scroll", "click"];
    const remove = () => events.forEach(event => window.removeEventListener(event, retry, true));
    const retry = () => { retryUsed.current = true; setFailure(""); setAttempt(current => current + 1); remove(); };
    events.forEach(event => window.addEventListener(event, retry, { capture: true, passive: true }));
    return remove;
  }, [failure, allowed]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || new URLSearchParams(window.location.search).get("debug") !== "1") return;
    const timer = setInterval(() => {
      const v = videoRef.current;
      const ranges = Array.from({ length: v.buffered.length }, (_, i) => `${v.buffered.start(i).toFixed(1)}-${v.buffered.end(i).toFixed(1)}`).join(",");
      setDebug(`${priority}: ${status}\nready ${v.readyState} / network ${v.networkState}\ntime ${v.currentTime.toFixed(2)} / buffered ${ranges || "none"}\ndropped ${v.getVideoPlaybackQuality?.().droppedVideoFrames ?? "n/a"}\nerror ${failure || "none"}`);
    }, 500);
    return () => clearInterval(timer);
  }, [status, failure, priority]);

  return <div ref={containerRef} className={`video-backdrop ${className}`} data-video-state={status} style={{ "--video-position": objectPosition }}>
    <Image className="video-poster" src={poster.src} alt="" fill unoptimized sizes="(max-width: 480px) 100vw, 480px" preload={priority === "cover"} loading={priority === "cover" ? undefined : "lazy"} placeholder={poster.blurDataURL ? "blur" : "empty"} blurDataURL={poster.blurDataURL} />
    <video ref={videoRef} data-background-video data-priority={priority} className={status === "playing" && eligible ? "is-playing" : ""} poster={poster.src} crossOrigin="anonymous" muted loop={priority !== "opening"} playsInline webkit-playsinline="true" autoPlay preload={important ? "auto" : "metadata"} disablePictureInPicture disableRemotePlayback aria-hidden="true" tabIndex={-1} />
    <span className="video-scrim" aria-hidden="true" />
    {priority === "cover" && status !== "playing" && status !== "fallback" && <LotusLoader progress={progress} label={t("preparingInvitation")} />}
    {!important && (status === "loading" || status === "ready") && <span className="poster-shimmer" aria-hidden="true" />}
    {debug && <output className="video-debug">{debug}</output>}
  </div>;
}
