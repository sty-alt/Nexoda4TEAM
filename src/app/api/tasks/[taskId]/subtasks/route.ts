import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventBus } from "@/lib/events";

export async function POST(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title } = await req.json();
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      select: { workspaceId: true },
    });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const subtask = await prisma.subtask.create({
      data: {
        taskId: params.taskId,
        title: title.trim(),
        completed: false,
      },
    });

    eventBus.publish(task.workspaceId, {
      type: "task_updated",
      taskId: params.taskId,
    });

    return NextResponse.json({ success: true, subtask });
  } catch (err: any) {
    console.error("Create subtask error:", err);
    return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { subtaskId, completed, title } = await req.json();
    if (!subtaskId) {
      return NextResponse.json({ error: "subtaskId is required" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      select: { workspaceId: true },
    });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const updated = await prisma.subtask.update({
      where: { id: subtaskId },
      data: {
        completed: completed !== undefined ? completed : undefined,
        title: title !== undefined ? title.trim() : undefined,
      },
    });

    eventBus.publish(task.workspaceId, {
      type: "task_updated",
      taskId: params.taskId,
    });

    return NextResponse.json({ success: true, subtask: updated });
  } catch (err: any) {
    console.error("Update subtask error:", err);
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
  }
}
