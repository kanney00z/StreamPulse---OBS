import React from 'react';
import { motion } from 'motion/react';
import { Heart, ShieldCheck, Star, Crown, UserPlus, Sparkles } from 'lucide-react';
import { ChatMessage, OverlayCustomSettings } from '../types';
import { TwitchIcon, YouTubeIcon, KickIcon, TikTokIcon, ShibaSticker, AnimeCheerSticker } from './MultistreamIcons';

interface MultistreamChatCardProps {
  msg: ChatMessage;
  settings: OverlayCustomSettings;
  compact?: boolean;
  forcedPlatform?: 'twitch' | 'kick' | 'tiktok' | 'youtube';
}

export const MultistreamChatCard: React.FC<MultistreamChatCardProps> = ({
  msg,
  settings,
  compact = false,
  forcedPlatform,
}) => {
  const isHorizontal = settings.chatLayout === 'horizontal';

  // Format timestamp e.g. 07:40
  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Determine platform and visual styling matching the video
  const resolvePlatformDetails = () => {
    // Check explicit platform or infer from username / role / message
    const rawPlat = forcedPlatform || msg.platform;
    const lowerUser = msg.username.toLowerCase();
    const lowerMsg = msg.message.toLowerCase();

    // 1. Kick
    if (rawPlat === 'kick' || lowerUser.includes('kick') || lowerMsg.includes('kick message')) {
      return {
        platform: 'kick',
        platformIcon: <KickIcon className="w-3.5 h-3.5 text-black font-black" />,
        pillBg: 'bg-[#22c55e] text-slate-950 font-black',
        ringClass: 'ring-[#22c55e] shadow-[0_0_14px_rgba(34,197,94,0.6)]',
        bubbleBorder: 'border-emerald-500/40 shadow-[0_0_20px_rgba(34,197,94,0.25)]',
        avatarFallbackBg: 'bg-emerald-900/80 text-emerald-200 border-emerald-400/50',
      };
    }

    // 2. TikTok
    if (
      rawPlat === 'tiktok' ||
      lowerUser === 'olive' ||
      lowerUser === 'di' ||
      lowerMsg.includes('tiktok message') ||
      msg.eventType === 'follow' && lowerUser === 'di'
    ) {
      return {
        platform: 'tiktok',
        platformIcon: <TikTokIcon className="w-3 h-3 text-white" />,
        pillBg: 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold',
        ringClass: 'ring-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.6)]',
        bubbleBorder: 'border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.22)]',
        avatarFallbackBg: 'bg-cyan-900/80 text-cyan-200 border-cyan-400/50',
      };
    }

    // 3. YouTube
    if (
      rawPlat === 'youtube' ||
      lowerUser === 'emely' ||
      lowerMsg.includes('youtube') ||
      lowerUser.includes('spacelabs')
    ) {
      const isSpacelabs = lowerUser.includes('spacelabs');
      return {
        platform: 'youtube',
        platformIcon: isSpacelabs ? (
          <Sparkles className="w-3 h-3 text-white" />
        ) : (
          <YouTubeIcon className="w-3.5 h-3.5 text-white" />
        ),
        pillBg: isSpacelabs
          ? 'bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white font-bold'
          : 'bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-600 text-white font-bold',
        ringClass: isSpacelabs
          ? 'ring-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.6)]'
          : 'ring-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.6)]',
        bubbleBorder: isSpacelabs
          ? 'border-sky-500/40 shadow-[0_0_20px_rgba(56,189,248,0.22)]'
          : 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.22)]',
        avatarFallbackBg: 'bg-rose-900/80 text-rose-200 border-rose-400/50',
      };
    }

    // 4. Follower event
    if (lowerUser.includes('follower') || msg.eventType === 'follow') {
      return {
        platform: 'multistream',
        platformIcon: <UserPlus className="w-3 h-3 text-white" />,
        pillBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold',
        ringClass: 'ring-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.6)]',
        bubbleBorder: 'border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.22)]',
        avatarFallbackBg: 'bg-blue-900/80 text-blue-200 border-blue-400/50',
      };
    }

    // 5. VIP Velvet
    if (lowerUser.includes('velvet') || msg.roleType === 'vip' || msg.badges?.includes('vip')) {
      return {
        platform: 'twitch',
        platformIcon: <Crown className="w-3 h-3 text-amber-300 fill-amber-300" />,
        pillBg: 'bg-gradient-to-r from-purple-700 via-fuchsia-700 to-purple-800 text-white font-bold',
        ringClass: 'ring-purple-400 shadow-[0_0_14px_rgba(192,132,252,0.6)]',
        bubbleBorder: 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.25)]',
        avatarFallbackBg: 'bg-purple-900/80 text-purple-200 border-purple-400/50',
      };
    }

    // 6. Tipped / Donation (nelly)
    if (lowerUser === 'nelly' || msg.eventType === 'tip' || msg.tipAmount) {
      return {
        platform: 'multistream',
        platformIcon: <Heart className="w-3 h-3 text-pink-200 fill-current" />,
        pillBg: 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white font-black animate-pulse',
        ringClass: 'ring-pink-400 shadow-[0_0_16px_rgba(244,114,182,0.8)]',
        bubbleBorder: 'border-pink-500/50 shadow-[0_0_24px_rgba(244,114,182,0.35)]',
        avatarFallbackBg: 'bg-pink-900/80 text-pink-200 border-pink-400/50',
      };
    }

    // 7. Modwatch (Moderator)
    if (lowerUser.includes('mod') || msg.roleType === 'mod' || msg.badges?.includes('mod')) {
      return {
        platform: 'twitch',
        platformIcon: <ShieldCheck className="w-3 h-3 text-white fill-white/20" />,
        pillBg: 'bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white font-bold',
        ringClass: 'ring-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.6)]',
        bubbleBorder: 'border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.22)]',
        avatarFallbackBg: 'bg-emerald-950/80 text-emerald-200 border-emerald-400/50',
      };
    }

    // 8. Default Twitch (Shapiadsr - Pink / Magenta)
    return {
      platform: 'twitch',
      platformIcon: <TwitchIcon className="w-3.5 h-3.5 text-white" />,
      pillBg: 'bg-gradient-to-r from-fuchsia-600 via-pink-600 to-purple-600 text-white font-bold',
      ringClass: 'ring-pink-400 shadow-[0_0_14px_rgba(244,114,182,0.6)]',
      bubbleBorder: 'border-pink-500/40 shadow-[0_0_20px_rgba(236,72,153,0.22)]',
      avatarFallbackBg: 'bg-fuchsia-950/80 text-pink-200 border-pink-400/50',
    };
  };

  const style = resolvePlatformDetails();

  // Check if message has custom animated emotes (like SpacelabsGaming in video)
  const isSpacelabs = msg.username.toLowerCase().includes('spacelabs');
  const hasEmotes = msg.emotes && msg.emotes.length > 0 || isSpacelabs;

  // Check if message is a tip or follow event
  const isTip = msg.eventType === 'tip' || msg.username.toLowerCase() === 'nelly' || !!msg.tipAmount;
  const isFollow = msg.eventType === 'follow' || msg.username.toLowerCase() === 'di' || msg.username.toLowerCase().includes('follower');

  const showAvatar = settings.chatShowAvatars && !compact;

  const fontSizeClass = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }[settings.chatFontSize];

  return (
    <motion.div
      layout
      initial={
        isHorizontal
          ? { opacity: 0, x: 40, scale: 0.94 }
          : { opacity: 0, y: 22, scale: 0.96 }
      }
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
      className={`relative select-none ${
        isHorizontal
          ? 'shrink-0 w-auto min-w-[260px] max-w-[420px]'
          : 'w-full max-w-xl'
      }`}
    >
      <div className="flex items-start gap-2.5 sm:gap-3">
        {/* 1. Large Circular Avatar with Glowing Neon Ring (Right side of reference video) */}
        {showAvatar && (
          <div className="relative shrink-0 mt-0.5">
            {msg.avatarUrl ? (
              <img
                src={msg.avatarUrl}
                alt={msg.username}
                referrerPolicy="no-referrer"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-offset-2 ring-offset-[#0b0c16] ${style.ringClass} transition-transform duration-300 hover:scale-105`}
              />
            ) : (
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-offset-2 ring-offset-[#0b0c16] ${style.ringClass} ${style.avatarFallbackBg} flex items-center justify-center font-black text-xs sm:text-sm uppercase shadow-md`}
              >
                {msg.username.charAt(0)}
              </div>
            )}
          </div>
        )}

        {/* 2. Message Column */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Top Line: Username Header Pill + Timestamp Pill */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Header Pill */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs shadow-md tracking-tight ${style.pillBg}`}
            >
              <span className="shrink-0">{style.platformIcon}</span>
              <span className="truncate max-w-[140px] sm:max-w-[180px]">
                {msg.username}
              </span>
            </div>

            {/* Timestamp Capsule */}
            {settings.chatShowTimestamps !== false && (
              <div className="px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-white/70 shadow-sm">
                {formatTimestamp(msg.timestamp)}
              </div>
            )}
          </div>

          {/* Bottom Line: Speech Capsule / Message Bubble */}
          <div
            className={`px-4 py-2 rounded-2xl sm:rounded-3xl bg-[#121322]/85 backdrop-blur-xl border ${style.bubbleBorder} text-white font-medium transition-all inline-block max-w-full`}
          >
            {/* Case A: Emotes / Stickers (like SpacelabsGaming in video 00:03 - 00:08) */}
            {hasEmotes ? (
              <div className="flex items-center gap-2.5 py-1">
                <ShibaSticker className="w-10 h-10 sm:w-11 sm:h-11" />
                <AnimeCheerSticker className="w-10 h-10 sm:w-11 sm:h-11" />
                {msg.message && !isSpacelabs && (
                  <span className={`${fontSizeClass} text-neutral-100 ml-1`}>
                    {msg.message}
                  </span>
                )}
              </div>
            ) : isTip ? (
              /* Case B: Tip / Donation Alert (like nelly $16 in video 00:14) */
              <div className="flex items-center gap-2 py-0.5">
                <span className="text-pink-300 font-black text-sm flex items-center gap-1">
                  💖 Now Tipped {msg.tipAmount || '$16!'}
                </span>
              </div>
            ) : isFollow && msg.username.toLowerCase() === 'di' ? (
              /* Case C: Follow Alert (like di in video 00:06) */
              <div className="flex items-center gap-1.5 py-0.5">
                <span className="text-cyan-300 font-bold text-xs sm:text-sm flex items-center gap-1">
                  ✨ Just followed!
                </span>
              </div>
            ) : (
              /* Case D: Standard Multistream Text Message */
              <p
                className={`${fontSizeClass} text-neutral-100 leading-relaxed break-words whitespace-pre-wrap`}
              >
                {msg.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
