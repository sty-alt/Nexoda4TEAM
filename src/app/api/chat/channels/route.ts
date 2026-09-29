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

    const channels = await prisma.channel.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { messages: true, members: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true, sender: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ channels });
  } catch (err: any) {
    console.error("Fetch channels error:", err);
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId, name, topic, isPrivate = false } = await req.json();

    if (!workspaceId || !name?.trim()) {
      return NextResponse.json({ error: "Workspace and channel name are required" }, { status: 400 });
    }

    const cleanName = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "-");

    const channel = await prisma.channel.create({
      data: {
        workspaceId,
        name: cleanName,
        topic: topic?.trim() || null,
        isPrivate,
        members: {
          create: { userId: user.id },
        },
      },
    });

    return NextResponse.json({ success: true, channel });
  } catch (err: any) {
    console.error("Create channel error:", err);
    return NextResponse.json({ error: "Failed to create channel" }, { status: 500 });
  }
}
