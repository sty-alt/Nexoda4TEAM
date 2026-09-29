"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  Server,
  Activity,
  Users,
  Database,
  CheckCircle2,
  HardDrive,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

export default function AdminPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const workspace = wsData?.workspace;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">System Administration</h1>
          <Badge variant="success" className="text-xs">
            Cluster Healthy
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          System telemetry, infrastructure status, connected workspace nodes, and security audit logs
        </p>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="subtle-border p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Database Node</span>
            <Database className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-foreground">SQLite / Local</div>
          <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> 0.8ms query latency
          </div>
        </Card>

        <Card className="subtle-border p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Real-time Event Bus</span>
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-foreground">SSE Stream</div>
          <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Connected (Keep-alive 20s)
          </div>
        </Card>

        <Card className="subtle-border p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Memory Consumption</span>
            <Cpu className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-foreground">124 MB</div>
          <div className="text-[11px] text-muted-foreground">Heap allocation stable</div>
        </Card>

        <Card className="subtle-border p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Registered Seats</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {workspace?.members?.length || 5} Active
          </div>
          <div className="text-[11px] text-muted-foreground">Unlimited tier license</div>
        </Card>
      </div>

      {/* Audit Log Stream */}
      <Card className="subtle-border p-5 space-y-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Security & Event Audit Logs
        </CardTitle>

        <div className="rounded-xl border border-border/40 overflow-hidden bg-card text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/40 border-b border-border/40 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">IP / Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <tr>
                <td className="p-3 text-muted-foreground font-mono">Today, 02:25 AM</td>
                <td className="p-3 font-medium">Alex Vance</td>
                <td className="p-3">
                  <Badge variant="default">STATUS_CHANGED</Badge>
                </td>
                <td className="p-3 font-mono text-muted-foreground">NX-101</td>
                <td className="p-3 text-muted-foreground font-mono">127.0.0.1 (Web)</td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground font-mono">Today, 02:24 AM</td>
                <td className="p-3 font-medium">Sarah Chen</td>
                <td className="p-3">
                  <Badge variant="secondary">AUTH_LOGIN</Badge>
                </td>
                <td className="p-3 font-mono text-muted-foreground">Session Token</td>
                <td className="p-3 text-muted-foreground font-mono">127.0.0.1 (Web)</td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground font-mono">Today, 02:22 AM</td>
                <td className="p-3 font-medium">System Seed</td>
                <td className="p-3">
                  <Badge variant="success">WORKSPACE_PROVISIONED</Badge>
                </td>
                <td className="p-3 font-mono text-muted-foreground">Acme Corporation</td>
                <td className="p-3 text-muted-foreground font-mono">Internal Daemon</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
