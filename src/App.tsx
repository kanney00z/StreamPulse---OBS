/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Heart,
  MessageSquare,
  Gift,
  Copy,
  Check,
  Radio,
  Sliders,
  Sparkles,
  Layers,
  Palette,
  Flame,
  Volume2,
  VolumeX,
  Smartphone,
  Tv,
  Eye,
  ExternalLink,
  UserPlus,
  Share2,
  RotateCcw,
  Timer,
} from 'lucide-react';
import {
  ChatMessage,
  GiftAlert,
  FollowAlert,
  ShareAlert,
  LikeUser,
  OverlayCustomSettings,
  FloatingHeartItem,
  GiftItem,
  SubathonTimeAddedEvent,
  IndoFinityConnectionStatus,
  IndoFinityLogItem,
} from './types';
import {
  INITIAL_CHAT_MESSAGES,
  INITIAL_LIKE_LEADERBOARD,
  GIFT_ITEMS,
  SIMULATION_NAMES,
  RANDOM_CHAT_PHRASES,
  CHAT_THEMES,
} from './data/mockData';
import { ChatOverlayWidget } from './components/ChatOverlayWidget';
import { LikeLeaderboardWidget } from './components/LikeLeaderboardWidget';
import { GiftOverlayWidget } from './components/GiftOverlayWidget';
import { FollowShareOverlayWidget } from './components/FollowShareOverlayWidget';
import { SubathonTimerWidget } from './components/SubathonTimerWidget';
import { SubathonControlCard } from './components/SubathonControlCard';
import { StreamSimulatorDeck } from './components/StreamSimulatorDeck';
import { OBSLinkHub } from './components/OBSLinkHub';
import { ThemeSelector } from './components/ThemeSelector';
import { OverlayView } from './components/OverlayView';
import { IndoFinityBridgeView } from './components/IndoFinityBridgeView';
import { ChatTtsControlCard } from './components/ChatTtsControlCard';
import { WidgetCustomizerPanel } from './components/WidgetCustomizerPanel';
import { getIndoFinityClient, IndoFinityClient } from './services/indofinityService';
import { sounds } from './utils/soundEffects';
import { ttsService } from './utils/ttsService';

export default function App() {
  // Check if opened as standalone OBS Browser Source overlay
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [overlayType, setOverlayType] = useState<'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'alerts' | 'subathon' | 'all'>('all');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const overlay = params.get('overlay') as 'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'alerts' | 'subathon' | 'all';

    if (mode === 'overlay' || overlay) {
      setIsOverlayMode(true);
      if (overlay) setOverlayType(overlay);
    }
  }, []);

  // Global Overlay Settings State
  const [settings, setSettings] = useState<OverlayCustomSettings>({
    chatTheme: 'twitch-glow-dynamic',
    chatFontSize: 'base',
    chatAutoHideSeconds: 10,
    chatShowAvatars: true,
    chatShowBadges: true,
    chatShowTimestamps: true,
    chatLayout: 'vertical',
    chatDirection: 'down',
    chatSoundEnabled: true,
    chatMaxMessages: 12,

    // TTS (Text-to-Speech อ่านแชทสดอัตโนมัติ ปรับแต่งเสียงได้หลากหลาย)
    chatTtsEnabled: true,
    chatTtsFormat: 'nameAndMessage',
    chatTtsSpeed: 0.86, // จังหวะปกติ ไม่เร็วเกิน ชัดเจน ฟังสบาย เป็นธรรมชาติ
    chatTtsPitch: 1.05, // โทนเสียงพูดผู้หญิงธรรมชาติ ฟังสบาย
    chatTtsVolume: 90,
    chatTtsVoice: 'ai_female_google', // เสียงสาวหวานใส AI รับประกันหญิง 100%
    chatTtsTonePreset: 'female-natural',
    chatTtsSkipSpam: true,
    chatTtsSweetEnding: false,

    likeGoal: 20000,
    currentLikes: 0,
    likeStyle: 'podium-card',
    likeShowGoalBar: true,
    likeShowTopCount: 5,
    likeSoundEnabled: true,

    giftSoundEnabled: true,
    giftSoundVolume: 60,
    giftDuration: 5,
    giftShowParticles: true,
    giftMinCoinFilter: 1,
    giftStyle: 'banner-epic',

    // Follow Alert
    followAlertEnabled: true,
    followSoundEnabled: true,
    followTtsEnabled: true,
    followDuration: 4,
    followStyle: 'neon-banner',

    // Share Alert
    shareAlertEnabled: true,
    shareSoundEnabled: true,
    shareTtsEnabled: true,
    shareDuration: 4,
    shareStyle: 'neon-banner',

    streamFollowCount: 0,
    streamShareCount: 0,

    // Subathon Timer Settings
    subathonTheme: 'viper-cyber-pink',
    subathonFont: 'orbitron',
    subathonStyle: 'viperuex', // สไตล์ตามคลิปวีดีโอ (หน้าปัดเข็ม เกียร์หมุน หลอดไฟ LED)
    subathonTitle: 'STARTING SOON',
    subathonAutoAdd: true,
    subathonAddPerFollow: 30,
    subathonAddPerShare: 15,
    subathonAddPer100Likes: 10,
    subathonAddPerCoin: 1,
    subathonMaxCapHours: 12,
    subathonShowProgressBar: true,
    subathonSoundEnabled: true,
  });

  // Live widgets state (Starts clean with 0 likes and empty leaderboard for new stream)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [leaderboard, setLeaderboard] = useState<LikeUser[]>([]);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [recentHearts, setRecentHearts] = useState<FloatingHeartItem[]>([]);
  const [currentGiftAlert, setCurrentGiftAlert] = useState<GiftAlert | null>(null);
  const [currentFollowAlert, setCurrentFollowAlert] = useState<FollowAlert | null>(null);
  const [currentShareAlert, setCurrentShareAlert] = useState<ShareAlert | null>(null);

  // Subathon Live State
  const [subathonSeconds, setSubathonSeconds] = useState<number>(7200); // 2 hours
  const [subathonIsRunning, setSubathonIsRunning] = useState<boolean>(true);
  const [subathonEvents, setSubathonEvents] = useState<SubathonTimeAddedEvent[]>([]);

  // Studio UI state
  const [activeTab, setActiveTab] = useState<'studio' | 'themes' | 'links' | 'indofinity'>('studio');
  const [activeWidgetView, setActiveWidgetView] = useState<'all' | 'chat' | 'leaderboard' | 'gift' | 'follow' | 'share' | 'alerts' | 'subathon'>('all');
  const [canvasAspect, setCanvasAspect] = useState<'16:9' | '9:16'>('16:9');
  const [canvasBg, setCanvasBg] = useState<'gaming' | 'lofi' | 'dark' | 'transparent'>('gaming');
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // IndoFinity State & Client
  const indoFinityClientRef = useRef<IndoFinityClient>(getIndoFinityClient());
  const [indoFinityStatus, setIndoFinityStatus] = useState<IndoFinityConnectionStatus>('disconnected');
  const [indoFinityLogs, setIndoFinityLogs] = useState<IndoFinityLogItem[]>([]);

  const giftTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const followTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shareTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSimIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync sound mute/unmute and TTS settings
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
    sounds.enabled = soundEnabled;
    ttsService.updateOptions({
      enabled: settings.chatTtsEnabled && soundEnabled,
      format: settings.chatTtsFormat,
      rate: settings.chatTtsSpeed,
      pitch: settings.chatTtsPitch,
      volume: settings.chatTtsVolume,
      voiceURI: settings.chatTtsVoice,
      cleanSpam: settings.chatTtsSkipSpam,
      sweetEnding: settings.chatTtsSweetEnding,
    });
  }, [settings, soundEnabled]);

  // Subathon Countdown Timer Interval
  useEffect(() => {
    if (!subathonIsRunning) return;
    const interval = setInterval(() => {
      setSubathonSeconds((prev) => {
        if (prev <= 1) {
          if (prev === 1 && settings.subathonSoundEnabled && soundEnabled) {
            sounds.playTimerEnd();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [subathonIsRunning, settings.subathonSoundEnabled, soundEnabled]);

  // Action: Add or Subtract Subathon Time
  const handleAddSubathonTime = (secsToAdd: number, reason?: string, senderName?: string) => {
    if (secsToAdd === 0) return;
    setSubathonSeconds((prev) => {
      const maxCap = settings.subathonMaxCapHours > 0 ? settings.subathonMaxCapHours * 3600 : Infinity;
      const target = prev + secsToAdd;
      return Math.max(0, Math.min(maxCap, target));
    });

    if (settings.subathonSoundEnabled && soundEnabled) {
      if (secsToAdd > 0) {
        sounds.playTimerAdd();
      } else {
        sounds.playLike();
      }
    }

    const newEvent: SubathonTimeAddedEvent = {
      id: Math.random().toString(36).substring(2, 9),
      seconds: secsToAdd,
      reason: reason || (secsToAdd > 0 ? 'เพิ่มเวลา' : 'ลดเวลา'),
      senderName,
      timestamp: Date.now(),
    };
    setSubathonEvents((prev) => [...prev, newEvent]);
    setTimeout(() => {
      setSubathonEvents((prev) => prev.filter((e) => e.id !== newEvent.id));
    }, 2800);
  };

  const handleToggleSubathon = () => {
    setSubathonIsRunning((prev) => !prev);
  };

  const handleResetSubathonTimer = (newSecs: number = 7200) => {
    setSubathonSeconds(newSecs);
  };

  // Action: Add Likes (supports real TikTok user from IndoFinity)
  const handleAddLikes = (count: number, user?: LikeUser, total?: number) => {
    sounds.playLike();
    setTotalLikes((prev) => (total !== undefined ? total : prev + count));

    // Subathon auto-add from likes
    if (settings.subathonAutoAdd && settings.subathonAddPer100Likes > 0 && count >= 10) {
      const addSecs = Math.max(1, Math.round((count / 100) * settings.subathonAddPer100Likes));
      handleAddSubathonTime(addSecs, `เคาะจอ ${count} ไลก์`);
    }

    const heartColors = ['#f43f5e', '#ec4899', '#f59e0b', '#a855f7', '#38bdf8', '#fb7185'];
    const newHearts: FloatingHeartItem[] = Array.from({ length: Math.min(count, 6) }).map(() => ({
      id: Math.random().toString(36).substring(2, 9),
      x: 10 + Math.random() * 80,
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
      scale: 0.7 + Math.random() * 0.7,
      icon: '❤️',
    }));

    setRecentHearts((prev) => [...prev, ...newHearts]);
    setTimeout(() => {
      setRecentHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
    }, 1800);

    // Update leaderboard
    setLeaderboard((prev) => {
      const updated = [...prev];
      if (user) {
        const existingIdx = updated.findIndex((u) => u.id === user.id || u.name === user.name);
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            likeCount: updated[existingIdx].likeCount + count,
            isRecent: true,
          };
        } else {
          updated.push({ ...user, likeCount: count, rank: updated.length + 1, isRecent: true });
        }
        updated.sort((a, b) => b.likeCount - a.likeCount);
        return updated.map((u, i) => ({ ...u, rank: i + 1 }));
      } else {
        if (updated.length > 0) {
          updated[0] = { ...updated[0], likeCount: updated[0].likeCount + count };
        } else {
          const simUser = SIMULATION_NAMES[0];
          updated.push({
            id: 'sim-liker-1',
            name: simUser.name,
            avatar: simUser.avatar,
            likeCount: count,
            rank: 1,
            badge: '👑 MVP Liker',
          });
        }
        return updated;
      }
    });
  };

  // Action: Reset Likes to 0 (For fresh stream sessions)
  const handleResetLikes = () => {
    setTotalLikes(0);
    setLeaderboard([]);
    setSettings((prev) => ({ ...prev, currentLikes: 0 }));
  };

  // Action: Send Chat
  const handleSendChat = (customText?: string, rolePreset?: 'queen' | 'mod' | 'vip' | 'sub' | 'coder' | 'memer' | 'event') => {
    sounds.playChat();

    if (rolePreset === 'event') {
      const eventTypes: ('resub' | 'redeem' | 'cheer' | 'follow')[] = ['resub', 'redeem', 'cheer', 'follow'];
      const chosenEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const randomUser = SIMULATION_NAMES[Math.floor(Math.random() * SIMULATION_NAMES.length)];
      
      let eventText = `✨ ${randomUser.name} สับตะไคร้ต่อเนื่อง 6 เดือน! (Resub x6)`;
      if (chosenEvent === 'redeem') {
        eventText = `💧 ${randomUser.name} แลกรางวัล Channel Points: ดื่มน้ำนะคนเก่ง`;
      } else if (chosenEvent === 'cheer') {
        eventText = `💎 ${randomUser.name} ส่ง 500 Bits! "สตรีมสนุกมากครับ"`;
      } else if (chosenEvent === 'follow') {
        eventText = `⭐ ${randomUser.name} กดติดตามช่องแล้ว ยินดีต้อนรับ!`;
      }

      const eventMsg: ChatMessage = {
        id: 'event-' + Date.now() + Math.random(),
        username: randomUser.name,
        avatarUrl: randomUser.avatar,
        message: eventText,
        timestamp: Date.now(),
        color: '#10b981',
        isEvent: true,
        eventType: chosenEvent,
        eventText,
      };

      setMessages((prev) => [...prev, eventMsg]);
      return;
    }

    const randomUser = SIMULATION_NAMES[Math.floor(Math.random() * SIMULATION_NAMES.length)];
    const text = customText || RANDOM_CHAT_PHRASES[Math.floor(Math.random() * RANDOM_CHAT_PHRASES.length)];
    
    // Choose role & icons matching reference video
    const roles: { roleType: 'streamer' | 'mod' | 'vip' | 'sub' | 'coder' | 'memer' | 'viewer'; roleTag: string; rightIcon: string; badge: 'mod' | 'vip' | 'sub' | 'top_fan' | 'verified' }[] = [
      { roleType: 'streamer', roleTag: 'QUEEN', rightIcon: 'crown', badge: 'verified' },
      { roleType: 'mod', roleTag: 'MOD', rightIcon: 'shield', badge: 'mod' },
      { roleType: 'vip', roleTag: 'VIP', rightIcon: 'diamond', badge: 'vip' },
      { roleType: 'sub', roleTag: 'SUB', rightIcon: 'star', badge: 'sub' },
      { roleType: 'coder', roleTag: 'CODER', rightIcon: 'flower', badge: 'vip' },
      { roleType: 'memer', roleTag: 'MEMER', rightIcon: 'pepe', badge: 'top_fan' },
    ];

    const chosenRole = rolePreset
      ? roles.find((r) => r.roleType === (rolePreset === 'queen' ? 'streamer' : rolePreset)) || roles[0]
      : roles[Math.floor(Math.random() * roles.length)];

    const newMsg: ChatMessage = {
      id: 'chat-' + Date.now() + Math.random(),
      username: customText ? 'You_Streamer' : randomUser.name,
      avatarUrl: customText
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
        : randomUser.avatar,
      message: text,
      timestamp: Date.now(),
      badges: [chosenRole.badge],
      roleType: chosenRole.roleType,
      roleTag: chosenRole.roleTag,
      rightIcon: chosenRole.rightIcon as any,
      color: ['#38bdf8', '#f472b6', '#34d399', '#fbbf24', '#c084fc'][Math.floor(Math.random() * 5)],
      highlighted: Math.random() > 0.8,
    };

    setMessages((prev) => [...prev, newMsg]);
    if (settingsRef.current.chatTtsEnabled) {
      ttsService.speakChat(newMsg.username, newMsg.message);
    }
  };

  // Action: Send Gift Alert
  const handleSendGift = (
    gift: GiftItem,
    combo: number = 1,
    senderName?: string,
    senderAvatar?: string
  ) => {
    if (combo > 1) {
      sounds.playCombo(combo);
    } else {
      sounds.playGift(gift.rarity);
    }

    const randomUser = SIMULATION_NAMES[Math.floor(Math.random() * SIMULATION_NAMES.length)];
    const name = senderName || randomUser.name;
    const avatar = senderAvatar || randomUser.avatar;

    const alert: GiftAlert = {
      id: 'gift-' + Date.now(),
      senderName: name,
      senderAvatar: avatar,
      gift,
      amount: 1,
      comboCount: combo,
      customMessage: combo > 3 ? `ส่งรัวๆ คอมโบ x${combo} เลิฟสตรีมเมอร์ม้ากมากกก! 🎉` : undefined,
      timestamp: Date.now(),
    };

    setCurrentGiftAlert(alert);

    if (giftTimeoutRef.current) clearTimeout(giftTimeoutRef.current);
    giftTimeoutRef.current = setTimeout(() => {
      setCurrentGiftAlert(null);
    }, settings.giftDuration * 1000);

    // Subathon auto-add from gift
    if (settings.subathonAutoAdd && settings.subathonAddPerCoin > 0) {
      const totalCoins = (gift.coinValue || 1) * combo;
      const addSecs = Math.max(1, Math.round(totalCoins * settings.subathonAddPerCoin));
      handleAddSubathonTime(addSecs, gift.nameTh || gift.name, name);
    }
  };

  // Action: Handle Follow Alert
  const handleFollowAlert = (alert: FollowAlert) => {
    if (settingsRef.current.followSoundEnabled && soundEnabled) {
      sounds.playFollow();
    }
    setCurrentFollowAlert(alert);
    setSettings((prev) => ({ ...prev, streamFollowCount: prev.streamFollowCount + 1 }));

    if (settingsRef.current.followTtsEnabled && settingsRef.current.chatTtsEnabled && soundEnabled) {
      ttsService.speakFollow(alert.username);
    }

    if (followTimeoutRef.current) clearTimeout(followTimeoutRef.current);
    followTimeoutRef.current = setTimeout(() => {
      setCurrentFollowAlert(null);
    }, settings.followDuration * 1000);

    // Subathon auto-add from follow
    if (settings.subathonAutoAdd && settings.subathonAddPerFollow > 0) {
      handleAddSubathonTime(settings.subathonAddPerFollow, 'คนติดตามใหม่', alert.username);
    }
  };

  // Action: Handle Share Alert
  const handleShareAlert = (alert: ShareAlert) => {
    if (settingsRef.current.shareSoundEnabled && soundEnabled) {
      sounds.playShare();
    }
    setCurrentShareAlert(alert);
    setSettings((prev) => ({
      ...prev,
      streamShareCount: prev.streamShareCount + (alert.shareCount || 1),
    }));

    if (settingsRef.current.shareTtsEnabled && settingsRef.current.chatTtsEnabled && soundEnabled) {
      ttsService.speakShare(alert.username);
    }

    if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    shareTimeoutRef.current = setTimeout(() => {
      setCurrentShareAlert(null);
    }, settings.shareDuration * 1000);

    // Subathon auto-add from share
    if (settings.subathonAutoAdd && settings.subathonAddPerShare > 0) {
      handleAddSubathonTime(settings.subathonAddPerShare, 'คนแชร์ไลฟ์', alert.username);
    }
  };

  // Action: Send Test Follow
  const handleSendTestFollow = (username?: string) => {
    const randomUser = SIMULATION_NAMES[Math.floor(Math.random() * SIMULATION_NAMES.length)];
    handleFollowAlert({
      id: 'follow-' + Date.now(),
      username: username || randomUser.name,
      avatarUrl: randomUser.avatar,
      timestamp: Date.now(),
      uniqueId: (username || randomUser.name).toLowerCase().replace(/\s+/g, '_'),
    });
  };

  // Action: Send Test Share
  const handleSendTestShare = (username?: string) => {
    const randomUser = SIMULATION_NAMES[Math.floor(Math.random() * SIMULATION_NAMES.length)];
    handleShareAlert({
      id: 'share-' + Date.now(),
      username: username || randomUser.name,
      avatarUrl: randomUser.avatar,
      timestamp: Date.now(),
      shareCount: 1,
      uniqueId: (username || randomUser.name).toLowerCase().replace(/\s+/g, '_'),
    });
  };

  // Setup IndoFinity Client listeners
  useEffect(() => {
    const client = indoFinityClientRef.current;

    client.setCallbacks({
      onStatusChange: (status) => setIndoFinityStatus(status),
      onLog: () => setIndoFinityLogs([...client.getLogs()]),
      onChat: (msg) => {
        sounds.playChat();
        setMessages((prev) => [...prev.slice(-20), msg]);
        if (settingsRef.current.chatTtsEnabled) {
          ttsService.speakChat(msg.username, msg.message);
        }
      },
      onLike: (data) => {
        handleAddLikes(data.count, data.user, data.totalLikes);
      },
      onGift: (alert) => {
        handleSendGift(alert.gift, alert.comboCount, alert.senderName, alert.senderAvatar);
      },
      onFollow: (alert) => {
        handleFollowAlert(alert);
      },
      onShare: (alert) => {
        handleShareAlert(alert);
      },
    });

    // Auto connect to ws://localhost:62024
    client.connect();

    return () => {
      // Don't kill client permanently, just unhook if unmounted
    };
  }, [settings.giftDuration, settings.followDuration, settings.shareDuration]);

  // Auto stream simulation loop
  useEffect(() => {
    if (!isAutoSimulating) {
      if (autoSimIntervalRef.current) clearInterval(autoSimIntervalRef.current);
      return;
    }

    autoSimIntervalRef.current = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.4) {
        handleAddLikes(Math.floor(5 + Math.random() * 20));
      } else if (rand < 0.7) {
        handleSendChat();
      } else if (rand < 0.85) {
        const randomGift = GIFT_ITEMS[Math.floor(Math.random() * GIFT_ITEMS.length)];
        handleSendGift(randomGift, Math.floor(1 + Math.random() * 4));
      } else if (rand < 0.93) {
        handleSendTestFollow();
      } else {
        handleSendTestShare();
      }
    }, 2800);

    return () => {
      if (autoSimIntervalRef.current) clearInterval(autoSimIntervalRef.current);
    };
  }, [isAutoSimulating]);

  const updateSettings = (partial: Partial<OverlayCustomSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const copyWidgetUrl = (type: 'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'alerts' | 'subathon') => {
    const origin = window.location.origin;
    const url = type === 'subathon'
      ? `${origin}?mode=overlay&overlay=subathon&subathontheme=${settings.subathonTheme}&subathonfont=${settings.subathonFont || 'orbitron'}&subathonstyle=${settings.subathonStyle}${settings.subathonStartSeconds ? `&subathonsec=${settings.subathonStartSeconds}` : ''}`
      : `${origin}?mode=overlay&overlay=${type}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedKey(type);
      setTimeout(() => setCopiedKey(null), 2500);
    });
  };

  // If in pure overlay mode (for OBS Browser Source)
  if (isOverlayMode) {
    return <OverlayView overlayType={overlayType} />;
  }

  // Background visual mock style for the Canvas
  const getCanvasBackgroundStyle = () => {
    switch (canvasBg) {
      case 'gaming':
        return 'bg-gradient-to-br from-slate-950 via-indigo-950/80 to-purple-950/90 relative';
      case 'lofi':
        return 'bg-gradient-to-br from-amber-950/70 via-rose-950/60 to-neutral-950 relative';
      case 'transparent':
        return 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-neutral-950';
      default:
        return 'bg-neutral-950';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      {/* Top Studio Navbar - Immersive UI Theme */}
      <header className="sticky top-0 z-40 h-16 border-b border-white/10 flex items-center justify-between px-4 sm:px-8 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center justify-center">
              <Radio className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tighter text-white">
                  STREAM<span className="text-cyan-400">PULSE</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  OBS Studio
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Mode Switchers */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'studio'
                  ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>สตูดิโอจำลองสด</span>
            </button>

            <button
              onClick={() => setActiveTab('themes')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'themes'
                  ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>ธีมกล่องแชท</span>
              <span className="text-[10px] bg-cyan-400 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">8</span>
            </button>

            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'links'
                  ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>ลิงก์ OBS แยกหมวดหมู่</span>
            </button>

            <button
              onClick={() => setActiveTab('indofinity')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'indofinity'
                  ? 'text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>IndoFinity Bridge</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  indoFinityStatus === 'connected'
                    ? 'bg-emerald-400 animate-pulse'
                    : indoFinityStatus === 'connecting'
                    ? 'bg-amber-400 animate-spin'
                    : 'bg-slate-500'
                }`}
              />
            </button>
          </div>

          {/* IndoFinity Live Interactive Pill */}
          <button
            onClick={() => setActiveTab('indofinity')}
            className={`flex items-center gap-2 px-3 py-1 border rounded-full transition-all cursor-pointer ${
              indoFinityStatus === 'connected'
                ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400'
                : indoFinityStatus === 'connecting'
                ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-300'
                : 'bg-slate-900 border-white/15 hover:border-white/30 text-slate-400'
            }`}
            title="คลิกเพื่อเปิด IndoFinity Bridge Manager"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                indoFinityStatus === 'connected'
                  ? 'bg-emerald-400 animate-pulse'
                  : indoFinityStatus === 'connecting'
                  ? 'bg-amber-400 animate-spin'
                  : 'bg-rose-400'
              }`}
            />
            <span className="text-xs font-medium tracking-wide">
              {indoFinityStatus === 'connected'
                ? 'IndoFinity 62024: Live'
                : indoFinityStatus === 'connecting'
                ? 'IndoFinity: Connecting...'
                : 'IndoFinity: Offline'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Tab 1: Studio Live Stage View */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Top Toolbar: Widget Focus & Canvas Controls */}
            <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-900/60 border border-white/10 px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mr-1">
                  เลือกแสดงบนจอ:
                </span>
                <button
                  onClick={() => setActiveWidgetView('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeWidgetView === 'all'
                      ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  รวมทุกวิดเจ็ต (HUD)
                </button>
                <button
                  onClick={() => setActiveWidgetView('leaderboard')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeWidgetView === 'leaderboard'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  1. Like Leaderboard
                </button>
                <button
                  onClick={() => setActiveWidgetView('chat')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeWidgetView === 'chat'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  2. Chat Overlay
                </button>
                <button
                  onClick={() => setActiveWidgetView('gift')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeWidgetView === 'gift'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  3. Gift Overlay
                </button>
                <button
                  onClick={() => setActiveWidgetView('follow')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeWidgetView === 'follow'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  4. Follow Alert
                </button>
                <button
                  onClick={() => setActiveWidgetView('share')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeWidgetView === 'share'
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  5. Share Alert
                </button>
                <button
                  onClick={() => setActiveWidgetView('subathon')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeWidgetView === 'subathon'
                      ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  <Timer className="w-3.5 h-3.5" />
                  6. Subathon Timer
                </button>
              </div>

              {/* Canvas Aspect Ratio & Mock Background */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setCanvasAspect('16:9')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                      canvasAspect === '16:9' ? 'bg-white/10 text-cyan-400 font-bold' : 'text-slate-400'
                    }`}
                    title="แนวนอน 16:9 (YouTube / Twitch / Facebook)"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    16:9
                  </button>
                  <button
                    onClick={() => setCanvasAspect('9:16')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                      canvasAspect === '9:16' ? 'bg-white/10 text-cyan-400 font-bold' : 'text-slate-400'
                    }`}
                    title="แนวตั้ง 9:16 (TikTok Live / Shorts)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    9:16
                  </button>
                </div>

                <select
                  value={canvasBg}
                  onChange={(e) => setCanvasBg(e.target.value as 'gaming' | 'lofi' | 'dark' | 'transparent')}
                  className="bg-slate-950 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                  title="พื้นหลังจำลองภาพฉากเกม/สตรีม"
                >
                  <option value="gaming">ฉากเกมไซเบอร์</option>
                  <option value="lofi">ฉากคาเฟ่ Lofi</option>
                  <option value="dark">ฉากสีดำเรียบ</option>
                  <option value="transparent">ฉากโปร่งใส (Checkerboard)</option>
                </select>
              </div>
            </div>

            {/* The Live Stream Stage (OBS Canvas Simulator) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Canvas Column */}
              <div className="lg:col-span-8 flex flex-col items-center">
                <div
                  className={`w-full rounded-3xl border border-white/10 overflow-hidden shadow-2xl transition-all duration-300 ${getCanvasBackgroundStyle()} ${
                    canvasAspect === '16:9'
                      ? 'aspect-[16/9] max-h-[580px]'
                      : 'aspect-[9/16] max-w-[340px] max-h-[620px]'
                  }`}
                >
                  {/* Decorative Game Simulation Elements */}
                  {canvasBg === 'gaming' && (
                    <div className="absolute inset-0 pointer-events-none opacity-25">
                      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" />
                      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl" />
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest text-slate-400/50 uppercase">
                        [ MOCK STREAM STREAMPLAY LIVE • 1080P60 ]
                      </div>
                    </div>
                  )}

                  {/* Widgets Placed in Canvas */}
                  <div className="w-full h-full relative p-3 sm:p-5 flex flex-col justify-between overflow-hidden">
                    {/* Centered Single View for Subathon */}
                    {activeWidgetView === 'subathon' && (
                      <div className="flex-1 flex items-center justify-center p-4">
                        <SubathonTimerWidget
                          seconds={subathonSeconds}
                          initialSeconds={7200}
                          maxCapSeconds={settings.subathonMaxCapHours > 0 ? settings.subathonMaxCapHours * 3600 : 0}
                          isRunning={subathonIsRunning}
                          theme={settings.subathonTheme}
                          font={settings.subathonFont}
                          style={settings.subathonStyle}
                          title={settings.subathonTitle}
                          addedEvents={subathonEvents}
                          showProgressBar={settings.subathonShowProgressBar}
                          standalone={false}
                        />
                      </div>
                    )}

                    {/* Top Row: Leaderboard (Left) & Subathon Timer (Right) & Gift Alert (Center) */}
                    {activeWidgetView !== 'subathon' && (
                      <div className="flex items-start justify-between w-full pointer-events-auto gap-3">
                        {(activeWidgetView === 'all' || activeWidgetView === 'leaderboard') && (
                          <div
                            className={`transition-all duration-200 ${
                              activeWidgetView === 'leaderboard' ? 'w-full max-w-sm mx-auto' : 'w-60 sm:w-68 shrink-0'
                            }`}
                          >
                            <LikeLeaderboardWidget
                              users={leaderboard}
                              totalLikes={totalLikes}
                              recentHearts={recentHearts}
                              settings={settings}
                            />
                          </div>
                        )}

                        {/* Gift Alert Positioned at Top Center */}
                        {(activeWidgetView === 'all' || activeWidgetView === 'gift') && (
                          <div
                            className={`flex-1 flex justify-center pt-2 sm:pt-4 ${
                              activeWidgetView === 'gift' ? 'w-full my-auto' : ''
                            }`}
                          >
                            <GiftOverlayWidget currentAlert={currentGiftAlert} settings={settings} />
                          </div>
                        )}

                        {/* Subathon Timer on Top Right in All Widgets Mode */}
                        {activeWidgetView === 'all' && (
                          <div className="w-60 sm:w-72 shrink-0">
                            <SubathonTimerWidget
                              seconds={subathonSeconds}
                              initialSeconds={7200}
                              maxCapSeconds={settings.subathonMaxCapHours > 0 ? settings.subathonMaxCapHours * 3600 : 0}
                              isRunning={subathonIsRunning}
                              theme={settings.subathonTheme}
                              font={settings.subathonFont}
                              style={settings.subathonStyle}
                              title={settings.subathonTitle}
                              addedEvents={subathonEvents}
                              showProgressBar={settings.subathonShowProgressBar}
                              standalone={false}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Follow & Share Alert Placed at Center / Top */}
                    {activeWidgetView !== 'subathon' && (activeWidgetView === 'all' || activeWidgetView === 'follow' || activeWidgetView === 'share' || activeWidgetView === 'alerts') && (
                      <div
                        className={`absolute inset-x-0 top-16 sm:top-20 flex justify-center pointer-events-none z-30 ${
                          activeWidgetView === 'follow' || activeWidgetView === 'share' ? 'my-auto' : ''
                        }`}
                      >
                        <FollowShareOverlayWidget
                          currentFollow={currentFollowAlert}
                          currentShare={currentShareAlert}
                          settings={settings}
                          mode={activeWidgetView === 'follow' ? 'follow-only' : activeWidgetView === 'share' ? 'share-only' : 'both'}
                        />
                      </div>
                    )}

                    {/* Bottom Row: Chat Overlay */}
                    {activeWidgetView !== 'subathon' && (activeWidgetView === 'all' || activeWidgetView === 'chat') && (
                      <div
                        className={`pointer-events-auto transition-all duration-200 ${
                          settings.chatLayout === 'horizontal'
                            ? 'w-full h-24 sm:h-28 overflow-hidden'
                            : activeWidgetView === 'chat'
                            ? 'w-full max-w-md mx-auto h-[480px]'
                            : 'w-72 sm:w-84 h-72 sm:h-80'
                        }`}
                      >
                        <ChatOverlayWidget messages={messages} settings={settings} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Canvas Dimension & OBS Info bar */}
                <div className="flex items-center justify-between w-full mt-2.5 px-2 text-[11px] text-slate-400">
                  <span>
                    ขนาดจอจำลอง: {canvasAspect === '16:9' ? '1920 × 1080 (16:9)' : '1080 × 1920 (9:16)'}
                  </span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    เรนเดอร์พื้นหลังใสอัตโนมัติเมื่อนำลิงก์ไปใส่ OBS
                  </span>
                </div>
              </div>

              {/* Right Settings & Categorized Widget Customizer Column */}
              <div className="lg:col-span-4 space-y-4">
                <WidgetCustomizerPanel
                  activeWidgetView={activeWidgetView}
                  onSelectWidgetView={setActiveWidgetView}
                  settings={settings}
                  onUpdateSettings={updateSettings}
                  totalLikes={totalLikes}
                  onResetLikes={handleResetLikes}
                  onOpenGallery={() => setActiveTab('themes')}
                  onCopyUrl={copyWidgetUrl}
                  copiedKey={copiedKey}
                  subathonSeconds={subathonSeconds}
                  subathonIsRunning={subathonIsRunning}
                  onToggleSubathon={handleToggleSubathon}
                  onAddSubathonTime={handleAddSubathonTime}
                  onResetSubathon={handleResetSubathonTimer}
                />
              </div>
            </div>

            {/* Bottom Stream Simulator Deck */}
            <StreamSimulatorDeck
              onAddLikes={handleAddLikes}
              onResetLikes={handleResetLikes}
              totalLikes={totalLikes}
              onSendChat={handleSendChat}
              onSendGift={handleSendGift}
              onSendFollow={handleSendTestFollow}
              onSendShare={handleSendTestShare}
              streamFollowCount={settings.streamFollowCount}
              streamShareCount={settings.streamShareCount}
              isAutoSimulating={isAutoSimulating}
              onToggleAutoSim={() => setIsAutoSimulating((prev) => !prev)}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled((prev) => !prev)}
              ttsEnabled={settings.chatTtsEnabled}
              onToggleTts={() => updateSettings({ chatTtsEnabled: !settings.chatTtsEnabled })}
              onTestTts={() => ttsService.testSpeak()}
            />
          </div>
        )}

        {/* Tab 2: Dedicated Chat Themes Gallery */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-6">
              <ThemeSelector
                selectedTheme={settings.chatTheme}
                onSelectTheme={(themeId) => {
                  updateSettings({ chatTheme: themeId });
                  setActiveTab('studio');
                }}
              />
            </div>

            {/* Live Preview Box with Current Chosen Theme */}
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    พรีวิวธีมที่เลือกปัจจุบัน: {CHAT_THEMES.find((t) => t.id === settings.chatTheme)?.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    ทดสอบส่งข้อความเพื่อดูการแสดงผลของแอนิเมชันและรูปทรงของธีมนี้
                  </p>
                </div>
                <button
                  onClick={() => handleSendChat()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                >
                  + ส่งข้อความทดสอบ
                </button>
              </div>

              <div className="h-80 bg-slate-950 rounded-2xl border border-white/10 p-4 overflow-hidden">
                <ChatOverlayWidget messages={messages} settings={settings} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Categorized OBS Links Hub */}
        {activeTab === 'links' && (
          <OBSLinkHub
            settings={settings}
            onUpdateSettings={updateSettings}
            onSelectPreviewTab={(widget) => {
              setActiveWidgetView(widget);
              setActiveTab('studio');
            }}
            onSelectIndoFinityTab={() => setActiveTab('indofinity')}
          />
        )}

        {/* Tab 4: IndoFinity Live WebSocket Bridge Monitor */}
        {activeTab === 'indofinity' && (
          <IndoFinityBridgeView
            client={indoFinityClientRef.current}
            status={indoFinityStatus}
            logs={indoFinityLogs}
            onClearLogs={() => setIndoFinityLogs([])}
            onConnect={(url) => indoFinityClientRef.current.connect(url)}
            onDisconnect={() => indoFinityClientRef.current.disconnect()}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          StreamPulse OBS Overlay Suite • สร้างเพื่อสตรีมเมอร์ไทย • รองรับ OBS Studio, Streamlabs Desktop & PRISM Live
        </p>
      </footer>
    </div>
  );
}
