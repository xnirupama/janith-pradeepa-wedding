"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Minus, Plus, RotateCcw, X } from "lucide-react";
import { useLanguage } from "./InvitationLanguage";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const distance = (first, second) => Math.hypot(second.x - first.x, second.y - first.y);
const midpoint = (first, second) => ({ x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 });
const initialView = { scale: 1, x: 0, y: 0 };

export default function GalleryLightbox({ images, initialIndex, onClose, restoreFocusTo }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(initialIndex);
  const [view, setView] = useState(initialView);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const stageRef = useRef(null);
  const viewRef = useRef(initialView);
  const imageRef = useRef(images[initialIndex]);
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const hadPinch = useRef(false);
  const lastTap = useRef(null);
  useEffect(() => {
    imageRef.current = images[active];
  }, [active, images]);

  const updateView = useCallback((nextView) => {
    const stage = stageRef.current;
    const image = imageRef.current;
    const scale = clamp(nextView.scale, MIN_SCALE, MAX_SCALE);
    const width = stage?.clientWidth ?? 0;
    const height = stage?.clientHeight ?? 0;
    const imageWidth = image.width || width;
    const imageHeight = image.height || height;
    const fit = Math.min(width / imageWidth, height / imageHeight);
    const limitX = Math.max(0, (imageWidth * fit * scale - width) / 2);
    const limitY = Math.max(0, (imageHeight * fit * scale - height) / 2);
    const next = { scale, x: clamp(nextView.x, -limitX, limitX), y: clamp(nextView.y, -limitY, limitY) };
    viewRef.current = next;
    setView(next);
  }, []);

  const resetView = useCallback(() => updateView(initialView), [updateView]);
  const navigate = useCallback((direction) => {
    setActive((current) => (current + direction + images.length) % images.length);
    pointers.current.clear();
    gesture.current = null;
    hadPinch.current = false;
    lastTap.current = null;
    resetView();
  }, [images.length, resetView]);

  const zoom = useCallback((scale, anchor) => {
    const current = viewRef.current;
    const nextScale = clamp(scale, MIN_SCALE, MAX_SCALE);
    const ratio = nextScale / current.scale;
    updateView({
      scale: nextScale,
      x: anchor ? anchor.x - (anchor.x - current.x) * ratio : current.x * ratio,
      y: anchor ? anchor.y - (anchor.y - current.y) * ratio : current.y * ratio,
    });
  }, [updateView]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;
    const previousBody = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    const previousHtmlOverflow = html.style.overflow;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    html.style.overflow = "hidden";
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); }
      if (event.key === "ArrowLeft" && images.length > 1) { event.preventDefault(); navigate(-1); }
      if (event.key === "ArrowRight" && images.length > 1) { event.preventDefault(); navigate(1); }
      if (event.key === "+" || event.key === "=") { event.preventDefault(); zoom(viewRef.current.scale + 0.5); }
      if (event.key === "-") { event.preventDefault(); zoom(viewRef.current.scale - 0.5); }
      if (event.key === "0") { event.preventDefault(); resetView(); }
      if (event.key !== "Tab") return;
      const controls = [...dialog.querySelectorAll("button:not([disabled]), [tabindex='0']")];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    const onResize = () => updateView(viewRef.current);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      dialog.close();
      Object.assign(body.style, previousBody);
      html.style.overflow = previousHtmlOverflow;
      window.scrollTo({ top: scrollY, behavior: "instant" });
      restoreFocusTo?.focus({ preventScroll: true });
    };
  }, [images.length, navigate, onClose, resetView, restoreFocusTo, updateView, zoom]);

  useEffect(() => {
    const stage = stageRef.current;
    const onWheel = (event) => {
      event.preventDefault();
      const bounds = stage.getBoundingClientRect();
      zoom(viewRef.current.scale * Math.exp(-event.deltaY * 0.002), {
        x: event.clientX - bounds.left - bounds.width / 2,
        y: event.clientY - bounds.top - bounds.height / 2,
      });
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, [zoom]);

  const beginGesture = () => {
    const points = [...pointers.current.values()];
    if (points.length >= 2) {
      hadPinch.current = true;
      const bounds = stageRef.current.getBoundingClientRect();
      const center = midpoint(points[0], points[1]);
      gesture.current = {
        kind: "pinch",
        distance: Math.max(1, distance(points[0], points[1])),
        center: { x: center.x - bounds.left - bounds.width / 2, y: center.y - bounds.top - bounds.height / 2 },
        view: { ...viewRef.current },
      };
    } else if (points.length === 1) {
      gesture.current = { kind: "pan", start: points[0], view: { ...viewRef.current }, time: performance.now() };
    } else {
      gesture.current = null;
    }
  };

  const onPointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    if (pointers.current.size === 0) hadPinch.current = false;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    event.currentTarget.setPointerCapture(event.pointerId);
    beginGesture();
  };

  const onPointerMove = (event) => {
    if (!pointers.current.has(event.pointerId)) return;
    event.preventDefault();
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const current = gesture.current;
    if (!current) return;
    const points = [...pointers.current.values()];
    if (current.kind === "pinch" && points.length >= 2) {
      const bounds = stageRef.current.getBoundingClientRect();
      const center = midpoint(points[0], points[1]);
      const scale = clamp(current.view.scale * distance(points[0], points[1]) / current.distance, MIN_SCALE, MAX_SCALE);
      const ratio = scale / current.view.scale;
      updateView({
        scale,
        x: center.x - bounds.left - bounds.width / 2 - (current.center.x - current.view.x) * ratio,
        y: center.y - bounds.top - bounds.height / 2 - (current.center.y - current.view.y) * ratio,
      });
    } else if (current.kind === "pan" && current.view.scale > 1) {
      updateView({ scale: current.view.scale, x: current.view.x + event.clientX - current.start.x, y: current.view.y + event.clientY - current.start.y });
    }
  };

  const onPointerEnd = (event) => {
    const current = gesture.current;
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (event.type !== "pointercancel" && current?.kind === "pan" && pointers.current.size === 0 && !hadPinch.current) {
      const deltaX = event.clientX - current.start.x;
      const deltaY = event.clientY - current.start.y;
      if (current.view.scale === 1 && Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && images.length > 1) {
        navigate(deltaX > 0 ? -1 : 1);
      } else if (Math.hypot(deltaX, deltaY) < 10 && performance.now() - current.time < 250 && event.pointerType === "touch") {
        const now = performance.now();
        const point = { x: event.clientX, y: event.clientY };
        if (lastTap.current && now - lastTap.current.time < 320 && distance(lastTap.current, point) < 28) {
          const bounds = stageRef.current.getBoundingClientRect();
          zoom(viewRef.current.scale > 1 ? 1 : 2.5, { x: point.x - bounds.left - bounds.width / 2, y: point.y - bounds.top - bounds.height / 2 });
          lastTap.current = null;
        } else {
          lastTap.current = { ...point, time: now };
        }
      }
    }
    beginGesture();
  };

  const image = images[active];
  return createPortal(
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-modal="true"
      aria-labelledby="photo-viewer-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
    >
      <header className="lightbox-toolbar">
        <h2 id="photo-viewer-title" className="sr-only">{t("viewerLabel")}</h2>
        <span className="lightbox-count" aria-live="polite">{t("viewerPhoto")} {active + 1} {t("viewerOf")} {images.length}</span>
        <button ref={closeRef} className="lightbox-close" type="button" onClick={onClose} aria-label={t("viewerClose")}><X aria-hidden="true" /></button>
      </header>
      <div className="lightbox-content">
        <div
          ref={stageRef}
          className={`lightbox-stage ${view.scale > 1 ? "is-zoomed" : ""}`}
          tabIndex={0}
          aria-label={t("photoAlt")}
          aria-describedby="photo-viewer-hint"
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onDoubleClick={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            zoom(viewRef.current.scale > 1 ? 1 : 2.5, { x: event.clientX - bounds.left - bounds.width / 2, y: event.clientY - bounds.top - bounds.height / 2 });
          }}
        >
          <div className="lightbox-image" style={{ transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.scale})` }}>
            <Image
              key={image.src}
              src={image.src}
              alt={t("photoAlt")}
              fill
              sizes="(max-width: 950px) 100vw, 900px"
              placeholder={image.blurDataURL ? "blur" : "empty"}
              blurDataURL={image.blurDataURL}
              loading="eager"
              draggable={false}
              style={{ objectFit: "contain", pointerEvents: "none" }}
            />
          </div>
        </div>
        {images.length > 1 && <>
          <button className="lightbox-nav lightbox-prev" type="button" onClick={() => navigate(-1)} aria-label={t("viewerPrevious")}><ChevronLeft aria-hidden="true" /></button>
          <button className="lightbox-nav lightbox-next" type="button" onClick={() => navigate(1)} aria-label={t("viewerNext")}><ChevronRight aria-hidden="true" /></button>
        </>}
      </div>
      <footer className="lightbox-footer">
        <div className="lightbox-zoom-controls">
          <button type="button" onClick={() => zoom(viewRef.current.scale - 0.5)} disabled={view.scale === 1} aria-label={t("viewerZoomOut")}><Minus size={19} aria-hidden="true" /></button>
          <button type="button" onClick={resetView} aria-label={t("viewerReset")}><RotateCcw size={17} aria-hidden="true" /><span>{Math.round(view.scale * 100)}%</span></button>
          <button type="button" onClick={() => zoom(viewRef.current.scale + 0.5)} disabled={view.scale === MAX_SCALE} aria-label={t("viewerZoomIn")}><Plus size={19} aria-hidden="true" /></button>
        </div>
        <p className="lightbox-hint" id="photo-viewer-hint">{t("viewerHint")}</p>
      </footer>
    </dialog>,
    document.body,
  );
}
