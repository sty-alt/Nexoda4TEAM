type Listener = (data: any) => void;

class RealtimeEventBus {
  private listeners: Map<string, Set<Listener>> = new Map();

  public subscribe(channel: string, listener: Listener): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(listener);

    return () => {
      this.listeners.get(channel)?.delete(listener);
      if (this.listeners.get(channel)?.size === 0) {
        this.listeners.delete(channel);
      }
    };
  }

  public publish(channel: string, data: any): void {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (err) {
          console.error("Realtime event error:", err);
        }
      });
    }

    // Also publish to wildcard channel if applicable
    const wildcard = "*";
    const globalListeners = this.listeners.get(wildcard);
    if (globalListeners) {
      globalListeners.forEach((listener) => {
        try {
          listener({ channel, ...data });
        } catch (err) {
          console.error("Global realtime event error:", err);
        }
      });
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var globalEventBus: RealtimeEventBus | undefined;
}

export const eventBus = global.globalEventBus || new RealtimeEventBus();

if (process.env.NODE_ENV !== "production") {
  global.globalEventBus = eventBus;
}
