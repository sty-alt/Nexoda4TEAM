"use client";

import React from "react";
import { useUIStore } from "@/store/useUIStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard, Command } from "lucide-react";

export function KeyboardShortcutsDialog() {
  const { shortcutsModalOpen, setShortcutsModalOpen } = useUIStore();

  const shortcutGroups = [
    {
      category: "Navigation",
      items: [
        { keys: ["⌘", "K"], description: "Open Command Palette / Search" },
        { keys: ["G", "P"], description: "Go to Projects" },
        { keys: ["G", "I"], description: "Go to Inbox" },
        { keys: ["G", "C"], description: "Go to Calendar" },
        { keys: ["G", "D"], description: "Go to Documents" },
        { keys: ["G", "T"], description: "Go to Tasks & Issues" },
      ],
    },
    {
      category: "Actions",
      items: [
        { keys: ["C"], description: "Create new task / issue" },
        { keys: ["N"], description: "Quick create item" },
        { keys: ["["], description: "Toggle left sidebar" },
        { keys: ["?"], description: "Open keyboard shortcuts help" },
        { keys: ["Esc"], description: "Close modal / cancel selection" },
      ],
    },
  ];

  return (
    <Dialog open={shortcutsModalOpen} onOpenChange={setShortcutsModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Keyboard className="h-4 w-4 text-primary" /> Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {shortcutGroups.map((group) => (
            <div key={group.category} className="space-y-2">
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {group.category}
              </div>
              <div className="divide-y divide-border/30 rounded-lg border border-border/40 overflow-hidden bg-card/50">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 text-xs"
                  >
                    <span className="text-foreground">{item.description}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-1.5 py-0.5 rounded bg-muted border border-border text-[11px] font-mono text-muted-foreground font-semibold"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
