"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Flame,
  Zap,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const workspaceId = wsData?.workspace?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["reports", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const res = await fetch(`/api/reports?workspaceId=${workspaceId}`);
      return res.json();
    },
    enabled: !!workspaceId,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-8 w-64 bg-muted rounded-md" />
        <div className="grid grid-cols-4 gap-4">
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-32 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const {
    totalTasks,
    completedTasks,
    inProgressTasks,
    totalTrackedHours,
    avgCycleTimeDays,
    avgLeadTimeDays,
    velocityPoints,
    userTimeData = [],
  } = data;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight"><LocalizedText>Reports & Velocity</LocalizedText></h1>
          <Badge variant="default" className="text-xs"><LocalizedText>
            Sprint 24 Cycle
          </LocalizedText></Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5"><LocalizedText>
          Engineering throughput, velocity, cycle time, and workload distribution metrics
        </LocalizedText></p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="subtle-border p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span><LocalizedText>Sprint Velocity</LocalizedText></span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">
            {velocityPoints}<LocalizedText> pts
          </LocalizedText></div>
          <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="h-3 w-3" /><LocalizedText> +18% vs last sprint
          </LocalizedText></div>
        </Card>

        <Card className="subtle-border p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span><LocalizedText>Completion Rate</LocalizedText></span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">
            {completionRate}<LocalizedText>%
          </LocalizedText></div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {completedTasks}<LocalizedText> of </LocalizedText>{totalTasks}<LocalizedText> deliverables
          </LocalizedText></div>
        </Card>

        <Card className="subtle-border p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span><LocalizedText>Average Cycle Time</LocalizedText></span>
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground">
            {avgCycleTimeDays}<LocalizedText> days
          </LocalizedText></div>
          <div className="text-[11px] text-muted-foreground mt-1"><LocalizedText>
            Time from in-progress to shipped
          </LocalizedText></div>
        </Card>

        <Card className="subtle-border p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span><LocalizedText>Tracked Focus Time</LocalizedText></span>
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground font-mono">
            {totalTrackedHours}<LocalizedText>h
          </LocalizedText></div>
          <div className="text-[11px] text-muted-foreground mt-1"><LocalizedText>
            Aggregated across team members
          </LocalizedText></div>
        </Card>
      </div>

      {/* Team Time Breakdown & Task Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Time Logged Breakdown */}
        <Card className="subtle-border p-5 space-y-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /><LocalizedText> Team Hours Tracked
          </LocalizedText></CardTitle>

          <div className="space-y-3 pt-2">
            {userTimeData.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-8"><LocalizedText>
                No time entries logged yet.
              </LocalizedText></div>
            ) : (
              userTimeData.map((item: any) => {
                const maxHours = Math.max(...userTimeData.map((u: any) => u.hours), 1);
                const percent = Math.round((item.hours / maxHours) * 100);

                return (
                  <div key={item.name} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span>{item.name}</span>
                      <span className="font-mono text-muted-foreground">{item.hours}<LocalizedText> hrs</LocalizedText></span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Lead Time & Throughput Explanation */}
        <Card className="subtle-border p-5 space-y-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /><LocalizedText> Throughput & Delivery Metrics
          </LocalizedText></CardTitle>

          <div className="space-y-3 pt-2 text-xs">
            <div className="p-3.5 rounded-xl border border-border/40 bg-card/60 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span><LocalizedText>Lead Time</LocalizedText></span>
                <span className="font-mono text-primary">{avgLeadTimeDays}<LocalizedText> days</LocalizedText></span>
              </div>
              <p className="text-[11px] text-muted-foreground"><LocalizedText>
                Total time from when an issue is created in Backlog to when it is shipped to Done.
              </LocalizedText></p>
            </div>

            <div className="p-3.5 rounded-xl border border-border/40 bg-card/60 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span><LocalizedText>WIP Constraints (Work in Progress)</LocalizedText></span>
                <Badge variant="success" className="text-[10px]"><LocalizedText>Healthy (4 active)</LocalizedText></Badge>
              </div>
              <p className="text-[11px] text-muted-foreground"><LocalizedText>
                Active tasks in development stay within capacity limits to minimize context switching.
              </LocalizedText></p>
            </div>

            <div className="p-3.5 rounded-xl border border-border/40 bg-card/60 space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span><LocalizedText>Sprint Health</LocalizedText></span>
                <span className="text-emerald-500 font-semibold"><LocalizedText>92% on schedule</LocalizedText></span>
              </div>
              <p className="text-[11px] text-muted-foreground"><LocalizedText>
                Current burndown trend projects zero spillover for Sprint 24.
              </LocalizedText></p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

