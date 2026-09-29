"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, ArrowRight, Building2, User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          workspaceName: workspaceName || `${name}'s Team`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      toast.success("Account and workspace created!");
      router.push(`/onboarding?ws=${data.workspace?.slug || ""}`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-md space-y-6 relative z-10">
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
          <h1 className="text-2xl font-bold tracking-tight mt-4">Start your workspace</h1>
          <p className="text-sm text-muted-foreground">
            Everything your team needs in one connected system
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="p-6 rounded-xl border border-border/80 bg-card/80 backdrop-blur-md shadow-lg space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Full Name
            </label>
            <Input
              type="text"
              placeholder="Elena Rostova"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Work Email
            </label>
            <Input
              type="email"
              placeholder="elena@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="bg-background/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5" /> Password (min 6 characters)
            </label>
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

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" /> Workspace Name (Optional)
            </label>
            <Input
              type="text"
              placeholder="Acme Studio"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              disabled={loading}
              className="bg-background/50"
            />
          </div>

          <Button
            type="submit"
            className="w-full font-medium"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Workspace"}
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>

          <div className="pt-2 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
