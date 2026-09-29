import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding realistic Acme Corp workspace data...");

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.messageReaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.channelMember.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.documentComment.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.githubItemLink.deleteMany();
  await prisma.taskLabelAssignment.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.taskAttachment.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = bcrypt.hashSync("demo123", 10);

  // 1. Users
  const alex = await prisma.user.create({
    data: {
      email: "alex@acme.com",
      passwordHash,
      name: "Alex Vance",
      title: "Lead Systems Architect",
      status: "Coding the core engine",
      presence: "ONLINE",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: "sarah@acme.com",
      passwordHash,
      name: "Sarah Chen",
      title: "Head of Product",
      status: "Reviewing Q4 Roadmaps",
      presence: "ONLINE",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
  });

  const oleg = await prisma.user.create({
    data: {
      email: "oleg@acme.com",
      passwordHash,
      name: "Oleg Ivanov",
      title: "Senior Full Stack Engineer",
      status: "Debugging WebSocket stream",
      presence: "ONLINE",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const elena = await prisma.user.create({
    data: {
      email: "elena@acme.com",
      passwordHash,
      name: "Elena Rostova",
      title: "Lead Product Designer",
      status: "Figma prototyping",
      presence: "AWAY",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  });

  const david = await prisma.user.create({
    data: {
      email: "david@acme.com",
      passwordHash,
      name: "David Miller",
      title: "DevOps & Cloud Engineer",
      status: "Deploying Kubernetes cluster",
      presence: "ONLINE",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Corporation",
      slug: "acme-corp",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80",
      ownerId: alex.id,
      members: {
        create: [
          { userId: alex.id, role: "OWNER", department: "Engineering" },
          { userId: sarah.id, role: "ADMIN", department: "Product" },
          { userId: oleg.id, role: "MANAGER", department: "Engineering" },
          { userId: elena.id, role: "MEMBER", department: "Design" },
          { userId: david.id, role: "MEMBER", department: "Infrastructure" },
        ],
      },
    },
  });

  // 3. Teams
  const teamEng = await prisma.team.create({
    data: {
      workspaceId: workspace.id,
      name: "Engineering",
      identifier: "ENG",
      icon: "code",
      color: "#6366f1",
      description: "Core platform, frontend, backend and mobile development",
      members: {
        create: [
          { userId: alex.id, role: "LEAD" },
          { userId: oleg.id, role: "MEMBER" },
          { userId: david.id, role: "MEMBER" },
        ],
      },
    },
  });

  const teamProduct = await prisma.team.create({
    data: {
      workspaceId: workspace.id,
      name: "Product & Design",
      identifier: "PRD",
      icon: "palette",
      color: "#ec4899",
      description: "Product strategy, UX research and design systems",
      members: {
        create: [
          { userId: sarah.id, role: "LEAD" },
          { userId: elena.id, role: "MEMBER" },
        ],
      },
    },
  });

  // 4. Projects
  const projectNexoda = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      teamId: teamEng.id,
      name: "Nexoda Core Platform",
      identifier: "NX",
      description: "Next-generation Everything App unified workspace engine",
      icon: "layers",
      color: "#6366f1",
      status: "IN_PROGRESS",
      priority: "URGENT",
      startDate: new Date("2026-08-01"),
      dueDate: new Date("2026-10-30"),
      members: {
        create: [
          { userId: alex.id, role: "OWNER" },
          { userId: oleg.id, role: "CONTRIBUTOR" },
          { userId: elena.id, role: "VIEWER" },
        ],
      },
    },
  });

  const projectMobile = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      teamId: teamEng.id,
      name: "Mobile App Companion",
      identifier: "MOB",
      description: "iOS & Android companion client with offline sync",
      icon: "smartphone",
      color: "#3b82f6",
      status: "IN_PROGRESS",
      priority: "HIGH",
      startDate: new Date("2026-08-15"),
      dueDate: new Date("2026-11-15"),
      members: {
        create: [
          { userId: oleg.id, role: "OWNER" },
          { userId: alex.id, role: "CONTRIBUTOR" },
        ],
      },
    },
  });

  const projectDesignSystem = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      teamId: teamProduct.id,
      name: "Design System 3.0",
      identifier: "DS",
      description: "Accessible, dark-mode native component library & tokens",
      icon: "palette",
      color: "#ec4899",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
      startDate: new Date("2026-07-01"),
      dueDate: new Date("2026-09-30"),
      members: {
        create: [
          { userId: elena.id, role: "OWNER" },
          { userId: sarah.id, role: "CONTRIBUTOR" },
        ],
      },
    },
  });

  // 5. Sprints
  const sprint24 = await prisma.sprint.create({
    data: {
      projectId: projectNexoda.id,
      name: "Sprint 24: Real-time Engine & Kanban",
      goal: "Ship collaborative Kanban board, drag & drop, and WebSocket sync",
      startDate: new Date("2026-08-25"),
      endDate: new Date("2026-09-08"),
      status: "ACTIVE",
    },
  });

  const sprint25 = await prisma.sprint.create({
    data: {
      projectId: projectNexoda.id,
      name: "Sprint 25: Notion Editor & Drive",
      goal: "Release Notion-style block editor and cloud drive storage",
      startDate: new Date("2026-09-09"),
      endDate: new Date("2026-09-23"),
      status: "UPCOMING",
    },
  });

  // 6. Labels
  const labelFrontend = await prisma.taskLabel.create({
    data: { workspaceId: workspace.id, name: "Frontend", color: "#3b82f6" },
  });
  const labelBackend = await prisma.taskLabel.create({
    data: { workspaceId: workspace.id, name: "Backend", color: "#10b981" },
  });
  const labelDesign = await prisma.taskLabel.create({
    data: { workspaceId: workspace.id, name: "Design", color: "#ec4899" },
  });
  const labelPerformance = await prisma.taskLabel.create({
    data: { workspaceId: workspace.id, name: "Performance", color: "#f59e0b" },
  });
  const labelSecurity = await prisma.taskLabel.create({
    data: { workspaceId: workspace.id, name: "Security", color: "#ef4444" },
  });

  // 7. Tasks
  const task1 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: projectNexoda.id,
      sprintId: sprint24.id,
      identifier: "NX-101",
      title: "Architect real-time event bus with SSE and presence heartbeats",
      description: "Implement low-latency server-sent events for broadcasting task transitions and typing indicators across connected clients.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      assigneeId: oleg.id,
      creatorId: alex.id,
      dueDate: new Date("2026-09-05"),
      estimateHours: 12,
      trackedSeconds: 14400, // 4 hours
      position: 1000,
      subtasks: {
        create: [
          { title: "Define typed RealtimeEventBus interface", completed: true, position: 1 },
          { title: "Hook up client subscription in useRealtimeSubscription", completed: true, position: 2 },
          { title: "Implement presence heartbeat detection", completed: false, position: 3 },
          { title: "Add reconnection backoff resilience", completed: false, position: 4 },
        ],
      },
      comments: {
        create: [
          {
            userId: alex.id,
            content: "Please ensure we handle client reconnections gracefully without duplicate messages.",
          },
          {
            userId: oleg.id,
            content: "Added backoff jitter with exponential retry. Testing across 4 browser tabs now.",
          },
        ],
      },
      labels: {
        create: [{ labelId: labelBackend.id }, { labelId: labelPerformance.id }],
      },
      githubLinks: {
        create: [
          {
            type: "PR",
            externalId: "#142",
            title: "feat(realtime): SSE event stream dispatcher",
            url: "https://github.com/acme/nexoda-app/pull/142",
            status: "OPEN",
            branch: "feature/realtime-sse",
          },
        ],
      },
    },
  });

  const task2 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: projectNexoda.id,
      sprintId: sprint24.id,
      identifier: "NX-102",
      title: "Interactive drag-and-drop Kanban board with column WIP constraints",
      description: "Silky 60fps drag and drop for cards between Backlog, Todo, In Progress, Review, and Done columns with optimistic UI updates.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: alex.id,
      creatorId: sarah.id,
      dueDate: new Date("2026-09-06"),
      estimateHours: 16,
      trackedSeconds: 18000, // 5 hours
      position: 2000,
      subtasks: {
        create: [
          { title: "Configure hello-pangea/dnd board layout", completed: true, position: 1 },
          { title: "Add optimistic task position reorder", completed: true, position: 2 },
          { title: "Implement quick task creation directly inside column", completed: true, position: 3 },
          { title: "Add WIP limits badge warning when exceeded", completed: false, position: 4 },
        ],
      },
      labels: {
        create: [{ labelId: labelFrontend.id }, { labelId: labelDesign.id }],
      },
    },
  });

  const task3 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: projectNexoda.id,
      sprintId: sprint24.id,
      identifier: "NX-103",
      title: "Motion-style day planner with Morning, Afternoon, and Evening time-blocking",
      description: "Allow dragging tasks from the backlog directly into personalized schedule blocks with integrated live timer execution.",
      status: "TODO",
      priority: "HIGH",
      assigneeId: alex.id,
      creatorId: sarah.id,
      dueDate: new Date("2026-09-08"),
      estimateHours: 14,
      position: 3000,
      labels: {
        create: [{ labelId: labelFrontend.id }],
      },
    },
  });

  const task4 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: projectNexoda.id,
      sprintId: sprint24.id,
      identifier: "NX-104",
      title: "Notion-like block editor with slash commands and checklist nodes",
      description: "Rich typography, headings, code blocks, quote callouts, and slash commands (/) for documents and knowledge base.",
      status: "IN_REVIEW",
      priority: "MEDIUM",
      assigneeId: elena.id,
      creatorId: sarah.id,
      dueDate: new Date("2026-09-07"),
      estimateHours: 18,
      trackedSeconds: 21600,
      position: 4000,
      labels: {
        create: [{ labelId: labelFrontend.id }, { labelId: labelDesign.id }],
      },
    },
  });

  const task5 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: projectNexoda.id,
      identifier: "NX-105",
      title: "Raycast-style Command Palette (Cmd+K) with instant fuzzy navigation",
      description: "Global keyboard shortcut triggering instant search across tasks, projects, docs, channels, and direct actions.",
      status: "DONE",
      priority: "HIGH",
      assigneeId: oleg.id,
      creatorId: alex.id,
      dueDate: new Date("2026-08-30"),
      estimateHours: 8,
      trackedSeconds: 28800,
      position: 5000,
      labels: {
        create: [{ labelId: labelFrontend.id }],
      },
    },
  });

  const task6 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: projectMobile.id,
      identifier: "MOB-201",
      title: "Design mobile bottom navigation and responsive drawer sidebar",
      description: "Compact touch-friendly mobile shell with quick switch between Inbox, Planner, Tasks, and Messages.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      assigneeId: elena.id,
      creatorId: sarah.id,
      dueDate: new Date("2026-09-12"),
      estimateHours: 10,
      trackedSeconds: 10800,
      position: 1000,
      labels: {
        create: [{ labelId: labelDesign.id }, { labelId: labelFrontend.id }],
      },
    },
  });

  const task7 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: projectNexoda.id,
      identifier: "NX-106",
      title: "Role-based access control (RBAC) permissions matrix",
      description: "Owner, Admin, Manager, Member, and Guest security policies with granular workspace resource controls.",
      status: "TODO",
      priority: "MEDIUM",
      assigneeId: david.id,
      creatorId: alex.id,
      dueDate: new Date("2026-09-15"),
      estimateHours: 10,
      position: 6000,
      labels: {
        create: [{ labelId: labelSecurity.id }],
      },
    },
  });

  const task8 = await prisma.task.create({
    data: {
      workspaceId: workspace.id,
      projectId: projectDesignSystem.id,
      identifier: "DS-301",
      title: "Handcrafted Dark & Light theme tokens with subtle 1px borders",
      description: "Refined zinc/neutral palette with electric indigo highlights, high-contrast text and zero cheap gradients.",
      status: "DONE",
      priority: "MEDIUM",
      assigneeId: elena.id,
      creatorId: sarah.id,
      dueDate: new Date("2026-08-28"),
      estimateHours: 6,
      trackedSeconds: 21600,
      position: 1000,
      labels: {
        create: [{ labelId: labelDesign.id }],
      },
    },
  });

  // 8. Calendar Events & Planner Blocks
  const today = new Date();
  const todayMorning = new Date(today);
  todayMorning.setHours(9, 30, 0, 0);
  const todayMorningEnd = new Date(today);
  todayMorningEnd.setHours(10, 0, 0, 0);

  const todayNoon = new Date(today);
  todayNoon.setHours(14, 0, 0, 0);
  const todayNoonEnd = new Date(today);
  todayNoonEnd.setHours(15, 30, 0, 0);

  await prisma.calendarEvent.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: alex.id,
        title: "Daily Engineering Sync & Sprint Standup",
        description: "Review blockers, PR merges, and Sprint 24 deliverables",
        startTime: todayMorning,
        endTime: todayMorningEnd,
        type: "MEETING",
      },
      {
        workspaceId: workspace.id,
        userId: alex.id,
        taskId: task1.id,
        title: "Focus Time: Realtime SSE Stream",
        description: "Deep work session on typed socket/SSE broadcasting",
        startTime: todayNoon,
        endTime: todayNoonEnd,
        type: "TASK_BLOCK",
      },
      {
        workspaceId: workspace.id,
        userId: sarah.id,
        title: "Q4 Product Strategy & Roadmap Review",
        description: "Finalize high-level milestones for enterprise readiness",
        startTime: new Date(today.getTime() + 86400000), // Tomorrow
        endTime: new Date(today.getTime() + 86400000 + 3600000),
        type: "MEETING",
      },
    ],
  });

  // 9. Time Tracking Entries
  await prisma.timeEntry.createMany({
    data: [
      {
        workspaceId: workspace.id,
        taskId: task1.id,
        userId: oleg.id,
        description: "Implemented event bus emitter and memory channels",
        durationSeconds: 7200, // 2 hours
        startTime: new Date(Date.now() - 14400000),
        endTime: new Date(Date.now() - 7200000),
        isRunning: false,
      },
      {
        workspaceId: workspace.id,
        taskId: task2.id,
        userId: alex.id,
        description: "Built Kanban column drag states and drop indicators",
        durationSeconds: 9000, // 2.5 hours
        startTime: new Date(Date.now() - 18000000),
        endTime: new Date(Date.now() - 9000000),
        isRunning: false,
      },
      {
        workspaceId: workspace.id,
        taskId: task4.id,
        userId: elena.id,
        description: "Configured block styling and checklist interactions",
        durationSeconds: 5400, // 1.5 hours
        startTime: new Date(Date.now() - 10000000),
        endTime: new Date(Date.now() - 4600000),
        isRunning: false,
      },
    ],
  });

  // 10. Documents & Knowledge Base
  await prisma.document.create({
    data: {
      workspaceId: workspace.id,
      teamId: teamEng.id,
      title: "Nexoda Engineering Architecture Handbook",
      icon: "book-open",
      isFavorite: true,
      authorId: alex.id,
      content: JSON.stringify({
        blocks: [
          { type: "h1", text: "Nexoda Engineering Architecture Handbook" },
          {
            type: "p",
            text: "Welcome to the central technical documentation for the Nexoda platform. This system is engineered around a unified, interconnected data graph: projects, tasks, planner, documents, and real-time chat live in a single reactive environment.",
          },
          { type: "h2", text: "Core Architecture Principles" },
          {
            type: "checklist",
            items: [
              { text: "Zero-latency optimistic UI updates for all task changes", checked: true },
              { text: "Server-Sent Events (SSE) unified broadcast bus", checked: true },
              { text: "Strict relational database integrity with Prisma ORM", checked: true },
              { text: "Keyboard-first navigation inspired by Linear and Raycast", checked: true },
            ],
          },
          { type: "h2", text: "Technology Stack" },
          {
            type: "p",
            text: "Nexoda is constructed on Next.js 14+ (App Router), TypeScript, Tailwind CSS, Radix UI primitives, Lucide Icons, and Prisma ORM with SQLite for zero-friction local development and seamless PostgreSQL production scaling.",
          },
        ],
      }),
    },
  });

  await prisma.document.create({
    data: {
      workspaceId: workspace.id,
      teamId: teamProduct.id,
      title: "Product Vision & Roadmap Q3-Q4",
      icon: "compass",
      isFavorite: true,
      authorId: sarah.id,
      content: JSON.stringify({
        blocks: [
          { type: "h1", text: "Product Vision & Strategic Priorities" },
          {
            type: "p",
            text: "The modern workforce is burdened with context switching across 10 disjointed tools: Jira for backlog, Notion for specs, Slack for chatter, Motion for planning, and Google Drive for files. Nexoda consolidates everything into one fluid SaaS platform.",
          },
          { type: "h2", text: "Q4 Major Deliverables" },
          {
            type: "ul",
            items: [
              "Deep bi-directional GitHub synchronization",
              "Motion-style AI daily planner scheduling",
              "Enterprise RBAC and security audit logs",
              "Native desktop and mobile companion experiences",
            ],
          },
        ],
      }),
    },
  });

  // 11. Chat Channels & Messages
  const chanGeneral = await prisma.channel.create({
    data: {
      workspaceId: workspace.id,
      name: "general",
      topic: "Company-wide discussions and updates",
      members: {
        create: [
          { userId: alex.id },
          { userId: sarah.id },
          { userId: oleg.id },
          { userId: elena.id },
          { userId: david.id },
        ],
      },
    },
  });

  const chanEng = await prisma.channel.create({
    data: {
      workspaceId: workspace.id,
      name: "engineering",
      topic: "Architecture, PRs, deployments, and technical RFCs",
      members: {
        create: [{ userId: alex.id }, { userId: oleg.id }, { userId: david.id }],
      },
    },
  });

  const chanDesign = await prisma.channel.create({
    data: {
      workspaceId: workspace.id,
      name: "design-critique",
      topic: "Figma specs, design system components, and micro-interactions",
      members: {
        create: [{ userId: elena.id }, { userId: sarah.id }, { userId: alex.id }],
      },
    },
  });

  // Messages in #general
  await prisma.message.create({
    data: {
      channelId: chanGeneral.id,
      senderId: sarah.id,
      content: "Good morning team! Sprint 24 is officially active. Our top goal is shipping the real-time Kanban and Motion-style Planner. Let's make it extraordinary! 🚀",
      reactions: {
        create: [
          { userId: alex.id, emoji: "🚀" },
          { userId: oleg.id, emoji: "🔥" },
          { userId: elena.id, emoji: "❤️" },
        ],
      },
    },
  });

  await prisma.message.create({
    data: {
      channelId: chanGeneral.id,
      senderId: alex.id,
      content: "All services and database schemas are synced. I've updated the Engineering Handbook in docs. Check out the new architecture blueprint!",
    },
  });

  await prisma.message.create({
    data: {
      channelId: chanEng.id,
      senderId: oleg.id,
      content: "PR #142 for the SSE event stream is up for review. Sub-second delivery across all active workspace clients tested successfully.",
    },
  });

  // 12. Notifications & Activity Logs
  await prisma.notification.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: alex.id,
        title: "Task Assigned",
        message: "Sarah Chen assigned you to NX-102: Interactive drag-and-drop Kanban board",
        type: "TASK_ASSIGNED",
        link: `/app/acme-corp/projects/${projectNexoda.id}`,
        isRead: false,
      },
      {
        workspaceId: workspace.id,
        userId: alex.id,
        title: "Sprint Retrospective Scheduled",
        message: "Sprint 24 Retrospective added to your calendar for Friday 4:00 PM",
        type: "DEADLINE",
        link: `/app/acme-corp/calendar`,
        isRead: false,
      },
      {
        workspaceId: workspace.id,
        userId: alex.id,
        title: "Mentioned in #engineering",
        message: "Oleg Ivanov mentioned you: 'PR #142 for the SSE event stream is up for review'",
        type: "MENTION",
        link: `/app/acme-corp/chat`,
        isRead: true,
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: alex.id,
        entityType: "TASK",
        entityId: task1.id,
        action: "STATUS_CHANGED",
        details: JSON.stringify({ from: "TODO", to: "IN_PROGRESS", task: "NX-101" }),
      },
      {
        workspaceId: workspace.id,
        userId: sarah.id,
        entityType: "PROJECT",
        entityId: projectNexoda.id,
        action: "UPDATED",
        details: JSON.stringify({ message: "Activated Sprint 24 with 8 core deliverables" }),
      },
      {
        workspaceId: workspace.id,
        userId: elena.id,
        entityType: "DOCUMENT",
        entityId: "doc-1",
        action: "CREATED",
        details: JSON.stringify({ title: "Design Tokens & Component Specs" }),
      },
    ],
  });

  // 13. File Drive sample items
  await prisma.driveFile.createMany({
    data: [
      {
        workspaceId: workspace.id,
        name: "Q4 Product Strategy.pdf",
        size: 2450000,
        mimeType: "application/pdf",
        uploaderId: sarah.id,
        isFolder: false,
      },
      {
        workspaceId: workspace.id,
        name: "Design Assets & Brand Tokens",
        size: 0,
        mimeType: "folder",
        uploaderId: elena.id,
        isFolder: true,
      },
      {
        workspaceId: workspace.id,
        name: "Architecture Diagram v2.png",
        size: 1120000,
        mimeType: "image/png",
        uploaderId: alex.id,
        isFolder: false,
      },
    ],
  });

  console.log("Successfully seeded Acme Corp demo dataset!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
