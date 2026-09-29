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

    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      select: { workspaceId: true, assigneeId: true, identifier: true },
    });

    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const comment = await prisma.taskComment.create({
      data: {
        taskId: params.taskId,
        userId: user.id,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Notify assignee if not the author
    if (task.assigneeId && task.assigneeId !== user.id) {
      await prisma.notification.create({
        data: {
          workspaceId: task.workspaceId,
          userId: task.assigneeId,
          title: "New Comment on Task",
          message: `${user.name} commented on ${task.identifier}: "${content.slice(0, 50)}..."`,
          type: "COMMENT",
          link: `/app/tasks?task=${params.taskId}`,
        },
      });
    }

    eventBus.publish(task.workspaceId, {
      type: "task_updated",
      taskId: params.taskId,
    });

    return NextResponse.json({ success: true, comment });
  } catch (err: any) {
    console.error("Add comment error:", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
