import React, { useEffect, useState, useRef } from 'react';
import { ChatOverlayWidget } from './ChatOverlayWidget';
import { LikeLeaderboardWidget } from './LikeLeaderboardWidget';
import { GiftOverlayWidget } from './GiftOverlayWidget';
import { FollowShareOverlayWidget } from './FollowShareOverlayWidget';
import {
  ChatMessage,
  GiftAlert,
  FollowAlert,
  ShareAlert,
  LikeUser,
  OverlayCustomSettings,
  FloatingHeartItem,
  ChatThemeId,
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
  overlayType: 'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'alerts' | 'all';
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
  const ttsFormatParam = (urlParams.get('ttsformat') as any) || 'sweet';
  const ttsSpeedParam = Number(urlParams.get('ttsspeed') || 1.05);
  const ttsPitchParam = Number(urlParams.get('ttspitch') || 1.22);
  const ttsVolParam = Number(urlParams.get('ttsvol') || 90);
  const ttsVoiceParam = urlParams.get('ttsvoice') || 'default';
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
    currentLikes: 14280,
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
  });

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [leaderboard, setLeaderboard] = useState<LikeUser[]>(INITIAL_LIKE_LEADERBOARD);
  const [totalLikes, setTotalLikes] = useState<number>(14280);
  const [recentHearts, setRecentHearts] = useState<FloatingHeartItem[]>([]);
  const [currentGiftAlert, setCurrentGiftAlert] = useState<GiftAlert | null>(null);
  const [currentFollowAlert, setCurrentFollowAlert] = useState<FollowAlert | null>(null);
  const [currentShareAlert, setCurrentShareAlert] = useState<ShareAlert | null>(null);
  const [, setIndoFinityStatus] = useState<IndoFinityConnectionStatus>('connecting');

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
        updated[0] = { ...updated[0], likeCount: updated[0].likeCount + count };
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
      },
      onFollow: (alert) => {
        handleFollowAlert(alert);
      },
      onShare: (alert) => {
        handleShareAlert(alert);
      },
    });

    client.connect();

    return () => {
      client.disconnect();
    };
  }, [wsUrlParam, settings.giftDuration, settings.followDuration, settings.shareDuration]);

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
