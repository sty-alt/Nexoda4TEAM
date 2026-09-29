import React from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceShell } from "./workspace-shell";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceSlug: string };
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug: params.workspaceSlug },
    include: {
      projects: {
        select: {
          id: true,
          name: true,
          identifier: true,
          color: true,
        },
      },
      channels: {
        select: {
          id: true,
          name: true,
          isPrivate: true,
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (!workspace) {
    notFound();
  }

  // Get user memberships to pass to workspace switcher
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: user.id },
    include: {
      workspace: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
        },
      },
    },
  });

  const workspaces = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    logo: m.workspace.logo,
    role: m.role,
  }));

  const notifications = await prisma.notification.findMany({
    where: { workspaceId: workspace.id, userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      link: true,
      isRead: true,
      createdAt: true,
    },
  });

  const formattedNotifications = notifications.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  const membersList = workspace.members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
    avatar: m.user.avatar,
  }));

  return (
    <WorkspaceShell
      workspace={workspace}
      workspaces={workspaces}
      currentUser={user}
      projects={workspace.projects}
      channels={workspace.channels}
      notifications={formattedNotifications}
      members={membersList}
    >
      {children}
    </WorkspaceShell>
  );
}
