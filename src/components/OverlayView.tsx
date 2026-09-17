import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap } from 'lucide-react';
import { ChatOverlayWidget } from './ChatOverlayWidget';
import { LikeLeaderboardWidget } from './LikeLeaderboardWidget';
import { GiftOverlayWidget } from './GiftOverlayWidget';
import { FollowShareOverlayWidget } from './FollowShareOverlayWidget';
import { SubathonTimerWidget } from './SubathonTimerWidget';
import { StreamAvatarsOverlay } from './StreamAvatarsOverlay';
import {
  ChatMessage,
  GiftAlert,
  FollowAlert,
  ShareAlert,
  LikeUser,
  OverlayCustomSettings,
  FloatingHeartItem,
  ChatThemeId,
  SubathonThemeId,
  SubathonFontId,
  SubathonTimeAddedEvent,
  IndoFinityConnectionStatus,
} from '../types';
import {
  INITIAL_CHAT_MESSAGES,
  INITIAL_LIKE_LEADERBOARD,
} from '../data/mockData';
import { sounds } from '../utils/soundEffects';
import { ttsService } from '../utils/ttsService';
import { IndoFinityClient } from '../services/indofinityService';
import { realtimeSync } from '../services/realtimeSync';

interface OverlayViewProps {
  overlayType: 'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'alerts' | 'subathon' | 'avatars' | 'all';
}

export const OverlayView: React.FC<OverlayViewProps> = ({ overlayType }) => {
  // Ensure transparent background for OBS browser source
  useEffect(() => {
    document.body.classList.add('obs-mode');
    document.documentElement.classList.add('obs-mode');
    return () => {
      document.body.classList.remove('obs-mode');
      document.documentElement.classList.remove('obs-mode');
    };
  }, []);

  // Check if localStorage has saved settings on this machine
  let savedLocalSettings: Partial<OverlayCustomSettings> = {};
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('stream_overlay_settings');
      if (raw) savedLocalSettings = JSON.parse(raw);
    } catch (e) {}
  }

  // Parse URL search params (URL query params take priority, then localStorage, then defaults)
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const rawTheme = urlParams.get('theme') || savedLocalSettings.chatTheme;
  const themeParam = ((rawTheme === 'comic-pop-pink' ? 'comic-pop' : rawTheme) as ChatThemeId) || 'multistream-pill-dynamic';
  const autoHideParam = urlParams.has('autohide')
    ? Number(urlParams.get('autohide'))
    : (savedLocalSettings.chatAutoHideSeconds ?? 10);
  const fontSizeParam = (urlParams.get('fontsize') as 'sm' | 'base' | 'lg' | 'xl') || savedLocalSettings.chatFontSize || 'base';
  const layoutParam = (urlParams.get('layout') as 'vertical' | 'horizontal') || savedLocalSettings.chatLayout || 'vertical';
  const showTimestampsParam = urlParams.has('timestamp')
    ? urlParams.get('timestamp') !== '0'
    : (savedLocalSettings.chatShowTimestamps ?? true);
  const showAvatarsParam = urlParams.has('avatars')
    ? urlParams.get('avatars') !== '0'
    : (savedLocalSettings.chatShowAvatars ?? true);
  const showBadgesParam = urlParams.has('badges')
    ? urlParams.get('badges') !== '0'
    : (savedLocalSettings.chatShowBadges ?? true);
  const soundParam = urlParams.has('sound')
    ? urlParams.get('sound') !== '0'
    : (savedLocalSettings.chatSoundEnabled ?? true);

  // Like Leaderboard
  const styleParam = (urlParams.get('style') as 'podium-card' | 'compact-ticker' | 'glass-list' | 'neon-glow') || savedLocalSettings.likeStyle || 'podium-card';
  const goalParam = urlParams.has('goal') ? Number(urlParams.get('goal')) : (savedLocalSettings.likeGoal ?? 25000);
  const showGoalParam = urlParams.has('showgoal') ? urlParams.get('showgoal') !== '0' : (savedLocalSettings.likeShowGoalBar ?? true);
  const topParam = (urlParams.has('top') ? Number(urlParams.get('top')) : (savedLocalSettings.likeShowTopCount ?? 5)) as 3 | 5 | 10;

  // Gift
  const durationParam = urlParams.has('duration') ? Number(urlParams.get('duration')) : (savedLocalSettings.giftDuration ?? 5);
  const giftStyleParam = (urlParams.get('giftstyle') as any) || savedLocalSettings.giftStyle || 'banner-epic';
  const giftParticlesParam = urlParams.has('particles') ? urlParams.get('particles') !== '0' : (savedLocalSettings.giftShowParticles ?? true);
  const giftVolParam = urlParams.has('volume') ? Number(urlParams.get('volume')) : (savedLocalSettings.giftSoundVolume ?? 60);
  const giftMinCoinParam = urlParams.has('mincoin') ? Number(urlParams.get('mincoin')) : (savedLocalSettings.giftMinCoinFilter ?? 1);
  const wsUrlParam = urlParams.get('ws') || 'ws://localhost:62024';

  // TTS URL Params
  const ttsParam = urlParams.has('tts') ? urlParams.get('tts') === '1' : (savedLocalSettings.chatTtsEnabled ?? false);
  const ttsFormatParam = (urlParams.get('ttsformat') as any) || savedLocalSettings.chatTtsFormat || 'nameAndMessage';
  const ttsSpeedParam = urlParams.has('ttsspeed') ? Number(urlParams.get('ttsspeed')) : (savedLocalSettings.chatTtsSpeed ?? 0.86);
  const ttsPitchParam = urlParams.has('ttspitch') ? Number(urlParams.get('ttspitch')) : (savedLocalSettings.chatTtsPitch ?? 1.05);
  const ttsVolParam = urlParams.has('ttsvol') ? Number(urlParams.get('ttsvol')) : (savedLocalSettings.chatTtsVolume ?? 90);
  const ttsVoiceParam = urlParams.get('ttsvoice') || savedLocalSettings.chatTtsVoice || 'ai_female_google';
  const ttsSweetParam = urlParams.has('ttssweet') ? urlParams.get('ttssweet') !== '0' : (savedLocalSettings.chatTtsSweetEnding ?? true);

  // Follow & Share URL Params
  const followParam = urlParams.has('follow') ? urlParams.get('follow') !== '0' : (savedLocalSettings.followAlertEnabled ?? true);
  const shareParam = urlParams.has('share') ? urlParams.get('share') !== '0' : (savedLocalSettings.shareAlertEnabled ?? true);
  const followTtsParam = urlParams.has('followtts') ? urlParams.get('followtts') !== '0' : (savedLocalSettings.followTtsEnabled ?? true);
  const shareTtsParam = urlParams.has('sharetts') ? urlParams.get('sharetts') !== '0' : (savedLocalSettings.shareTtsEnabled ?? true);
  const followDurParam = urlParams.has('followdur') ? Number(urlParams.get('followdur')) : (savedLocalSettings.followDuration ?? 4);
  const shareDurParam = urlParams.has('sharedur') ? Number(urlParams.get('sharedur')) : (savedLocalSettings.shareDuration ?? 4);
  const followStyleParam = (urlParams.get('followstyle') as any) || savedLocalSettings.followStyle || 'neon-banner';
  const shareStyleParam = (urlParams.get('sharestyle') as any) || savedLocalSettings.shareStyle || 'neon-banner';
  const followSoundParam = urlParams.has('followsound') ? urlParams.get('followsound') !== '0' : (savedLocalSettings.followSoundEnabled ?? true);
  const shareSoundParam = urlParams.has('sharesound') ? urlParams.get('sharesound') !== '0' : (savedLocalSettings.shareSoundEnabled ?? true);

  // Subathon URL Params
  const subathonThemeParam = (urlParams.get('subathontheme') || urlParams.get('theme') || savedLocalSettings.subathonTheme || 'cyberpunk-neon') as SubathonThemeId;
  const subathonFontParam = (urlParams.get('subathonfont') || urlParams.get('font') || savedLocalSettings.subathonFont || 'orbitron') as SubathonFontId;
  const subathonStyleParam = (urlParams.get('subathonstyle') as 'card' | 'frameless' | 'viperuex') || savedLocalSettings.subathonStyle || (String(subathonThemeParam).startsWith('viper-') ? 'viperuex' : 'frameless');
  const subathonTitleParam = urlParams.get('subathontitle') || savedLocalSettings.subathonTitle || 'SUBATHON MARATHON';
  const subathonSecParam = urlParams.has('subathonsec') ? Number(urlParams.get('subathonsec')) : (savedLocalSettings.subathonStartSeconds ?? 7200);
  const subathonCapParam = urlParams.has('subathoncap') ? Number(urlParams.get('subathoncap')) : (savedLocalSettings.subathonMaxCapHours ?? 12);

  // Stream Avatars URL Params
  const avatarCountParam = urlParams.has('avatarcount') ? Number(urlParams.get('avatarcount')) : (savedLocalSettings.avatarViewerCount ?? 10);
  const avatarStyleParam = (urlParams.get('avatarstyle') as any) || savedLocalSettings.avatarStyle || 'shiba-squad';
  const avatarSizeParam = (urlParams.get('avatarsize') as any) || savedLocalSettings.avatarSize || 'md';
  const avatarFloorParam = (urlParams.get('avatarfloor') as any) || savedLocalSettings.avatarFloorStyle || 'transparent';
  const avatarSpeedParam = urlParams.has('avatarspeed') ? Number(urlParams.get('avatarspeed')) : (savedLocalSettings.avatarSpeed ?? 2.5);
  const avatarNamesParam = urlParams.has('avatarnames') ? urlParams.get('avatarnames') !== '0' : (savedLocalSettings.avatarShowNametags ?? true);
  const avatarBubblesParam = urlParams.has('avatarbubbles') ? urlParams.get('avatarbubbles') !== '0' : (savedLocalSettings.avatarShowChatBubbles ?? true);

  const [settings, setSettings] = useState<OverlayCustomSettings>({
    chatTheme: themeParam,
    chatFontSize: fontSizeParam,
    chatAutoHideSeconds: autoHideParam,
    chatShowAvatars: showAvatarsParam,
    chatShowBadges: showBadgesParam,
    chatShowTimestamps: showTimestampsParam,
    chatLayout: layoutParam,
    chatDirection: 'down',
    chatSoundEnabled: soundParam,
    chatMaxMessages: 15,

    // TTS (เสียงไทยหวานใส)
    chatTtsEnabled: ttsParam,
    chatTtsFormat: ttsFormatParam,
    chatTtsSpeed: ttsSpeedParam,
    chatTtsPitch: ttsPitchParam,
    chatTtsVolume: ttsVolParam,
    chatTtsVoice: ttsVoiceParam,
    chatTtsTonePreset: 'sweet',
    chatTtsSkipSpam: true,
    chatTtsSweetEnding: ttsSweetParam,

    likeGoal: goalParam,
    currentLikes: 0,
    likeStyle: styleParam,
    likeShowGoalBar: showGoalParam,
    likeShowTopCount: topParam,
    likeSoundEnabled: true,

    giftSoundEnabled: true,
    giftSoundVolume: giftVolParam,
    giftDuration: durationParam,
    giftShowParticles: giftParticlesParam,
    giftMinCoinFilter: giftMinCoinParam,
    giftStyle: giftStyleParam,

    // Follow Alert
    followAlertEnabled: followParam,
    followSoundEnabled: followSoundParam,
    followTtsEnabled: followTtsParam,
    followDuration: followDurParam,
    followStyle: followStyleParam,

    // Share Alert
    shareAlertEnabled: shareParam,
    shareSoundEnabled: shareSoundParam,
    shareTtsEnabled: shareTtsParam,
    shareDuration: shareDurParam,
    shareStyle: shareStyleParam,

    streamFollowCount: 0,
    streamShareCount: 0,

    // Subathon Timer
    subathonTheme: subathonThemeParam,
    subathonFont: subathonFontParam,
    subathonStyle: subathonStyleParam,
    subathonTitle: subathonTitleParam,
    subathonAutoAdd: true,
    subathonAddPerFollow: 30,
    subathonAddPerShare: 15,
    subathonAddPer100Likes: 10,
    subathonAddPerCoin: 1,
    subathonMaxCapHours: subathonCapParam,
    subathonShowProgressBar: true,
    subathonSoundEnabled: true,

    // Stream Avatars
    avatarEnabled: true,
    avatarViewerCount: avatarCountParam,
    avatarStyle: avatarStyleParam,
    avatarSize: avatarSizeParam,
    avatarSpeed: avatarSpeedParam,
    avatarShowNametags: avatarNamesParam,
    avatarShowChatBubbles: avatarBubblesParam,
    avatarShowGiftsReaction: true,
    avatarShowLikesReaction: true,
    avatarFloorStyle: avatarFloorParam,
    avatarAllowCheer: true,
  });

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [leaderboard, setLeaderboard] = useState<LikeUser[]>([]);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [recentHearts, setRecentHearts] = useState<FloatingHeartItem[]>([]);
  const [currentGiftAlert, setCurrentGiftAlert] = useState<GiftAlert | null>(null);
  const [currentFollowAlert, setCurrentFollowAlert] = useState<FollowAlert | null>(null);
  const [currentShareAlert, setCurrentShareAlert] = useState<ShareAlert | null>(null);
  const [, setIndoFinityStatus] = useState<IndoFinityConnectionStatus>('connecting');

  // Subathon Live State
  const [subathonSeconds, setSubathonSeconds] = useState<number>(subathonSecParam);
  const [subathonIsRunning, setSubathonIsRunning] = useState<boolean>(true);
  const [subathonEvents, setSubathonEvents] = useState<SubathonTimeAddedEvent[]>([]);

  const giftTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const followTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shareTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indoFinityClientRef = useRef<IndoFinityClient | null>(null);

  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const syncNoticeTimer = useRef<NodeJS.Timeout | null>(null);

  const showLiveSyncNotice = (text: string) => {
    setSyncNotice(text);
    if (syncNoticeTimer.current) clearTimeout(syncNoticeTimer.current);
    syncNoticeTimer.current = setTimeout(() => {
      setSyncNotice(null);
    }, 2200);
  };

  // Sound & TTS settings
  useEffect(() => {
    sounds.enabled = true;
    sounds.volume = 0.5;
    ttsService.updateOptions({
      enabled: settings.chatTtsEnabled,
      format: settings.chatTtsFormat,
      rate: settings.chatTtsSpeed,
      pitch: settings.chatTtsPitch,
      volume: settings.chatTtsVolume,
      voiceURI: settings.chatTtsVoice,
      cleanSpam: settings.chatTtsSkipSpam,
      sweetEnding: settings.chatTtsSweetEnding,
    });
  }, [
    settings.chatTtsEnabled,
    settings.chatTtsFormat,
    settings.chatTtsSpeed,
    settings.chatTtsPitch,
    settings.chatTtsVolume,
    settings.chatTtsVoice,
    settings.chatTtsSkipSpam,
    settings.chatTtsSweetEnding,
  ]);

  // Action: Add likes
  const handleAddLikes = (count: number, user?: LikeUser, total?: number) => {
    sounds.playLike();
    setTotalLikes((prev) => (total !== undefined ? total : prev + count));

    // Spawn 3-5 floating hearts
    const heartColors = ['#f43f5e', '#ec4899', '#f59e0b', '#a855f7', '#38bdf8'];
    const newHearts: FloatingHeartItem[] = Array.from({ length: Math.min(count, 5) }).map(() => ({
      id: Math.random().toString(36).substring(2, 9),
      x: 10 + Math.random() * 80,
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
      scale: 0.8 + Math.random() * 0.6,
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
          updated.push({
            id: 'first-liker',
            name: 'ผู้ชมในไลฟ์ 💖',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
            likeCount: count,
            rank: 1,
            badge: '👑 MVP Liker',
          });
        }
        return updated;
      }
    });
  };

  // Action: Handle new Follower
  const handleFollowAlert = (alert: FollowAlert) => {
    const curSettings = settingsRef.current;
    if (curSettings.followSoundEnabled) {
      sounds.playFollow();
    }
    setCurrentFollowAlert(alert);
    setSettings((prev) => ({ ...prev, streamFollowCount: prev.streamFollowCount + 1 }));

    if (curSettings.followTtsEnabled && curSettings.chatTtsEnabled) {
      ttsService.speakFollow(alert.username);
    }

    if (followTimeoutRef.current) clearTimeout(followTimeoutRef.current);
    followTimeoutRef.current = setTimeout(() => {
      setCurrentFollowAlert(null);
    }, (curSettings.followDuration || 4) * 1000);
  };

  // Action: Handle Stream Share
  const handleShareAlert = (alert: ShareAlert) => {
    const curSettings = settingsRef.current;
    if (curSettings.shareSoundEnabled) {
      sounds.playShare();
    }
    setCurrentShareAlert(alert);
    setSettings((prev) => ({ ...prev, streamShareCount: prev.streamShareCount + (alert.shareCount || 1) }));

    if (curSettings.shareTtsEnabled && curSettings.chatTtsEnabled) {
      ttsService.speakShare(alert.username);
    }

    if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    shareTimeoutRef.current = setTimeout(() => {
      setCurrentShareAlert(null);
    }, (curSettings.shareDuration || 4) * 1000);
  };

  // Action: Add Subathon Time
  const handleAddSubathonTime = (secsToAdd: number, reason?: string, senderName?: string) => {
    if (secsToAdd === 0) return;
    setSubathonSeconds((prev) => {
      const maxCap = settings.subathonMaxCapHours > 0 ? settings.subathonMaxCapHours * 3600 : Infinity;
      const target = prev + secsToAdd;
      return Math.max(0, Math.min(maxCap, target));
    });

    if (settings.subathonSoundEnabled) {
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

  // Subathon Countdown Timer Interval
  useEffect(() => {
    if (!subathonIsRunning) return;
    const interval = setInterval(() => {
      setSubathonSeconds((prev) => {
        if (prev <= 1) {
          if (prev === 1) sounds.playTimerEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [subathonIsRunning]);

  // Keep ref to latest settings so real-time event handlers always use fresh values
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Connect to Real-Time Live Sync Engine (Web Dashboard <-> OBS Studio Mirror)
  useEffect(() => {
    const unsubscribe = realtimeSync.subscribe({
      clientType: 'obs',
      onInit: (state) => {
        if (state.settings && Object.keys(state.settings).length > 0) {
          setSettings((prev) => {
            const merged = { ...prev, ...state.settings };
            try {
              localStorage.setItem('stream_overlay_settings', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
        if (typeof state.subathonSeconds === 'number') {
          setSubathonSeconds(state.subathonSeconds);
        }
        if (typeof state.subathonIsRunning === 'boolean') {
          setSubathonIsRunning(state.subathonIsRunning);
        }
        if (typeof state.totalLikes === 'number') {
          setTotalLikes(state.totalLikes);
        }
      },
      onSettingsUpdate: (newSettings) => {
        setSettings((prev) => {
          const merged = { ...prev, ...newSettings };
          try {
            localStorage.setItem('stream_overlay_settings', JSON.stringify(merged));
          } catch (e) {}
          return merged;
        });
        showLiveSyncNotice('⚡ ซิงค์การตั้งค่าสดเรียบร้อย');
      },
      onStreamEvent: (event) => {
        const curSettings = settingsRef.current;
        switch (event.type) {
          case 'chat_message': {
            const msg = event.payload;
            sounds.playChat();
            setMessages((prev) => [...prev.slice(-25), msg]);
            if (curSettings.chatTtsEnabled) {
              ttsService.speakChat(msg.username, msg.message);
            }
            break;
          }
          case 'gift_alert': {
            const alert = event.payload;
            if (alert.comboCount > 1) {
              sounds.playCombo(alert.comboCount);
            } else {
              sounds.playGift(alert.gift?.rarity);
            }
            setCurrentGiftAlert(alert);
            if (giftTimeoutRef.current) clearTimeout(giftTimeoutRef.current);
            giftTimeoutRef.current = setTimeout(() => {
              setCurrentGiftAlert(null);
            }, (curSettings.giftDuration || 4) * 1000);

            if (curSettings.subathonAutoAdd && curSettings.subathonAddPerCoin > 0) {
              const coinTotal = (alert.gift?.coinValue || 1) * (alert.amount || 1);
              const addedSecs = Math.max(1, Math.round(coinTotal * curSettings.subathonAddPerCoin));
              handleAddSubathonTime(addedSecs, alert.gift?.nameTh || alert.gift?.name, alert.senderName);
            }
            break;
          }
          case 'follow_alert':
            handleFollowAlert(event.payload);
            break;
          case 'share_alert':
            handleShareAlert(event.payload);
            break;
          case 'likes':
            handleAddLikes(event.payload.count || 1, event.payload.user, event.payload.total);
            break;
          case 'subathon_add_time':
            handleAddSubathonTime(event.payload.seconds, event.payload.reason, event.payload.senderName);
            break;
          case 'subathon_state':
            if (typeof event.payload.seconds === 'number') setSubathonSeconds(event.payload.seconds);
            if (typeof event.payload.isRunning === 'boolean') setSubathonIsRunning(event.payload.isRunning);
            break;
          case 'clear_chat':
            setMessages([]);
            break;
          case 'reset_state':
            setMessages([]);
            setLeaderboard([]);
            setTotalLikes(0);
            break;
        }
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Connect to IndoFinity WebSocket
  useEffect(() => {
    const client = new IndoFinityClient(wsUrlParam, true);
    indoFinityClientRef.current = client;

    client.setCallbacks({
      onStatusChange: (s) => setIndoFinityStatus(s),
      onChat: (msg) => {
        const curSettings = settingsRef.current;
        sounds.playChat();
        setMessages((prev) => [...prev.slice(-20), msg]);
        if (curSettings.chatTtsEnabled) {
          ttsService.speakChat(msg.username, msg.message);
        }
      },
      onLike: (data) => {
        const curSettings = settingsRef.current;
        handleAddLikes(data.count, data.user, data.totalLikes);
        if (curSettings.subathonAutoAdd && curSettings.subathonAddPer100Likes > 0 && data.count >= 10) {
          const added = Math.max(1, Math.round((data.count / 100) * curSettings.subathonAddPer100Likes));
          handleAddSubathonTime(added, `เคาะจอ ${data.count} ไลก์`);
        }
      },
      onGift: (alert) => {
        const curSettings = settingsRef.current;
        if (alert.comboCount > 1) {
          sounds.playCombo(alert.comboCount);
        } else {
          sounds.playGift(alert.gift.rarity);
        }
        setCurrentGiftAlert(alert);
        if (giftTimeoutRef.current) clearTimeout(giftTimeoutRef.current);
        giftTimeoutRef.current = setTimeout(() => {
          setCurrentGiftAlert(null);
        }, (curSettings.giftDuration || 4) * 1000);

        if (curSettings.subathonAutoAdd && curSettings.subathonAddPerCoin > 0) {
          const coinTotal = (alert.gift.coinValue || 1) * (alert.amount || 1);
          const addedSecs = Math.max(1, Math.round(coinTotal * curSettings.subathonAddPerCoin));
          handleAddSubathonTime(addedSecs, alert.gift.nameTh || alert.gift.name, alert.senderName);
        }
      },
      onFollow: (alert) => {
        const curSettings = settingsRef.current;
        handleFollowAlert(alert);
        if (curSettings.subathonAutoAdd && curSettings.subathonAddPerFollow > 0) {
          handleAddSubathonTime(curSettings.subathonAddPerFollow, 'คนติดตามใหม่', alert.username);
        }
      },
      onShare: (alert) => {
        const curSettings = settingsRef.current;
        handleShareAlert(alert);
        if (curSettings.subathonAutoAdd && curSettings.subathonAddPerShare > 0) {
          handleAddSubathonTime(curSettings.subathonAddPerShare, 'คนแชร์ไลฟ์', alert.username);
        }
      },
    });

    client.connect();

    return () => {
      client.disconnect();
    };
  }, [wsUrlParam]);

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-transparent select-none">
      {/* Render Selected Overlay */}
      {overlayType === 'chat' && (
        <div className="w-full h-full">
          <ChatOverlayWidget messages={messages} settings={settings} isOBSMode={true} />
        </div>
      )}

      {overlayType === 'leaderboard' && (
        <div className="w-full h-full max-w-sm mx-auto">
          <LikeLeaderboardWidget
            users={leaderboard}
            totalLikes={totalLikes}
            recentHearts={recentHearts}
            settings={settings}
            isOBSMode={true}
          />
        </div>
      )}

      {overlayType === 'gift' && (
        <div className="w-full h-full flex items-center justify-center">
          <GiftOverlayWidget
            currentAlert={currentGiftAlert}
            settings={settings}
            isOBSMode={true}
          />
        </div>
      )}

      {overlayType === 'follow' && (
        <div className="w-full h-full flex items-center justify-center">
          <FollowShareOverlayWidget
            currentFollow={currentFollowAlert}
            settings={settings}
            isOBSMode={true}
            mode="follow-only"
          />
        </div>
      )}

      {overlayType === 'share' && (
        <div className="w-full h-full flex items-center justify-center">
          <FollowShareOverlayWidget
            currentShare={currentShareAlert}
            settings={settings}
            isOBSMode={true}
            mode="share-only"
          />
        </div>
      )}

      {overlayType === 'alerts' && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <GiftOverlayWidget
            currentAlert={currentGiftAlert}
            settings={settings}
            isOBSMode={true}
          />
          <FollowShareOverlayWidget
            currentFollow={currentFollowAlert}
            currentShare={currentShareAlert}
            settings={settings}
            isOBSMode={true}
            mode="both"
          />
        </div>
      )}

      {overlayType === 'subathon' && (
        <div className="w-full h-full flex items-center justify-center p-4">
          <SubathonTimerWidget
            seconds={subathonSeconds}
            initialSeconds={settings.subathonStartSeconds ?? subathonSecParam ?? 7200}
            maxCapSeconds={(settings.subathonMaxCapHours ?? 12) * 3600}
            isRunning={subathonIsRunning}
            theme={settings.subathonTheme}
            font={settings.subathonFont}
            style={settings.subathonStyle}
            title={settings.subathonTitle}
            addedEvents={subathonEvents}
            showProgressBar={settings.subathonShowProgressBar}
            standalone={true}
          />
        </div>
      )}

      {overlayType === 'avatars' && (
        <div className="w-full h-full flex flex-col justify-end">
          <StreamAvatarsOverlay
            settings={settings}
            viewerCount={settings.avatarViewerCount}
            lastMessage={messages.length > 0 ? messages[messages.length - 1] : null}
            lastGift={currentGiftAlert}
            lastFollow={currentFollowAlert}
            lastShare={currentShareAlert}
            totalLikes={totalLikes}
            isOBSMode={true}
          />
        </div>
      )}

      {overlayType === 'all' && (
        <div className="w-full h-full relative p-4 flex flex-col justify-between">
          {/* Top Row: Like Leaderboard on left & Gift / Follow / Share Alerts centered */}
          <div className="flex items-start justify-between w-full">
            <div className="w-80">
              <LikeLeaderboardWidget
                users={leaderboard}
                totalLikes={totalLikes}
                recentHearts={recentHearts}
                settings={settings}
                isOBSMode={true}
              />
            </div>

            <div className="flex-1 flex flex-col items-center justify-start pt-4 gap-2">
              <GiftOverlayWidget
                currentAlert={currentGiftAlert}
                settings={settings}
                isOBSMode={true}
              />
              <FollowShareOverlayWidget
                currentFollow={currentFollowAlert}
                currentShare={currentShareAlert}
                settings={settings}
                isOBSMode={true}
                mode="both"
              />
            </div>
          </div>

          {/* Bottom Row: Chat Overlay on Left + Stream Avatars walking across bottom */}
          <div className="w-full flex items-end justify-between relative">
            <div className="w-96 h-80 z-20">
              <ChatOverlayWidget messages={messages} settings={settings} isOBSMode={true} />
            </div>
            {settings.avatarEnabled && (
              <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10">
                <StreamAvatarsOverlay
                  settings={settings}
                  viewerCount={settings.avatarViewerCount}
                  lastMessage={messages.length > 0 ? messages[messages.length - 1] : null}
                  lastGift={currentGiftAlert}
                  lastFollow={currentFollowAlert}
                  lastShare={currentShareAlert}
                  totalLikes={totalLikes}
                  isOBSMode={true}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time live sync toast feedback for OBS streamer confirmation */}
      <AnimatePresence>
        {syncNotice && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed top-3 right-3 z-50 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.4)] text-cyan-300 text-xs font-semibold backdrop-blur-md"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{syncNotice}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
