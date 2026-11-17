"use client";

import { useEffect, useRef } from "react";
import { sendGAEvent } from "@next/third-parties/google";

/**
 * The banner's 5 s clip, laid over its still (DictumusSlot). The server HTML carries a
 * <video> with no src, so nothing downloads until the banner is about a screen away;
 * it plays once when half of it is on screen, then hides again over the still, which
 * is the clip's own first and last frame.
 *
 * Nothing happens for readers who ask for reduced motion or whose browser reports a
 * data saver, or in a slot hidden at this width (display: none never intersects).
 * A refused play() (iPhone Low Power Mode) or a stalled, paused or half-off-screen
 * clip hides the video and leaves the still; it is never retried.
 */
export default function DictumusMotion({ src, slot, slug }: { src: string; slot: string; slug: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  // Measurement for the test (docs/dictumus/BANNER-SLOTS.md §5), sent to GA4 with the
  // slot and the article: "dictumus_view" once per page view when half the banner has
  // been on screen for a second (the IAB viewability rule), "dictumus_click" on every
  // click, middle-click included. Clicks open a new tab, so the event always gets out.
  // Runs for every reader, reduced motion or not; a slot hidden at this width is
  // never on screen, so it never counts.
  useEffect(() => {
    const frame = ref.current?.parentElement;
    const link = frame?.closest("a");
    if (!frame || !link) return;
    const params = { slot, article: slug };
    const onClick = (e: MouseEvent) => {
      if (e.type === "auxclick" && e.button !== 1) return;
      sendGAEvent("event", "dictumus_click", params);
    };
    link.addEventListener("click", onClick);
    link.addEventListener("auxclick", onClick);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const seen = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      (entries) => {
        const visible = entries[entries.length - 1].isIntersecting;
        if (visible && !timer) {
          timer = setTimeout(() => { sendGAEvent("event", "dictumus_view", params); seen?.disconnect(); }, 1000);
        } else if (!visible && timer) {
          clearTimeout(timer);
          timer = undefined;
        }
      },
      { threshold: 0.5 },
    );
    seen?.observe(frame);
    return () => {
      link.removeEventListener("click", onClick);
      link.removeEventListener("auxclick", onClick);
      seen?.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [slot, slug]);

  useEffect(() => {
    const video = ref.current;
    if (!video || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (saveData) return;

    // done: the one play is used up or given up; final, never retried.
    // started: a frame has been shown. Leaving the screen before that re-arms instead.
    // rearming: our own pause while re-arming, which onPause must not treat as giving up.
    let done = false;
    let started = false;
    let rearming = false;
    const show = () => {
      if (done) { video.pause(); return; } // e.g. buffering recovered after we gave up
      started = true;
      video.style.opacity = "1";
    };
    const finish = () => {
      done = true;
      video.style.opacity = "0";
      near.disconnect();
      half.disconnect();
      if (!video.paused) video.pause();
    };

    // React does not reliably write `muted` to the DOM (facebook/react#10389), and
    // browsers only autoplay a muted video.
    video.muted = true;
    video.defaultMuted = true;

    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || video.src) return;
        video.preload = "auto";
        video.src = src;
        video.load();
        near.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    const half = new IntersectionObserver(
      (entries) => {
        if (done) return;
        const entry = entries[entries.length - 1];
        if (entry.isIntersecting && video.paused && video.currentTime === 0) {
          if (!video.src) { video.preload = "auto"; video.src = src; video.load(); }
          video.play().catch((e: unknown) => {
            // Our own re-arm pause aborts play(); anything else (iPhone Low Power Mode) is final.
            if (rearming || (e instanceof DOMException && e.name === "AbortError" && !started)) return;
            finish();
          });
        } else if (!entry.isIntersecting && !video.paused) {
          if (started) { video.pause(); return; } // half off screen mid-play: give up
          // A fast scroll past it before any frame showed: rewind and wait for the next pass.
          // The pause event arrives later as a task; onPause clears the flag when it does.
          rearming = true;
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: 0.5 },
    );

    const onPause = () => {
      if (rearming) { rearming = false; return; }
      if (!video.ended) finish();
    };
    // Only a stall mid-play gives up: Safari can report one while it is still preloading.
    const onStalled = () => { if (!video.paused) finish(); };
    video.addEventListener("playing", show);
    video.addEventListener("ended", finish);
    video.addEventListener("pause", onPause);
    video.addEventListener("stalled", onStalled);
    video.addEventListener("error", finish);
    near.observe(video);
    half.observe(video);
    return () => {
      near.disconnect();
      half.disconnect();
      video.removeEventListener("playing", show);
      video.removeEventListener("ended", finish);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("stalled", onStalled);
      video.removeEventListener("error", finish);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className="dx-slot__video"
      muted
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
    />
  );
}
