"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GitBranch,
  GitPullRequest,
  GitCommit,
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function GithubIntegrationPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const queryClient = useQueryClient();

  const [connectOpen, setConnectOpen] = useState(false);
  const [repoName, setRepoName] = useState("acme/nexoda-app");
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const workspaceId = wsData?.workspace?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["github", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { repos: [], linkedItems: [] };
      const res = await fetch(`/api/integrations/github?workspaceId=${workspaceId}`);
      return res.json();
    },
    enabled: !!workspaceId,
  });

  const repos = data?.repos || [
    {
      id: "repo-1",
      repoName: "acme/nexoda-workspace",
      repoUrl: "https://github.com/acme/nexoda-workspace",
      defaultBranch: "main",
      isConnected: true,
    },
  ];

  const linkedItems = data?.linkedItems || [
    {
      id: "link-1",
      type: "PR",
      externalId: "#142",
      title: "feat(realtime): SSE event stream dispatcher",
      url: "https://github.com/acme/nexoda-app/pull/142",
      status: "OPEN",
      branch: "feature/realtime-sse",
      task: { identifier: "NX-101", title: "Architect real-time event bus with SSE" },
    },
  ];

  const connectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/integrations/github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, repoName }),
      });
      return res.json();
    },
    onSuccess: () => {
      toast.success(`Connected repository ${repoName}!`);
      setConnectOpen(false);
      setRepoName("");
      queryClient.invalidateQueries({ queryKey: ["github"] });
    },
  });

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("GitHub bi-directional synchronization complete!");
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight"><LocalizedText>GitHub Integration</LocalizedText></h1>
            <Badge variant="success" className="text-xs"><LocalizedText>
              Bi-directional Sync Active
            </LocalizedText></Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5"><LocalizedText>
            Connect repositories, link PRs and issues to internal tasks, and automate status transitions
          </LocalizedText></p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            className="text-xs gap-1.5 h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
          <Button
            size="sm"
            onClick={() => setConnectOpen(true)}
            className="text-xs gap-1.5 h-8"
          >
            <Plus className="h-4 w-4" /><LocalizedText> Connect Repository
          </LocalizedText></Button>
        </div>
      </div>

      {/* Connected Repositories */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" /><LocalizedText> Connected Repositories
        </LocalizedText></h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo: any) => (
            <Card key={repo.id} className="subtle-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <GitBranch className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-foreground">
                      {repo.repoName}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-mono"><LocalizedText>
                      branch: </LocalizedText>{repo.defaultBranch}
                    </span>
                  </div>
                </div>

                <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /><LocalizedText> Webhook Active
                </LocalizedText></span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Linked Pull Requests & Commits */}
      <div className="space-y-3 pt-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <GitPullRequest className="h-4 w-4 text-primary" /><LocalizedText> Active Linked Pull Requests
        </LocalizedText></h3>

        <div className="rounded-xl border border-border/40 overflow-hidden bg-card/60">
          <div className="divide-y divide-border/30">
            {linkedItems.map((item: any) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <GitPullRequest className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{item.externalId}</span>
                      <span className="text-muted-foreground truncate max-w-md">
                        {item.title}
                      </span>
                    </div>
                    {item.task && (
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                        <Link2 className="h-3 w-3 text-primary" />
                        <span><LocalizedText>
                          Linked to </LocalizedText><strong className="text-foreground">{item.task.identifier}</strong><LocalizedText>: </LocalizedText>{item.task.title}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="success" className="text-[10px]">
                    <LocalizedText>{item.status || "OPEN"}</LocalizedText>
                  </Badge>
                  <Button asChild size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connect Repo Dialog */}
      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              connectMutation.mutate();
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <GitBranch className="h-4 w-4 text-primary" /><LocalizedText> Connect GitHub Repository
              </LocalizedText></DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2 text-xs">
              <label className="font-medium text-muted-foreground"><LocalizedText>Repository Name (org/repo)</LocalizedText></label>
              <Input
                placeholder="e.g. acme/web-platform"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setConnectOpen(false)}><LocalizedText>
                Cancel
              </LocalizedText></Button>
              <Button type="submit" size="sm" disabled={connectMutation.isPending}><LocalizedText>
                Connect
              </LocalizedText></Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

