"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Kanban,
  Clock,
  FileText,
  MessageSquare,
  GitBranch,
  Shield,
  Star,
  ChevronDown,
  Command,
  Bell,
  Video,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  Calendar,
  Search,
  Check,
  FolderGit2,
  Lock,
  GitPullRequest,
  CheckSquare,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CosmicHeroBeam } from "@/components/landing/cosmic-hero-beam";
import { LoopVideo } from "@/components/landing/loop-video";

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const pricingTiers = [
    {
      name: "Free Starter",
      desc: "For small teams discovering a unified flow",
      price: "$0",
      period: "forever",
      features: [
        "Up to 5 team members",
        "Unlimited tasks & Kanban boards",
        "Personal day planner",
        "Basic document editor",
        "Community chat channels",
      ],
      cta: "Get Started Free",
      href: "/login",
      popular: false,
    },
    {
      name: "Pro",
      desc: "For fast-growing teams demanding speed and collaboration",
      price: billingPeriod === "annual" ? "$12" : "$15",
      period: "per user / month",
      features: [
        "Unlimited workspace members",
        "Motion-style time blocking & timer",
        "Full Notion-like knowledge base",
        "Real-time team chat & DMs",
        "GitHub bi-directional sync",
        "Velocity & cycle time reports",
      ],
      cta: "Start 14-Day Pro Trial",
      href: "/login",
      popular: true,
    },
    {
      name: "Business",
      desc: "Advanced automation, unlimited file drive, and RBAC",
      price: billingPeriod === "annual" ? "$24" : "$29",
      period: "per user / month",
      features: [
        "Everything in Pro",
        "Granular RBAC permission matrix",
        "Cloud File Drive 500GB",
        "Custom workflow automations",
        "Audit log exports & SSO",
        "Priority 24/7 dedicated support",
      ],
      cta: "Upgrade to Business",
      href: "/login",
      popular: false,
    },
    {
      name: "Enterprise",
      desc: "Custom deployment, SLA guarantee & security compliance",
      price: "Custom",
      period: "contact sales",
      features: [
        "Dedicated isolated database instance",
        "Custom data residency & HIPAA",
        "99.99% uptime SLA",
        "Dedicated customer success architect",
        "Custom integration connectors",
      ],
      cta: "Contact Enterprise Team",
      href: "/login",
      popular: false,
    },
  ];

  const faqs = [
    {
      q: "How does Nexoda replace 5 separate SaaS tools?",
      a: "Nexoda unites the speed of Linear, the rich block documentation of Notion, the day planning of Motion, and the real-time channels of Slack onto one reactive relational graph. When you assign an issue, it appears on your day planner, links to specifications, and updates team discussions without context switching.",
    },
    {
      q: "Is there a ready-to-test demo?",
      a: "Yes! Simply click 'SEE IN ACTION' and use the 1-Click Instant Demo Login (Alex Vance, Sarah Chen, or Oleg Ivanov) with password 'demo123' to explore a fully populated workspace.",
    },
    {
      q: "How does bidirectional GitHub synchronization work?",
      a: "Nexoda functions as an advanced front-end for GitHub. Changes made to internal tasks propagate to linked PRs and Issues, and GitHub webhook events instantly update status, assignees, and branch merges in real time.",
    },
    {
      q: "Can I host Nexoda on-premises or migrate to PostgreSQL?",
      a: "Yes. Nexoda runs on Prisma ORM. It ships configured for zero-dependency SQLite out of the box, and can seamlessly point to PostgreSQL, MySQL, or CockroachDB via a single environment variable.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#030306] text-white selection:bg-cyan-500/20 selection:text-white font-sans overflow-x-hidden">
      {/* Top Navbar (Huly Minimalist Style) */}
      <header className="fixed left-0 right-0 top-0 z-50 h-16 border-b border-white/[0.06] bg-[#090a0c]/40 px-4 sm:px-8 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-xs shadow-md shadow-indigo-500/30">
              N
            </div>
            <span className="font-bold text-sm tracking-tight text-white">Nexoda4TEAM</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-medium">
            <a href="#productivity" className="hover:text-white transition-colors">
              Productivity
            </a>
            <a href="#virtual-office" className="hover:text-white transition-colors">
              Virtual Office
            </a>
            <a href="#github" className="hover:text-white transition-colors">
              GitHub Sync
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-zinc-300 hover:text-white hover:border-white/20 transition-colors"
          >
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>Star Us</span>
          </a>

          <Button asChild variant="ghost" size="sm" className="text-xs text-zinc-300 hover:text-white hover:bg-white/[0.06] h-8">
            <Link href="/login">SIGN IN</Link>
          </Button>
          <Button asChild size="sm" className="text-xs font-semibold bg-white text-black hover:bg-zinc-200 h-8 rounded-full px-4">
            <Link href="/login">SIGN UP</Link>
          </Button>
        </div>
      </header>

      {/* Hero — Huly plate: 1920×1438 lighten-blend video inside the 1280 container */}
      <section className="hero relative overflow-hidden bg-[#090a0c] pt-[92px] min-h-[780px] md:pt-24 lg:h-[1078px] lg:min-h-0 lg:pt-28 xl:h-[1438px] xl:pt-[184px]">
        <div className="relative mx-auto flex h-full max-w-[1280px] flex-col px-8">
          {/* Title — gradient text matching Huly: white→lavender→pink-white */}
          <h1 className="relative z-30 max-w-[616px] bg-gradient-to-br from-white from-[30%] via-[#d5d8f6] via-[80%] to-[#fdf7fe] bg-clip-text font-semibold text-[84px] leading-[0.9] tracking-tight text-transparent lg:max-w-[528px] lg:text-[72px] md:text-[56px] sm:text-[32px]">
            Everything App for your teams
          </h1>

          <p className="relative z-30 mt-5 max-w-md text-[18px] leading-snug tracking-tight text-white/60 lg:mt-4 md:text-[16px] sm:text-[15px]">
            Nexoda4TEAM, an open-source platform, brings project management, documentation, planning, and team communication together.
          </p>

          {/* CTA Button — exact Huly anatomy: bg-[#d1d1d1], dual radial flare layers, text-[#5A250A] */}
          <div className="mt-11 lg:mt-9 md:mt-7 sm:mt-5">
            <div className="relative inline-flex items-center z-10">
              {/* Outer glow ring */}
              <div className="absolute left-1/2 top-1/2 h-[calc(100%+9px)] w-[calc(100%+9px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 bg-gradient-to-r from-orange-400/40 via-amber-300/30 to-orange-400/40 blur-sm" />
              <Link
                href="/login"
                className="group relative z-10 inline-flex items-center justify-center h-10 rounded-full border border-white/60 bg-[#d1d1d1] px-16 overflow-hidden transition-all hover:scale-[1.02]"
              >
                {/* Radial flare layer 1 — circular warm glow */}
                <div
                  className="absolute -z-10 flex w-[204px] items-center justify-center"
                  style={{ transform: "translateX(105px) translateZ(0)" }}
                >
                  <div className="absolute top-1/2 h-[121px] w-[121px] -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,#FFFFF5_3.5%,#FFAA81_26.5%,#FFDA9F_37.5%,rgba(255,170,129,0.50)_49%,rgba(210,106,58,0.00)_92.5%)]" />
                  <div className="absolute top-1/2 h-[103px] w-[204px] -translate-y-1/2 bg-[radial-gradient(43.3%_44.23%_at_50%_49.51%,#FFFFF7_29%,#FFFACD_48.5%,#F4D2BF_60.71%,rgba(214,211,210,0.00)_100%)] blur-[5px]" />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-tight text-[#5A250A]">See in Action</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 9" className="ml-1 h-[9px] w-[17px] text-[#5A250A]">
                  <path fill="currentColor" fillRule="evenodd" d="m12.495 0 4.495 4.495-4.495 4.495-.99-.99 2.805-2.805H0v-1.4h14.31L11.505.99z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Stage: same box Huly uses for the video + product shot */}
          <div className="relative z-20 mx-auto mt-10 w-full max-w-[1100px] md:mt-14 lg:absolute lg:-bottom-[39px] lg:left-0 lg:mx-0 lg:mt-0 lg:aspect-[1.067842] lg:w-[1220px] lg:max-w-none xl:bottom-0 xl:left-6 xl:w-[1574px]">
            <CosmicHeroBeam />

            <div className="relative lg:absolute lg:bottom-[138px] lg:left-9 lg:w-[873px] xl:bottom-[141px] xl:left-2 xl:w-[1024px]">
              <div className="relative overflow-hidden rounded-t-[10px] rounded-b-2xl border border-white/10 bg-[#07070a]/90 text-left shadow-2xl backdrop-blur-2xl">
                {/* Rim light where the portal meets the window — baked into Huly's product plate */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[2px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 4%, #ffb07a 16%, #fff6e8 42%, #ffffff 50%, #c8e4ff 58%, #7aa8ff 84%, transparent 96%)",
                    boxShadow:
                      "0 0 18px 3px rgba(200, 220, 255, 0.45), 0 0 40px 8px rgba(255, 160, 100, 0.18)",
                  }}
                />
            {/* Window Titlebar */}
            <div className="h-10 border-b border-white/[0.08] px-4 flex items-center justify-between bg-[#0a0a0f]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                  <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400 pl-3 border-l border-white/[0.08]">
                  <span className="font-semibold text-white">Nexoda4TEAM</span>
                  <span>/</span>
                  <span>Acme Platform</span>
                  <span>/</span>
                  <span className="text-indigo-400">Issues</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
            </div>

            {/* Three-Column Workspace Layout */}
            <div className="grid grid-cols-12 min-h-[460px] text-xs">
              {/* Left Pane: Tracker & Projects Tree */}
              <div className="col-span-12 sm:col-span-3 border-r border-white/[0.08] p-3 space-y-4 bg-[#060609]/60">
                <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-xs">
                  <Search className="h-3.5 w-3.5" />
                  <span className="flex-1 ml-2 text-[11px]">Search...</span>
                  <kbd className="font-mono text-[9px] bg-white/[0.06] px-1 rounded">⌘K</kbd>
                </div>

                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    My Workspace
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.06] text-white font-medium">
                    <Kanban className="h-3.5 w-3.5 text-indigo-400" />
                    <span>My Issues</span>
                    <span className="ml-auto text-[10px] font-mono text-zinc-400">12</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-400 hover:text-white">
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>All Issues</span>
                    <span className="ml-auto text-[10px] font-mono text-zinc-500">48</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/[0.06]">
                  <div className="px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Projects
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded text-zinc-300">
                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    <span className="truncate">Core Architecture</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded text-zinc-400">
                    <span className="h-2 w-2 rounded-full bg-cyan-500" />
                    <span className="truncate">Mobile Client</span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded text-zinc-400">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <span className="truncate">Design System 3.0</span>
                  </div>
                </div>
              </div>

              {/* Center Pane: Kanban Board */}
              <div className="col-span-12 sm:col-span-6 p-4 space-y-3 bg-[#08080c]/50">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-white">Issues</span>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-white/[0.03] p-1 rounded-md">
                      <span className="px-2 py-0.5 rounded bg-white/[0.08] text-white font-medium">Kanban</span>
                      <span className="px-2 py-0.5 rounded hover:text-white">List</span>
                      <span className="px-2 py-0.5 rounded hover:text-white">Timeline</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Column 1: In Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-indigo-400 font-semibold px-1">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-400" /> IN PROGRESS
                      </span>
                      <span className="font-mono text-zinc-400">2</span>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-[#0e0e14] space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-indigo-400">NX-101</span>
                        <Badge variant="default" className="text-[9px] h-4">High</Badge>
                      </div>
                      <p className="text-xs font-medium text-white leading-snug">
                        Architect real-time event bus with SSE
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px] text-zinc-400">
                        <span>Core Platform</span>
                        <span className="h-5 w-5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold flex items-center justify-center">
                          AV
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-[#0e0e14] space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-indigo-400">NX-102</span>
                        <Badge variant="default" className="text-[9px] h-4">Medium</Badge>
                      </div>
                      <p className="text-xs font-medium text-white leading-snug">
                        Drag-and-drop Kanban board reordering
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px] text-zinc-400">
                        <span>Frontend</span>
                        <span className="h-5 w-5 rounded-full bg-cyan-500/30 text-cyan-300 font-bold flex items-center justify-center">
                          SC
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Done */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold px-1">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" /> DONE
                      </span>
                      <span className="font-mono text-zinc-400">3</span>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-[#0e0e14]/70 space-y-2 opacity-85">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-zinc-500">NX-105</span>
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                      <p className="text-xs font-medium text-zinc-300 line-through">
                        Raycast-style Command Palette
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px] text-zinc-500">
                        <span>UI Engine</span>
                        <span className="h-5 w-5 rounded-full bg-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center">
                          OI
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-[#0e0e14]/70 space-y-2 opacity-85">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-zinc-500">DS-301</span>
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                      <p className="text-xs font-medium text-zinc-300 line-through">
                        Design tokens & Obsidian themes
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px] text-zinc-500">
                        <span>Design</span>
                        <span className="h-5 w-5 rounded-full bg-purple-500/30 text-purple-300 font-bold flex items-center justify-center">
                          ER
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Pane: Unified Inbox Drawer */}
              <div className="col-span-12 sm:col-span-3 border-l border-white/[0.08] p-3 space-y-3 bg-[#060609]/60">
                <div className="flex items-center justify-between px-1">
                  <span className="font-bold text-xs text-white">Inbox</span>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <span className="text-indigo-400 font-medium">All</span>
                    <span>•</span>
                    <span>Tasks</span>
                    <span>•</span>
                    <span>Chat</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                      <span className="font-semibold text-white text-[11px]">Sarah Chen</span>
                      <span className="text-[9px] text-zinc-500 ml-auto">10m ago</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Assigned you to <strong>NX-101</strong>: SSE streaming bus
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="font-semibold text-white text-[11px]">Oleg Ivanov</span>
                      <span className="text-[9px] text-zinc-500 ml-auto">25m ago</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Opened PR #142 for real-time channel reactions
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="font-semibold text-white text-[11px]">Sprint 24 Alert</span>
                      <span className="text-[9px] text-zinc-500 ml-auto">1h ago</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      Velocity on track: 92% deliverables completed
                    </p>
                  </div>
                </div>
              </div>
            </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Unmatched Productivity (Image 2 replica Bento Grid) */}
      <section id="productivity" className="py-24 px-4 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Unmatched productivity
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Nexoda is a process, project, time, and knowledge management platform that provides amazing collaboration opportunities for developers and product teams alike.
          </p>
        </div>

        {/* 4-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Keyboard Shortcuts with warm amber ray */}
          <div className="huly-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[360px] group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/25 via-amber-600/10 to-transparent blur-3xl pointer-events-none" />

            {/* Visual Graphic: Floating Glassmorphic Command Palette */}
            <div className="relative my-auto p-4 rounded-xl border border-white/10 bg-[#0c0c12]/80 backdrop-blur-xl shadow-2xl max-w-sm mx-auto w-full space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08] text-xs text-zinc-400">
                <Search className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-white font-medium">Run command...</span>
                <kbd className="font-mono text-[10px] ml-auto text-zinc-500">⌘K</kbd>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.08] text-white">
                  <span>Mark Task as Done</span>
                  <kbd className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-amber-400">K</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg text-zinc-400 hover:text-white">
                  <span>Open To-Do List</span>
                  <kbd className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded">T</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg text-zinc-400 hover:text-white">
                  <span>Switch to Timeline View</span>
                  <kbd className="font-mono text-[10px] bg-black/40 px-1.5 py-0.5 rounded">V</kbd>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <h3 className="font-bold text-sm text-white">
                Keyboard shortcuts.{" "}
                <span className="text-zinc-400 font-normal">
                  Work efficiently with instant access to common actions.
                </span>
              </h3>
            </div>
          </div>

          {/* Card 2: Team Planner with cool cyan glow */}
          <div className="huly-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[360px] group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/20 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />

            {/* Visual Graphic: Floating Team Planner Task Card */}
            <div className="relative my-auto p-4 rounded-xl border border-white/10 bg-[#0c0c12]/80 backdrop-blur-xl shadow-2xl max-w-sm mx-auto w-full space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-cyan-400" /> Today Schedule
                </span>
                <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-300">
                  Sprint 24
                </Badge>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <Badge variant="default" className="h-4 text-[9px] bg-rose-500/20 text-rose-300 border-0">High</Badge>
                  <span className="text-zinc-500">10:00 AM</span>
                </div>
                <p className="text-xs font-medium text-white">
                  Implement new features according to project requirements
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-400">
                  <span className="h-4 w-4 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[9px]">SC</span>
                  <span>Sarah Chen</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between text-[10px]">
                  <Badge variant="default" className="h-4 text-[9px] bg-amber-500/20 text-amber-300 border-0">Medium</Badge>
                  <span className="text-zinc-500">02:30 PM</span>
                </div>
                <p className="text-xs font-medium text-white">
                  Code Review & MVP Testing
                </p>
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <h3 className="font-bold text-sm text-white">
                Team Planner.{" "}
                <span className="text-zinc-400 font-normal">
                  Keep track of the bigger picture by viewing all individual tasks in one centralized team calendar.
                </span>
              </h3>
            </div>
          </div>

          {/* Card 3: Time-blocking with structured focus slot */}
          <div className="huly-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[360px] group">
            <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-indigo-500/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

            {/* Visual Graphic: Floating Time-Block Card */}
            <div className="relative my-auto p-4 rounded-xl border border-white/10 bg-[#0c0c12]/80 backdrop-blur-xl shadow-2xl max-w-sm mx-auto w-full space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-zinc-400">03:00 - 04:00 pm</span>
                <span className="text-[11px] text-zinc-500">Weekly on Monday</span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">Design meeting</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Weekly review and refinement of project prototypes.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors">
                  <Video className="h-3.5 w-3.5" /> Join Meeting
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-white/[0.06]">
                <span>8 participants</span>
                <div className="flex items-center gap-1">
                  <span className="text-zinc-500">Going?</span>
                  <span className="text-white font-semibold cursor-pointer">Yes</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <h3 className="font-bold text-sm text-white">
                Time-blocking.{" "}
                <span className="text-zinc-400 font-normal">
                  Transform daily tasks into structured time blocks for focused productivity.
                </span>
              </h3>
            </div>
          </div>

          {/* Card 4: Notifications — Huly stay-productive/waves plate + bell */}
          <div className="huly-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[360px] group">
            <LoopVideo
              className="pointer-events-none absolute left-1/2 top-[42%] z-0 aspect-[1.52381] h-[72%] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
              poster="/huly-assets/productivity-waves.jpg"
              width={640}
              height={420}
              sources={[{ src: "/huly-assets/productivity-waves.mp4", type: "video/mp4" }]}
            />

            <div className="relative z-10 my-auto flex h-48 w-full items-center justify-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/50 bg-[#12121c] text-amber-400 shadow-xl shadow-amber-500/30">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black">
                  +3
                </span>
              </div>
            </div>

            <div className="relative z-10 pt-4">
              <h3 className="font-bold text-sm text-white">
                Notifications.{" "}
                <span className="text-zinc-400 font-normal">
                  Keep up to date with any changes by receiving instant notifications.
                </span>
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Virtual Office & Spatial Presence (Image 3 replica) */}
      <section id="virtual-office" className="py-24 px-4 max-w-6xl mx-auto space-y-12 relative">
        <div className="text-center space-y-3">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Virtual Office & Spatial Presence
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Collaborating with remote teams is easy in your virtual office environment. Enjoy real-time audio and video within your workspace without extra software.
          </p>
        </div>

        {/* Huly work-together plate: oversized office waves + live call loop */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0b0c10] p-6 shadow-2xl sm:p-10">
          <LoopVideo
            className="pointer-events-none absolute inset-0 z-0"
            videoClassName="scale-110 object-cover"
            poster="/huly-assets/office-waves.jpg"
            width={1920}
            height={1184}
            sources={[{ src: "/huly-assets/office-waves.mp4", type: "video/mp4" }]}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-56 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/85 to-transparent" />

          <div className="relative z-20 mx-auto w-full max-w-[864px]">
            <div className="relative overflow-hidden rounded-[10px] border border-white/15 bg-black shadow-2xl">
              <LoopVideo
                className="aspect-video w-full"
                poster="/huly-assets/office-call.jpg"
                width={864}
                height={486}
                sources={[{ src: "/huly-assets/office-call.mp4", type: "video/mp4" }]}
              />

              <div className="pointer-events-none absolute inset-0 text-white">
                <div className="absolute left-5 top-5 flex flex-col">
                  <span className="text-[15px] font-medium leading-snug tracking-tight opacity-90">
                    Onboarding Meeting
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium opacity-60">
                    <Users className="h-3.5 w-3.5" />
                    4 participants
                  </span>
                </div>

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 backdrop-blur-md">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
                    <Mic className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
                    <Video className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
                    <Monitor className="h-3.5 w-3.5" />
                  </span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white">
                    <PhoneOff className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Value Props below */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 relative z-10 text-xs">
            <div className="space-y-1.5">
              <h4 className="font-bold text-sm text-white">Customize workspace</h4>
              <p className="text-zinc-400 leading-relaxed">
                Create your own offices and meeting rooms to suit your team's unique rhythm.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-sm text-white">Audio and video calls</h4>
              <p className="text-zinc-400 leading-relaxed">
                Collaborate efficiently and seamlessly with high quality audio and video conferencing.
              </p>
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-sm text-white">Invite guests</h4>
              <p className="text-zinc-400 leading-relaxed">
                Meet with clients and contractors without ever needing to leave your workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: GitHub Bidirectional Sync ("Both ways." Image 4 replica) */}
      <section id="github" className="py-24 px-4 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Both ways.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Manage your tasks efficiently with Nexoda's bidirectional GitHub synchronization. Use Nexoda as an advanced front-end for GitHub Issues and GitHub Projects.
          </p>
        </div>

        {/* Floating GitHub Window — Huly sync-with-github/glow plate */}
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl px-6 py-10 sm:px-10 sm:py-14">
          <LoopVideo
            className="pointer-events-none absolute inset-[-8%] z-0 mix-blend-screen"
            poster="/huly-assets/github-glow.jpg"
            width={1472}
            height={1056}
            sources={[{ src: "/huly-assets/github-glow.mp4", type: "video/mp4" }]}
          />

          {/* GitHub Window */}
          <div className="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a10] text-left text-xs shadow-2xl">
            {/* GitHub Header */}
            <div className="p-3 border-b border-white/[0.08] bg-[#07070b] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderGit2 className="h-4 w-4 text-zinc-400" />
                <span className="font-semibold text-white">acme-project / core-engine</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white">Pull requests (21)</span>
                <span className="px-2 py-0.5 rounded">Issues (148)</span>
              </div>
            </div>

            {/* GitHub PR rows */}
            <div className="divide-y divide-white/[0.06]">
              <div className="p-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <GitPullRequest className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-medium text-white">Feature Request: Document analysis engine</span>
                    <span className="text-[10px] text-zinc-500 block">#5054 opened 10 minutes ago by alexvance</span>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-[10px]">Open</Badge>
              </div>

              <div className="p-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <GitPullRequest className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-medium text-white">Store markup as ProseMirror JSON instead of HTML</span>
                    <span className="text-[10px] text-zinc-500 block">#5051 opened 2 hours ago by sarahchen</span>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-[10px]">Open</Badge>
              </div>

              <div className="p-3.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <GitPullRequest className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-medium text-white">Improve unified inbox grouping & SSE stream dispatcher</span>
                    <span className="text-[10px] text-zinc-500 block">#5049 opened 5 hours ago by olegivanov</span>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-[10px]">Open</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 6-Icon Feature Grid below */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 text-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Two-way synchronization</h4>
            <p className="text-zinc-400">Integrate your task tracker with GitHub to sync changes instantly.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Private tasks</h4>
            <p className="text-zinc-400">Integration and management of multiple data repositories effectively.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Multiple repositories</h4>
            <p className="text-zinc-400">Organize multiple projects for more effective planning and collaboration.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Milestone migration</h4>
            <p className="text-zinc-400">Transfer sprints and milestones seamlessly between platforms.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Track progress</h4>
            <p className="text-zinc-400">Automatic status transitions whenever PRs are merged or closed.</p>
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-white">Advanced filtering</h4>
            <p className="text-zinc-400">Slice and query across commits, branches, and internal issue links.</p>
          </div>
        </div>
      </section>

      {/* Pricing Matrix */}
      <section id="pricing" className="py-24 px-4 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Transparent, High-Velocity Pricing
          </h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Choose the plan that matches your team's ambition. Switch or cancel anytime.
          </p>

          <div className="inline-flex items-center gap-2 p-1 rounded-full bg-white/[0.04] border border-white/10 text-xs mt-2">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                billingPeriod === "monthly" ? "bg-white text-black font-semibold shadow-sm" : "text-zinc-400"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                billingPeriod === "annual" ? "bg-white text-black font-semibold shadow-sm" : "text-zinc-400"
              }`}
            >
              Annual <span className="text-[10px] text-cyan-500 font-bold">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`huly-card p-6 flex flex-col justify-between space-y-6 relative ${
                tier.popular ? "border-cyan-500/50 shadow-cyan-500/10 shadow-2xl" : ""
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-base text-white">{tier.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1 min-h-[32px]">{tier.desc}</p>
                </div>

                <div>
                  <span className="text-3xl font-extrabold text-white">{tier.price}</span>
                  <span className="text-xs text-zinc-400 ml-1">/{tier.period}</span>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span className="text-zinc-300">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                asChild
                className={`w-full text-xs font-semibold rounded-full ${
                  tier.popular ? "bg-white text-black hover:bg-zinc-200" : "bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/10"
                }`}
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="p-4 rounded-xl border border-white/[0.08] bg-[#07070a] cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between font-semibold text-xs text-white">
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 text-zinc-400 transition-transform ${
                    openFaq === idx ? "rotate-180 text-cyan-400" : ""
                  }`}
                />
              </div>
              {openFaq === idx && (
                <p className="text-xs text-zinc-400 leading-relaxed pt-1 border-t border-white/[0.06]">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner — Huly cta/clock plate */}
      <section className="px-4 py-20">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-500/10 via-[#0a0a12] to-cyan-500/10 p-8 shadow-2xl sm:p-14">
          <LoopVideo
            className="pointer-events-none relative z-0 mx-auto mb-6 aspect-square w-40 overflow-hidden rounded-full opacity-90 md:absolute md:-top-8 md:left-16 md:mb-0 md:w-[280px] lg:left-20 lg:w-[332px]"
            videoClassName="scale-110"
            poster="/huly-assets/cta-clock.jpg"
            width={403}
            height={403}
            sources={[{ src: "/huly-assets/cta-clock.mp4", type: "video/mp4" }]}
          />

          <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center md:ml-auto md:mr-0 md:max-w-md md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Unify your team's workspace today.
            </h2>
            <p className="mx-auto max-w-md text-sm text-zinc-400 md:mx-0">
              Experience the productivity multiplier of having projects, planner, docs, and chat connected in one place.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="ember-btn inline-flex items-center gap-3 px-8 py-3.5 text-xs font-bold uppercase tracking-wider"
              >
                <span>LAUNCH NEXODA4TEAM</span>
                <ArrowRight className="relative z-10 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 px-4 text-center text-xs text-zinc-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-semibold text-white">
          <div className="h-5 w-5 rounded bg-indigo-500 flex items-center justify-center text-[10px] font-bold">N</div>
          <span>Nexoda4TEAM</span>
        </div>
        <p>© 2026 Nexoda Studio. An open-source Everything App for high-velocity teams.</p>
      </footer>
    </div>
  );
}
