"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  FolderGit2,
  Kanban,
  List,
  Flame,
  Plus,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { TaskList } from "@/components/tasks/task-list";
import { useUIStore } from "@/store/useUIStore";
import { formatDate } from "@/lib/utils";

export default function SingleProjectPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const projectId = params.projectId as string;
  const setQuickCreateTaskOpen = useUIStore((s) => s.setQuickCreateTaskOpen);

  const [activeView, setActiveView] = useState("board");

  const { data, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to load project");
      return res.json();
    },
  });

  const project = data?.project;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-64 bg-muted rounded-md" />
        <div className="h-10 w-96 bg-muted rounded-md" />
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16 text-muted-foreground text-sm">
        Project not found.
      </div>
    );
  }

  const tasks = project.tasks || [];
  const members = project.members?.map((m: any) => m.user) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span
              className="h-4 w-4 rounded-md shrink-0"
              style={{ backgroundColor: project.color }}
            />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {project.name}
            </h1>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
              {project.identifier}
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl">
            {project.description || "Active project in sprint cycle."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setQuickCreateTaskOpen(true)}
            className="text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" /> New Issue
          </Button>
        </div>
      </div>

      {/* Tabs View Switcher */}
      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
        <TabsList className="bg-muted/40 p-1 border border-border/40">
          <TabsTrigger value="board" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <Kanban className="h-3.5 w-3.5" /> Board (Kanban)
          </TabsTrigger>
          <TabsTrigger value="list" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <List className="h-3.5 w-3.5" /> List
          </TabsTrigger>
          <TabsTrigger value="sprints" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <Flame className="h-3.5 w-3.5" /> Sprints ({project.sprints?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="m-0">
          <KanbanBoard
            tasks={tasks}
            workspaceId={project.workspaceId}
            projectId={project.id}
            members={members}
          />
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <TaskList
            tasks={tasks}
            workspaceId={project.workspaceId}
            members={members}
          />
        </TabsContent>

        <TabsContent value="sprints" className="space-y-4 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.sprints?.map((sprint: any) => (
              <div
                key={sprint.id}
                className="p-5 rounded-xl border border-border/50 bg-card space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{sprint.name}</span>
                  <Badge variant={sprint.status === "ACTIVE" ? "success" : "secondary"}>
                    {sprint.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{sprint.goal || "No goal stated."}</p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {sprint.startDate ? formatDate(sprint.startDate) : "TBD"} -{" "}
                    {sprint.endDate ? formatDate(sprint.endDate) : "TBD"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
