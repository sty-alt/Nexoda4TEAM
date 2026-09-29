"use client";

import React, { useState, useMemo } from "react";
import {
  CheckSquare,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Play,
  Trash2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";
import { TaskDetailDialog } from "./task-detail-dialog";
import { useTimerStore } from "@/store/useTimerStore";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface TaskListProps {
  tasks: any[];
  workspaceId: string;
  members?: { id: string; name: string; avatar?: string | null }[];
}

export function TaskList({ tasks, workspaceId, members = [] }: TaskListProps) {
  const queryClient = useQueryClient();
  const startTimer = useTimerStore((s) => s.startTimer);

  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState<"identifier" | "title" | "priority" | "dueDate">("identifier");
  const [sortAsc, setSortAsc] = useState(true);

  // Filter & Sort
  const processedTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const matchesSearch =
          !search ||
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.identifier.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField] || "";
        let valB = b[sortField] || "";
        if (sortField === "dueDate") {
          valA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          valB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        }
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [tasks, search, statusFilter, sortField, sortAsc]);

  const toggleSelectAll = () => {
    if (selectedIds.length === processedTasks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(processedTasks.map((t) => t.id));
    }
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (status: string) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/tasks/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );
      toast.success(`Updated ${selectedIds.length} tasks to ${status}`);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch {
      toast.error("Bulk update failed");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} tasks?`)) return;
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/tasks/${id}`, { method: "DELETE" })
        )
      );
      toast.success(`Deleted ${selectedIds.length} tasks`);
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch {
      toast.error("Bulk delete failed");
    }
  };

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

  return (
    <div className="space-y-4">
      {/* Search and Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl border border-border/40 bg-card/50">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="h-4 w-4 text-muted-foreground ml-1" />
          <input
            type="text"
            placeholder="Search list..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 rounded-md border border-border/60 bg-background px-2 text-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="BACKLOG">Backlog</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>

      {/* Bulk action banner when items are selected */}
      {selectedIds.length > 0 && (
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs animate-in fade-in-50">
          <span className="font-semibold text-primary">
            {selectedIds.length} tasks selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatus("DONE")}
              className="h-7 text-xs"
            >
              Mark Done
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatus("IN_PROGRESS")}
              className="h-7 text-xs"
            >
              Set In Progress
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleBulkDelete}
              className="h-7 text-xs gap-1"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          </div>
        </div>
      )}

      {/* High-density Table */}
      <div className="rounded-xl border border-border/40 overflow-hidden bg-card/40">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30 text-muted-foreground font-semibold">
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.length === processedTasks.length &&
                    processedTasks.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </th>
              <th
                onClick={() => {
                  setSortField("identifier");
                  setSortAsc(!sortAsc);
                }}
                className="p-3 cursor-pointer hover:text-foreground transition-colors w-24"
              >
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => {
                  setSortField("title");
                  setSortAsc(!sortAsc);
                }}
                className="p-3 cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Title</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="p-3 w-28">Status</th>
              <th className="p-3 w-24">Priority</th>
              <th className="p-3 w-36">Assignee</th>
              <th className="p-3 w-32">Project</th>
              <th
                onClick={() => {
                  setSortField("dueDate");
                  setSortAsc(!sortAsc);
                }}
                className="p-3 cursor-pointer hover:text-foreground transition-colors w-28"
              >
                <div className="flex items-center gap-1">
                  <span>Due Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="p-3 w-16 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {processedTasks.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="p-8 text-center text-xs text-muted-foreground"
                >
                  No tasks match the filter criteria.
                </td>
              </tr>
            ) : (
              processedTasks.map((task) => {
                const isSelected = selectedIds.includes(task.id);
                return (
                  <tr
                    key={task.id}
                    onClick={() => {
                      setActiveTaskId(task.id);
                      setDetailOpen(true);
                    }}
                    className={`hover:bg-accent/40 cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    <td
                      className="p-3 text-center"
                      onClick={(e) => toggleSelect(task.id, e)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td className="p-3 font-mono font-semibold text-muted-foreground">
                      {task.identifier}
                    </td>
                    <td className="p-3 font-medium text-foreground max-w-[320px] truncate">
                      {task.title}
                    </td>
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={async (e) => {
                          await fetch(`/api/tasks/${task.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: e.target.value }),
                          });
                          queryClient.invalidateQueries({ queryKey: ["tasks"] });
                        }}
                        className="h-7 rounded border border-border/40 bg-background px-1.5 text-[11px] font-medium"
                      >
                        <option value="BACKLOG">Backlog</option>
                        <option value="TODO">Todo</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="DONE">Done</option>
                        <option value="CANCELED">Canceled</option>
                      </select>
                    </td>
                    <td className="p-3">{getPriorityBadge(task.priority)}</td>
                    <td className="p-3">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <UserAvatar
                            name={task.assignee.name}
                            avatar={task.assignee.avatar}
                            size="sm"
                          />
                          <span className="truncate text-foreground">
                            {task.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px]">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {task.project && (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: task.project.color }}
                          />
                          <span className="truncate">{task.project.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {task.dueDate ? formatDate(task.dueDate) : "—"}
                    </td>
                    <td
                      className="p-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => {
                          startTimer(task.id, task.title, task.project?.color);
                          toast.success(`Timer started for ${task.identifier}`);
                        }}
                        className="h-7 w-7 rounded hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-primary transition-colors ml-auto"
                        title="Start timer"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TaskDetailDialog
        taskId={activeTaskId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        members={members}
      />
    </div>
  );
}
