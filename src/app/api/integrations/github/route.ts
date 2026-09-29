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

    const repos = await prisma.githubRepository.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    const linkedItems = await prisma.githubItemLink.findMany({
      include: {
        task: {
          select: { id: true, identifier: true, title: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ repos, linkedItems });
  } catch (err: any) {
    console.error("Github integration error:", err);
    return NextResponse.json({ error: "Failed to load GitHub integration" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId, repoName, action, taskId, prNumber, prTitle, prUrl } = await req.json();

    if (action === "link_pr") {
      if (!taskId || !prNumber) {
        return NextResponse.json({ error: "taskId and prNumber required" }, { status: 400 });
      }

      const item = await prisma.githubItemLink.create({
        data: {
          taskId,
          type: "PR",
          externalId: `#${prNumber}`,
          title: prTitle || `PR #${prNumber}`,
          url: prUrl || `https://github.com/acme/nexoda-app/pull/${prNumber}`,
          status: "OPEN",
          branch: "main",
        },
      });

      return NextResponse.json({ success: true, item });
    }

    // Connect repository
    if (!workspaceId || !repoName?.trim()) {
      return NextResponse.json({ error: "repoName required" }, { status: 400 });
    }

    const repo = await prisma.githubRepository.create({
      data: {
        workspaceId,
        repoName: repoName.trim(),
        repoUrl: `https://github.com/${repoName.trim()}`,
        defaultBranch: "main",
        isConnected: true,
      },
    });

    return NextResponse.json({ success: true, repo });
  } catch (err: any) {
    console.error("GitHub integration error:", err);
    return NextResponse.json({ error: "Operation failed" }, { status: 500 });
  }
}
