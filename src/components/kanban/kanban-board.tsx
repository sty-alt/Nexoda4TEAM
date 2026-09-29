"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import React, { useState, useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Plus,
  MoreHorizontal,
  CheckSquare,
  MessageSquare,
  Clock,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar";
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export interface KanbanTask {
  id: string;
  identifier: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  dueDate?: string | null;
  estimateHours?: number;
  trackedSeconds?: number;
  position: number;
  assignee?: { id: string; name: string; avatar?: string | null } | null;
  project?: { id: string; name: string; identifier: string; color: string } | null;
  subtasks?: { id: string; completed: boolean }[];
  _count?: { comments: number };
}

interface KanbanBoardProps {
  tasks: KanbanTask[];
  workspaceId: string;
  projectId?: string;
  members?: { id: string; name: string; avatar?: string | null }[];
}

const COLUMNS = [
  { id: "BACKLOG", label: "Backlog", color: "#64748b" },
  { id: "TODO", label: "Todo", color: "#3b82f6" },
  { id: "IN_PROGRESS", label: "In Progress", color: "#f59e0b" },
  { id: "IN_REVIEW", label: "In Review", color: "#8b5cf6" },
  { id: "DONE", label: "Done", color: "#10b981" },
];

export function KanbanBoard({
  tasks: initialTasks,
  workspaceId,
  projectId,
  members = [],
}: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [quickAddColumn, setQuickAddColumn] = useState<string | null>(null);
  const [quickAddTitle, setQuickAddTitle] = useState("");

  // Keep local tasks in sync with props
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.identifier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPriority =
        priorityFilter === "ALL" || t.priority === priorityFilter;

      const matchesAssignee =
        assigneeFilter === "ALL" || t.assignee?.id === assigneeFilter;

      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter]);

  // Group tasks by status column
  const tasksByColumn = useMemo(() => {
    const map: Record<string, KanbanTask[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };
    filteredTasks.forEach((t) => {
      if (map[t.status]) {
        map[t.status].push(t);
      } else {
        map.TODO.push(t);
      }
    });
    return map;
  }, [filteredTasks]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const movedTask = tasks.find((t) => t.id === draggableId);
    if (!movedTask) return;

    // Optimistic state update
    const updatedTasks = tasks.map((t) =>
      t.id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(updatedTasks);

    try {
      const res = await fetch(`/api/tasks/${draggableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch {
      toast.error("Failed to move task");
      setTasks(initialTasks); // Rollback on error
    }
  };

  const handleQuickAdd = async (columnId: string) => {
    if (!quickAddTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          projectId: projectId || tasks[0]?.project?.id || "default",
          title: quickAddTitle.trim(),
          status: columnId,
          priority: "MEDIUM",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create task");

      toast.success(`Created: ${data.task.identifier}`);
      setQuickAddTitle("");
      setQuickAddColumn(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="urgent"><LocalizedText>Urgent</LocalizedText></Badge>;
      case "HIGH":
        return <Badge variant="warning"><LocalizedText>High</LocalizedText></Badge>;
      case "MEDIUM":
        return <Badge variant="default"><LocalizedText>Med</LocalizedText></Badge>;
      default:
        return <Badge variant="secondary"><LocalizedText>Low</LocalizedText></Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Kanban Filters & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl border border-border/40 bg-card/50">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <Search className="h-4 w-4 text-muted-foreground ml-1 shrink-0" />
          <input
            type="text"
            placeholder="Filter tasks by name, id..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs text-muted-foreground"
          >
            <option value="ALL"><LocalizedText>All Priorities</LocalizedText></option>
            <option value="URGENT"><LocalizedText>Urgent</LocalizedText></option>
            <option value="HIGH"><LocalizedText>High</LocalizedText></option>
            <option value="MEDIUM"><LocalizedText>Medium</LocalizedText></option>
            <option value="LOW"><LocalizedText>Low</LocalizedText></option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs text-muted-foreground"
          >
            <option value="ALL"><LocalizedText>All Assignees</LocalizedText></option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Drag & Drop Kanban Canvas */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colTasks = tasksByColumn[col.id] || [];
            return (
              <div
                key={col.id}
                className="w-full rounded-xl border border-border/40 bg-muted/20 flex flex-col max-h-[80vh]"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: col.color }}
                    />
                    <span className="font-semibold text-xs text-foreground">
                      <LocalizedText>{col.label}</LocalizedText>
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
                      {colTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setQuickAddColumn(col.id);
                      setQuickAddTitle("");
                    }}
                    className="h-6 w-6 rounded hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    title="Quick add task in column"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Inline Quick Add Form */}
                {quickAddColumn === col.id && (
                  <div className="p-2 border-b border-border/30 space-y-2 bg-card/60">
                    <Input
                      placeholder="Task title..."
                      value={quickAddTitle}
                      onChange={(e) => setQuickAddTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleQuickAdd(col.id);
                        if (e.key === "Escape") setQuickAddColumn(null);
                      }}
                      autoFocus
                      className="h-7 text-xs"
                    />
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setQuickAddColumn(null)}
                        className="h-6 text-[10px] px-2"
                      ><LocalizedText>
                        Cancel
                      </LocalizedText></Button>
                      <Button
                        size="sm"
                        onClick={() => handleQuickAdd(col.id)}
                        className="h-6 text-[10px] px-2"
                      ><LocalizedText>
                        Add
                      </LocalizedText></Button>
                    </div>
                  </div>
                )}

                {/* Droppable Card Container */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-2 space-y-2.5 overflow-y-auto min-h-[160px] transition-colors rounded-b-xl ${
                        snapshot.isDraggingOver ? "bg-primary/5" : ""
                      }`}
                    >
                      {colTasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              onClick={() => {
                                setActiveTaskId(task.id);
                                setDetailOpen(true);
                              }}
                              className={`p-3 rounded-lg border bg-card text-card-foreground shadow-sm hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing space-y-2.5 ${
                                dragSnapshot.isDragging
                                  ? "shadow-xl border-primary scale-[1.02] rotate-1"
                                  : "border-border/60"
                              }`}
                            >
                              {/* Identifier + Priority */}
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                                  {task.identifier}
                                </span>
                                {getPriorityBadge(task.priority)}
                              </div>

                              {/* Title */}
                              <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                                {task.title}
                              </p>

                              {/* Footer: Subtasks count, Comments count, Assignee */}
                              <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/30">
                                <div className="flex items-center gap-3">
                                  {task.subtasks && task.subtasks.length > 0 && (
                                    <span className="flex items-center gap-1">
                                      <CheckSquare className="h-3 w-3" />
                                      {
                                        task.subtasks.filter((s) => s.completed)
                                          .length
                                      }<LocalizedText>
                                      /</LocalizedText>{task.subtasks.length}
                                    </span>
                                  )}
                                  {task._count && task._count.comments > 0 && (
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" />
                                      {task._count.comments}
                                    </span>
                                  )}
                                </div>

                                {task.assignee ? (
                                  <UserAvatar
                                    name={task.assignee.name}
                                    avatar={task.assignee.avatar}
                                    size="sm"
                                  />
                                ) : (
                                  <span className="h-5 w-5 rounded-full border border-dashed border-muted-foreground/40 flex items-center justify-center text-[10px]"><LocalizedText>
                                    ?
                                  </LocalizedText></span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Task Detail Modal */}
      <TaskDetailDialog
        taskId={activeTaskId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        members={members}
      />
    </div>
  );
}

