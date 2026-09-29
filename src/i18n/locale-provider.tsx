"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { translate, type Locale } from "./messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (source: string) => string;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => undefined,
  t: (source) => source,
});

const LOCALIZED_ATTRIBUTES = [
  "placeholder",
  "title",
  "aria-label",
  "aria-description",
  "alt",
  "data-tooltip-content",
];

type AttributeTranslation = { source: string; translated: string };
const toastTextCache = new WeakMap<Text, AttributeTranslation>();
const attributeTranslationCache = new WeakMap<Element, Map<string, AttributeTranslation>>();

function translateToastText(node: Text, locale: Locale) {
  const current = node.data;
  const previous = toastTextCache.get(node);
  const source = previous && current === previous.translated ? previous.source : current;
  const translated = translate(locale, source);
  toastTextCache.set(node, { source, translated });
  if (translated !== current) node.data = translated;
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `nexoda_locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
    document.documentElement.lang = nextLocale;
  }, []);

  const t = useCallback((source: string) => translate(locale, source), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  useLayoutEffect(() => {
    document.documentElement.lang = locale;

    const translateElement = (element: Element) => {
      const elementCache = attributeTranslationCache.get(element) ?? new Map<string, AttributeTranslation>();
      for (const attribute of LOCALIZED_ATTRIBUTES) {
        const current = element.getAttribute(attribute);
        if (current === null) continue;

        const previous = elementCache.get(attribute);
        const source = previous && current === previous.translated ? previous.source : current;
        const translated = translate(locale, source);
        elementCache.set(attribute, { source, translated });
        if (translated !== current) element.setAttribute(attribute, translated);
      }
      attributeTranslationCache.set(element, elementCache);
    };

    const translateTree = (node: Node) => {
      if (node instanceof Text) {
        if (node.parentElement?.closest("[data-sonner-toast]")) translateToastText(node, locale);
        return;
      }
      if (node instanceof Element) {
        translateElement(node);
        for (const child of Array.from(node.querySelectorAll(LOCALIZED_ATTRIBUTES.map((attribute) => `[${attribute}]`).join(",")))) {
          translateElement(child);
        }
        if (node.matches("[data-sonner-toast]")) {
          const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) translateToastText(walker.currentNode as Text, locale);
        }
      }
    };

    translateTree(document.body);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.target instanceof Element) {
          translateElement(mutation.target);
        }
        if (mutation.type === "characterData" && mutation.target instanceof Text && mutation.target.parentElement?.closest("[data-sonner-toast]")) {
          translateToastText(mutation.target, locale);
        }
        Array.from(mutation.addedNodes).forEach(translateTree);
      }
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: LOCALIZED_ATTRIBUTES,
    });

    return () => observer.disconnect();
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function LocalizedText({ children }: { children: string }) {
  const { t } = useLocale();
  return t(children);
}

