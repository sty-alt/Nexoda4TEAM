import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceSlug = searchParams.get("workspaceSlug");

    if (!workspaceSlug) {
      return NextResponse.json({ error: "Workspace slug required" }, { status: 400 });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const [
      myTasks,
      activeProjects,
      activeSprint,
      recentActivity,
      todayEvents,
      overdueTasks,
      timeEntriesToday,
    ] = await Promise.all([
      // My assigned open tasks
      prisma.task.findMany({
        where: {
          workspaceId: workspace.id,
          assigneeId: user.id,
          status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW"] },
        },
        include: {
          project: {
            select: { id: true, name: true, identifier: true, color: true },
          },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),

      // Active Projects with task counts
      prisma.project.findMany({
        where: {
          workspaceId: workspace.id,
          status: "IN_PROGRESS",
        },
        include: {
          _count: { select: { tasks: true } },
          tasks: {
            where: { status: "DONE" },
            select: { id: true },
          },
        },
        take: 4,
      }),

      // Active Sprint
      prisma.sprint.findFirst({
        where: {
          project: { workspaceId: workspace.id },
          status: "ACTIVE",
        },
        include: {
          project: { select: { name: true, identifier: true } },
          tasks: {
            select: { id: true, status: true, estimateHours: true },
          },
        },
      }),

      // Recent Activity Logs
      prisma.activityLog.findMany({
        where: { workspaceId: workspace.id },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),

      // Today's Calendar events
      prisma.calendarEvent.findMany({
        where: {
          workspaceId: workspace.id,
          userId: user.id,
          startTime: { gte: startOfToday, lte: endOfToday },
        },
        orderBy: { startTime: "asc" },
      }),

      // Overdue tasks
      prisma.task.findMany({
        where: {
          workspaceId: workspace.id,
          assigneeId: user.id,
          status: { notIn: ["DONE", "CANCELED"] },
          dueDate: { lt: startOfToday },
        },
        select: {
          id: true,
          identifier: true,
          title: true,
          dueDate: true,
          priority: true,
        },
      }),

      // Time logged today
      prisma.timeEntry.findMany({
        where: {
          workspaceId: workspace.id,
          userId: user.id,
          startTime: { gte: startOfToday },
        },
        select: { durationSeconds: true },
      }),
    ]);

    const totalTimeLoggedToday = timeEntriesToday.reduce(
      (acc, curr) => acc + curr.durationSeconds,
      0
    );

    const formattedProjects = activeProjects.map((p) => {
      const total = p._count.tasks;
      const completed = p.tasks.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        id: p.id,
        name: p.name,
        identifier: p.identifier,
        color: p.color,
        status: p.status,
        totalTasks: total,
        completedTasks: completed,
        percent,
      };
    });

    let sprintProgress = null;
    if (activeSprint) {
      const total = activeSprint.tasks.length;
      const done = activeSprint.tasks.filter((t) => t.status === "DONE").length;
      const inProgress = activeSprint.tasks.filter((t) => t.status === "IN_PROGRESS").length;
      const percent = total > 0 ? Math.round((done / total) * 100) : 0;
      sprintProgress = {
        id: activeSprint.id,
        name: activeSprint.name,
        goal: activeSprint.goal,
        projectName: activeSprint.project.name,
        total,
        done,
        inProgress,
        percent,
      };
    }

    return NextResponse.json({
      myTasks,
      activeProjects: formattedProjects,
      activeSprint: sprintProgress,
      recentActivity,
      todayEvents,
      overdueTasks,
      totalTimeLoggedToday,
    });
  } catch (err: any) {
    console.error("Dashboard error:", err);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
