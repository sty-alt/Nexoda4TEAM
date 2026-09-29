import { create } from "zustand";

interface TimerState {
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  activeProjectColor: string | null;
  elapsedSeconds: number;
  isRunning: boolean;
  startTime: number | null;

  startTimer: (taskId: string, title: string, projectColor?: string) => void;
  stopTimer: () => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  activeTaskId: null,
  activeTaskTitle: null,
  activeProjectColor: null,
  elapsedSeconds: 0,
  isRunning: false,
  startTime: null,

  startTimer: (taskId, title, projectColor = "#6366f1") => {
    // If currently running, stop previous first
    set({
      activeTaskId: taskId,
      activeTaskTitle: title,
      activeProjectColor: projectColor,
      elapsedSeconds: 0,
      isRunning: true,
      startTime: Date.now(),
    });
  },

  stopTimer: () => {
    const { activeTaskId, elapsedSeconds } = get();
    if (activeTaskId && elapsedSeconds > 0) {
      // Send time log to server in background
      fetch("/api/time/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: activeTaskId,
          durationSeconds: elapsedSeconds,
        }),
      }).catch(console.error);
    }

    set({
      activeTaskId: null,
      activeTaskTitle: null,
      activeProjectColor: null,
      elapsedSeconds: 0,
      isRunning: false,
      startTime: null,
    });
  },

  tick: () => {
    const { isRunning, startTime } = get();
    if (!isRunning || startTime === null) return;

    set({ elapsedSeconds: Math.floor((Date.now() - startTime) / 1000) });
  },
}));
