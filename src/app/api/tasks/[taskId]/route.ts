import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventBus } from "@/lib/events";

export async function GET(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      include: {
        assignee: { select: { id: true, name: true, avatar: true, email: true, title: true } },
        creator: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, identifier: true, color: true } },
        sprint: { select: { id: true, name: true } },
        subtasks: { orderBy: { position: "asc" } },
        comments: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        attachments: true,
        githubLinks: true,
        labels: { include: { label: true } },
      },
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    return NextResponse.json({ task });
  } catch (err: any) {
    console.error("Get task error:", err);
    return NextResponse.json({ error: "Failed to load task" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      status,
      priority,
      title,
      description,
      assigneeId,
      dueDate,
      estimateHours,
      position,
    } = body;

    const existing = await prisma.task.findUnique({
      where: { id: params.taskId },
    });

    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (estimateHours !== undefined) updateData.estimateHours = parseFloat(estimateHours) || 0;
    if (position !== undefined) updateData.position = position;

    const updatedTask = await prisma.task.update({
      where: { id: params.taskId },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, identifier: true, color: true } },
        subtasks: true,
        _count: { select: { comments: true } },
      },
    });

    // Record activity log if status changed
    if (status && status !== existing.status) {
      await prisma.activityLog.create({
        data: {
          workspaceId: existing.workspaceId,
          userId: user.id,
          entityType: "TASK",
          entityId: existing.id,
          action: "STATUS_CHANGED",
          details: JSON.stringify({
            identifier: existing.identifier,
            from: existing.status,
            to: status,
          }),
        },
      });
    }

    // Broadcast realtime event
    eventBus.publish(existing.workspaceId, {
      type: "task_updated",
      task: updatedTask,
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (err: any) {
    console.error("Update task error:", err);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.task.findUnique({
      where: { id: params.taskId },
    });

    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    await prisma.task.delete({
      where: { id: params.taskId },
    });

    eventBus.publish(existing.workspaceId, {
      type: "task_updated",
      deletedTaskId: params.taskId,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete task error:", err);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
