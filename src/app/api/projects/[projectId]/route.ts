import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project = await prisma.project.findUnique({
      where: { id: params.projectId },
      include: {
        team: true,
        sprints: {
          orderBy: { startDate: "desc" },
        },
        milestones: {
          orderBy: { dueDate: "asc" },
        },
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true, email: true, title: true } },
          },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, avatar: true } },
            subtasks: true,
            _count: { select: { comments: true } },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (err: any) {
    console.error("Get project error:", err);
    return NextResponse.json({ error: "Failed to load project" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { name, description, color, status, priority, dueDate } = body;

    const updated = await prisma.project.update({
      where: { id: params.projectId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description?.trim() : undefined,
        color: color !== undefined ? color : undefined,
        status: status !== undefined ? status : undefined,
        priority: priority !== undefined ? priority : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
      },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (err: any) {
    console.error("Update project error:", err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
