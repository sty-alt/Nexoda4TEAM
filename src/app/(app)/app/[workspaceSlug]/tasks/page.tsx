"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import React, { useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  CheckSquare,
  Kanban,
  List,
  Plus,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { TaskList } from "@/components/tasks/task-list";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import { useUIStore } from "@/store/useUIStore";

function TasksContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceSlug = params.workspaceSlug as string;
  const directTaskId = searchParams.get("task");
  const setQuickCreateTaskOpen = useUIStore((s) => s.setQuickCreateTaskOpen);

  const [activeView, setActiveView] = useState("board");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(directTaskId);
  const [detailOpen, setDetailOpen] = useState(!!directTaskId);

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const workspace = wsData?.workspace;
  const workspaceId = workspace?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["tasks", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { tasks: [] };
      const res = await fetch(`/api/tasks?workspaceId=${workspaceId}`);
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const tasks = data?.tasks || [];
  const members = workspace?.members?.map((m: any) => m.user) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight"><LocalizedText>All Tasks & Issues</LocalizedText></h1>
          <p className="text-xs text-muted-foreground mt-0.5"><LocalizedText>
            Cross-project unified issue queue with drag & drop Kanban and List views
          </LocalizedText></p>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="h-8 bg-muted/40 p-1 border border-border/40">
              <TabsTrigger value="board" className="text-xs gap-1.5 h-6">
                <Kanban className="h-3 w-3" /><LocalizedText> Board
              </LocalizedText></TabsTrigger>
              <TabsTrigger value="list" className="text-xs gap-1.5 h-6">
                <List className="h-3 w-3" /><LocalizedText> List
              </LocalizedText></TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            onClick={() => setQuickCreateTaskOpen(true)}
            className="text-xs gap-1.5 h-8"
          >
            <Plus className="h-4 w-4" /><LocalizedText> New Task
          </LocalizedText></Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-muted rounded-md" />
          <div className="grid grid-cols-5 gap-4">
            <div className="h-80 bg-muted rounded-xl" />
            <div className="h-80 bg-muted rounded-xl" />
            <div className="h-80 bg-muted rounded-xl" />
            <div className="h-80 bg-muted rounded-xl" />
            <div className="h-80 bg-muted rounded-xl" />
          </div>
        </div>
      ) : activeView === "board" ? (
        <KanbanBoard
          tasks={tasks}
          workspaceId={workspaceId}
          members={members}
        />
      ) : (
        <TaskList
          tasks={tasks}
          workspaceId={workspaceId}
          members={members}
        />
      )}

      {selectedTaskId && (
        <TaskDetailDialog
          taskId={selectedTaskId}
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (!open) setSelectedTaskId(null);
          }}
          members={members}
        />
      )}
    </div>
  );
}

export default function AllTasksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground"><LocalizedText>Loading tasks...</LocalizedText></div>}>
      <TasksContent />
    </Suspense>
  );
}

