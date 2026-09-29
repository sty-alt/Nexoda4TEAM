"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";

interface ShortcutOptions {
  workspaceSlug: string;
}

export function useKeyboardShortcuts({ workspaceSlug }: ShortcutOptions) {
  const router = useRouter();
  const {
    setCommandPaletteOpen,
    setShortcutsModalOpen,
    setQuickCreateTaskOpen,
    toggleSidebar,
  } = useUIStore();

  const lastKeyRef = useRef<{ key: string; time: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing inside an input, textarea or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Single key 'c' or 'n' -> quick create task
      if (e.key === "c" || e.key === "C" || e.key === "n" || e.key === "N") {
        e.preventDefault();
        setQuickCreateTaskOpen(true);
        return;
      }

      // '?' -> shortcuts modal
      if (e.key === "?") {
        e.preventDefault();
        setShortcutsModalOpen(true);
        return;
      }

      // '[' -> toggle sidebar
      if (e.key === "[") {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Sequential 'G' then letter
      const now = Date.now();
      if (e.key.toLowerCase() === "g") {
        lastKeyRef.current = { key: "g", time: now };
        return;
      }

      if (lastKeyRef.current && lastKeyRef.current.key === "g" && now - lastKeyRef.current.time < 1000) {
        const nextKey = e.key.toLowerCase();
        lastKeyRef.current = null;

        if (nextKey === "p") {
          e.preventDefault();
          router.push(`/app/${workspaceSlug}/projects`);
        } else if (nextKey === "i") {
          e.preventDefault();
          router.push(`/app/${workspaceSlug}/inbox`);
        } else if (nextKey === "c") {
          e.preventDefault();
          router.push(`/app/${workspaceSlug}/calendar`);
        } else if (nextKey === "d") {
          e.preventDefault();
          router.push(`/app/${workspaceSlug}/docs`);
        } else if (nextKey === "t") {
          e.preventDefault();
          router.push(`/app/${workspaceSlug}/tasks`);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    workspaceSlug,
    router,
    setCommandPaletteOpen,
    setShortcutsModalOpen,
    setQuickCreateTaskOpen,
    toggleSidebar,
  ]);
}
