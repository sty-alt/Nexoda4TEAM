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

    const events = await prisma.calendarEvent.findMany({
      where: {
        workspaceId,
        userId: user.id,
      },
      include: {
        task: {
          select: {
            id: true,
            identifier: true,
            title: true,
            priority: true,
            project: { select: { name: true, color: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json({ events });
  } catch (err: any) {
    console.error("Calendar fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { workspaceId, taskId, title, description, startTime, endTime, type = "MEETING" } = body;

    if (!workspaceId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Workspace, title, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const event = await prisma.calendarEvent.create({
      data: {
        workspaceId,
        userId: user.id,
        taskId: taskId || undefined,
        title: title.trim(),
        description: description?.trim() || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type,
      },
      include: {
        task: {
          select: {
            id: true,
            identifier: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (err: any) {
    console.error("Create calendar event error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, startTime, endTime, title } = await req.json();
    if (!id) return NextResponse.json({ error: "Event ID required" }, { status: 400 });

    const updated = await prisma.calendarEvent.update({
      where: { id },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        title: title !== undefined ? title.trim() : undefined,
      },
    });

    return NextResponse.json({ success: true, event: updated });
  } catch (err: any) {
    console.error("Update event error:", err);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.calendarEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete event error:", err);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
