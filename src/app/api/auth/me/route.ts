import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
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

    return NextResponse.json({
      user,
      workspaces,
    });
  } catch (err: any) {
    console.error("Auth me error:", err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
