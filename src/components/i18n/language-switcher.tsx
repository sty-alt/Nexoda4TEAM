"use client";

import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/i18n/locale-provider";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={cn("inline-flex items-center gap-1 rounded-lg border border-border/50 bg-card/60 p-1", className)}
      aria-label={t("Interface language")}
      title={t("Switch language")}
    >
      <Languages className="mx-1 h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      {(["en", "ru"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          aria-pressed={locale === option}
          aria-label={option === "en" ? t("Switch to English") : t("Switch to Russian")}
          className={cn(
            "rounded-md px-2 py-1 text-[10px] font-semibold transition-colors",
            locale === option
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

