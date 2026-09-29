"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import { useLocale } from "@/i18n/locale-provider";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";
import {
  CheckSquare,
  Clock,
  Play,
  User,
  Calendar,
  Tag,
  GitPullRequest,
  MessageSquare,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useTimerStore } from "@/store/useTimerStore";
import { formatTime, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface TaskDetailDialogProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members?: { id: string; name: string; avatar?: string | null }[];
}

export function TaskDetailDialog({
  taskId,
  open,
  onOpenChange,
  members = [],
}: TaskDetailDialogProps) {
  const { locale, t } = useLocale();
  const queryClient = useQueryClient();
  const startTimer = useTimerStore((s) => s.startTimer);

  const [newComment, setNewComment] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error("Failed to fetch task details");
      return res.json();
    },
    enabled: !!taskId && open,
  });

  const task = data?.task;

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: async (patch: any) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task updated");
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return res.json();
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      toast.success("Comment added");
    },
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, completed }: { subtaskId: string; completed: boolean }) => {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtaskId, completed }),
      });
      if (!res.ok) throw new Error("Failed to toggle subtask");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const addSubtaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to add subtask");
      return res.json();
    },
    onSuccess: () => {
      setNewSubtaskTitle("");
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleStartTimer = () => {
    if (task) {
      startTimer(task.id, task.title, task.project?.color);
      toast.success(`Timer started for ${task.identifier}`);
    }
  };

  if (!task && isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto p-0 gap-0 border border-border/60">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: task.project?.color || "#6366f1" }}
            />
            <span className="font-mono text-xs font-semibold text-muted-foreground">
              {task.identifier}
            </span>
            <span className="text-xs text-muted-foreground"><LocalizedText>•</LocalizedText></span>
            <span className="text-xs font-medium text-muted-foreground">
              {task.project?.name}
            </span>
          </div>

          <div className="flex items-center gap-2 mr-6">
            <Button
              size="sm"
              variant="outline"
              onClick={handleStartTimer}
              className="h-7 text-xs gap-1.5"
            >
              <Play className="h-3 w-3 fill-primary text-primary" />
              <span><LocalizedText>Track Time</LocalizedText></span>
            </Button>
          </div>
        </div>

        {/* Content Body: 2 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/40">
          {/* Main Column (2/3): Title, Description, Subtasks, Comments */}
          <div className="md:col-span-2 p-6 space-y-6">
            {/* Title */}
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    autoFocus
                    className="font-semibold text-base"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      updateTaskMutation.mutate({ title: titleValue });
                      setIsEditingTitle(false);
                    }}
                  ><LocalizedText>
                    Save
                  </LocalizedText></Button>
                </div>
              ) : (
                <h2
                  onClick={() => {
                    setTitleValue(task.title);
                    setIsEditingTitle(true);
                  }}
                  className="text-lg font-bold text-foreground cursor-pointer hover:bg-muted/40 p-1.5 -ml-1.5 rounded-lg transition-colors"
                >
                  {task.title}
                </h2>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"><LocalizedText>
                Description
              </LocalizedText></label>
              <Textarea
                defaultValue={task.description || ""}
                placeholder="Add a detailed description, specifications, or notes..."
                onBlur={(e) => {
                  if (e.target.value !== (task.description || "")) {
                    updateTaskMutation.mutate({ description: e.target.value });
                  }
                }}
                className="text-xs min-h-[90px] resize-none bg-background/50 leading-relaxed"
              />
            </div>

            {/* Subtasks Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5" /><LocalizedText> Subtasks (
                  </LocalizedText>{task.subtasks?.filter((s: any) => s.completed).length || 0}<LocalizedText>/
                  </LocalizedText>{task.subtasks?.length || 0}<LocalizedText>)
                </LocalizedText></label>
              </div>

              <div className="space-y-1.5">
                {task.subtasks?.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/40 text-xs transition-colors group"
                  >
                    <button
                      onClick={() =>
                        toggleSubtaskMutation.mutate({
                          subtaskId: sub.id,
                          completed: !sub.completed,
                        })
                      }
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {sub.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <span
                      className={`flex-1 ${
                        sub.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {sub.title}
                    </span>
                  </div>
                ))}

                {/* Add Subtask Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newSubtaskTitle.trim()) {
                      addSubtaskMutation.mutate(newSubtaskTitle.trim());
                    }
                  }}
                  className="flex items-center gap-2 pt-1"
                >
                  <Input
                    placeholder="Add a subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="h-8 text-xs bg-background/50"
                  />
                  <Button type="submit" size="sm" variant="ghost" className="h-8 text-xs">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            </div>

            {/* GitHub Links if any */}
            {task.githubLinks && task.githubLinks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <GitPullRequest className="h-3.5 w-3.5" /><LocalizedText> Linked Pull Requests & Issues
                </LocalizedText></label>
                <div className="space-y-1.5">
                  {task.githubLinks.map((link: any) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 hover:border-primary/50 hover:bg-accent/40 text-xs transition-all group"
                    >
                      <div className="flex items-center gap-2">
                        <GitPullRequest className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">{link.externalId}</span>
                        <span className="text-muted-foreground truncate max-w-[240px]">
                          {link.title}
                        </span>
                      </div>
                      <Badge variant="success" className="text-[10px]">
                        <LocalizedText>{link.status || "OPEN"}</LocalizedText>
                      </Badge>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Thread */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /><LocalizedText> Activity & Discussion
              </LocalizedText></label>

              <div className="space-y-3">
                {task.comments?.map((comment: any) => (
                  <div key={comment.id} className="flex items-start gap-3 text-xs">
                    <UserAvatar
                      name={comment.user.name}
                      avatar={comment.user.avatar}
                      size="sm"
                      className="mt-0.5"
                    />
                    <div className="flex-1 rounded-lg border border-border/40 bg-card/60 p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {comment.user.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(comment.createdAt, locale)}
                        </span>
                      </div>
                      <p className="text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add comment box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newComment.trim()) {
                    addCommentMutation.mutate(newComment.trim());
                  }
                }}
                className="space-y-2 pt-2"
              >
                <Textarea
                  placeholder="Write a reply or mention colleagues..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[70px] text-xs resize-none"
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" className="h-7 text-xs"><LocalizedText>
                    Send Comment
                  </LocalizedText></Button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Attributes Column (1/3): Status, Priority, Assignee, Dates, Estimates */}
          <div className="p-6 space-y-5 bg-muted/10 text-xs">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]"><LocalizedText>
                Status
              </LocalizedText></label>
              <select
                value={task.status}
                onChange={(e) => updateTaskMutation.mutate({ status: e.target.value })}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
              >
                <option value="BACKLOG"><LocalizedText>Backlog</LocalizedText></option>
                <option value="TODO"><LocalizedText>Todo</LocalizedText></option>
                <option value="IN_PROGRESS"><LocalizedText>In Progress</LocalizedText></option>
                <option value="IN_REVIEW"><LocalizedText>In Review</LocalizedText></option>
                <option value="DONE"><LocalizedText>Done</LocalizedText></option>
                <option value="CANCELED"><LocalizedText>Canceled</LocalizedText></option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]"><LocalizedText>
                Priority
              </LocalizedText></label>
              <select
                value={task.priority}
                onChange={(e) => updateTaskMutation.mutate({ priority: e.target.value })}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
              >
                <option value="URGENT"><LocalizedText>Urgent</LocalizedText></option>
                <option value="HIGH"><LocalizedText>High</LocalizedText></option>
                <option value="MEDIUM"><LocalizedText>Medium</LocalizedText></option>
                <option value="LOW"><LocalizedText>Low</LocalizedText></option>
                <option value="NONE"><LocalizedText>None</LocalizedText></option>
              </select>
            </div>

            {/* Assignee */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]"><LocalizedText>
                Assignee
              </LocalizedText></label>
              <select
                value={task.assigneeId || ""}
                onChange={(e) => updateTaskMutation.mutate({ assigneeId: e.target.value || null })}
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
              >
                <option value=""><LocalizedText>Unassigned</LocalizedText></option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]"><LocalizedText>
                Due Date
              </LocalizedText></label>
              <input
                type="date"
                defaultValue={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  updateTaskMutation.mutate({
                    dueDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                  })
                }
                className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs font-medium"
              />
            </div>

            {/* Estimates & Time Tracking */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]"><LocalizedText>
                  Estimated Time
                </LocalizedText></span>
                <span className="font-medium text-foreground">{task.estimateHours || 0}<LocalizedText>h</LocalizedText></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]"><LocalizedText>
                  Tracked Time
                </LocalizedText></span>
                <span className="font-medium text-emerald-500 font-mono">
                  {formatTime(task.trackedSeconds || 0, locale)}
                </span>
              </div>
            </div>

            {/* Delete button */}
            <div className="pt-4 border-t border-border/40">
              <Button
                variant="destructive"
                size="sm"
                className="w-full h-8 text-xs gap-1.5"
                onClick={() => {
                  if (confirm(t("Are you sure you want to delete this issue?"))) {
                    fetch(`/api/tasks/${task.id}`, { method: "DELETE" }).then(() => {
                      toast.success("Task deleted");
                      onOpenChange(false);
                      queryClient.invalidateQueries({ queryKey: ["tasks"] });
                    });
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /><LocalizedText> Delete Issue
              </LocalizedText></Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

