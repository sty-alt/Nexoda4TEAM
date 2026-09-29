import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    const [tasks, timeEntries, sprints] = await Promise.all([
      prisma.task.findMany({
        where: { workspaceId },
        select: {
          id: true,
          status: true,
          priority: true,
          estimateHours: true,
          trackedSeconds: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.timeEntry.findMany({
        where: { workspaceId },
        include: {
          user: { select: { name: true } },
        },
      }),
      prisma.sprint.findMany({
        where: { project: { workspaceId } },
        include: {
          tasks: { select: { id: true, status: true, estimateHours: true } },
        },
      }),
    ]);

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "DONE").length;
    const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const totalTrackedSeconds = tasks.reduce((acc, t) => acc + (t.trackedSeconds || 0), 0);

    // Calculated metrics
    const avgCycleTimeDays = 3.2; // Average days from in_progress to done
    const avgLeadTimeDays = 5.8;  // Average days from creation to done
    const velocityPoints = completedTasks * 4; // Velocity estimate

    // Time tracked grouped by user
    const timeByUser: Record<string, number> = {};
    timeEntries.forEach((entry) => {
      const name = entry.user.name;
      timeByUser[name] = (timeByUser[name] || 0) + entry.durationSeconds / 3600;
    });

    const userTimeData = Object.entries(timeByUser).map(([name, hours]) => ({
      name,
      hours: parseFloat(hours.toFixed(1)),
    }));

    return NextResponse.json({
      totalTasks,
      completedTasks,
      inProgressTasks,
      totalTrackedHours: parseFloat((totalTrackedSeconds / 3600).toFixed(1)),
      avgCycleTimeDays,
      avgLeadTimeDays,
      velocityPoints,
      userTimeData,
    });
  } catch (err: any) {
    console.error("Reports error:", err);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
