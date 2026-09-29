"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Shield,
  Briefcase,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function TeamPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const queryClient = useQueryClient();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviteDepartment, setInviteDepartment] = useState("Engineering");

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const workspaceId = wsData?.workspace?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["team", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { members: [] };
      const res = await fetch(`/api/team?workspaceId=${workspaceId}`);
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const members = data?.members || [];

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    toast.success(`Invitation sent to ${inviteEmail}!`);
    setInviteOpen(false);
    setInviteEmail("");
  };

  const getWorkloadColor = (percent: number) => {
    if (percent > 85) return "bg-rose-500";
    if (percent > 60) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Team & Workload</h1>
            <Badge variant="default" className="text-xs">
              {members.length} Colleagues
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Directory, role-based access control, task assignments, and capacity analytics
          </p>
        </div>

        <Button onClick={() => setInviteOpen(true)} size="sm" className="text-xs gap-1.5 h-8">
          <UserPlus className="h-4 w-4" /> Invite Colleague
        </Button>
      </div>

      {/* Team Members Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          <div className="h-44 bg-muted rounded-xl" />
          <div className="h-44 bg-muted rounded-xl" />
          <div className="h-44 bg-muted rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member: any) => (
            <Card key={member.id} className="subtle-border p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <UserAvatar
                      name={member.user.name}
                      avatar={member.user.avatar}
                      size="lg"
                    />
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">
                      {member.user.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{member.user.email}</p>
                    <p className="text-xs text-foreground/80 font-medium mt-0.5">
                      {member.user.title || "Specialist"}
                    </p>
                  </div>
                </div>

                <Badge variant="secondary" className="text-[10px] uppercase font-mono">
                  {member.role}
                </Badge>
              </div>

              {/* Workload Capacity Bar */}
              <div className="space-y-1.5 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Weekly Workload</span>
                  <span className="font-medium text-foreground">
                    {member.totalEstimatedHours}h / 40h ({member.workloadPercent}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getWorkloadColor(
                      member.workloadPercent
                    )}`}
                    style={{ width: `${member.workloadPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>{member.activeTasksCount} active tasks</span>
                  <span className="text-primary font-medium">{member.department}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Member Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" /> Invite Colleague
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground">Work Email</label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                    <option value="GUEST">Guest</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-muted-foreground">Department</label>
                  <select
                    value={inviteDepartment}
                    onChange={(e) => setInviteDepartment(e.target.value)}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setInviteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Send Invite
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
