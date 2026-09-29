"use client";

import React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/search/command-palette";
import { QuickCreateTaskDialog } from "@/components/tasks/quick-create-task-dialog";
import { KeyboardShortcutsDialog } from "@/components/layout/keyboard-shortcuts-dialog";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRealtimeSubscription } from "@/hooks/useRealtime";
import { SafeUser, WorkspaceWithDetails, NotificationItem } from "@/lib/types";

interface WorkspaceShellProps {
  children: React.ReactNode;
  workspace: any;
  workspaces: any[];
  currentUser: any;
  projects: any[];
  channels: any[];
  notifications: NotificationItem[];
  members: any[];
}

export function WorkspaceShell({
  children,
  workspace,
  workspaces,
  currentUser,
  projects,
  channels,
  notifications,
  members,
}: WorkspaceShellProps) {
  // Activate global keyboard shortcuts
  useKeyboardShortcuts({ workspaceSlug: workspace.slug });

  // Activate realtime subscription via SSE
  useRealtimeSubscription({ workspaceId: workspace.id });

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentWorkspace={workspace}
        workspaces={workspaces}
        currentUser={currentUser}
        projects={projects}
        channels={channels}
        unreadInboxCount={notifications.filter((n) => !n.isRead).length}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          workspaceSlug={workspace.slug}
          breadcrumbs={[
            { label: workspace.name, href: `/app/${workspace.slug}/dashboard` },
          ]}
          notifications={notifications}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>

      {/* Global Modals */}
      <CommandPalette workspaceSlug={workspace.slug} />
      <QuickCreateTaskDialog
        workspaceId={workspace.id}
        projects={projects}
        members={members}
      />
      <KeyboardShortcutsDialog />
    </div>
  );
}
