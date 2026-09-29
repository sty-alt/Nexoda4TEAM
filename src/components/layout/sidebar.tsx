"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  CalendarDays,
  Calendar,
  FolderGit2,
  CheckSquare,
  FileText,
  MessageSquare,
  Users,
  HardDrive,
  BarChart3,
  GitBranch,
  Settings,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Hash,
  Circle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { UserNav } from "./user-nav";
import { SafeUser, WorkspaceWithDetails } from "@/lib/types";

interface SidebarProps {
  currentWorkspace: WorkspaceWithDetails;
  workspaces: WorkspaceWithDetails[];
  currentUser: SafeUser;
  projects?: { id: string; name: string; identifier: string; color: string }[];
  channels?: { id: string; name: string; isPrivate: boolean }[];
  unreadInboxCount?: number;
}

export function Sidebar({
  currentWorkspace,
  workspaces,
  currentUser,
  projects = [],
  channels = [],
  unreadInboxCount = 2,
}: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, setCommandPaletteOpen, setQuickCreateTaskOpen } = useUIStore();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [channelsOpen, setChannelsOpen] = useState(true);

  const baseUrl = `/app/${currentWorkspace.slug}`;

  const navItems = [
    { label: "Dashboard", href: `${baseUrl}/dashboard`, icon: LayoutDashboard },
    {
      label: "Inbox",
      href: `${baseUrl}/inbox`,
      icon: Inbox,
      badge: unreadInboxCount > 0 ? unreadInboxCount : undefined,
    },
    { label: "Planner", href: `${baseUrl}/planner`, icon: CalendarDays },
    { label: "Calendar", href: `${baseUrl}/calendar`, icon: Calendar },
    { label: "Tasks & Issues", href: `${baseUrl}/tasks`, icon: CheckSquare },
    { label: "Documents", href: `${baseUrl}/docs`, icon: FileText },
    { label: "Team Chat", href: `${baseUrl}/chat`, icon: MessageSquare },
    { label: "Team & Workload", href: `${baseUrl}/team`, icon: Users },
    { label: "Drive Storage", href: `${baseUrl}/drive`, icon: HardDrive },
    { label: "Reports & Velocity", href: `${baseUrl}/reports`, icon: BarChart3 },
    { label: "GitHub Integration", href: `${baseUrl}/integrations/github`, icon: GitBranch },
  ];

  if (sidebarCollapsed) {
    return (
      <aside className="w-16 border-r border-border/50 bg-sidebar flex flex-col items-center py-3 justify-between transition-all select-none">
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
            {currentWorkspace.name.slice(0, 2).toUpperCase()}
          </div>
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Search (Cmd+K)"
          >
            <Search className="h-4 w-4" />
          </button>
          <div className="h-px w-8 bg-border/60" />
          <nav className="flex flex-col items-center space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  title={item.label}
                >
                  <Icon className="h-4 w-4" />
                  {item.badge && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <Link
            href={`${baseUrl}/settings`}
            className="h-8 w-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <UserNav user={currentUser} workspaceSlug={currentWorkspace.slug} />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 border-r border-border/50 bg-sidebar flex flex-col justify-between transition-all select-none h-screen sticky top-0">
      {/* Top Header & Search */}
      <div className="flex flex-col overflow-hidden">
        <div className="p-3 border-b border-border/40">
          <WorkspaceSwitcher
            currentWorkspace={currentWorkspace}
            workspaces={workspaces}
          />
        </div>

        {/* Global Quick Search Button */}
        <div className="p-3 pb-1">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-border/40 bg-card/40 hover:bg-accent/60 text-xs text-muted-foreground hover:text-foreground transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
              <span><LocalizedText>Jump to or search...</LocalizedText></span>
            </div>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 border border-border/60"><LocalizedText>
              ⌘K
            </LocalizedText></kbd>
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="overflow-y-auto px-2 py-2 space-y-4">
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.label !== "Dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
                    <span><LocalizedText>{item.label}</LocalizedText></span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Active Projects section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <button
                onClick={() => setProjectsOpen(!projectsOpen)}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                {projectsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <span><LocalizedText>Projects</LocalizedText></span>
              </button>
              <Link
                href={`${baseUrl}/projects`}
                className="hover:text-foreground transition-colors"
                title="Create or view all projects"
              >
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </div>

            {projectsOpen && (
              <div className="space-y-0.5 pl-2">
                {projects.map((proj) => {
                  const active = pathname.includes(`/projects/${proj.id}`);
                  return (
                    <Link
                      key={proj.id}
                      href={`${baseUrl}/projects/${proj.id}`}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1 rounded-md text-xs transition-colors",
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: proj.color }}
                      />
                      <span className="truncate">{proj.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Channels section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              <button
                onClick={() => setChannelsOpen(!channelsOpen)}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                {channelsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                <span><LocalizedText>Channels</LocalizedText></span>
              </button>
              <Link
                href={`${baseUrl}/chat`}
                className="hover:text-foreground transition-colors"
                title="Open chat"
              >
                <Plus className="h-3.5 w-3.5" />
              </Link>
            </div>

            {channelsOpen && (
              <div className="space-y-0.5 pl-2">
                {channels.map((chan) => {
                  const active = pathname === `${baseUrl}/chat?channel=${chan.id}`;
                  return (
                    <Link
                      key={chan.id}
                      href={`${baseUrl}/chat?channel=${chan.id}`}
                      className={cn(
                        "flex items-center gap-2 px-2.5 py-1 rounded-md text-xs transition-colors",
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{chan.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-2 border-t border-border/40 space-y-1">
        <Link
          href={`${baseUrl}/settings`}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          <span><LocalizedText>Workspace Settings</LocalizedText></span>
        </Link>
        <UserNav user={currentUser} workspaceSlug={currentWorkspace.slug} />
      </div>
    </aside>
  );
}

