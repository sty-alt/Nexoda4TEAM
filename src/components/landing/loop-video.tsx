"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useLoopPlayback } from "@/components/landing/use-loop-playback";

export type LoopVideoSource = {
  src: string;
  type: string;
};

type LoopVideoProps = {
  sources: LoopVideoSource[];
  poster?: string;
  className?: string;
  videoClassName?: string;
  width?: number;
  height?: number;
  preload?: "none" | "metadata" | "auto";
};

/**
 * Section loop plate — muted / loop / autoplay / playsInline.
 * H.264 mp4 is listed first so Chrome/Edge on Windows don't get stuck on a
 * WebM source they can't decode. Playback is retried on canplay + visibility.
 * Decorative loops keep playing even when OS "animation effects" are off.
 */
export function LoopVideo({
  sources,
  poster,
  className,
  videoClassName,
  width,
  height,
  preload = "auto",
}: LoopVideoProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useLoopPlayback(videoRef, wrapRef);

  const ordered = [...sources].sort((a, b) => {
    const score = (s: LoopVideoSource) =>
      s.type.includes("mp4") ? 0 : s.type.includes("webm") ? 1 : 2;
    return score(a) - score(b);
  });

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <video
        ref={videoRef}
        className={cn("h-full w-full object-cover transform-gpu", videoClassName)}
        poster={poster}
        width={width}
        height={height}
        autoPlay
        muted
        loop
        playsInline
        preload={preload}
        disablePictureInPicture
      >
        {ordered.map((source) => (
          <source key={source.src} src={source.src} type={source.type} />
        ))}
      </video>
    </div>
  );
}
