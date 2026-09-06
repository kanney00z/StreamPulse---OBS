import React, { useEffect, useState, useRef } from 'react';
import { ChatOverlayWidget } from './ChatOverlayWidget';
import { LikeLeaderboardWidget } from './LikeLeaderboardWidget';
import { GiftOverlayWidget } from './GiftOverlayWidget';
import { FollowShareOverlayWidget } from './FollowShareOverlayWidget';
import { SubathonTimerWidget } from './SubathonTimerWidget';
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

interface OverlayViewProps {
  overlayType: 'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'alerts' | 'subathon' | 'all';
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

  // Parse URL search params
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const themeParam = (urlParams.get('theme') as ChatThemeId) || 'cyberpunk-neon';
  const autoHideParam = Number(urlParams.get('autohide') || 10);
  const fontSizeParam = (urlParams.get('fontsize') as 'sm' | 'base' | 'lg' | 'xl') || 'base';
  const styleParam = (urlParams.get('style') as 'podium-card' | 'compact-ticker' | 'glass-list' | 'neon-glow') || 'podium-card';
  const goalParam = Number(urlParams.get('goal') || 25000);
  const showGoalParam = urlParams.get('showgoal') !== '0';
  const durationParam = Number(urlParams.get('duration') || 5);
  const wsUrlParam = urlParams.get('ws') || 'ws://localhost:62024';

  // TTS URL Params
  const ttsParam = urlParams.get('tts') === '1';
  const ttsFormatParam = (urlParams.get('ttsformat') as any) || 'nameAndMessage';
  const ttsSpeedParam = Number(urlParams.get('ttsspeed') || 0.86);
  const ttsPitchParam = Number(urlParams.get('ttspitch') || 1.05);
  const ttsVolParam = Number(urlParams.get('ttsvol') || 90);
  const ttsVoiceParam = urlParams.get('ttsvoice') || 'ai_female_google';
  const ttsSweetParam = urlParams.get('ttssweet') !== '0';

  // Follow & Share URL Params
  const followParam = urlParams.get('follow') !== '0';
  const shareParam = urlParams.get('share') !== '0';
  const followTtsParam = urlParams.get('followtts') !== '0';
  const shareTtsParam = urlParams.get('sharetts') !== '0';
  const followDurParam = Number(urlParams.get('followdur') || 4);
  const shareDurParam = Number(urlParams.get('sharedur') || 4);
  const followStyleParam = (urlParams.get('followstyle') as any) || 'neon-banner';
  const shareStyleParam = (urlParams.get('sharestyle') as any) || 'neon-banner';

  // Subathon URL Params
  const subathonThemeParam = (urlParams.get('subathontheme') || urlParams.get('theme') || 'cyberpunk-neon') as SubathonThemeId;
  const subathonStyleParam = (urlParams.get('subathonstyle') as 'card' | 'frameless') || 'frameless';
  const subathonTitleParam = urlParams.get('subathontitle') || 'SUBATHON MARATHON';
  const subathonSecParam = Number(urlParams.get('subathonsec') || 7200);
  const subathonCapParam = Number(urlParams.get('subathoncap') || 12);

  const [settings, setSettings] = useState<OverlayCustomSettings>({
    chatTheme: themeParam,
    chatFontSize: fontSizeParam,
    chatAutoHideSeconds: autoHideParam,
    chatShowAvatars: true,
    chatShowBadges: true,
    chatDirection: 'down',
    chatSoundEnabled: true,
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
    likeShowTopCount: 5,
    likeSoundEnabled: true,

    giftSoundEnabled: true,
    giftSoundVolume: 60,
    giftDuration: durationParam,
    giftShowParticles: true,
    giftMinCoinFilter: 1,
    giftStyle: 'banner-epic',

    // Follow Alert
    followAlertEnabled: followParam,
    followSoundEnabled: true,
    followTtsEnabled: followTtsParam,
    followDuration: followDurParam,
    followStyle: followStyleParam,

    // Share Alert
    shareAlertEnabled: shareParam,
    shareSoundEnabled: true,
    shareTtsEnabled: shareTtsParam,
    shareDuration: shareDurParam,
    shareStyle: shareStyleParam,

    streamFollowCount: 0,
    streamShareCount: 0,

    // Subathon Timer
    subathonTheme: subathonThemeParam,
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
    if (settings.followSoundEnabled) {
      sounds.playFollow();
    }
    setCurrentFollowAlert(alert);
    setSettings((prev) => ({ ...prev, streamFollowCount: prev.streamFollowCount + 1 }));

    if (settings.followTtsEnabled && settings.chatTtsEnabled) {
      ttsService.speakFollow(alert.username);
    }

    if (followTimeoutRef.current) clearTimeout(followTimeoutRef.current);
    followTimeoutRef.current = setTimeout(() => {
      setCurrentFollowAlert(null);
    }, settings.followDuration * 1000);
  };

  // Action: Handle Stream Share
  const handleShareAlert = (alert: ShareAlert) => {
    if (settings.shareSoundEnabled) {
      sounds.playShare();
    }
    setCurrentShareAlert(alert);
    setSettings((prev) => ({ ...prev, streamShareCount: prev.streamShareCount + (alert.shareCount || 1) }));

    if (settings.shareTtsEnabled && settings.chatTtsEnabled) {
      ttsService.speakShare(alert.username);
    }

    if (shareTimeoutRef.current) clearTimeout(shareTimeoutRef.current);
    shareTimeoutRef.current = setTimeout(() => {
      setCurrentShareAlert(null);
    }, settings.shareDuration * 1000);
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

  // Connect to IndoFinity WebSocket
  useEffect(() => {
    const client = new IndoFinityClient(wsUrlParam, true);
    indoFinityClientRef.current = client;

    client.setCallbacks({
      onStatusChange: (s) => setIndoFinityStatus(s),
      onChat: (msg) => {
        sounds.playChat();
        setMessages((prev) => [...prev.slice(-20), msg]);
        if (settings.chatTtsEnabled) {
          ttsService.speakChat(msg.username, msg.message);
        }
      },
      onLike: (data) => {
        handleAddLikes(data.count, data.user, data.totalLikes);
        if (settings.subathonAutoAdd && settings.subathonAddPer100Likes > 0 && data.count >= 10) {
          const added = Math.max(1, Math.round((data.count / 100) * settings.subathonAddPer100Likes));
          handleAddSubathonTime(added, `เคาะจอ ${data.count} ไลก์`);
        }
      },
      onGift: (alert) => {
        if (alert.comboCount > 1) {
          sounds.playCombo(alert.comboCount);
        } else {
          sounds.playGift(alert.gift.rarity);
        }
        setCurrentGiftAlert(alert);
        if (giftTimeoutRef.current) clearTimeout(giftTimeoutRef.current);
        giftTimeoutRef.current = setTimeout(() => {
          setCurrentGiftAlert(null);
        }, settings.giftDuration * 1000);

        if (settings.subathonAutoAdd && settings.subathonAddPerCoin > 0) {
          const coinTotal = (alert.gift.coinValue || 1) * (alert.amount || 1);
          const addedSecs = Math.max(1, Math.round(coinTotal * settings.subathonAddPerCoin));
          handleAddSubathonTime(addedSecs, alert.gift.nameTh || alert.gift.name, alert.senderName);
        }
      },
      onFollow: (alert) => {
        handleFollowAlert(alert);
        if (settings.subathonAutoAdd && settings.subathonAddPerFollow > 0) {
          handleAddSubathonTime(settings.subathonAddPerFollow, 'คนติดตามใหม่', alert.username);
        }
      },
      onShare: (alert) => {
        handleShareAlert(alert);
        if (settings.subathonAutoAdd && settings.subathonAddPerShare > 0) {
          handleAddSubathonTime(settings.subathonAddPerShare, 'คนแชร์ไลฟ์', alert.username);
        }
      },
    });

    client.connect();

    return () => {
      client.disconnect();
    };
  }, [
    wsUrlParam,
    settings.giftDuration,
    settings.followDuration,
    settings.shareDuration,
    settings.subathonAutoAdd,
    settings.subathonAddPerFollow,
    settings.subathonAddPerShare,
    settings.subathonAddPer100Likes,
    settings.subathonAddPerCoin,
  ]);

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
            initialSeconds={subathonSecParam}
            maxCapSeconds={settings.subathonMaxCapHours * 3600}
            isRunning={subathonIsRunning}
            theme={settings.subathonTheme}
            style={settings.subathonStyle}
            title={settings.subathonTitle}
            addedEvents={subathonEvents}
            showProgressBar={settings.subathonShowProgressBar}
            standalone={true}
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

          {/* Bottom Left: Chat Overlay */}
          <div className="w-96 h-96">
            <ChatOverlayWidget messages={messages} settings={settings} isOBSMode={true} />
          </div>
        </div>
      )}
    </div>
  );
};
