"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Moon,
  Sun,
  Laptop,
  Shield,
  Keyboard,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/avatar";
import { useUIStore } from "@/store/useUIStore";
import { toast } from "sonner";
import { SafeUser } from "@/lib/types";

interface UserNavProps {
  user: SafeUser;
  workspaceSlug: string;
}

export function UserNav({ user, workspaceSlug }: UserNavProps) {
  const router = useRouter();
  const { setTheme, setShortcutsModalOpen } = useUIStore();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out");
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent/60 transition-colors group text-left">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>
            <div className="truncate">
              <div className="font-medium text-xs text-foreground truncate">
                {user.name}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">
                {user.status || user.title || user.email}
              </div>
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" side="top">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-semibold leading-none">{user.name}</p>
            <p className="text-[11px] leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push(`/app/${workspaceSlug}/settings`)}
          className="cursor-pointer gap-2 py-1.5 text-xs"
        >
          <User className="h-4 w-4 text-muted-foreground" />
          <span>Profile & Account</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer gap-2 py-1.5 text-xs">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-muted-foreground" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-muted-foreground" />
            <span className="ml-1">Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => setTheme("light")} className="text-xs">
              <Sun className="h-3.5 w-3.5 mr-2" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")} className="text-xs">
              <Moon className="h-3.5 w-3.5 mr-2" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")} className="text-xs">
              <Laptop className="h-3.5 w-3.5 mr-2" /> System
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem
          onClick={() => setShortcutsModalOpen(true)}
          className="cursor-pointer gap-2 py-1.5 text-xs"
        >
          <Keyboard className="h-4 w-4 text-muted-foreground" />
          <span>Keyboard Shortcuts</span>
          <span className="ml-auto text-[10px] text-muted-foreground font-mono">?</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push(`/app/${workspaceSlug}/admin`)}
          className="cursor-pointer gap-2 py-1.5 text-xs"
        >
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span>Admin & Audit Logs</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer gap-2 py-1.5 text-xs text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
