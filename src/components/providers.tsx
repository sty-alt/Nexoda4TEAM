"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { useTimerStore } from "@/store/useTimerStore";
import { LocaleProvider } from "@/i18n/locale-provider";
import type { Locale } from "@/i18n/messages";

export function Providers({ children, initialLocale }: { children: React.ReactNode; initialLocale: Locale }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30s cache
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const isTimerRunning = useTimerStore((s) => s.isRunning);
  const tick = useTimerStore((s) => s.tick);

  // Global live timer interval
  useEffect(() => {
    if (!isTimerRunning) return;

    tick();
    const timer = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, tick]);

  // Initial theme loader
  useEffect(() => {
    const savedTheme = localStorage.getItem("nexoda_theme") || "dark";
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (savedTheme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(isDark ? "dark" : "light");
    } else {
      root.classList.add(savedTheme);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <LocaleProvider initialLocale={initialLocale}>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </LocaleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

