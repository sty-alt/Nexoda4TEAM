import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { docId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const doc = await prisma.document.findUnique({
      where: { id: params.docId },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        team: true,
        versions: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    return NextResponse.json({ document: doc });
  } catch (err: any) {
    console.error("Get document error:", err);
    return NextResponse.json({ error: "Failed to load document" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { docId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, content, isFavorite, icon } = await req.json();

    const existing = await prisma.document.findUnique({
      where: { id: params.docId },
    });

    if (!existing) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    // Save version history snapshot if content is changing substantially
    if (content && content !== existing.content) {
      await prisma.documentVersion.create({
        data: {
          documentId: existing.id,
          title: existing.title,
          content: existing.content,
          createdById: user.id,
        },
      });
    }

    const updated = await prisma.document.update({
      where: { id: params.docId },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        content: content !== undefined ? content : undefined,
        isFavorite: isFavorite !== undefined ? isFavorite : undefined,
        icon: icon !== undefined ? icon : undefined,
      },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (err: any) {
    console.error("Update document error:", err);
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { docId: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.document.delete({
      where: { id: params.docId },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete document error:", err);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
