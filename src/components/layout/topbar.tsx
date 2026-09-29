"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Bell,
  Plus,
  Play,
  Square,
  Sparkles,
  Wifi,
  Sun,
  Moon,
  Keyboard,
  CheckCheck,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/store/useUIStore";
import { useTimerStore } from "@/store/useTimerStore";
import { formatTimerClock } from "@/lib/utils";
import { NotificationItem } from "@/lib/types";

interface TopbarProps {
  workspaceSlug: string;
  breadcrumbs?: { label: string; href?: string }[];
  notifications?: NotificationItem[];
}

export function Topbar({
  workspaceSlug,
  breadcrumbs = [{ label: "Workspace" }],
  notifications = [],
}: TopbarProps) {
  const { toggleSidebar, setQuickCreateTaskOpen, setShortcutsModalOpen, theme, setTheme } =
    useUIStore();
  const { isRunning, activeTaskTitle, elapsedSeconds, stopTimer } = useTimerStore();

  const [unreadList, setUnreadList] = useState(notifications);
  const unreadCount = unreadList.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setUnreadList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    fetch("/api/notifications/read-all", { method: "POST" }).catch(console.error);
  };

  return (
    <header className="h-12 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Sidebar Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-semibold text-foreground" : ""}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <span className="text-border">/</span>}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right: Timer Pill, Quick Create, Live Sync, Notifications, Theme */}
      <div className="flex items-center gap-2">
        {/* Live Running Timer Pill */}
        {isRunning ? (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary animate-pulse-glow">
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span className="max-w-[140px] truncate font-medium hidden sm:inline">
              {activeTaskTitle || "Tracking task"}
            </span>
            <span className="font-mono font-bold tracking-wider text-xs">
              {formatTimerClock(elapsedSeconds)}
            </span>
            <button
              onClick={stopTimer}
              className="h-5 w-5 rounded-full hover:bg-primary/20 flex items-center justify-center transition-colors"
              title="Stop timer"
            >
              <Square className="h-3 w-3 fill-current" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setQuickCreateTaskOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Start time tracking"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Track Time</span>
          </button>
        )}

        {/* Quick Create Task button */}
        <Button
          size="sm"
          onClick={() => setQuickCreateTaskOpen(true)}
          className="h-7 px-2.5 text-xs gap-1 shadow-sm font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Task</span>
          <kbd className="hidden lg:inline text-[9px] opacity-70 bg-primary-foreground/20 px-1 py-0.2 rounded ml-0.5">
            C
          </kbd>
        </Button>

        {/* Realtime Live Status Pill */}
        <div
          className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-card/60 border border-border/40 text-[11px] text-muted-foreground"
          title="Realtime sync active via SSE"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Sync</span>
        </div>

        {/* Notifications Bell Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative h-8 w-8 rounded-md hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <div className="flex items-center justify-between p-3 border-b border-border/40">
              <span className="font-semibold text-xs">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto divide-y divide-border/30">
              {unreadList.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                unreadList.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 text-xs transition-colors hover:bg-accent/50 ${
                      !notif.isRead ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="font-medium text-foreground">{notif.title}</div>
                    <div className="text-muted-foreground text-[11px] mt-0.5">
                      {notif.message}
                    </div>
                  </div>
                ))
              )}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="p-2 text-center text-xs text-primary cursor-pointer justify-center">
              <Link href={`/app/${workspaceSlug}/inbox`}>
                View all in Inbox <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Shortcuts trigger */}
        <button
          onClick={() => setShortcutsModalOpen(true)}
          className="hidden sm:flex h-8 w-8 rounded-md hover:bg-accent items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
