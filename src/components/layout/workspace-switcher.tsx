"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Building,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { WorkspaceWithDetails } from "@/lib/types";

interface WorkspaceSwitcherProps {
  currentWorkspace: WorkspaceWithDetails;
  workspaces: WorkspaceWithDetails[];
}

export function WorkspaceSwitcher({
  currentWorkspace,
  workspaces,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWsName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");

      toast.success("Workspace created!");
      setCreateOpen(false);
      setNewWsName("");
      router.push(`/app/${data.workspace.slug}/dashboard`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent/70 transition-colors border border-border/40 group text-left">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-md bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center text-primary-foreground font-bold text-xs shadow-sm shrink-0">
                {currentWorkspace.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="font-semibold text-xs text-foreground truncate">
                  {currentWorkspace.name}
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {currentWorkspace.role || "Owner"}
                </div>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="start">
          <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
            Workspaces
          </DropdownMenuLabel>
          {workspaces.map((ws) => {
            const isActive = ws.slug === currentWorkspace.slug;
            return (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => router.push(`/app/${ws.slug}/dashboard`)}
                className="flex items-center justify-between cursor-pointer py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate text-xs font-medium">{ws.name}</span>
                </div>
                {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setCreateOpen(true)}
            className="cursor-pointer gap-2 py-2 text-xs text-primary"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Workspace</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => router.push(`/app/${currentWorkspace.slug}/settings`)}
            className="cursor-pointer gap-2 py-2 text-xs text-muted-foreground"
          >
            <Settings className="h-4 w-4" />
            <span>Workspace Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateWorkspace}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" /> Create Workspace
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <label className="text-xs font-medium text-muted-foreground">
                Workspace Name
              </label>
              <Input
                placeholder="e.g. Next Ventures"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                autoFocus
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
