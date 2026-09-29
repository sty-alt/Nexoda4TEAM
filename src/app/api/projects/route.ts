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
      return NextResponse.json({ error: "Workspace ID is required" }, { status: 400 });
    }

    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: {
        team: true,
        _count: {
          select: { tasks: true },
        },
        tasks: {
          select: { id: true, status: true },
        },
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = projects.map((p) => {
      const total = p._count.tasks;
      const completed = p.tasks.filter((t) => t.status === "DONE").length;
      return {
        id: p.id,
        name: p.name,
        identifier: p.identifier,
        description: p.description,
        icon: p.icon,
        color: p.color,
        status: p.status,
        priority: p.priority,
        startDate: p.startDate,
        dueDate: p.dueDate,
        team: p.team,
        totalTasks: total,
        completedTasks: completed,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        members: p.members.map((m) => m.user),
      };
    });

    return NextResponse.json({ projects: formatted });
  } catch (err: any) {
    console.error("Projects fetch error:", err);
    return NextResponse.json({ error: "Failed to load projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const {
      workspaceId,
      name,
      identifier,
      description,
      color = "#6366f1",
      icon = "folder",
      priority = "MEDIUM",
      dueDate,
    } = body;

    if (!workspaceId || !name?.trim()) {
      return NextResponse.json({ error: "Name and workspace are required" }, { status: 400 });
    }

    const cleanIdentifier = (
      identifier || name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "PRJ")
    ).toUpperCase();

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name: name.trim(),
        identifier: cleanIdentifier,
        description: description?.trim() || null,
        color,
        icon,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (err: any) {
    console.error("Create project error:", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
