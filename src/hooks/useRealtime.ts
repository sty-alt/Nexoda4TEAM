"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface RealtimeOptions {
  workspaceId?: string;
  onEvent?: (event: string, data: any) => void;
}

export function useRealtimeSubscription({ workspaceId, onEvent }: RealtimeOptions = {}) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!workspaceId) return;

    const sse = new EventSource(`/api/realtime?workspaceId=${workspaceId}`);
    eventSourceRef.current = sse;

    sse.addEventListener("task_updated", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", workspaceId] });
        if (onEvent) onEvent("task_updated", data);
      } catch (err) {
        console.error(err);
      }
    });

    sse.addEventListener("task_created", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", workspaceId] });
        if (onEvent) onEvent("task_created", data);
      } catch (err) {
        console.error(err);
      }
    });

    sse.addEventListener("message_received", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        queryClient.invalidateQueries({ queryKey: ["messages", data.channelId] });
        queryClient.invalidateQueries({ queryKey: ["channels", workspaceId] });
        if (onEvent) onEvent("message_received", data);
      } catch (err) {
        console.error(err);
      }
    });

    sse.addEventListener("notification_created", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        toast.info(data.title || "New notification", {
          description: data.message,
        });
        if (onEvent) onEvent("notification_created", data);
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      sse.close();
    };
  }, [workspaceId, queryClient, onEvent]);
}
