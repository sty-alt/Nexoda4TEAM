import { create } from "zustand";
import { WorkspaceWithDetails } from "@/lib/types";

interface WorkspaceState {
  currentWorkspace: WorkspaceWithDetails | null;
  workspaces: WorkspaceWithDetails[];
  setCurrentWorkspace: (workspace: WorkspaceWithDetails) => void;
  setWorkspaces: (workspaces: WorkspaceWithDetails[]) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  workspaces: [],
  setCurrentWorkspace: (currentWorkspace) => set({ currentWorkspace }),
  setWorkspaces: (workspaces) => set({ workspaces }),
}));
