import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
      },
    });

    const workspaces = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      logo: m.workspace.logo,
      role: m.role,
      membersCount: m.workspace._count.members,
      projectsCount: m.workspace._count.projects,
    }));

    return NextResponse.json({ workspaces });
  } catch (err: any) {
    console.error("Fetch workspaces error:", err);
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 });
    }

    const slug =
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Math.floor(1000 + Math.random() * 9000);

    const workspace = await prisma.workspace.create({
      data: {
        name: name.trim(),
        slug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
            department: "Executive",
          },
        },
        channels: {
          create: [
            { name: "general", topic: "Company discussions" },
            { name: "announcements", topic: "General updates" },
          ],
        },
        teams: {
          create: [
            { name: "Engineering", identifier: "ENG", icon: "code", color: "#6366f1" },
          ],
        },
      },
    });

    return NextResponse.json({ success: true, workspace });
  } catch (err: any) {
    console.error("Create workspace error:", err);
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}
