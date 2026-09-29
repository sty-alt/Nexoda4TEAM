"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Search,
  CheckSquare,
  FolderGit2,
  FileText,
  MessageSquare,
  Plus,
  Clock,
  Settings,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CommandPaletteProps {
  workspaceSlug: string;
}

export function CommandPalette({ workspaceSlug }: CommandPaletteProps) {
  const router = useRouter();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setQuickCreateTaskOpen,
  } = useUIStore();

  const [query, setQuery] = useState("");

  const { data: searchResults } = useQuery({
    queryKey: ["search", workspaceSlug, query],
    queryFn: async () => {
      if (!query.trim()) return null;
      const res = await fetch(
        `/api/search?workspaceSlug=${workspaceSlug}&q=${encodeURIComponent(query)}`
      );
      if (!res.ok) return null;
      return res.json();
    },
    enabled: commandPaletteOpen && query.trim().length > 0,
  });

  const staticActions = useMemo(
    () => [
      {
        id: "new-task",
        label: "Create new task / issue",
        icon: Plus,
        category: "Actions",
        shortcut: "C",
        run: () => {
          setCommandPaletteOpen(false);
          setQuickCreateTaskOpen(true);
        },
      },
      {
        id: "go-projects",
        label: "View all projects",
        icon: FolderGit2,
        category: "Navigation",
        shortcut: "G P",
        run: () => {
          setCommandPaletteOpen(false);
          router.push(`/app/${workspaceSlug}/projects`);
        },
      },
      {
        id: "go-planner",
        label: "Open Motion-style Day Planner",
        icon: Clock,
        category: "Navigation",
        run: () => {
          setCommandPaletteOpen(false);
          router.push(`/app/${workspaceSlug}/planner`);
        },
      },
      {
        id: "go-docs",
        label: "Knowledge base & Documents",
        icon: FileText,
        category: "Navigation",
        shortcut: "G D",
        run: () => {
          setCommandPaletteOpen(false);
          router.push(`/app/${workspaceSlug}/docs`);
        },
      },
      {
        id: "go-chat",
        label: "Team Chat & Channels",
        icon: MessageSquare,
        category: "Navigation",
        run: () => {
          setCommandPaletteOpen(false);
          router.push(`/app/${workspaceSlug}/chat`);
        },
      },
      {
        id: "go-settings",
        label: "Workspace settings",
        icon: Settings,
        category: "Settings",
        run: () => {
          setCommandPaletteOpen(false);
          router.push(`/app/${workspaceSlug}/settings`);
        },
      },
    ],
    [router, setCommandPaletteOpen, setQuickCreateTaskOpen, workspaceSlug]
  );

  // Filtered static actions when typing
  const filteredActions = useMemo(() => {
    if (!query.trim()) return staticActions;
    return staticActions.filter((a) =>
      a.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [staticActions, query]);

  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery("");
    }
  }, [commandPaletteOpen]);

  return (
    <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <DialogContent className="p-0 sm:max-w-2xl overflow-hidden border border-border/60 bg-popover shadow-2xl rounded-2xl">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border/40 gap-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search tasks, projects, docs, channels or type an action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted border border-border/60 text-muted-foreground shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results Stream */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-4">
          {/* Dynamic Database Search Results */}
          {searchResults && (
            <>
              {searchResults.tasks?.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 py-1">
                    Tasks & Issues
                  </div>
                  {searchResults.tasks.map((task: any) => (
                    <button
                      key={task.id}
                      onClick={() => {
                        setCommandPaletteOpen(false);
                        router.push(`/app/${workspaceSlug}/tasks?task=${task.id}`);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent text-left transition-colors group text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-mono text-muted-foreground">
                          {task.identifier}
                        </span>
                        <span className="truncate font-medium text-foreground">
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold shrink-0">
                        {task.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.docs?.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 py-1">
                    Documents
                  </div>
                  {searchResults.docs.map((doc: any) => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setCommandPaletteOpen(false);
                        router.push(`/app/${workspaceSlug}/docs?doc=${doc.id}`);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent text-left transition-colors group text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="truncate font-medium text-foreground">
                          {doc.title}
                        </span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Quick Commands & Navigation */}
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 py-1">
              Commands & Quick Navigation
            </div>
            {filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.run}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent text-left transition-colors group text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    <span className="font-medium text-foreground">
                      {action.label}
                    </span>
                  </div>
                  {action.shortcut && (
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 border border-border/40 text-muted-foreground">
                      {action.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-border/40 bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground px-4">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary" /> Nexoda Fast Search
          </span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
