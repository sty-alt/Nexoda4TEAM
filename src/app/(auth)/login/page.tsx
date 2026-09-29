"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, ArrowRight, Sparkles, Lock, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPass = customPass || password;

    if (!loginEmail || !loginPass) {
      toast.error("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to login");
      }

      toast.success("Welcome back to Nexoda4TEAM!");
      const targetSlug = data.workspace?.slug || "acme-corp";
      router.push(`/app/${targetSlug}/dashboard`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword("demo123");
    toast.info(`Logging in as ${demoRole}...`);
    handleLogin(undefined, demoEmail, "demo123");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-card border border-border/60 shadow-sm hover:border-primary/50 transition-colors"
          >
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/30">
              <Layers className="h-4 w-4" />
            </div>
            <span className="font-bold text-base tracking-tight">Nexoda4TEAM</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-4">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your projects, docs, chat, and planner
          </p>
        </div>

        {/* Demo 1-Click Login Cards */}
        <div className="p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-md shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Instant Demo Sign-in
            </span>
            <span className="text-[11px] text-muted-foreground">Password: demo123</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => demoLogin("alex@acme.com", "Alex (Tech Lead)")}
              className="p-2.5 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-accent text-left transition-all group"
            >
              <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                Alex Vance
              </div>
              <div className="text-[11px] text-muted-foreground">Tech Lead</div>
            </button>
            <button
              type="button"
              onClick={() => demoLogin("sarah@acme.com", "Sarah (Product Mgr)")}
              className="p-2.5 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-accent text-left transition-all group"
            >
              <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                Sarah Chen
              </div>
              <div className="text-[11px] text-muted-foreground">Product Head</div>
            </button>
            <button
              type="button"
              onClick={() => demoLogin("oleg@acme.com", "Oleg (Full Stack)")}
              className="p-2.5 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-accent text-left transition-all group"
            >
              <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                Oleg Ivanov
              </div>
              <div className="text-[11px] text-muted-foreground">Full Stack</div>
            </button>
          </div>
        </div>

        {/* Standard credentials form */}
        <form
          onSubmit={handleLogin}
          className="p-6 rounded-xl border border-border/80 bg-card/80 backdrop-blur-md shadow-lg space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Work Email
            </label>
            <Input
              type="email"
              placeholder="alex@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="bg-background/50"
            />
          </div>

          <Button
            type="submit"
            className="w-full font-medium"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Continue to Workspace"}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Create workspace
            </Link>
          </div>
        </form>

        {/* Security & Features Badge */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/80">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> End-to-end Encrypted
          </span>
          <span>•</span>
          <span>Role-Based Access</span>
          <span>•</span>
          <span>Real-time Sync</span>
        </div>
      </div>
    </div>
  );
}
