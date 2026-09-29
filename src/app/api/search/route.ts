import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceSlug = searchParams.get("workspaceSlug");
    const query = searchParams.get("q")?.trim() || "";

    if (!workspaceSlug || !query) {
      return NextResponse.json({ tasks: [], docs: [], projects: [] });
    }

    const workspace = await prisma.workspace.findUnique({
      where: { slug: workspaceSlug },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // SQLite search (contains)
    const [tasks, docs, projects] = await Promise.all([
      prisma.task.findMany({
        where: {
          workspaceId: workspace.id,
          OR: [
            { title: { contains: query } },
            { identifier: { contains: query } },
            { description: { contains: query } },
          ],
        },
        take: 8,
        select: {
          id: true,
          identifier: true,
          title: true,
          status: true,
          priority: true,
        },
      }),
      prisma.document.findMany({
        where: {
          workspaceId: workspace.id,
          OR: [
            { title: { contains: query } },
            { content: { contains: query } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          icon: true,
        },
      }),
      prisma.project.findMany({
        where: {
          workspaceId: workspace.id,
          OR: [
            { name: { contains: query } },
            { identifier: { contains: query } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          identifier: true,
          color: true,
        },
      }),
    ]);

    return NextResponse.json({
      tasks,
      docs,
      projects,
    });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
