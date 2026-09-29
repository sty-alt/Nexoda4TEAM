"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import React, { useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckSquare, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface QuickCreateTaskDialogProps {
  workspaceId: string;
  projects: { id: string; name: string; identifier: string; color: string }[];
  members: { id: string; name: string }[];
}

export function QuickCreateTaskDialog({
  workspaceId,
  projects = [],
  members = [],
}: QuickCreateTaskDialogProps) {
  const { quickCreateTaskOpen, setQuickCreateTaskOpen } = useUIStore();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id || "");
  const [assigneeId, setAssigneeId] = useState(members[0]?.id || "");
  const [priority, setPriority] = useState("MEDIUM");
  const [status, setStatus] = useState("TODO");
  const [estimateHours, setEstimateHours] = useState("4");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) {
      toast.error("Please provide a title and select a project");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          projectId,
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          assigneeId: assigneeId || undefined,
          estimateHours: parseFloat(estimateHours) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create task");

      toast.success(`Task created: ${data.task.identifier}`);
      setTitle("");
      setDescription("");
      setQuickCreateTaskOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={quickCreateTaskOpen} onOpenChange={setQuickCreateTaskOpen}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <CheckSquare className="h-4 w-4 text-primary" /><LocalizedText> Create New Issue
            </LocalizedText></DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <div className="space-y-1">
              <Input
                placeholder="Issue title (e.g. Implement WebSocket heartbeat)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
                className="font-medium text-sm"
              />
            </div>

            <div className="space-y-1">
              <Textarea
                placeholder="Add details, acceptance criteria, or context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="space-y-1">
                <label className="text-muted-foreground font-medium"><LocalizedText>Project</LocalizedText></label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.identifier}<LocalizedText> - </LocalizedText>{p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium"><LocalizedText>Status</LocalizedText></label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="BACKLOG"><LocalizedText>Backlog</LocalizedText></option>
                  <option value="TODO"><LocalizedText>Todo</LocalizedText></option>
                  <option value="IN_PROGRESS"><LocalizedText>In Progress</LocalizedText></option>
                  <option value="IN_REVIEW"><LocalizedText>In Review</LocalizedText></option>
                  <option value="DONE"><LocalizedText>Done</LocalizedText></option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium"><LocalizedText>Priority</LocalizedText></label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value="URGENT"><LocalizedText>Urgent</LocalizedText></option>
                  <option value="HIGH"><LocalizedText>High</LocalizedText></option>
                  <option value="MEDIUM"><LocalizedText>Medium</LocalizedText></option>
                  <option value="LOW"><LocalizedText>Low</LocalizedText></option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-medium"><LocalizedText>Assignee</LocalizedText></label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                >
                  <option value=""><LocalizedText>Unassigned</LocalizedText></option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuickCreateTaskOpen(false)}
            ><LocalizedText>
              Cancel
            </LocalizedText></Button>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? <LocalizedText>Creating...</LocalizedText> : <LocalizedText>Create Issue</LocalizedText>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

