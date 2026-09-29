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

    const entries = await prisma.timeEntry.findMany({
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
            estimateHours: true,
            project: { select: { name: true, color: true } },
          },
        },
      },
      orderBy: { startTime: "desc" },
      take: 50,
    });

    return NextResponse.json({ entries });
  } catch (err: any) {
    console.error("Fetch time entries error:", err);
    return NextResponse.json({ error: "Failed to fetch time entries" }, { status: 500 });
  }
}
