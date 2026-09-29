"use client";

import { useEffect, type RefObject } from "react";

/**
 * Chrome/Edge autoplay is easy to lose: React's `muted` attr doesn't always
 * set the `.muted` property, `play()` before `canplay` rejects and stays
 * paused if the error is swallowed, and a strict IntersectionObserver can
 * treat a visible plate as off-screen.
 *
 * Do not freeze on `prefers-reduced-motion`. On Windows that media query is
 * tied to "Animation effects" / "Show animations in Windows" — when it's
 * off (common), every plate was paused at 0.08s and looked stuck.
 */
export function useLoopPlayback(
  videoRef: RefObject<HTMLVideoElement | null>,
  rootRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const root = rootRef?.current ?? video;
    let visible = true;
    let stopped = false;

    const unlock = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.volume = 0;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
    };

    const tryPlay = () => {
      if (stopped || !visible) return;
      unlock();
      const attempt = video.play();
      if (attempt !== undefined) {
        void attempt.catch(() => {
          /* autoplay may reject until the next ready event */
        });
      }
    };

    const sync = () => {
      if (visible) tryPlay();
      else video.pause();
    };

    unlock();
    tryPlay();

    const readyEvents = ["canplay", "canplaythrough", "loadeddata", "loadedmetadata"] as const;
    for (const eventName of readyEvents) {
      video.addEventListener(eventName, tryPlay);
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { root: null, rootMargin: "480px 0px", threshold: 0 },
    );
    io.observe(root);

    return () => {
      stopped = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      for (const eventName of readyEvents) {
        video.removeEventListener(eventName, tryPlay);
      }
    };
  }, [videoRef, rootRef]);
}
