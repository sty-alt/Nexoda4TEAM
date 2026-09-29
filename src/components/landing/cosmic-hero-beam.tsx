"use client";

import { useRef } from "react";
import { useLoopPlayback } from "@/components/landing/use-loop-playback";

/**
 * Huly hero light plate.
 *
 * Pixel Point composites `/videos/pages/home/hero/hero.webm|mp4`
 * (1920×1438, actually 3840×2876 source) with `mix-blend-mode: lighten`
 * inside a stage that sits in the 1280px page container:
 *   stage `left-6` + video `-left-[344px]` → video x = -240 at 1440px.
 * Black in the plate disappears; the iridescent pillar remains.
 *
 * MP4 (H.264 High / yuv420p) is first so Chrome/Edge never lock onto the
 * VP9 webm when hardware decode is flaky; mix-blend stays on the wrapper.
 */
export function CosmicHeroBeam() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useLoopPlayback(videoRef, wrapRef);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none absolute z-0 aspect-[1.335187] max-w-none mix-blend-lighten
        bottom-[5.4%] left-[-34.95%] w-[189%]
        md:bottom-[-2.1%] md:left-[-27%] md:w-[147%]
        lg:bottom-[23px] lg:left-[-253px] lg:w-[1620px]
        xl:bottom-0 xl:left-[-344px] xl:w-[1920px]"
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="h-full w-full transform-gpu"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      >
        <source src="/huly-assets/hero.mp4" type="video/mp4" />
        <source src="/huly-assets/hero.webm" type="video/webm" />
      </video>
    </div>
  );
}
