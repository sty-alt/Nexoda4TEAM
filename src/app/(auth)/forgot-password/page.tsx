"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Layers, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
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
          <h1 className="text-2xl font-bold tracking-tight mt-4">Reset password</h1>
          <p className="text-sm text-muted-foreground">
            We will send you a secure verification link
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border/80 bg-card/80 backdrop-blur-md shadow-lg space-y-4">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
              <h3 className="font-semibold text-lg">Reset Link Dispatched</h3>
              <p className="text-sm text-muted-foreground">
                If an account exists for <span className="text-foreground font-medium">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link href="/login">Return to login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Account Email
                </label>
                <Input
                  type="email"
                  placeholder="alex@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
