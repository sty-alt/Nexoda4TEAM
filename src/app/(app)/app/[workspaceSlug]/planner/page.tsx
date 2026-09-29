"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Sun,
  Sunrise,
  Sunset,
  Clock,
  Plus,
  Play,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useTimerStore } from "@/store/useTimerStore";
import { formatTime, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function PlannerPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const queryClient = useQueryClient();
  const startTimer = useTimerStore((s) => s.startTimer);

  const [createBlockOpen, setCreateBlockOpen] = useState(false);
  const [selectedBlockType, setSelectedBlockType] = useState<"morning" | "afternoon" | "evening">("morning");
  const [newTitle, setNewTitle] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const workspaceId = wsData?.workspace?.id;

  // Fetch all assigned tasks
  const { data: tasksData } = useQuery({
    queryKey: ["tasks", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { tasks: [] };
      const res = await fetch(`/api/tasks?workspaceId=${workspaceId}`);
      return res.json();
    },
    enabled: !!workspaceId,
  });

  // Fetch calendar events / planner blocks
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["calendar", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { events: [] };
      const res = await fetch(`/api/calendar?workspaceId=${workspaceId}`);
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const tasks = tasksData?.tasks || [];
  const events = eventsData?.events || [];

  // Group events into Morning (8-12), Afternoon (12-17), Evening (17-21)
  const categorizedEvents = {
    morning: events.filter((e: any) => {
      const hour = new Date(e.startTime).getHours();
      return hour < 12;
    }),
    afternoon: events.filter((e: any) => {
      const hour = new Date(e.startTime).getHours();
      return hour >= 12 && hour < 17;
    }),
    evening: events.filter((e: any) => {
      const hour = new Date(e.startTime).getHours();
      return hour >= 17;
    }),
  };

  const createEventMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to schedule block");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Scheduled into planner!");
      setCreateBlockOpen(false);
      setNewTitle("");
      setSelectedTaskId("");
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    },
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    let startHour = 9;
    let endHour = 10;

    if (selectedBlockType === "afternoon") {
      startHour = 14;
      endHour = 15;
    } else if (selectedBlockType === "evening") {
      startHour = 18;
      endHour = 19;
    }

    const start = new Date(today);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(today);
    end.setHours(endHour, 30, 0, 0);

    const chosenTask = tasks.find((t: any) => t.id === selectedTaskId);
    const titleToUse = newTitle.trim() || chosenTask?.title || "Focus block";

    createEventMutation.mutate({
      workspaceId,
      taskId: selectedTaskId || undefined,
      title: titleToUse,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      type: selectedTaskId ? "TASK_BLOCK" : "PERSONAL",
    });
  };

  const scheduleDirectTask = (task: any, blockType: "morning" | "afternoon" | "evening") => {
    const today = new Date();
    let startHour = blockType === "morning" ? 10 : blockType === "afternoon" ? 14 : 18;
    const start = new Date(today);
    start.setHours(startHour, 0, 0, 0);
    const end = new Date(today);
    end.setHours(startHour + 1, 30, 0, 0);

    createEventMutation.mutate({
      workspaceId,
      taskId: task.id,
      title: task.title,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      type: "TASK_BLOCK",
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Planner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Motion Personal Planner</h1>
            <Badge variant="default" className="text-xs">
              Today: {formatDate(new Date())}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Structured daily time-blocking: turn backlog issues into intentional action items
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setSelectedBlockType("morning");
              setCreateBlockOpen(true);
            }}
            className="text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" /> Add Time Block
          </Button>
        </div>
      </div>

      {/* Grid: Left Backlog (1/3) + Right Schedule Blocks (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Action Item Queue / Backlog */}
        <div className="space-y-4">
          <Card className="subtle-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-primary" /> Unscheduled Issues
                </span>
                <span className="text-xs font-mono text-muted-foreground font-normal">
                  {tasks.length} items
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 max-h-[70vh] overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No issues to schedule!
                </div>
              ) : (
                tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-border/40 bg-card/60 hover:border-primary/40 transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                        {task.identifier}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                        {task.priority}
                      </span>
                    </div>

                    <p className="font-medium text-foreground line-clamp-2">{task.title}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[11px]">
                      <span className="text-muted-foreground font-mono">
                        {task.estimateHours || 2}h est.
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => scheduleDirectTask(task, "morning")}
                          className="h-6 text-[10px] px-1.5"
                          title="Schedule in Morning"
                        >
                          AM
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => scheduleDirectTask(task, "afternoon")}
                          className="h-6 text-[10px] px-1.5"
                          title="Schedule in Afternoon"
                        >
                          PM
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Morning / Afternoon / Evening Blocks */}
        <div className="lg:col-span-2 space-y-5">
          {/* Morning Block */}
          <div className="p-4 rounded-xl border border-border/50 bg-card/60 space-y-3">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Sunrise className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Morning Focus</h3>
                  <div className="text-[11px] text-muted-foreground">08:00 — 12:00</div>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedBlockType("morning");
                  setCreateBlockOpen(true);
                }}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              {categorizedEvents.morning.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  No blocks scheduled for morning. Add an action item or meeting.
                </div>
              ) : (
                categorizedEvents.morning.map((evt: any) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card hover:border-primary/40 transition-all text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-medium text-foreground truncate">{evt.title}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
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

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          startTimer(evt.taskId || evt.id, evt.title);
                          toast.success(`Timer started: ${evt.title}`);
                        }}
                        className="h-7 text-xs gap-1"
                      >
                        <Play className="h-3 w-3 fill-primary text-primary" /> Start
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Afternoon Block */}
          <div className="p-4 rounded-xl border border-border/50 bg-card/60 space-y-3">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Sun className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Afternoon Deep Work</h3>
                  <div className="text-[11px] text-muted-foreground">12:00 — 17:00</div>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedBlockType("afternoon");
                  setCreateBlockOpen(true);
                }}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              {categorizedEvents.afternoon.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  No afternoon blocks scheduled.
                </div>
              ) : (
                categorizedEvents.afternoon.map((evt: any) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card hover:border-primary/40 transition-all text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-medium text-foreground truncate">{evt.title}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
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

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          startTimer(evt.taskId || evt.id, evt.title);
                          toast.success(`Timer started: ${evt.title}`);
                        }}
                        className="h-7 text-xs gap-1"
                      >
                        <Play className="h-3 w-3 fill-primary text-primary" /> Start
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Evening Block */}
          <div className="p-4 rounded-xl border border-border/50 bg-card/60 space-y-3">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Sunset className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Evening Wrap-up</h3>
                  <div className="text-[11px] text-muted-foreground">17:00 — 21:00</div>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedBlockType("evening");
                  setCreateBlockOpen(true);
                }}
                className="h-7 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              {categorizedEvents.evening.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                  No evening blocks scheduled.
                </div>
              ) : (
                categorizedEvents.evening.map((evt: any) => (
                  <div
                    key={evt.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-card hover:border-primary/40 transition-all text-xs"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-medium text-foreground truncate">{evt.title}</div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
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

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          startTimer(evt.taskId || evt.id, evt.title);
                          toast.success(`Timer started: ${evt.title}`);
                        }}
                        className="h-7 text-xs gap-1"
                      >
                        <Play className="h-3 w-3 fill-primary text-primary" /> Start
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Time Block Dialog */}
      <Dialog open={createBlockOpen} onOpenChange={setCreateBlockOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleScheduleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-5 w-5 text-primary" /> Schedule Action Item
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Select Day Block</label>
                <select
                  value={selectedBlockType}
                  onChange={(e: any) => setSelectedBlockType(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="morning">Morning (08:00 - 12:00)</option>
                  <option value="afternoon">Afternoon (12:00 - 17:00)</option>
                  <option value="evening">Evening (17:00 - 21:00)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Link Issue (Optional)</label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="">No linked issue (Custom event)</option>
                  {tasks.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.identifier} - {t.title}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedTaskId && (
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Block Title</label>
                  <Input
                    placeholder="e.g. Design critique & roadmap sync"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateBlockOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={createEventMutation.isPending}>
                Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
