import { NextRequest } from "next/server";
import { eventBus } from "@/lib/events";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId") || "default";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection packet
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected", timestamp: Date.now() })}\n\n`)
      );

      // Subscribe to events for this workspace and global
      const unsubscribe = eventBus.subscribe(workspaceId, (payload) => {
        try {
          const eventType = payload.type || "message";
          const dataString = JSON.stringify(payload);
          controller.enqueue(
            encoder.encode(`event: ${eventType}\ndata: ${dataString}\n\n`)
          );
        } catch (err) {
          console.error("SSE encoding error:", err);
        }
      });

      // Keep-alive heartbeat every 20 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 20000);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
