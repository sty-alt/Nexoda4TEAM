import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventBus } from "@/lib/events";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return NextResponse.json({ error: "Channel ID required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: { channelId },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true, title: true },
        },
        reactions: {
          include: {
            user: { select: { name: true } },
          },
        },
        _count: { select: { replies: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ messages });
  } catch (err: any) {
    console.error("Fetch messages error:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { channelId, content, replyToId } = await req.json();

    if (!channelId || !content?.trim()) {
      return NextResponse.json({ error: "Channel ID and content are required" }, { status: 400 });
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      select: { workspaceId: true, name: true },
    });

    if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

    const message = await prisma.message.create({
      data: {
        channelId,
        senderId: user.id,
        content: content.trim(),
        replyToId: replyToId || undefined,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true, title: true },
        },
        reactions: true,
      },
    });

    // Broadcast message to all clients in workspace via SSE
    eventBus.publish(channel.workspaceId, {
      type: "message_received",
      channelId,
      message,
    });

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    console.error("Send message error:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
