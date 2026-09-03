/**
 * IndoFinity WebSocket Bridge Service
 * Connects to local IndoFinity TikTok Live WebSocket at ws://localhost:62024
 */

import {
  IndoFinityConnectionStatus,
  IndoFinityLogItem,
  IndoFinityChatEventData,
  IndoFinityLikeEventData,
  IndoFinityGiftEventData,
  ChatMessage,
  GiftAlert,
  GiftItem,
  LikeUser,
} from '../types';

export const DEFAULT_INDOFINITY_WS_URL = 'ws://localhost:62024';

export interface IndoFinityCallbacks {
  onChat?: (chatMessage: ChatMessage, raw: IndoFinityChatEventData) => void;
  onLike?: (data: { count: number; totalLikes?: number; user: LikeUser }, raw: IndoFinityLikeEventData) => void;
  onGift?: (alert: GiftAlert, raw: IndoFinityGiftEventData) => void;
  onStatusChange?: (status: IndoFinityConnectionStatus) => void;
  onLog?: (log: IndoFinityLogItem) => void;
}

// Helper to determine gift rarity and styling from diamond count
export function mapIndoFinityGift(giftData: IndoFinityGiftEventData): GiftItem {
  const diamonds = giftData.diamondCount || giftData.coins || 1;
  const name = giftData.giftName || giftData.describe || 'TikTok Gift';
  const nameLower = name.toLowerCase();

  let icon = '🎁';
  let nameTh = name;
  let rarity: GiftItem['rarity'] = 'common';
  let accentColor = '#f43f5e';
  let bgGradient = 'from-rose-500/20 via-pink-500/10 to-transparent';
  let soundType: GiftItem['soundType'] = 'pop';

  if (nameLower.includes('rose') || nameLower.includes('กุหลาบ')) {
    icon = '🌹';
    nameTh = 'กุหลาบหัวใจ';
  } else if (nameLower.includes('heart') || nameLower.includes('หัวใจ')) {
    icon = '💖';
    nameTh = 'หัวใจส่งรัก';
  } else if (nameLower.includes('boba') || nameLower.includes('tea') || nameLower.includes('ชา')) {
    icon = '🧋';
    nameTh = 'ชานมไข่มุก';
  } else if (nameLower.includes('diamond') || nameLower.includes('เพชร')) {
    icon = '💎';
    nameTh = 'เพชรน้ำหนึ่ง';
  } else if (nameLower.includes('car') || nameLower.includes('รถ') || nameLower.includes('cooper')) {
    icon = '🏎️';
    nameTh = 'ซูเปอร์คาร์หรู';
  } else if (nameLower.includes('dragon') || nameLower.includes('มังกร')) {
    icon = '🐉';
    nameTh = 'มังกรทองสวรรค์';
  } else if (nameLower.includes('galaxy') || nameLower.includes('universe') || nameLower.includes('จักรวาล')) {
    icon = '🌌';
    nameTh = 'จักรวาลคอสมิก';
  } else if (nameLower.includes('lion') || nameLower.includes('สิงโต')) {
    icon = '🦁';
    nameTh = 'ราชสีห์ผู้เกรียงไกร';
  } else if (nameLower.includes('crown') || nameLower.includes('มงกุฎ')) {
    icon = '👑';
    nameTh = 'มงกุฎจักรพรรดิ';
  } else if (nameLower.includes('rocket') || nameLower.includes('จรวด')) {
    icon = '🚀';
    nameTh = 'จรวดทะลุอวกาศ';
  }

  // Rarity scale by diamonds
  if (diamonds >= 8000) {
    rarity = 'mythic';
    accentColor = '#a855f7';
    bgGradient = 'from-fuchsia-600/50 via-purple-600/40 to-cyan-950/80';
    soundType = 'epic';
  } else if (diamonds >= 3000) {
    rarity = 'legendary';
    accentColor = '#eab308';
    bgGradient = 'from-yellow-500/40 via-amber-600/30 to-orange-950/60';
    soundType = 'fanfare';
  } else if (diamonds >= 500) {
    rarity = 'epic';
    accentColor = '#ec4899';
    bgGradient = 'from-purple-600/30 via-pink-600/20 to-indigo-900/40';
    soundType = 'fanfare';
  } else if (diamonds >= 50) {
    rarity = 'rare';
    accentColor = '#38bdf8';
    bgGradient = 'from-cyan-500/30 via-blue-500/20 to-transparent';
    soundType = 'chime';
  } else {
    rarity = 'common';
    accentColor = '#f43f5e';
    bgGradient = 'from-rose-500/20 via-pink-500/10 to-transparent';
    soundType = 'pop';
  }

  return {
    id: `gift-${giftData.giftId || nameLower.replace(/\s+/g, '-')}`,
    name,
    nameTh,
    icon,
    coinValue: diamonds,
    rarity,
    accentColor,
    bgGradient,
    soundType,
  };
}

export class IndoFinityClient {
  private ws: WebSocket | null = null;
  private url: string = DEFAULT_INDOFINITY_WS_URL;
  private status: IndoFinityConnectionStatus = 'disconnected';
  private reconnectInterval: NodeJS.Timeout | null = null;
  private autoReconnect: boolean = true;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private callbacks: IndoFinityCallbacks = {};
  private logs: IndoFinityLogItem[] = [];

  constructor(url: string = DEFAULT_INDOFINITY_WS_URL, autoReconnect: boolean = true) {
    this.url = url;
    this.autoReconnect = autoReconnect;
  }

  public setCallbacks(callbacks: IndoFinityCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  public getStatus(): IndoFinityConnectionStatus {
    return this.status;
  }

  public getUrl(): string {
    return this.url;
  }

  public getLogs(): IndoFinityLogItem[] {
    return this.logs;
  }

  public clearLogs() {
    this.logs = [];
  }

  public setAutoReconnect(enabled: boolean) {
    this.autoReconnect = enabled;
    if (!enabled && this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  public connect(customUrl?: string, resetRetries: boolean = true) {
    if (customUrl) {
      this.url = customUrl;
    }

    if (resetRetries) {
      this.retryCount = 0;
    }

    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }

    this.setStatus('connecting');
    this.addLog('system', `Connecting to IndoFinity WebSocket: ${this.url}`, 'Client', { url: this.url });

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[IndoFinity] Connected successfully to', this.url);
        this.retryCount = 0;
        this.setStatus('connected');
        this.addLog('connect', 'Connected to IndoFinity WebSocket successfully', 'IndoFinity', { status: 'open' });

        if (this.reconnectInterval) {
          clearTimeout(this.reconnectInterval);
          this.reconnectInterval = null;
        }
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          const { event: eventName, data: eventData } = message;

          this.handleIncomingEvent(eventName, eventData || {});
        } catch (error) {
          console.warn('[IndoFinity] Failed to parse message:', error);
          this.addLog('error', 'Failed to parse incoming WebSocket message', 'IndoFinity', { error: String(error) });
        }
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        this.addLog('disconnect', 'IndoFinity WebSocket offline or closed', 'IndoFinity', {});

        if (this.autoReconnect && !this.reconnectInterval && this.retryCount < this.maxRetries) {
          this.retryCount++;
          this.reconnectInterval = setTimeout(() => {
            this.reconnectInterval = null;
            if (this.status !== 'connected') {
              this.connect(undefined, false);
            }
          }, 5000);
        } else if (this.retryCount >= this.maxRetries) {
          if (this.reconnectInterval) {
            clearTimeout(this.reconnectInterval);
            this.reconnectInterval = null;
          }
          this.addLog('system', 'IndoFinity is offline. Launch IndoFinity desktop app and click Connect.', 'System', {});
        }
      };

      this.ws.onerror = () => {
        // Gentle handling: do NOT use console.error so offline local server probes do not trigger fatal error notifications
        console.warn(`[IndoFinity] WebSocket offline on ${this.url}. Please ensure IndoFinity desktop app is running.`);
        this.setStatus('disconnected');
        this.addLog('info', `Waiting for IndoFinity on ${this.url}...`, 'IndoFinity', { status: 'offline' });
      };
    } catch (err) {
      console.warn('[IndoFinity] WebSocket init note:', err);
      this.setStatus('disconnected');
      this.addLog('info', `IndoFinity offline or unreachable: ${String(err)}`, 'IndoFinity', { err });
    }
  }

  public disconnect() {
    this.autoReconnect = false;
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {
        // ignore
      }
      this.ws = null;
    }
    this.setStatus('disconnected');
    this.addLog('system', 'Disconnected manually by user', 'Client', {});
  }

  private setStatus(newStatus: IndoFinityConnectionStatus) {
    this.status = newStatus;
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(newStatus);
    }
  }

  private addLog(event: string, summary: string, sender: string, rawData: any) {
    const logItem: IndoFinityLogItem = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      event,
      summary,
      sender,
      rawData,
    };
    this.logs = [logItem, ...this.logs.slice(0, 49)];
    if (this.callbacks.onLog) {
      this.callbacks.onLog(logItem);
    }
  }

  // Process and route IndoFinity events
  public handleIncomingEvent(event: string, eventData: any) {
    const sender = eventData?.nickname || eventData?.uniqueId || 'TikTok Viewer';

    // 1. Chat Event
    if (event === 'chat' || event === 'comment') {
      const data = eventData as IndoFinityChatEventData;
      const uniqueId = data.uniqueId || 'user';
      const nickname = data.nickname || `@${uniqueId}`;
      const comment = data.comment || '';
      const avatarUrl =
        data.profilePictureUrl ||
        data.avatarThumb ||
        data.avatar ||
        `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(uniqueId)}`;

      const badges: ('mod' | 'vip' | 'sub' | 'top_fan' | 'verified')[] = [];
      if (data.isModerator) badges.push('mod');
      if (data.isSubscriber) badges.push('sub');

      // Pick vibrant color based on handle
      const colors = ['#38bdf8', '#f472b6', '#34d399', '#fbbf24', '#c084fc', '#a78bfa'];
      let hash = 0;
      for (let i = 0; i < uniqueId.length; i++) {
        hash = uniqueId.charCodeAt(i) + ((hash << 5) - hash);
      }
      const color = colors[Math.abs(hash) % colors.length];

      const chatMessage: ChatMessage = {
        id: 'if-chat-' + (data.msgId || Date.now() + '-' + Math.random().toString(36).substring(2, 6)),
        username: nickname,
        avatarUrl,
        message: comment,
        timestamp: Date.now(),
        badges: badges.length > 0 ? badges : undefined,
        color,
        highlighted: comment.length > 50 || badges.length > 0,
      };

      this.addLog('chat', `@${uniqueId}: ${comment}`, nickname, data);
      if (this.callbacks.onChat) {
        this.callbacks.onChat(chatMessage, data);
      }
    }

    // 2. Like Event
    else if (event === 'like') {
      const data = eventData as IndoFinityLikeEventData;
      const count = Number(data.likeCount) || 1;
      const uniqueId = data.uniqueId || 'viewer';
      const nickname = data.nickname || `@${uniqueId}`;
      const avatar =
        data.profilePictureUrl ||
        `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(uniqueId)}`;

      const user: LikeUser = {
        id: 'user-' + uniqueId,
        name: nickname,
        avatar,
        likeCount: count,
        rank: 1,
        isRecent: true,
      };

      this.addLog('like', `+${count} ไลก์จาก @${uniqueId}`, nickname, data);
      if (this.callbacks.onLike) {
        this.callbacks.onLike(
          {
            count,
            totalLikes: data.totalLikes ? Number(data.totalLikes) : undefined,
            user,
          },
          data
        );
      }
    }

    // 3. Gift Event
    else if (event === 'gift') {
      const data = eventData as IndoFinityGiftEventData;
      const uniqueId = data.uniqueId || 'supporter';
      const nickname = data.nickname || `@${uniqueId}`;
      const avatar =
        data.profilePictureUrl ||
        `https://api.dicebear.com/7.x/thumbs/svg?seed=${encodeURIComponent(uniqueId)}`;

      const combo = Number(data.repeatCount || data.combo || data.repeat_count || 1);
      const giftItem = mapIndoFinityGift(data);

      const alert: GiftAlert = {
        id: 'if-gift-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        senderName: nickname,
        senderAvatar: avatar,
        gift: giftItem,
        amount: 1,
        comboCount: combo,
        customMessage: combo > 3 ? `ส่งรัวๆ x${combo}! ขอบคุณมากๆ นะครับ! 🎉` : undefined,
        timestamp: Date.now(),
      };

      this.addLog('gift', `ส่งของขวัญ ${giftItem.name} (${giftItem.coinValue} 💎) x${combo}`, nickname, data);
      if (this.callbacks.onGift) {
        this.callbacks.onGift(alert, data);
      }
    }

    // 4. Follow Event
    else if (event === 'follow') {
      const uniqueId = eventData?.uniqueId || 'viewer';
      const nickname = eventData?.nickname || `@${uniqueId}`;
      this.addLog('follow', `@${uniqueId} ได้เริ่มติดตามไลฟ์สดนี้! ❤️`, nickname, eventData);
    }

    // 5. Share Event
    else if (event === 'share') {
      const uniqueId = eventData?.uniqueId || 'viewer';
      const nickname = eventData?.nickname || `@${uniqueId}`;
      this.addLog('share', `@${uniqueId} ได้แชร์ไลฟ์สดนี้ไปยังเพื่อนๆ! 📢`, nickname, eventData);
    }

    // 6. Member / Join Event
    else if (event === 'member' || event === 'join') {
      const uniqueId = eventData?.uniqueId || 'viewer';
      const nickname = eventData?.nickname || `@${uniqueId}`;
      this.addLog('member', `@${uniqueId} ได้เข้าร่วมชมไลฟ์สด 👋`, nickname, eventData);
    }

    // Other events
    else {
      this.addLog(event, `Received event "${event}" from IndoFinity`, sender, eventData);
    }
  }

  // Simulation method to test IndoFinity events without needing the app running
  public simulateEvent(event: 'chat' | 'like' | 'gift') {
    if (event === 'chat') {
      const mockChats = [
        { uniqueId: 'tiktok_fan_th', comment: 'ทักทายครับพี่สตรีมเมอร์ ติดตามอยู่น้าา 💖' },
        { uniqueId: 'pro_gamer_99', comment: 'คอมโบช็อตเมื่อกี้โหดจัดดดด 55555 🔥🎯' },
        { uniqueId: 'somying_cute', comment: 'เพลงเพราะจังงง เปิดเพลงอะไรอยู่คะ? ✨' },
        { uniqueId: 'ball_street', comment: 'สวัสดีคร้าบบบ วันนี้เล่นเกมอะไรต่อ 🎮' },
      ];
      const pick = mockChats[Math.floor(Math.random() * mockChats.length)];
      this.handleIncomingEvent('chat', {
        uniqueId: pick.uniqueId,
        nickname: pick.uniqueId.toUpperCase(),
        comment: pick.comment,
        isModerator: Math.random() > 0.8,
        isSubscriber: Math.random() > 0.6,
      });
    } else if (event === 'like') {
      const counts = [10, 25, 50, 100];
      const count = counts[Math.floor(Math.random() * counts.length)];
      const users = ['user_heart_tap', 'stream_lover_55', 'tiktok_supporter_th'];
      const user = users[Math.floor(Math.random() * users.length)];
      this.handleIncomingEvent('like', {
        uniqueId: user,
        nickname: `@${user}`,
        likeCount: count,
      });
    } else if (event === 'gift') {
      const gifts = [
        { giftName: 'Rose', diamondCount: 1, repeatCount: Math.floor(1 + Math.random() * 8) },
        { giftName: 'Pearl Milk Tea', diamondCount: 50, repeatCount: 1 },
        { giftName: 'Blue Diamond', diamondCount: 300, repeatCount: 1 },
        { giftName: 'Cyber Supercar', diamondCount: 1200, repeatCount: 1 },
        { giftName: 'Cosmic Galaxy', diamondCount: 10000, repeatCount: 1 },
      ];
      const pick = gifts[Math.floor(Math.random() * gifts.length)];
      const gifters = ['boss_wealthy', 'super_supporter', 'nong_gift_give'];
      const gifter = gifters[Math.floor(Math.random() * gifters.length)];
      this.handleIncomingEvent('gift', {
        uniqueId: gifter,
        nickname: `@${gifter}`,
        giftName: pick.giftName,
        diamondCount: pick.diamondCount,
        repeatCount: pick.repeatCount,
      });
    }
  }
}

// Global default singleton for Studio and Overlays
let globalIndoFinityClient: IndoFinityClient | null = null;

export function getIndoFinityClient(customUrl?: string): IndoFinityClient {
  if (!globalIndoFinityClient) {
    globalIndoFinityClient = new IndoFinityClient(customUrl || DEFAULT_INDOFINITY_WS_URL, true);
  }
  return globalIndoFinityClient;
}
