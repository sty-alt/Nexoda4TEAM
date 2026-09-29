"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Layers,
  ArrowRight,
  Check,
  Code2,
  Palette,
  Briefcase,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import confetti from "canvas-confetti";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("ws") || "acme-corp";

  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState("engineering");
  const [teamEmails, setTeamEmails] = useState("sarah@company.com, oleg@company.com");
  const [projectName, setProjectName] = useState("Product Launch v1");
  const [firstTask, setFirstTask] = useState("Design architecture blueprint");

  const finishOnboarding = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
    toast.success("Workspace ready! Welcome to Nexoda4TEAM.");
    router.push(`/app/${initialSlug}/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Header with step indicators */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" /> Quick Setup • Step {step} of 3
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Configure your environment</h1>
          <p className="text-sm text-muted-foreground">
            Personalize Nexoda4TEAM to match your team's rhythm
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md shadow-xl">
          {/* Step 1: Select Template */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                How will you primarily use Nexoda4TEAM?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTemplate("engineering")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    template === "engineering"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/60 hover:border-border hover:bg-accent"
                  }`}
                >
                  <Code2 className="h-6 w-6 mb-2" />
                  <div className="font-semibold text-sm">Engineering</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Linear issues, sprints, GitHub link
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplate("product")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    template === "product"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/60 hover:border-border hover:bg-accent"
                  }`}
                >
                  <Palette className="h-6 w-6 mb-2" />
                  <div className="font-semibold text-sm">Product & Design</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Roadmaps, Notion docs, specs
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTemplate("business")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    template === "business"
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/60 hover:border-border hover:bg-accent"
                  }`}
                >
                  <Briefcase className="h-6 w-6 mb-2" />
                  <div className="font-semibold text-sm">Operations</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    Planner, time tracking, drives
                  </div>
                </button>
              </div>

              <Button onClick={() => setStep(2)} className="w-full mt-4">
                Next: Invite Colleagues <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </div>
          )}

          {/* Step 2: Invite Teammates */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">Invite your team</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter emails of colleagues who should join this workspace. You can also invite more later.
              </p>
              <Input
                value={teamEmails}
                onChange={(e) => setTeamEmails(e.target.value)}
                placeholder="colleague1@co.com, colleague2@co.com"
                className="bg-background/50"
              />

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next: First Project <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: First Project & Task */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Create your first project & issue</h3>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Project Name</label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">First Task / Issue</label>
                <Input
                  value={firstTask}
                  onChange={(e) => setFirstTask(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={finishOnboarding} className="flex-1">
                  Launch Workspace <Check className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">Loading onboarding...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
