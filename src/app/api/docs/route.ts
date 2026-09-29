import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const teamId = searchParams.get("teamId");
    const favoriteOnly = searchParams.get("favorite") === "true";

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    const where: any = { workspaceId };
    if (teamId) where.teamId = teamId;
    if (favoriteOnly) where.isFavorite = true;

    const documents = await prisma.document.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        team: { select: { id: true, name: true, color: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (err: any) {
    console.error("Fetch documents error:", err);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId, teamId, title = "Untitled Document" } = await req.json();

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        workspaceId,
        teamId: teamId || undefined,
        title: title.trim() || "Untitled Document",
        icon: "file-text",
        authorId: user.id,
        content: JSON.stringify({
          blocks: [
            { type: "h1", text: title.trim() || "Untitled Document" },
            { type: "p", text: "Start writing specifications, notes, or press '/' for commands..." },
          ],
        }),
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (err: any) {
    console.error("Create document error:", err);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
