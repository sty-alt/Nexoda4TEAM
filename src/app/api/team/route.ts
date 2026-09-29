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

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          include: {
            assignedTasks: {
              where: { workspaceId, status: { in: ["TODO", "IN_PROGRESS", "IN_REVIEW"] } },
              select: { id: true, estimateHours: true, priority: true },
            },
          },
        },
      },
    });

    const formatted = members.map((m) => {
      const activeTasksCount = m.user.assignedTasks.length;
      const totalEstimatedHours = m.user.assignedTasks.reduce(
        (acc, t) => acc + (t.estimateHours || 0),
        0
      );
      // Workload capacity calculation: 40h standard week
      const workloadPercent = Math.min(100, Math.round((totalEstimatedHours / 40) * 100));

      return {
        id: m.id,
        role: m.role,
        department: m.department || "Engineering",
        joinedAt: m.joinedAt,
        user: {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          avatar: m.user.avatar,
          title: m.user.title,
          status: m.user.status,
          presence: m.user.presence,
        },
        activeTasksCount,
        totalEstimatedHours,
        workloadPercent,
      };
    });

    return NextResponse.json({ members: formatted });
  } catch (err: any) {
    console.error("Team fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}
