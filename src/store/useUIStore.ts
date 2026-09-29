import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  shortcutsModalOpen: boolean;
  setShortcutsModalOpen: (open: boolean) => void;

  quickCreateTaskOpen: boolean;
  setQuickCreateTaskOpen: (open: boolean) => void;

  theme: "dark" | "light" | "system";
  setTheme: (theme: "dark" | "light" | "system") => void;

  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  shortcutsModalOpen: false,
  setShortcutsModalOpen: (open) => set({ shortcutsModalOpen: open }),

  quickCreateTaskOpen: false,
  setQuickCreateTaskOpen: (open) => set({ quickCreateTaskOpen: open }),

  theme: "dark",
  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
      localStorage.setItem("nexoda_theme", theme);
    }
    set({ theme });
  },

  activeTab: "overview",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
