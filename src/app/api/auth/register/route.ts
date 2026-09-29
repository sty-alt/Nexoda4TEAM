import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, password, workspaceName } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const wsTitle = workspaceName?.trim() || `${name}'s Workspace`;
    const wsSlug =
      wsTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
      "-" +
      Math.floor(1000 + Math.random() * 9000);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash: hashPassword(password),
        workspaceMembers: {
          create: {
            role: "OWNER",
            workspace: {
              create: {
                name: wsTitle,
                slug: wsSlug,
                ownerId: "temp", // Will update after
                channels: {
                  create: [
                    { name: "general", topic: "Company-wide discussions" },
                    { name: "announcements", topic: "Key updates & milestones" },
                  ],
                },
                teams: {
                  create: [
                    { name: "Engineering", identifier: "ENG", icon: "code", color: "#6366f1" },
                    { name: "Product", identifier: "PRD", icon: "box", color: "#3b82f6" },
                  ],
                },
              },
            },
          },
        },
      },
      include: {
        workspaceMembers: {
          include: {
            workspace: true,
          },
        },
      },
    });

    // Update ownerId on created workspace
    const createdWs = user.workspaceMembers[0]?.workspace;
    if (createdWs) {
      await prisma.workspace.update({
        where: { id: createdWs.id },
        data: { ownerId: user.id },
      });
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      workspace: createdWs,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
