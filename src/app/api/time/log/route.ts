import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId, durationSeconds, description } = await req.json();

    if (!taskId || !durationSeconds) {
      return NextResponse.json(
        { error: "Task ID and durationSeconds required" },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { workspaceId: true, trackedSeconds: true },
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    // Create time entry
    const entry = await prisma.timeEntry.create({
      data: {
        workspaceId: task.workspaceId,
        taskId,
        userId: user.id,
        durationSeconds: Math.round(durationSeconds),
        description: description?.trim() || "Work session",
        startTime: new Date(Date.now() - durationSeconds * 1000),
        endTime: new Date(),
        isRunning: false,
      },
    });

    // Update cumulative trackedSeconds on task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        trackedSeconds: (task.trackedSeconds || 0) + Math.round(durationSeconds),
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (err: any) {
    console.error("Log time error:", err);
    return NextResponse.json({ error: "Failed to log time" }, { status: 500 });
  }
}
