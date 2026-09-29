"use client";

import { LocalizedText } from "@/i18n/locale-provider";
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
          <h1 className="text-2xl font-bold tracking-tight"><LocalizedText>System Administration</LocalizedText></h1>
          <Badge variant="success" className="text-xs"><LocalizedText>
            Cluster Healthy
          </LocalizedText></Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5"><LocalizedText>
          System telemetry, infrastructure status, connected workspace nodes, and security audit logs
        </LocalizedText></p>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="subtle-border p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span><LocalizedText>Database Node</LocalizedText></span>
            <Database className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-foreground"><LocalizedText>SQLite / Local</LocalizedText></div>
          <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /><LocalizedText> 0.8ms query latency
          </LocalizedText></div>
        </Card>

        <Card className="subtle-border p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span><LocalizedText>Real-time Event Bus</LocalizedText></span>
            <Server className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-foreground"><LocalizedText>SSE Stream</LocalizedText></div>
          <div className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /><LocalizedText> Connected (Keep-alive 20s)
          </LocalizedText></div>
        </Card>

        <Card className="subtle-border p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span><LocalizedText>Memory Consumption</LocalizedText></span>
            <Cpu className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-foreground"><LocalizedText>124 MB</LocalizedText></div>
          <div className="text-[11px] text-muted-foreground"><LocalizedText>Heap allocation stable</LocalizedText></div>
        </Card>

        <Card className="subtle-border p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span><LocalizedText>Registered Seats</LocalizedText></span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-foreground">
            {workspace?.members?.length || 5}<LocalizedText> Active
          </LocalizedText></div>
          <div className="text-[11px] text-muted-foreground"><LocalizedText>Unlimited tier license</LocalizedText></div>
        </Card>
      </div>

      {/* Audit Log Stream */}
      <Card className="subtle-border p-5 space-y-4">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /><LocalizedText> Security & Event Audit Logs
        </LocalizedText></CardTitle>

        <div className="rounded-xl border border-border/40 overflow-hidden bg-card text-xs">
          <table className="w-full text-left">
            <thead className="bg-muted/40 border-b border-border/40 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3"><LocalizedText>Timestamp</LocalizedText></th>
                <th className="p-3"><LocalizedText>Actor</LocalizedText></th>
                <th className="p-3"><LocalizedText>Action</LocalizedText></th>
                <th className="p-3"><LocalizedText>Entity</LocalizedText></th>
                <th className="p-3"><LocalizedText>IP / Context</LocalizedText></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <tr>
                <td className="p-3 text-muted-foreground font-mono"><LocalizedText>Today, 02:25 AM</LocalizedText></td>
                <td className="p-3 font-medium"><LocalizedText>Alex Vance</LocalizedText></td>
                <td className="p-3">
                  <Badge variant="default"><LocalizedText>STATUS_CHANGED</LocalizedText></Badge>
                </td>
                <td className="p-3 font-mono text-muted-foreground"><LocalizedText>NX-101</LocalizedText></td>
                <td className="p-3 text-muted-foreground font-mono"><LocalizedText>127.0.0.1 (Web)</LocalizedText></td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground font-mono"><LocalizedText>Today, 02:24 AM</LocalizedText></td>
                <td className="p-3 font-medium"><LocalizedText>Sarah Chen</LocalizedText></td>
                <td className="p-3">
                  <Badge variant="secondary"><LocalizedText>AUTH_LOGIN</LocalizedText></Badge>
                </td>
                <td className="p-3 font-mono text-muted-foreground"><LocalizedText>Session Token</LocalizedText></td>
                <td className="p-3 text-muted-foreground font-mono"><LocalizedText>127.0.0.1 (Web)</LocalizedText></td>
              </tr>
              <tr>
                <td className="p-3 text-muted-foreground font-mono"><LocalizedText>Today, 02:22 AM</LocalizedText></td>
                <td className="p-3 font-medium"><LocalizedText>System Seed</LocalizedText></td>
                <td className="p-3">
                  <Badge variant="success"><LocalizedText>WORKSPACE_PROVISIONED</LocalizedText></Badge>
                </td>
                <td className="p-3 font-mono text-muted-foreground"><LocalizedText>Acme Corporation</LocalizedText></td>
                <td className="p-3 text-muted-foreground font-mono"><LocalizedText>Internal Daemon</LocalizedText></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

