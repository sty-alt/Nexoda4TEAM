"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FolderGit2,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProjectsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const workspaceId = wsData?.workspace?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["projects", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { projects: [] };
      const res = await fetch(`/api/projects?workspaceId=${workspaceId}`);
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Project created!");
      setCreateOpen(false);
      setName("");
      setIdentifier("");
      setDescription("");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({
      workspaceId,
      name: name.trim(),
      identifier: identifier.trim() || undefined,
      description: description.trim() || undefined,
      color,
    });
  };

  const projects = data?.projects || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your product roadmaps, milestones, and deliverables
          </p>
        </div>

        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5 text-xs">
          <Plus className="h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Project Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold">No projects yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Create your first project to start tracking issues, sprints, and roadmaps.
          </p>
          <Button onClick={() => setCreateOpen(true)} size="sm" className="mt-4 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Create Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p: any) => (
            <Link
              key={p.id}
              href={`/app/${workspaceSlug}/projects/${p.id}`}
              className="p-5 rounded-xl border border-border/50 bg-card hover:border-primary/50 hover:bg-accent/30 transition-all flex flex-col justify-between space-y-4 group shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="h-3 w-3 rounded-md shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground font-semibold px-2 py-0.5 rounded bg-muted/50 border border-border/40">
                    {p.identifier}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {p.description || "No description provided."}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Progress ({p.completedTasks}/{p.totalTasks} issues)</span>
                  <span>{p.percent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${p.percent}%`, backgroundColor: p.color }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-primary" /> Create Project
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Project Name</label>
                <Input
                  placeholder="e.g. Mobile App Companion"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!identifier) {
                      setIdentifier(
                        e.target.value
                          .slice(0, 3)
                          .toUpperCase()
                          .replace(/[^A-Z]/g, "PRJ")
                      );
                    }
                  }}
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Key / Identifier</label>
                  <Input
                    placeholder="e.g. MOB"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value.toUpperCase())}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Accent Color</label>
                  <div className="flex items-center gap-2 h-9 px-2 rounded-md border border-input bg-background">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-6 w-6 rounded border-0 cursor-pointer bg-transparent"
                    />
                    <span className="font-mono text-xs">{color}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Description</label>
                <Textarea
                  placeholder="Briefly describe what this project delivers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[70px] resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
