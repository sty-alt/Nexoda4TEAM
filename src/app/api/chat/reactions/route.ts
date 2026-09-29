import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventBus } from "@/lib/events";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messageId, emoji } = await req.json();

    if (!messageId || !emoji) {
      return NextResponse.json({ error: "Message ID and emoji required" }, { status: 400 });
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { channel: { select: { workspaceId: true } } },
    });

    if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

    const existing = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: user.id,
          emoji,
        },
      },
    });

    if (existing) {
      // Toggle off
      await prisma.messageReaction.delete({
        where: { id: existing.id },
      });
    } else {
      // Add reaction
      await prisma.messageReaction.create({
        data: {
          messageId,
          userId: user.id,
          emoji,
        },
      });
    }

    eventBus.publish(message.channel.workspaceId, {
      type: "message_received",
      channelId: message.channelId,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reaction error:", err);
    return NextResponse.json({ error: "Failed to toggle reaction" }, { status: 500 });
  }
}
