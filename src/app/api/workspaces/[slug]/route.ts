import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = params;

    const workspace = await prisma.workspace.findUnique({
      where: { slug },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                title: true,
                presence: true,
                status: true,
              },
            },
          },
        },
        teams: true,
        projects: {
          select: {
            id: true,
            name: true,
            identifier: true,
            icon: true,
            color: true,
            status: true,
            _count: {
              select: { tasks: true },
            },
          },
        },
        channels: {
          select: {
            id: true,
            name: true,
            isPrivate: true,
            type: true,
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const userMembership = workspace.members.find((m) => m.userId === user.id);
    if (!userMembership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      workspace,
      currentUserRole: userMembership.role,
    });
  } catch (err: any) {
    console.error("Get workspace by slug error:", err);
    return NextResponse.json({ error: "Failed to load workspace" }, { status: 500 });
  }
}
