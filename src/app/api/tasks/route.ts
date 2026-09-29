import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventBus } from "@/lib/events";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const projectId = searchParams.get("projectId");
    const sprintId = searchParams.get("sprintId");
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assigneeId");
    const query = searchParams.get("q");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    const where: any = { workspaceId };
    if (projectId) where.projectId = projectId;
    if (sprintId) where.sprintId = sprintId;
    if (status) where.status = status;
    if (assigneeId) where.assigneeId = assigneeId;
    if (query) {
      where.OR = [
        { title: { contains: query } },
        { identifier: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        creator: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true, identifier: true, color: true },
        },
        subtasks: {
          orderBy: { position: "asc" },
        },
        labels: {
          include: { label: true },
        },
        _count: {
          select: { comments: true, attachments: true },
        },
      },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ tasks });
  } catch (err: any) {
    console.error("Tasks fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      workspaceId,
      projectId,
      sprintId,
      title,
      description,
      status = "TODO",
      priority = "MEDIUM",
      assigneeId,
      dueDate,
      estimateHours = 0,
    } = body;

    if (!workspaceId || !projectId || !title?.trim()) {
      return NextResponse.json(
        { error: "Workspace, project, and title are required" },
        { status: 400 }
      );
    }

    // Get project identifier prefix and count of tasks in project to generate e.g. "NX-105"
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { _count: { select: { tasks: true } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const nextNumber = project._count.tasks + 101;
    const identifier = `${project.identifier}-${nextNumber}`;

    const task = await prisma.task.create({
      data: {
        workspaceId,
        projectId,
        sprintId: sprintId || undefined,
        identifier,
        title: title.trim(),
        description: description?.trim() || null,
        status,
        priority,
        assigneeId: assigneeId || undefined,
        creatorId: user.id,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        estimateHours: parseFloat(estimateHours) || 0,
      },
      include: {
        assignee: { select: { id: true, name: true, avatar: true } },
        project: { select: { id: true, name: true, identifier: true, color: true } },
        subtasks: true,
        _count: { select: { comments: true } },
      },
    });

    // Record activity log
    await prisma.activityLog.create({
      data: {
        workspaceId,
        userId: user.id,
        entityType: "TASK",
        entityId: task.id,
        action: "CREATED",
        details: JSON.stringify({ identifier: task.identifier, title: task.title }),
      },
    });

    // Notify assignee if assigned to someone else
    if (assigneeId && assigneeId !== user.id) {
      await prisma.notification.create({
        data: {
          workspaceId,
          userId: assigneeId,
          title: "New Task Assigned",
          message: `${user.name} assigned you to ${task.identifier}: ${task.title}`,
          type: "TASK_ASSIGNED",
          link: `/app/tasks?task=${task.id}`,
        },
      });
      eventBus.publish(workspaceId, {
        type: "notification_created",
        title: "New Task Assigned",
        message: `${user.name} assigned you to ${task.identifier}`,
      });
    }

    // Broadcast realtime event
    eventBus.publish(workspaceId, {
      type: "task_created",
      task,
    });

    return NextResponse.json({ success: true, task });
  } catch (err: any) {
    console.error("Create task error:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
