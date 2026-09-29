import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const parentFolderId = searchParams.get("folderId");

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    const files = await prisma.driveFile.findMany({
      where: {
        workspaceId,
        parentFolderId: parentFolderId || null,
      },
      include: {
        uploader: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: [{ isFolder: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ files });
  } catch (err: any) {
    console.error("Drive files error:", err);
    return NextResponse.json({ error: "Failed to fetch drive files" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId, name, isFolder = false, size = 102400, mimeType } = await req.json();

    if (!workspaceId || !name?.trim()) {
      return NextResponse.json({ error: "Name and workspaceId required" }, { status: 400 });
    }

    const file = await prisma.driveFile.create({
      data: {
        workspaceId,
        name: name.trim(),
        isFolder,
        size: isFolder ? 0 : size,
        mimeType: isFolder ? "folder" : mimeType || "application/octet-stream",
        uploaderId: user.id,
      },
      include: {
        uploader: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ success: true, file });
  } catch (err: any) {
    console.error("Create drive file error:", err);
    return NextResponse.json({ error: "Failed to create file" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.driveFile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete drive file error:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
