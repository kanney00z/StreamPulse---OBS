import { OverlayCustomSettings, StreamSyncEvent, RealtimeServerState, RealtimeSyncStatus } from '../types';

const SYNC_CHANNEL_NAME = 'streampulse_realtime_sync';
const sessionId = Math.random().toString(36).substring(2, 9);

class RealtimeSyncManager {
  private broadcastChannel: BroadcastChannel | null = null;
  private pendingSettings: Partial<OverlayCustomSettings> = {};
  private settingsDebounceTimer: NodeJS.Timeout | null = null;
  private processedEventIds = new Set<string>();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      } catch (err) {
        console.warn('[RealtimeSync] BroadcastChannel unsupported:', err);
      }
    }
  }

  public getSessionId(): string {
    return sessionId;
  }

  /**
   * Broadcast settings change immediately to all tabs & OBS Studio Browser Source
   */
  public broadcastSettings(settings: Partial<OverlayCustomSettings>, immediate = false) {
    this.pendingSettings = { ...this.pendingSettings, ...settings };

    // 1. Instant local BroadcastChannel (0ms latency between tabs on same browser)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'settings_update',
          payload: settings,
          source: sessionId,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn('[RealtimeSync] BroadcastChannel post error:', e);
      }
    }

    // 2. Network POST to Server (Broadcasts to OBS Studio CEF and other devices)
    if (this.settingsDebounceTimer) {
      clearTimeout(this.settingsDebounceTimer);
      this.settingsDebounceTimer = null;
    }

    const sendToServer = () => {
      const payloadToSend = { ...this.pendingSettings };
      this.pendingSettings = {};

      fetch('/api/sync/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payloadToSend, _source: sessionId }),
      }).catch((err) => {
        console.warn('[RealtimeSync] Failed to post settings to server:', err);
      });
    };

    if (immediate) {
      sendToServer();
    } else {
      this.settingsDebounceTimer = setTimeout(sendToServer, 60);
    }
  }

  /**
   * Broadcast stream events (chat message, gift, likes, follow, share, subathon timer)
   */
  public broadcastStreamEvent(event: StreamSyncEvent) {
    const eventWithMeta: StreamSyncEvent = {
      ...event,
      id: event.id || Math.random().toString(36).substring(2, 9),
      source: sessionId,
      timestamp: event.timestamp || Date.now(),
    };

    // Track ID so we don't handle our own echoed event
    this.markProcessed(eventWithMeta.id!);

    // 1. Local BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(eventWithMeta);
      } catch (e) {
        console.warn('[RealtimeSync] BroadcastChannel event post error:', e);
      }
    }

    // 2. Server Event Broadcast for OBS Studio CEF
    fetch('/api/sync/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventWithMeta),
    }).catch((err) => {
      console.warn('[RealtimeSync] Failed to post stream event to server:', err);
    });
  }

  /**
   * Subscribe to real-time events and settings updates
   */
  public subscribe(callbacks: {
    onSettingsUpdate?: (settings: Partial<OverlayCustomSettings>) => void;
    onStreamEvent?: (event: StreamSyncEvent) => void;
    onInit?: (state: RealtimeServerState) => void;
    onStatusChange?: (status: RealtimeSyncStatus) => void;
    clientType?: 'obs' | 'dashboard' | 'preview';
  }): () => void {
    let isSubscribed = true;
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectDelay = 1000;
    let pollInterval: NodeJS.Timeout | null = null;
    let lastKnownUpdatedAt = 0;
    const clientType = callbacks.clientType || 'unknown';

    // 1. Immediate HTTP Snapshot Fetch (Gets current live settings within 5-15ms, 0 delay)
    fetch(`/api/sync/state?sessionId=${sessionId}&type=${encodeURIComponent(clientType)}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isSubscribed) return;
        if (data?.state) {
          if (data.state.updatedAt) {
            lastKnownUpdatedAt = Math.max(lastKnownUpdatedAt, data.state.updatedAt);
          }
          if (callbacks.onInit) {
            callbacks.onInit(data.state);
          }
          if (data.state.settings && Object.keys(data.state.settings).length > 0) {
            callbacks.onSettingsUpdate?.(data.state.settings);
          }
          callbacks.onStatusChange?.('connected');
        }
      })
      .catch((err) => {
        console.warn('[RealtimeSync] Initial snapshot fetch failed, falling back to SSE:', err);
      });

    // 2. Listen to local BroadcastChannel (0ms sync between browser tabs on same machine)
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (!isSubscribed) return;
      const data = event.data as StreamSyncEvent;
      if (!data) return;

      // Ignore messages sent by self
      if (data.source === sessionId) return;

      if (data.id && this.isProcessed(data.id)) return;
      if (data.id) this.markProcessed(data.id);

      if (data.type === 'settings_update' && callbacks.onSettingsUpdate) {
        callbacks.onSettingsUpdate(data.payload);
      } else if (callbacks.onStreamEvent) {
        callbacks.onStreamEvent(data);
      }
    };

    if (this.broadcastChannel) {
      this.broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }

    // 3. Fast-Polling Watchdog (Ensures OBS CEF never desyncs even if SSE drops or proxy idles)
    const runPollingWatchdog = async () => {
      if (!isSubscribed) return;
      try {
        const res = await fetch(
          `/api/sync/poll?since=${lastKnownUpdatedAt}&sessionId=${sessionId}&type=${encodeURIComponent(clientType)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!isSubscribed) return;

        if (data.updatedAt) {
          lastKnownUpdatedAt = Math.max(lastKnownUpdatedAt, data.updatedAt);
        }

        if (data.changed) {
          if (callbacks.onInit) {
            callbacks.onInit(data);
          }
          if (data.settings && callbacks.onSettingsUpdate) {
            callbacks.onSettingsUpdate(data.settings);
          }
          callbacks.onStatusChange?.('connected');
        }
      } catch {
        // Silently retry next interval
      }
    };

    // Run watchdog every 1000ms for OBS, 2000ms for dashboard
    const pollFrequency = clientType === 'obs' ? 1000 : 2000;
    pollInterval = setInterval(runPollingWatchdog, pollFrequency);

    // 4. Setup Server-Sent Events (SSE) for Instant Push (0ms latency)
    const connectSSE = () => {
      if (!isSubscribed) return;

      callbacks.onStatusChange?.('connecting');
      const url = `/api/sync/events?type=${encodeURIComponent(clientType)}&sessionId=${sessionId}`;

      try {
        eventSource = new EventSource(url);

        eventSource.onopen = () => {
          if (!isSubscribed) return;
          reconnectDelay = 1000; // Reset backoff
          callbacks.onStatusChange?.('connected');
        };

        // Initial full state from server
        eventSource.addEventListener('init', (e: MessageEvent) => {
          if (!isSubscribed) return;
          try {
            const state: RealtimeServerState = JSON.parse(e.data);
            if (state.updatedAt) {
              lastKnownUpdatedAt = Math.max(lastKnownUpdatedAt, state.updatedAt);
            }
            if (callbacks.onInit) {
              callbacks.onInit(state);
            }
            if (state.settings && callbacks.onSettingsUpdate) {
              callbacks.onSettingsUpdate(state.settings);
            }
            callbacks.onStatusChange?.('connected');
          } catch (err) {
            console.warn('[RealtimeSync] Failed to parse init state:', err);
          }
        });

        // Settings update event
        eventSource.addEventListener('settings_update', (e: MessageEvent) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(e.data);
            if (data._source === sessionId) return; // Don't echo self
            delete data._source;
            lastKnownUpdatedAt = Date.now();
            callbacks.onSettingsUpdate?.(data);
          } catch (err) {
            console.warn('[RealtimeSync] Failed to parse settings_update:', err);
          }
        });

        // Stream event (Chat, Gift, Follow, Share, Subathon, etc.)
        eventSource.addEventListener('stream_event', (e: MessageEvent) => {
          if (!isSubscribed) return;
          try {
            const eventData: StreamSyncEvent = JSON.parse(e.data);
            if (eventData.source === sessionId) return; // Don't echo self
            if (eventData.id && this.isProcessed(eventData.id)) return;
            if (eventData.id) this.markProcessed(eventData.id);

            callbacks.onStreamEvent?.(eventData);
          } catch (err) {
            console.warn('[RealtimeSync] Failed to parse stream_event:', err);
          }
        });

        // Keepalive ping
        eventSource.addEventListener('ping', () => {
          callbacks.onStatusChange?.('connected');
        });

        eventSource.onerror = () => {
          if (!isSubscribed) return;
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          // Auto reconnect with quick backoff (polling watchdog continues in background)
          reconnectTimeout = setTimeout(() => {
            if (isSubscribed) {
              reconnectDelay = Math.min(reconnectDelay * 1.5, 5000);
              connectSSE();
            }
          }, reconnectDelay);
        };
      } catch (err) {
        console.warn('[RealtimeSync] SSE connection failed:', err);
        reconnectTimeout = setTimeout(connectSSE, 2000);
      }
    };

    connectSSE();

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (this.broadcastChannel) {
        this.broadcastChannel.removeEventListener('message', handleBroadcastMessage);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }

  private markProcessed(id: string) {
    this.processedEventIds.add(id);
    if (this.processedEventIds.size > 200) {
      const first = this.processedEventIds.values().next().value;
      if (first) this.processedEventIds.delete(first);
    }
  }

  private isProcessed(id: string): boolean {
    return this.processedEventIds.has(id);
  }
}

export const realtimeSync = new RealtimeSyncManager();
