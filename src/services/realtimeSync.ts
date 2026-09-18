import Peer, { type DataConnection } from 'peerjs';
import { OverlayCustomSettings, StreamSyncEvent, RealtimeServerState, RealtimeSyncStatus } from '../types';

const SYNC_CHANNEL_NAME = 'streampulse_realtime_sync';
const sessionId = Math.random().toString(36).substring(2, 9);

/**
 * Returns a stable, persistent sync room code for pairing Dashboard and OBS Studio.
 */
export function getPersistentRoomId(): string {
  if (typeof window === 'undefined') return 'sp-live';
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const urlRoom = searchParams.get('room');
    if (urlRoom && urlRoom.trim()) {
      return urlRoom.trim();
    }
    let stored = localStorage.getItem('streampulse_sync_room');
    if (!stored || !stored.startsWith('sp-')) {
      stored = 'sp-' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem('streampulse_sync_room', stored);
    }
    return stored;
  } catch {
    return 'sp-live';
  }
}

export function resetPersistentRoomId(): string {
  if (typeof window === 'undefined') return 'sp-live';
  const newId = 'sp-' + Math.random().toString(36).substring(2, 8);
  try {
    localStorage.setItem('streampulse_sync_room', newId);
  } catch {}
  return newId;
}

class RealtimeSyncManager {
  private broadcastChannel: BroadcastChannel | null = null;
  private pendingSettings: Partial<OverlayCustomSettings> = {};
  private settingsDebounceTimer: NodeJS.Timeout | null = null;
  private processedEventIds = new Set<string>();

  // WebRTC P2P Data Channel Engine (Direct browser <-> OBS CEF connection)
  private p2pHostPeer: Peer | null = null;
  private p2pClientPeer: Peer | null = null;
  private p2pConnections = new Set<DataConnection>();
  private p2pClientConn: DataConnection | null = null;
  private isP2PHostInitialized = false;
  private isP2PClientInitialized = false;
  private p2pReconnectTimeout: NodeJS.Timeout | null = null;

  // Latest cached state for immediate dispatch to newly connected OBS instances
  private latestKnownState: RealtimeServerState = {
    settings: {},
    subathonSeconds: 7200,
    subathonIsRunning: true,
    totalLikes: 0,
    streamStats: {
      viewerCount: 1420,
      totalLikes: 48500,
      subscribersCount: 89,
      diamondsCount: 12500,
      streamDurationSeconds: 4320,
      topGifters: [],
    },
    updatedAt: Date.now(),
  };

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

  public getConnectedOBSCount(): number {
    let count = 0;
    for (const conn of this.p2pConnections) {
      if (conn.open) count++;
    }
    return count;
  }

  /**
   * Start WebRTC P2P Host in the Dashboard
   */
  public initP2PHost(roomId: string) {
    if (this.isP2PHostInitialized || typeof window === 'undefined') return;
    this.isP2PHostInitialized = true;

    const hostPeerId = `streampulse-host-${roomId}`;

    try {
      this.p2pHostPeer = new Peer(hostPeerId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
          ],
        },
      });

      this.p2pHostPeer.on('open', (id) => {
        console.log(`[RealtimeSync P2P] Host initialized with ID: ${id}`);
      });

      this.p2pHostPeer.on('connection', (conn) => {
        console.log(`[RealtimeSync P2P] OBS Studio connected via WebRTC DataChannel: ${conn.peer}`);
        this.p2pConnections.add(conn);

        conn.on('open', () => {
          // Immediately transmit current live settings to OBS
          try {
            conn.send({
              type: 'init',
              state: this.latestKnownState,
              timestamp: Date.now(),
            });
          } catch (e) {
            console.warn('[RealtimeSync P2P] Failed to send init state to OBS:', e);
          }
        });

        conn.on('close', () => {
          this.p2pConnections.delete(conn);
          console.log(`[RealtimeSync P2P] OBS Studio disconnected: ${conn.peer}`);
        });

        conn.on('error', (err) => {
          console.warn('[RealtimeSync P2P] Connection error:', err);
          this.p2pConnections.delete(conn);
        });
      });

      this.p2pHostPeer.on('disconnected', () => {
        if (this.p2pHostPeer && !this.p2pHostPeer.destroyed) {
          try {
            this.p2pHostPeer.reconnect();
          } catch {}
        }
      });

      this.p2pHostPeer.on('error', (err: any) => {
        if (err?.type === 'unavailable-id') {
          console.log('[RealtimeSync P2P] Host ID already registered (another tab running as host).');
          return;
        }
        // Gracefully handle network disconnects or signaling server resets
        if (this.p2pHostPeer && !this.p2pHostPeer.destroyed && this.p2pHostPeer.disconnected) {
          setTimeout(() => {
            try {
              this.p2pHostPeer?.reconnect();
            } catch {}
          }, 3000);
        }
      });
    } catch (err) {
      console.warn('[RealtimeSync P2P] Failed to initialize P2P host:', err);
    }
  }

  /**
   * Start WebRTC P2P Client in OBS Studio Browser Source
   */
  public initP2PClient(
    roomId: string,
    callbacks: {
      onSettingsUpdate?: (settings: Partial<OverlayCustomSettings>) => void;
      onStreamEvent?: (event: StreamSyncEvent) => void;
      onInit?: (state: RealtimeServerState) => void;
      onStatusChange?: (status: RealtimeSyncStatus) => void;
    }
  ) {
    if (this.isP2PClientInitialized || typeof window === 'undefined') return;
    this.isP2PClientInitialized = true;

    const targetHostId = `streampulse-host-${roomId}`;

    const connectToHost = () => {
      if (this.p2pReconnectTimeout) {
        clearTimeout(this.p2pReconnectTimeout);
        this.p2pReconnectTimeout = null;
      }

      if (this.p2pClientPeer) {
        try {
          this.p2pClientPeer.destroy();
        } catch {}
        this.p2pClientPeer = null;
      }

      try {
        this.p2pClientPeer = new Peer(undefined, {
          debug: 0,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
            ],
          },
        });

        this.p2pClientPeer.on('open', () => {
          const conn = this.p2pClientPeer!.connect(targetHostId, {
            reliable: true,
          });

          this.p2pClientConn = conn;

          conn.on('open', () => {
            console.log(`[RealtimeSync P2P] Connected to Dashboard Host via WebRTC: ${targetHostId}`);
            callbacks.onStatusChange?.('connected');
          });

          conn.on('data', (data: any) => {
            if (!data) return;

            if (data.type === 'init') {
              if (callbacks.onInit && data.state) {
                callbacks.onInit(data.state);
              }
              if (callbacks.onSettingsUpdate && data.state?.settings) {
                callbacks.onSettingsUpdate(data.state.settings);
              }
              callbacks.onStatusChange?.('connected');
            } else if (data.type === 'settings_update') {
              if (callbacks.onSettingsUpdate && data.payload) {
                callbacks.onSettingsUpdate(data.payload);
              }
              callbacks.onStatusChange?.('connected');
            } else if (data.type === 'stream_event' || data.payload) {
              if (callbacks.onStreamEvent) {
                callbacks.onStreamEvent(data);
              }
            }
          });

          conn.on('close', () => {
            console.log('[RealtimeSync P2P] Connection closed. Retrying in 2.5s...');
            this.p2pReconnectTimeout = setTimeout(connectToHost, 2500);
          });

          conn.on('error', () => {
            this.p2pReconnectTimeout = setTimeout(connectToHost, 3000);
          });
        });

        this.p2pClientPeer.on('disconnected', () => {
          if (this.p2pClientPeer && !this.p2pClientPeer.destroyed) {
            try {
              this.p2pClientPeer.reconnect();
            } catch {}
          }
        });

        this.p2pClientPeer.on('error', (err) => {
          // Expected when host is not yet online or signaling drops
          if (!this.p2pReconnectTimeout) {
            this.p2pReconnectTimeout = setTimeout(connectToHost, 3500);
          }
        });
      } catch (err) {
        if (!this.p2pReconnectTimeout) {
          this.p2pReconnectTimeout = setTimeout(connectToHost, 4000);
        }
      }
    };

    connectToHost();
  }

  /**
   * Broadcast settings change immediately to OBS Studio and all tabs
   */
  public broadcastSettings(settings: Partial<OverlayCustomSettings>, immediate = true) {
    this.pendingSettings = { ...this.pendingSettings, ...settings };
    this.latestKnownState.settings = { ...this.latestKnownState.settings, ...settings };
    this.latestKnownState.updatedAt = Date.now();

    // 1. Direct WebRTC P2P DataChannel (0.5ms latency directly to OBS Studio CEF)
    const p2pPayload = {
      type: 'settings_update',
      payload: settings,
      source: sessionId,
      timestamp: Date.now(),
    };

    for (const conn of this.p2pConnections) {
      try {
        if (conn.open) {
          conn.send(p2pPayload);
        }
      } catch (e) {
        console.warn('[RealtimeSync P2P] Send failed:', e);
      }
    }

    // 2. Instant local BroadcastChannel (0ms latency between browser tabs)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(p2pPayload);
      } catch (e) {
        console.warn('[RealtimeSync] BroadcastChannel post error:', e);
      }
    }

    // 3. LocalStorage Cross-Tab Synchronization event
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'streampulse_synced_settings',
          JSON.stringify({
            settings: this.latestKnownState.settings,
            delta: settings,
            timestamp: Date.now(),
            source: sessionId,
          })
        );
      }
    } catch {}

    // 4. Network POST to Server (with credentials included)
    if (this.settingsDebounceTimer) {
      clearTimeout(this.settingsDebounceTimer);
      this.settingsDebounceTimer = null;
    }

    const sendToServer = () => {
      const payloadToSend = { ...this.pendingSettings };
      this.pendingSettings = {};

      fetch('/api/sync/settings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payloadToSend, _source: sessionId }),
      }).catch((err) => {
        console.warn('[RealtimeSync] Network POST note:', err);
      });
    };

    if (immediate) {
      sendToServer();
    } else {
      this.settingsDebounceTimer = setTimeout(sendToServer, 25);
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

    this.markProcessed(eventWithMeta.id!);

    // 1. Direct WebRTC P2P DataChannel to OBS Studio
    for (const conn of this.p2pConnections) {
      try {
        if (conn.open) {
          conn.send(eventWithMeta);
        }
      } catch (e) {
        console.warn('[RealtimeSync P2P] Event send error:', e);
      }
    }

    // 2. Local BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(eventWithMeta);
      } catch (e) {
        console.warn('[RealtimeSync] BroadcastChannel event post error:', e);
      }
    }

    // 3. LocalStorage Event trigger
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'streampulse_last_stream_event',
          JSON.stringify({
            event: eventWithMeta,
            timestamp: Date.now(),
            source: sessionId,
          })
        );
      }
    } catch {}

    // 4. Server Event Broadcast
    fetch('/api/sync/event', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventWithMeta),
    }).catch((err) => {
      console.warn('[RealtimeSync] Server event broadcast note:', err);
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
    roomId?: string;
  }): () => void {
    let isSubscribed = true;
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let reconnectDelay = 1000;
    let pollInterval: NodeJS.Timeout | null = null;
    let lastKnownUpdatedAt = 0;
    const clientType = callbacks.clientType || 'unknown';
    const activeRoomId = callbacks.roomId || getPersistentRoomId();

    // 0. Initialize WebRTC P2P (Dashboard as Host, OBS as Client)
    if (clientType === 'obs') {
      this.initP2PClient(activeRoomId, callbacks);
    } else {
      this.initP2PHost(activeRoomId);
    }

    // 1. Immediate HTTP Snapshot Fetch (Cache-busted, with credentials)
    const initialUrl = `/api/sync/state?sessionId=${sessionId}&type=${encodeURIComponent(clientType)}&_t=${Date.now()}`;
    fetch(initialUrl, { cache: 'no-store', credentials: 'include' })
      .then(async (r) => {
        const text = await r.text();
        if (text.startsWith('<')) {
          // HTML redirect or auth page, skip JSON parsing
          return null;
        }
        return JSON.parse(text);
      })
      .then((data) => {
        if (!isSubscribed || !data) return;
        if (data?.state) {
          if (data.state.updatedAt) {
            lastKnownUpdatedAt = Math.max(lastKnownUpdatedAt, data.state.updatedAt);
          }
          this.latestKnownState = { ...this.latestKnownState, ...data.state };
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
        console.warn('[RealtimeSync] Snapshot fetch note:', err);
      });

    // 2. Listen to local BroadcastChannel (0ms sync between browser tabs)
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (!isSubscribed) return;
      const data = event.data as StreamSyncEvent;
      if (!data) return;

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

    // 3. Listen to LocalStorage cross-tab events
    const handleStorageEvent = (e: StorageEvent) => {
      if (!isSubscribed) return;
      if (e.key === 'streampulse_synced_settings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.source === sessionId) return;
          if (parsed.delta && callbacks.onSettingsUpdate) {
            callbacks.onSettingsUpdate(parsed.delta);
          }
        } catch {}
      } else if (e.key === 'streampulse_last_stream_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.source === sessionId) return;
          if (parsed.event && callbacks.onStreamEvent) {
            callbacks.onStreamEvent(parsed.event);
          }
        } catch {}
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageEvent);
    }

    // 4. Fast-Polling Watchdog with safe text/json handling
    const runPollingWatchdog = async () => {
      if (!isSubscribed) return;
      try {
        const pollUrl = `/api/sync/poll?since=${lastKnownUpdatedAt}&sessionId=${sessionId}&type=${encodeURIComponent(clientType)}&_t=${Date.now()}`;
        const res = await fetch(pollUrl, { cache: 'no-store', credentials: 'include' });
        if (!res.ok) return;

        const text = await res.text();
        if (text.startsWith('<')) return; // Auth redirect, do not throw

        const data = JSON.parse(text);
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

        if (data.events && Array.isArray(data.events) && callbacks.onStreamEvent) {
          for (const evt of data.events) {
            if (evt.id && this.isProcessed(evt.id)) continue;
            if (evt.id) this.markProcessed(evt.id);
            callbacks.onStreamEvent(evt);
          }
        }
      } catch {}
    };

    const pollFrequency = clientType === 'obs' ? 600 : 2000;
    pollInterval = setInterval(runPollingWatchdog, pollFrequency);

    // 5. Server-Sent Events (SSE) with withCredentials: true
    const connectSSE = () => {
      if (!isSubscribed) return;

      callbacks.onStatusChange?.('connecting');
      const url = `/api/sync/events?type=${encodeURIComponent(clientType)}&sessionId=${sessionId}`;

      try {
        eventSource = new EventSource(url, { withCredentials: true });

        eventSource.onopen = () => {
          if (!isSubscribed) return;
          reconnectDelay = 1000;
          callbacks.onStatusChange?.('connected');
        };

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
            console.warn('[RealtimeSync] Init parse note:', err);
          }
        });

        eventSource.addEventListener('settings_update', (e: MessageEvent) => {
          if (!isSubscribed) return;
          try {
            const data = JSON.parse(e.data);
            if (data._source === sessionId) return;
            delete data._source;
            lastKnownUpdatedAt = Date.now();
            callbacks.onSettingsUpdate?.(data);
          } catch (err) {
            console.warn('[RealtimeSync] Settings parse note:', err);
          }
        });

        eventSource.addEventListener('stream_event', (e: MessageEvent) => {
          if (!isSubscribed) return;
          try {
            const eventData: StreamSyncEvent = JSON.parse(e.data);
            if (eventData.source === sessionId) return;
            if (eventData.id && this.isProcessed(eventData.id)) return;
            if (eventData.id) this.markProcessed(eventData.id);

            callbacks.onStreamEvent?.(eventData);
          } catch (err) {
            console.warn('[RealtimeSync] Stream event parse note:', err);
          }
        });

        eventSource.addEventListener('ping', () => {
          callbacks.onStatusChange?.('connected');
        });

        eventSource.onerror = () => {
          if (!isSubscribed) return;
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          reconnectTimeout = setTimeout(() => {
            if (isSubscribed) {
              reconnectDelay = Math.min(reconnectDelay * 1.5, 5000);
              connectSSE();
            }
          }, reconnectDelay);
        };
      } catch (err) {
        console.warn('[RealtimeSync] SSE setup note:', err);
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
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageEvent);
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
