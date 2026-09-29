"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Inbox,
  CheckCheck,
  CheckCircle2,
  Archive,
  Bell,
  MessageSquare,
  CheckSquare,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function InboxPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const queryClient = useQueryClient();

  const [filterTab, setFilterTab] = useState<"all" | "unread" | "tasks" | "mentions">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return res.json();
    },
  });

  const notifications = data?.notifications || [];

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      return res.json();
    },
    onSuccess: () => {
      toast.success("All marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const filtered = useMemo(() => {
    return notifications.filter((n: any) => {
      if (filterTab === "unread") return !n.isRead;
      if (filterTab === "tasks") return n.type.includes("TASK");
      if (filterTab === "mentions") return n.type === "MENTION";
      return true;
    });
  }, [notifications, filterTab]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return <CheckSquare className="h-4 w-4 text-primary" />;
      case "MENTION":
        return <MessageSquare className="h-4 w-4 text-emerald-500" />;
      case "DEADLINE":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
      default:
        return <Bell className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Unified Inbox</h1>
            <Badge variant="default" className="text-xs">
              {notifications.filter((n: any) => !n.isRead).length} unread
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aggregated notifications, task assignments, mentions, and deadline alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => markAllAsReadMutation.mutate()}
            className="text-xs gap-1.5 h-8"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-2 text-xs">
        <button
          onClick={() => setFilterTab("all")}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            filterTab === "all"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilterTab("unread")}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            filterTab === "unread"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilterTab("tasks")}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            filterTab === "tasks"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Assignments
        </button>
        <button
          onClick={() => setFilterTab("mentions")}
          className={`px-3 py-1 rounded-md font-medium transition-colors ${
            filterTab === "mentions"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Mentions
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-16 bg-muted rounded-xl" />
            <div className="h-16 bg-muted rounded-xl" />
            <div className="h-16 bg-muted rounded-xl" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 rounded-xl border border-dashed border-border/60 bg-card/30 p-8 space-y-2">
            <Inbox className="h-10 w-10 text-muted-foreground/60 mx-auto" />
            <h3 className="font-semibold text-sm">Inbox Zero</h3>
            <p className="text-xs text-muted-foreground">
              You are completely caught up! No unread notifications or alerts.
            </p>
          </div>
        ) : (
          filtered.map((item: any) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border border-border/40 transition-all flex items-start justify-between gap-4 ${
                !item.isRead
                  ? "bg-card/90 border-primary/30 shadow-sm"
                  : "bg-card/40 opacity-80"
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-muted/60 shrink-0 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-xs text-foreground">
                      {item.title}
                    </h4>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground/70 block pt-0.5">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
              </div>

              {item.link && (
                <Button asChild size="sm" variant="ghost" className="text-xs shrink-0 gap-1 h-7">
                  <Link href={item.link}>
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
