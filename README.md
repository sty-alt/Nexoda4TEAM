# Nexoda4TEAM — The Team Workspace

**Nexoda4TEAM** is a team workspace combining:
- **Project & Issue Management** (Linear / Jira)
- **Interactive Kanban & List Views** with 60fps drag & drop
- **Motion-Style Personal Day Planner** with Morning/Afternoon/Evening time blocking
- **Real-Time Live Task Timer & Workload Tracking**
- **Notion-Style Block Editor & Knowledge Base** with slash commands (`/`), checklists, and code snippets
- **Team Chat & Real-Time Direct Messaging** with channels (`#general`, `#engineering`), threads, and emoji reactions
- **Unified Inbox** for assignments, mentions, and deadline alerts
- **Cloud File Storage Drive**
- **Bi-directional GitHub Integration** (connecting PRs, issues, and commit hashes to tasks)
- **Velocity, Cycle Time & Burndown Reports**
- **Admin Panel, Security Audit Logs & Granular RBAC Permissions**
- **Sleek Marketing Website & Pricing Matrix**

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node.js v22)
- **npm** or **pnpm**

### 2. Installation
```bash
# Clone the repository
git clone <repo-url> Nexoda4TEAM
cd Nexoda4TEAM

# Install dependencies
npm install
```

### 3. Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```

Default `.env` configuration (SQLite zero-configuration out-of-the-box):
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-unique-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Nexoda4TEAM"
```

### 4. Database Setup & Demo Seed Data
Initialize the database and populate the realistic **Acme Corporation** demo dataset:
```bash
# Sync schema to SQLite database
npm run db:push

# Populate realistic demo dataset (Alex Vance, Sarah Chen, Oleg Ivanov, tasks, sprints, documents, chat messages)
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🔑 Demo Login Accounts

Pre-seeded instant test accounts (Password: `demo123`):
| Name | Email | Role | Focus |
|---|---|---|---|
| **Alex Vance** | `alex@acme.com` | Lead Systems Architect (Owner) | Core platform & engineering |
| **Sarah Chen** | `sarah@acme.com` | Head of Product (Admin) | Product vision & roadmaps |
| **Oleg Ivanov** | `oleg@acme.com` | Senior Full Stack Engineer (Manager) | Realtime engine & mobile |
| **Elena Rostova** | `elena@acme.com` | Lead Product Designer (Member) | Design system & UI tokens |
| **David Miller** | `david@acme.com` | DevOps & Cloud Engineer (Member) | Cloud infrastructure & security |

> **Tip:** You can also use the **1-Click Demo Login** buttons directly on the `/login` page for instantaneous one-click access!

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── (auth)/                    # Login, Register, Forgot Password, Onboarding
│   ├── (app)/app/[workspaceSlug]/ # Core Workspace Application
│   │   ├── dashboard/             # Customizable modular widgets
│   │   ├── projects/              # Projects overview & roadmaps
│   │   ├── projects/[projectId]/  # Kanban, List, Sprints
│   │   ├── tasks/                 # Unified issues queue
│   │   ├── planner/               # Motion-style Day Planner
│   │   ├── calendar/              # Month / Week / Day schedule
│   │   ├── docs/                  # Notion-style documents & knowledge base
│   │   ├── chat/                  # Team channels, DMs, real-time stream
│   │   ├── inbox/                 # Unified notifications center
│   │   ├── team/                  # Team directory & workload capacity
│   │   ├── drive/                 # Cloud file explorer
│   │   ├── reports/               # Velocity & cycle time analytics
│   │   ├── settings/              # Profile, Workspace, RBAC, API keys
│   │   └── admin/                 # System health & audit logs
│   ├── api/                       # Typed App Router REST API endpoints
│   ├── page.tsx                   # Premium SaaS Landing Page & Pricing
│   └── layout.tsx                 # Root layout with providers
├── components/
│   ├── ui/                        # Radix UI + Tailwind design tokens
│   ├── layout/                    # Sidebar, Topbar, WorkspaceSwitcher, UserNav
│   ├── kanban/                    # Drag-and-drop Kanban Board
│   ├── tasks/                     # Task list, Task detail drawer, Subtasks
│   ├── editor/                    # Notion-like block editor & slash menu
│   ├── search/                    # Command Palette (Cmd+K)
│   └── timer/                     # Live time tracker widget
├── lib/
│   ├── prisma.ts                  # Prisma Client singleton
│   ├── auth.ts                    # JWT token creation, verification & session handling
│   ├── events.ts                  # Real-time Server-Sent Events (SSE) bus
│   ├── types.ts                   # TypeScript domain models
│   └── utils.ts                   # Formatting and class utilities
└── store/
    ├── useUIStore.ts              # Sidebar, command palette, shortcuts, theme
    ├── useTimerStore.ts           # Live timer clock & task attribution
    └── useWorkspaceStore.ts       # Workspace context
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Description |
|---|---|
| `⌘ K` / `Ctrl K` | Open Raycast-style Global Command Palette / Fast Search |
| `C` or `N` | Quick create task / issue from anywhere |
| `?` | Open keyboard shortcuts modal |
| `[` | Toggle left sidebar collapse/expand |
| `G` then `P` | Navigate to Projects |
| `G` then `T` | Navigate to Tasks |
| `G` then `I` | Navigate to Inbox |
| `G` then `C` | Navigate to Calendar |
| `G` then `D` | Navigate to Documents |

---

## 🚀 Production Deployment

### Building the Project
```bash
npm run build
npm run start
```

### PostgreSQL Production Migration
To connect to an external PostgreSQL database (e.g. AWS RDS, Supabase, Neon):
1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your PostgreSQL connection string in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/nexoda?sslmode=require"
   ```
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```
