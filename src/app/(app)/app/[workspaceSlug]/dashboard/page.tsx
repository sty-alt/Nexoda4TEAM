"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare,
  Sparkles,
  Layers,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
  Play,
  TrendingUp,
  Activity,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/ui/avatar";
import { useTimerStore } from "@/store/useTimerStore";
import { formatTimerClock, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function DashboardPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const startTimer = useTimerStore((s) => s.startTimer);

  // Widget visibility toggles
  const [enabledWidgets, setEnabledWidgets] = useState({
    myTasks: true,
    sprint: true,
    projects: true,
    time: true,
    activity: true,
    events: true,
  });
  const [showConfig, setShowConfig] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard?workspaceSlug=${workspaceSlug}`);
      if (!res.ok) throw new Error("Failed to load dashboard data");
      return res.json();
    },
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="urgent">Urgent</Badge>;
      case "HIGH":
        return <Badge variant="warning">High</Badge>;
      case "MEDIUM":
        return <Badge variant="default">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-64 bg-muted rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-40 bg-muted rounded-xl" />
          <div className="h-40 bg-muted rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-muted rounded-xl" />
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const {
    myTasks = [],
    activeProjects = [],
    activeSprint,
    recentActivity = [],
    todayEvents = [],
    overdueTasks = [],
    totalTimeLoggedToday = 0,
  } = data || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Today's Pulse</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              All Systems Operational
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            You have <strong className="text-foreground">{myTasks.length}</strong> active tasks,{" "}
            <strong className="text-foreground">{todayEvents.length}</strong> events scheduled, and{" "}
            <strong className="text-foreground">{overdueTasks.length}</strong> overdue items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
            className="text-xs gap-1.5"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Customize Widgets
          </Button>
          <Button asChild size="sm" className="text-xs gap-1.5">
            <Link href={`/app/${workspaceSlug}/planner`}>
              <Clock className="h-3.5 w-3.5" /> Open Day Planner
            </Link>
          </Button>
        </div>
      </div>

      {/* Widget Customization Drawer / Bar */}
      {showConfig && (
        <Card className="border-dashed bg-card/50 p-4 animate-in fade-in-50">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-semibold text-muted-foreground">Toggle Widgets:</span>
            {Object.entries(enabledWidgets).map(([key, enabled]) => (
              <label key={key} className="flex items-center gap-1.5 cursor-pointer capitalize">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={() =>
                    setEnabledWidgets((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof enabledWidgets],
                    }))
                  }
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>{key.replace(/([A-Z])/g, " $1")}</span>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="subtle-border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-medium">Assigned Tasks</div>
              <div className="text-2xl font-bold mt-0.5">{myTasks.length}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Across all active projects</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CheckSquare className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="subtle-border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-medium">Hours Logged Today</div>
              <div className="text-2xl font-bold mt-0.5">
                {(totalTimeLoggedToday / 3600).toFixed(1)}h
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Target: 7.5h daily</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="subtle-border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-medium">Sprint Completion</div>
              <div className="text-2xl font-bold mt-0.5">
                {activeSprint ? `${activeSprint.percent}%` : "0%"}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {activeSprint ? `${activeSprint.done}/${activeSprint.total} deliverables` : "No active sprint"}
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Flame className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="subtle-border bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground font-medium">Overdue Deadlines</div>
              <div className="text-2xl font-bold mt-0.5 text-rose-500">
                {overdueTasks.length}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">Needs immediate attention</div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left 2 columns, Right 1 column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Tasks + Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Tasks Widget */}
          {enabledWidgets.myTasks && (
            <Card className="subtle-border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ListTodo className="h-4 w-4 text-primary" /> My Action Items
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Prioritized tasks currently assigned to you
                  </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs h-7 gap-1">
                  <Link href={`/app/${workspaceSlug}/tasks`}>
                    View All <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {myTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-xs">
                    No active tasks assigned! Great job clearing your queue.
                  </div>
                ) : (
                  myTasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:border-border hover:bg-accent/40 transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: task.project?.color || "#6366f1" }}
                        />
                        <span className="font-mono text-xs text-muted-foreground shrink-0">
                          {task.identifier}
                        </span>
                        <span className="text-xs font-medium text-foreground truncate max-w-[280px] sm:max-w-md">
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {getPriorityBadge(task.priority)}
                        <button
                          onClick={() => {
                            startTimer(task.id, task.title, task.project?.color);
                            toast.success(`Started tracking: ${task.identifier}`);
                          }}
                          className="h-7 w-7 rounded-md hover:bg-primary/20 text-muted-foreground hover:text-primary flex items-center justify-center transition-colors opacity-80 group-hover:opacity-100"
                          title="Start timer on this task"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Active Projects Widget */}
          {enabledWidgets.projects && (
            <Card className="subtle-border">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="space-y-0.5">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" /> Active Projects
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Progress tracking across high-velocity deliverables
                  </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs h-7 gap-1">
                  <Link href={`/app/${workspaceSlug}/projects`}>
                    All Projects <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeProjects.map((proj: any) => (
                  <Link
                    key={proj.id}
                    href={`/app/${workspaceSlug}/projects/${proj.id}`}
                    className="p-3.5 rounded-xl border border-border/40 bg-card hover:border-primary/40 hover:bg-accent/30 transition-all space-y-2 block group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-md shrink-0"
                          style={{ backgroundColor: proj.color }}
                        />
                        <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                          {proj.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {proj.identifier}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Progress</span>
                        <span>{proj.percent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${proj.percent}%`,
                            backgroundColor: proj.color,
                          }}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Sprint Progress + Today Schedule + Live Activity */}
        <div className="space-y-6">
          {/* Active Sprint Progress Widget */}
          {enabledWidgets.sprint && activeSprint && (
            <Card className="subtle-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
                    Active Sprint
                  </span>
                  <Badge variant="success">In Progress</Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-1">
                  {activeSprint.name}
                </CardTitle>
                <CardDescription className="text-xs">
                  {activeSprint.goal || "Sprint deliverables roadmap"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Sprint Velocity</span>
                    <span>{activeSprint.percent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${activeSprint.percent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
                    <div className="font-bold text-foreground">{activeSprint.total}</div>
                    <div className="text-[10px] text-muted-foreground">Total</div>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                    <div className="font-bold">{activeSprint.inProgress}</div>
                    <div className="text-[10px]">Active</div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <div className="font-bold">{activeSprint.done}</div>
                    <div className="text-[10px]">Shipped</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Schedule & Planner Widget */}
          {enabledWidgets.events && (
            <Card className="subtle-border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Today's Agenda
                </CardTitle>
                <Link
                  href={`/app/${workspaceSlug}/calendar`}
                  className="text-[11px] text-primary hover:underline"
                >
                  Calendar
                </Link>
              </CardHeader>
              <CardContent className="space-y-2 pt-2">
                {todayEvents.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No scheduled meetings today. Open day for focus time!
                  </div>
                ) : (
                  todayEvents.map((evt: any) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-lg border border-border/40 bg-card/60 text-xs space-y-1"
                    >
                      <div className="font-medium text-foreground">{evt.title}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(evt.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(evt.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {/* Recent Activity Log Stream Widget */}
          {enabledWidgets.activity && (
            <Card className="subtle-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Workspace Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                {recentActivity.map((act: any) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <UserAvatar
                      name={act.user.name}
                      avatar={act.user.avatar}
                      size="sm"
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-foreground">
                        <strong className="font-semibold">{act.user.name}</strong>{" "}
                        <span className="text-muted-foreground">{act.action.toLowerCase()}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {act.details}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
