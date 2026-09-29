"use client";

import { LocalizedText } from "@/i18n/locale-provider";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  User,
  Building,
  Shield,
  Palette,
  Keyboard,
  Key,
  Bell,
  CheckCircle2,
  Moon,
  Sun,
  Laptop,
  Copy,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useUIStore } from "@/store/useUIStore";
import { toast } from "sonner";

export default function SettingsPage() {
  const params = useParams();
  const workspaceSlug = params.workspaceSlug as string;
  const { theme, setTheme } = useUIStore();
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState("profile");

  const { data: authData } = useQuery({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    },
  });

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceSlug],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceSlug}`);
      return res.json();
    },
  });

  const currentUser = authData?.user;
  const workspace = wsData?.workspace;

  const [name, setName] = useState(currentUser?.name || "Alex Vance");
  const [title, setTitle] = useState(currentUser?.title || "Lead Systems Architect");
  const [apiKeyGenerated, setApiKeyGenerated] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile preferences saved!");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-2xl font-bold tracking-tight"><LocalizedText>Settings & Preferences</LocalizedText></h1>
        <p className="text-xs text-muted-foreground mt-0.5"><LocalizedText>
          Manage your account, workspace configuration, permissions, and security
        </LocalizedText></p>
      </div>

      {/* Tabs */}
      <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
        <TabsList className="bg-muted/40 p-1 border border-border/40 flex-wrap h-auto gap-1">
          <TabsTrigger value="profile" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <User className="h-3.5 w-3.5" /><LocalizedText> Profile & Account
          </LocalizedText></TabsTrigger>
          <TabsTrigger value="workspace" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <Building className="h-3.5 w-3.5" /><LocalizedText> Workspace
          </LocalizedText></TabsTrigger>
          <TabsTrigger value="rbac" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <Shield className="h-3.5 w-3.5" /><LocalizedText> RBAC Permissions
          </LocalizedText></TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <Palette className="h-3.5 w-3.5" /><LocalizedText> Appearance
          </LocalizedText></TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1.5 data-[state=active]:bg-card">
            <Key className="h-3.5 w-3.5" /><LocalizedText> Security & API
          </LocalizedText></TabsTrigger>
        </TabsList>

        {/* Profile Section */}
        <TabsContent value="profile" className="space-y-4 m-0">
          <Card className="subtle-border p-6 space-y-4">
            <h3 className="font-semibold text-sm"><LocalizedText>Personal Information</LocalizedText></h3>
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md text-xs">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground"><LocalizedText>Full Name</LocalizedText></label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/60"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground"><LocalizedText>Email Address</LocalizedText></label>
                <Input
                  value={currentUser?.email || "alex@acme.com"}
                  disabled
                  className="bg-muted/40 text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground"><LocalizedText>Job Title / Role</LocalizedText></label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/60"
                />
              </div>

              <Button type="submit" size="sm"><LocalizedText>
                Save Profile
              </LocalizedText></Button>
            </form>
          </Card>
        </TabsContent>

        {/* Workspace Section */}
        <TabsContent value="workspace" className="space-y-4 m-0">
          <Card className="subtle-border p-6 space-y-4">
            <h3 className="font-semibold text-sm"><LocalizedText>Workspace Information</LocalizedText></h3>
            <div className="space-y-4 max-w-md text-xs">
              <div className="space-y-1">
                <label className="font-medium text-muted-foreground"><LocalizedText>Workspace Name</LocalizedText></label>
                <Input
                  defaultValue={workspace?.name || "Acme Corporation"}
                  className="bg-background/60"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-muted-foreground"><LocalizedText>Workspace Slug</LocalizedText></label>
                <Input
                  value={workspaceSlug}
                  disabled
                  className="bg-muted/40 font-mono text-muted-foreground"
                />
              </div>

              <div className="pt-2">
                <Button size="sm" onClick={() => toast.success("Workspace updated!")}><LocalizedText>
                  Update Workspace
                </LocalizedText></Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* RBAC Permissions Section */}
        <TabsContent value="rbac" className="space-y-4 m-0">
          <Card className="subtle-border p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-sm"><LocalizedText>Role-Based Access Control (RBAC)</LocalizedText></h3>
              <p className="text-xs text-muted-foreground mt-0.5"><LocalizedText>
                Defines default permission matrix across workspace capabilities
              </LocalizedText></p>
            </div>

            <div className="rounded-xl border border-border/40 overflow-hidden bg-card text-xs">
              <table className="w-full text-left">
                <thead className="bg-muted/40 border-b border-border/40 text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3"><LocalizedText>Capability</LocalizedText></th>
                    <th className="p-3 text-center"><LocalizedText>Owner</LocalizedText></th>
                    <th className="p-3 text-center"><LocalizedText>Admin</LocalizedText></th>
                    <th className="p-3 text-center"><LocalizedText>Manager</LocalizedText></th>
                    <th className="p-3 text-center"><LocalizedText>Member</LocalizedText></th>
                    <th className="p-3 text-center"><LocalizedText>Guest</LocalizedText></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  <tr>
                    <td className="p-3 font-medium"><LocalizedText>Create & Delete Projects</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-muted-foreground"><LocalizedText>—</LocalizedText></td>
                    <td className="p-3 text-center text-muted-foreground"><LocalizedText>—</LocalizedText></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium"><LocalizedText>Manage Tasks & Issues</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium"><LocalizedText>Documents & Knowledge Base</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-muted-foreground"><LocalizedText>Read Only</LocalizedText></td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium"><LocalizedText>Manage Billing & Integrations</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-emerald-500 font-bold"><LocalizedText>✓</LocalizedText></td>
                    <td className="p-3 text-center text-muted-foreground"><LocalizedText>—</LocalizedText></td>
                    <td className="p-3 text-center text-muted-foreground"><LocalizedText>—</LocalizedText></td>
                    <td className="p-3 text-center text-muted-foreground"><LocalizedText>—</LocalizedText></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance Section */}
        <TabsContent value="appearance" className="space-y-4 m-0">
          <Card className="subtle-border p-6 space-y-4">
            <h3 className="font-semibold text-sm"><LocalizedText>Theme & Visual Experience</LocalizedText></h3>
            <p className="text-xs text-muted-foreground"><LocalizedText>
              Choose your preferred interface theme. Carefully calibrated contrast in both light and dark.
            </LocalizedText></p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  theme === "dark"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 hover:bg-accent"
                }`}
              >
                <Moon className="h-5 w-5 mb-2" />
                <div className="font-semibold text-xs"><LocalizedText>Dark Obsidian</LocalizedText></div>
                <div className="text-[11px] text-muted-foreground mt-0.5"><LocalizedText>
                  Deep neutral zinc palette with electric highlights
                </LocalizedText></div>
              </button>

              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  theme === "light"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 hover:bg-accent"
                }`}
              >
                <Sun className="h-5 w-5 mb-2" />
                <div className="font-semibold text-xs"><LocalizedText>Pure Light</LocalizedText></div>
                <div className="text-[11px] text-muted-foreground mt-0.5"><LocalizedText>
                  Crisp daylight theme with high readability
                </LocalizedText></div>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  theme === "system"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 hover:bg-accent"
                }`}
              >
                <Laptop className="h-5 w-5 mb-2" />
                <div className="font-semibold text-xs"><LocalizedText>System Synchronized</LocalizedText></div>
                <div className="text-[11px] text-muted-foreground mt-0.5"><LocalizedText>
                  Matches your operating system preference
                </LocalizedText></div>
              </button>
            </div>
          </Card>
        </TabsContent>

        {/* Security & API Section */}
        <TabsContent value="security" className="space-y-4 m-0">
          <Card className="subtle-border p-6 space-y-4">
            <h3 className="font-semibold text-sm"><LocalizedText>Developer API Keys</LocalizedText></h3>
            <p className="text-xs text-muted-foreground"><LocalizedText>
              API tokens allow programmatic access to your tasks, documents, and webhooks.
            </LocalizedText></p>

            <div className="space-y-3 pt-2">
              {apiKeyGenerated ? (
                <div className="p-3 rounded-xl border border-primary/40 bg-primary/5 flex items-center justify-between text-xs">
                  <span className="font-mono text-foreground"><LocalizedText>
                    nx_live_98a72f10b83e490c29184d092
                  </LocalizedText></span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText("nx_live_98a72f10b83e490c29184d092");
                      toast.success("Copied to clipboard");
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    <Copy className="h-3 w-3" /><LocalizedText> Copy
                  </LocalizedText></Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    setApiKeyGenerated(true);
                    toast.success("Generated new API token!");
                  }}
                  className="text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /><LocalizedText> Generate Personal Token
                </LocalizedText></Button>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

