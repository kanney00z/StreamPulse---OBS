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
} from 'lucide-react';
import {
  ChatMessage,
  GiftAlert,
  LikeUser,
  OverlayCustomSettings,
  FloatingHeartItem,
  GiftItem,
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
import { StreamSimulatorDeck } from './components/StreamSimulatorDeck';
import { OBSLinkHub } from './components/OBSLinkHub';
import { ThemeSelector } from './components/ThemeSelector';
import { OverlayView } from './components/OverlayView';
import { IndoFinityBridgeView } from './components/IndoFinityBridgeView';
import { ChatTtsControlCard } from './components/ChatTtsControlCard';
import { getIndoFinityClient, IndoFinityClient } from './services/indofinityService';
import { sounds } from './utils/soundEffects';
import { ttsService } from './utils/ttsService';

export default function App() {
  // Check if opened as standalone OBS Browser Source overlay
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [overlayType, setOverlayType] = useState<'leaderboard' | 'chat' | 'gift' | 'all'>('all');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const overlay = params.get('overlay') as 'leaderboard' | 'chat' | 'gift' | 'all';

    if (mode === 'overlay' || overlay) {
      setIsOverlayMode(true);
      if (overlay) setOverlayType(overlay);
    }
  }, []);

  // Global Overlay Settings State
  const [settings, setSettings] = useState<OverlayCustomSettings>({
    chatTheme: 'cyberpunk-neon',
    chatFontSize: 'base',
    chatAutoHideSeconds: 10,
    chatShowAvatars: true,
    chatShowBadges: true,
    chatDirection: 'down',
    chatSoundEnabled: true,
    chatMaxMessages: 12,

    // TTS (Text-to-Speech อ่านแชทสดอัตโนมัติ)
    chatTtsEnabled: true,
    chatTtsFormat: 'nameAndMessage',
    chatTtsSpeed: 1.05,
    chatTtsVolume: 90,
    chatTtsVoice: 'default',
    chatTtsSkipSpam: true,

    likeGoal: 20000,
    currentLikes: 14280,
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
  });

  // Live widgets state
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [leaderboard, setLeaderboard] = useState<LikeUser[]>(INITIAL_LIKE_LEADERBOARD);
  const [totalLikes, setTotalLikes] = useState<number>(14280);
  const [recentHearts, setRecentHearts] = useState<FloatingHeartItem[]>([]);
  const [currentGiftAlert, setCurrentGiftAlert] = useState<GiftAlert | null>(null);

  // Studio UI state
  const [activeTab, setActiveTab] = useState<'studio' | 'themes' | 'links' | 'indofinity'>('studio');
  const [activeWidgetView, setActiveWidgetView] = useState<'all' | 'chat' | 'leaderboard' | 'gift'>('all');
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
      volume: settings.chatTtsVolume,
      voiceURI: settings.chatTtsVoice,
      cleanSpam: settings.chatTtsSkipSpam,
    });
  }, [settings, soundEnabled]);

  // Action: Add Likes (supports real TikTok user from IndoFinity)
  const handleAddLikes = (count: number, user?: LikeUser, total?: number) => {
    sounds.playLike();
    setTotalLikes((prev) => (total !== undefined ? total : prev + count));

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
        updated[0] = { ...updated[0], likeCount: updated[0].likeCount + count };
        return updated;
      }
    });
  };

  // Action: Send Chat
  const handleSendChat = (customText?: string) => {
    sounds.playChat();
    const randomUser = SIMULATION_NAMES[Math.floor(Math.random() * SIMULATION_NAMES.length)];
    const text = customText || RANDOM_CHAT_PHRASES[Math.floor(Math.random() * RANDOM_CHAT_PHRASES.length)];
    const possibleBadges: ('mod' | 'vip' | 'sub' | 'top_fan' | 'verified')[][] = [
      ['vip'],
      ['sub'],
      ['mod', 'sub'],
      ['top_fan'],
      [],
    ];
    const badges = possibleBadges[Math.floor(Math.random() * possibleBadges.length)];

    const newMsg: ChatMessage = {
      id: 'chat-' + Date.now() + Math.random(),
      username: customText ? 'You_Streamer' : randomUser.name,
      avatarUrl: customText
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
        : randomUser.avatar,
      message: text,
      timestamp: Date.now(),
      badges: customText ? ['mod', 'verified'] : badges,
      color: ['#38bdf8', '#f472b6', '#34d399', '#fbbf24', '#c084fc'][Math.floor(Math.random() * 5)],
      highlighted: Math.random() > 0.75,
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
    });

    // Auto connect to ws://localhost:62024
    client.connect();

    return () => {
      // Don't kill client permanently, just unhook if unmounted
    };
  }, [settings.giftDuration]);

  // Auto stream simulation loop
  useEffect(() => {
    if (!isAutoSimulating) {
      if (autoSimIntervalRef.current) clearInterval(autoSimIntervalRef.current);
      return;
    }

    autoSimIntervalRef.current = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.5) {
        handleAddLikes(Math.floor(5 + Math.random() * 20));
      } else if (rand < 0.85) {
        handleSendChat();
      } else {
        const randomGift = GIFT_ITEMS[Math.floor(Math.random() * GIFT_ITEMS.length)];
        handleSendGift(randomGift, Math.floor(1 + Math.random() * 4));
      }
    }, 2800);

    return () => {
      if (autoSimIntervalRef.current) clearInterval(autoSimIntervalRef.current);
    };
  }, [isAutoSimulating]);

  const updateSettings = (partial: Partial<OverlayCustomSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const copyWidgetUrl = (type: 'leaderboard' | 'chat' | 'gift') => {
    const origin = window.location.origin;
    const url = `${origin}?mode=overlay&overlay=${type}`;
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
                    {/* Top Row: Leaderboard (Left) & Gift Alert (Center) */}
                    <div className="flex items-start justify-between w-full pointer-events-auto">
                      {(activeWidgetView === 'all' || activeWidgetView === 'leaderboard') && (
                        <div
                          className={`transition-all duration-200 ${
                            activeWidgetView === 'leaderboard' ? 'w-full max-w-sm mx-auto' : 'w-64 sm:w-72'
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
                    </div>

                    {/* Bottom Row: Chat Overlay */}
                    {(activeWidgetView === 'all' || activeWidgetView === 'chat') && (
                      <div
                        className={`pointer-events-auto transition-all duration-200 ${
                          activeWidgetView === 'chat'
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

              {/* Right Settings & Quick OBS Link Inspector Column */}
              <div className="lg:col-span-4 space-y-4">
                {/* Active Theme Badge & Customizer */}
                <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      ปรับแต่งวิดเจ็ตปัจจุบัน
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      LIVE SYNC
                    </span>
                  </div>

                  {/* Chat Theme Quick Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>ธีมกล่องแชท (Chat Theme):</span>
                      <button
                        onClick={() => setActiveTab('themes')}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                      >
                        ดูตัวอย่าง 8 ธีม &rarr;
                      </button>
                    </label>
                    <select
                      value={settings.chatTheme}
                      onChange={(e) => updateSettings({ chatTheme: e.target.value as any })}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      {CHAT_THEMES.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                          {theme.name} ({theme.badge})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chat Font Size & Auto-Hide */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-slate-400 mb-1 block">ขนาดฟอนต์แชท:</label>
                      <select
                        value={settings.chatFontSize}
                        onChange={(e) => updateSettings({ chatFontSize: e.target.value as any })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      >
                        <option value="sm">เล็ก (Small)</option>
                        <option value="base">กลาง (Medium)</option>
                        <option value="lg">ใหญ่ (Large)</option>
                        <option value="xl">ใหญ่พิเศษ (XL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 mb-1 block">เวลาซ่อนข้อความ:</label>
                      <select
                        value={settings.chatAutoHideSeconds}
                        onChange={(e) => updateSettings({ chatAutoHideSeconds: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                      >
                        <option value={0}>แสดงตลอดเวลา</option>
                        <option value={5}>5 วินาที</option>
                        <option value={10}>10 วินาที</option>
                        <option value={15}>15 วินาที</option>
                      </select>
                    </div>
                  </div>

                  {/* Like Goal Target */}
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">เป้าหมายยอดไลก์:</span>
                      <span className="font-mono font-bold text-pink-400">
                        {settings.likeGoal.toLocaleString()} ไลก์
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5000"
                      max="100000"
                      step="5000"
                      value={settings.likeGoal}
                      onChange={(e) => updateSettings({ likeGoal: Number(e.target.value) })}
                      className="w-full accent-pink-500 cursor-pointer"
                    />
                  </div>

                  {/* Quick Copy Link for Current Focused Widget */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      คัดลอกลิงก์ OBS ของวิดเจ็ตที่เลือก:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => copyWidgetUrl('leaderboard')}
                        className="py-1.5 px-2 rounded-xl bg-slate-950 border border-pink-500/30 hover:border-pink-400 text-pink-300 text-[11px] font-bold transition-all text-center truncate cursor-pointer hover:shadow-[0_0_10px_rgba(244,63,94,0.2)]"
                        title="คัดลอกลิงก์ Like Leaderboard"
                      >
                        {copiedKey === 'leaderboard' ? '✓ คัดลอกแล้ว' : '1. Like Link'}
                      </button>
                      <button
                        onClick={() => copyWidgetUrl('chat')}
                        className="py-1.5 px-2 rounded-xl bg-slate-950 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[11px] font-bold transition-all text-center truncate cursor-pointer hover:shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                        title="คัดลอกลิงก์ Chat Overlay"
                      >
                        {copiedKey === 'chat' ? '✓ คัดลอกแล้ว' : '2. Chat Link'}
                      </button>
                      <button
                        onClick={() => copyWidgetUrl('gift')}
                        className="py-1.5 px-2 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-[11px] font-bold transition-all text-center truncate cursor-pointer hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                        title="คัดลอกลิงก์ Gift Overlay"
                      >
                        {copiedKey === 'gift' ? '✓ คัดลอกแล้ว' : '3. Gift Link'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* TTS Control Card */}
                <ChatTtsControlCard settings={settings} onUpdateSettings={updateSettings} />

                {/* OBS Helper Card */}
                <div className="bg-gradient-to-br from-cyan-950/30 via-slate-900 to-purple-950/30 border border-cyan-500/20 rounded-3xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>เคล็ดลับการใช้งานใน OBS Studio:</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    เพิ่มแหล่งสัญญาณแบบ <strong>Browser Source</strong> แล้ววาง URL ลงไป ตัววิดเจ็ตจะมีพื้นหลังโปร่งใส สามารถนำไปวางทับภาพเกมหรือกล้องเว็บแคมได้ทันที
                  </p>
                  <button
                    onClick={() => setActiveTab('links')}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    ดูคำแนะนำและลิงก์ทั้งหมด &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Stream Simulator Deck */}
            <StreamSimulatorDeck
              onAddLikes={handleAddLikes}
              onSendChat={handleSendChat}
              onSendGift={handleSendGift}
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
