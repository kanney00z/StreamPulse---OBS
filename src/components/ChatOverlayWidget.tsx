import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ShieldCheck,
  Star,
  Heart,
  Award,
  CheckCircle2,
  Sparkles,
  Crown,
  Gem,
  Droplets,
  UserPlus,
  Flower2,
} from 'lucide-react';
import { ChatMessage, ChatThemeConfig, OverlayCustomSettings } from '../types';
import { CHAT_THEMES } from '../data/mockData';

interface ChatOverlayWidgetProps {
  messages: ChatMessage[];
  settings: OverlayCustomSettings;
  isOBSMode?: boolean;
}

export const ChatOverlayWidget: React.FC<ChatOverlayWidgetProps> = ({
  messages,
  settings,
  isOBSMode = false,
}) => {
  const [activeTheme, setActiveTheme] = useState<ChatThemeConfig>(
    () => CHAT_THEMES.find((t) => t.id === settings.chatTheme) || CHAT_THEMES[0]
  );

  useEffect(() => {
    const found = CHAT_THEMES.find((t) => t.id === settings.chatTheme);
    if (found) setActiveTheme(found);
  }, [settings.chatTheme]);

  // Handle auto-hide messages if setting is > 0
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>(messages);

  useEffect(() => {
    if (settings.chatAutoHideSeconds <= 0) {
      setVisibleMessages(messages.slice(-settings.chatMaxMessages));
      return;
    }

    const now = Date.now();
    const expireMs = settings.chatAutoHideSeconds * 1000;
    const filtered = messages.filter((m) => now - m.timestamp < expireMs);
    setVisibleMessages(filtered.slice(-settings.chatMaxMessages));

    const timer = setInterval(() => {
      const current = Date.now();
      setVisibleMessages((prev) => prev.filter((m) => current - m.timestamp < expireMs));
    }, 1000);

    return () => clearInterval(timer);
  }, [messages, settings.chatAutoHideSeconds, settings.chatMaxMessages]);

  const fontSizeClass = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }[settings.chatFontSize];

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const getTwitchStyle = (msg: ChatMessage, variant?: string) => {
    if (variant === 'purple') {
      return {
        glowClass: 'shadow-[0_0_24px_rgba(168,85,247,0.45),0_8px_20px_rgba(0,0,0,0.65)] border-purple-500/40',
        badgeBg: 'bg-[#9333ea]',
        badgeText: msg.roleTag || 'TWITCH',
        iconColor: 'text-purple-400',
        icon: 'flower',
      };
    }
    if (variant === 'green') {
      return {
        glowClass: 'shadow-[0_0_24px_rgba(16,185,129,0.5),0_8px_20px_rgba(0,0,0,0.65)] border-emerald-500/40',
        badgeBg: 'bg-[#10b981]',
        badgeText: msg.roleTag || 'MOD',
        iconColor: 'text-emerald-400',
        icon: 'shield',
      };
    }
    if (variant === 'pink') {
      return {
        glowClass: 'shadow-[0_0_24px_rgba(236,72,153,0.5),0_8px_20px_rgba(0,0,0,0.65)] border-pink-500/40',
        badgeBg: 'bg-[#ec4899]',
        badgeText: msg.roleTag || 'VIP',
        iconColor: 'text-pink-400',
        icon: 'diamond',
      };
    }
    if (variant === 'cyan') {
      return {
        glowClass: 'shadow-[0_0_24px_rgba(6,182,212,0.5),0_8px_20px_rgba(0,0,0,0.65)] border-cyan-500/40',
        badgeBg: 'bg-[#06b6d4]',
        badgeText: msg.roleTag || 'SUB',
        iconColor: 'text-cyan-400',
        icon: 'star',
      };
    }
    if (variant === 'gold') {
      return {
        glowClass: 'shadow-[0_0_24px_rgba(245,158,11,0.5),0_8px_20px_rgba(0,0,0,0.65)] border-amber-500/40',
        badgeBg: 'bg-[#f59e0b]',
        badgeText: msg.roleTag || 'BITS',
        iconColor: 'text-amber-400',
        icon: 'crown',
      };
    }
    if (variant === 'red') {
      return {
        glowClass: 'shadow-[0_0_24px_rgba(244,63,94,0.5),0_8px_20px_rgba(0,0,0,0.65)] border-rose-500/40',
        badgeBg: 'bg-[#f43f5e]',
        badgeText: msg.roleTag || 'QUEEN',
        iconColor: 'text-rose-400',
        icon: 'crown',
      };
    }

    // Dynamic based on role (matching the reference video exactly)
    const role =
      msg.roleType ||
      (msg.roleTag?.toLowerCase() === 'queen'
        ? 'streamer'
        : msg.roleTag?.toLowerCase() === 'coder'
        ? 'coder'
        : msg.roleTag?.toLowerCase() === 'memer'
        ? 'memer'
        : msg.badges?.includes('mod')
        ? 'mod'
        : msg.badges?.includes('vip')
        ? 'vip'
        : msg.badges?.includes('sub')
        ? 'sub'
        : 'viewer');

    switch (role) {
      case 'streamer':
      case 'queen':
        return {
          glowClass:
            'shadow-[0_0_25px_rgba(244,63,94,0.48),0_8px_20px_rgba(0,0,0,0.7)] border-rose-500/40',
          badgeBg: 'bg-[#f43f5e]',
          badgeText: msg.roleTag || 'QUEEN',
          iconColor: 'text-rose-400',
          icon: 'crown',
        };
      case 'mod':
        return {
          glowClass:
            'shadow-[0_0_25px_rgba(16,185,129,0.48),0_8px_20px_rgba(0,0,0,0.7)] border-emerald-500/40',
          badgeBg: 'bg-[#10b981]',
          badgeText: msg.roleTag || 'MOD',
          iconColor: 'text-emerald-400',
          icon: 'shield',
        };
      case 'vip':
        return {
          glowClass:
            'shadow-[0_0_25px_rgba(236,72,153,0.48),0_8px_20px_rgba(0,0,0,0.7)] border-pink-500/40',
          badgeBg: 'bg-[#ec4899]',
          badgeText: msg.roleTag || 'VIP',
          iconColor: 'text-pink-400',
          icon: 'diamond',
        };
      case 'sub':
        return {
          glowClass:
            'shadow-[0_0_25px_rgba(6,182,212,0.48),0_8px_20px_rgba(0,0,0,0.7)] border-cyan-500/40',
          badgeBg: 'bg-[#06b6d4]',
          badgeText: msg.roleTag || 'SUB',
          iconColor: 'text-cyan-400',
          icon: 'star',
        };
      case 'coder':
        return {
          glowClass:
            'shadow-[0_0_25px_rgba(168,85,247,0.48),0_8px_20px_rgba(0,0,0,0.7)] border-purple-500/40',
          badgeBg: 'bg-[#9333ea]',
          badgeText: msg.roleTag || 'CODER',
          iconColor: 'text-purple-400',
          icon: 'flower',
        };
      case 'memer':
        return {
          glowClass:
            'shadow-[0_0_25px_rgba(249,115,22,0.48),0_8px_20px_rgba(0,0,0,0.7)] border-orange-500/40',
          badgeBg: 'bg-[#f97316]',
          badgeText: msg.roleTag || 'MEMER',
          iconColor: 'text-orange-400',
          icon: 'pepe',
        };
      default:
        return {
          glowClass:
            'shadow-[0_0_20px_rgba(168,85,247,0.35),0_8px_20px_rgba(0,0,0,0.7)] border-white/10',
          badgeBg: 'bg-slate-700',
          badgeText: msg.roleTag || 'VIEWER',
          iconColor: 'text-slate-300',
          icon: 'sparkle',
        };
    }
  };

  const renderRightIcon = (iconType?: string, colorClass: string = 'text-white') => {
    switch (iconType) {
      case 'crown':
        return (
          <Crown className={`w-4 h-4 ${colorClass} fill-current drop-shadow-[0_0_8px_currentColor]`} />
        );
      case 'diamond':
        return (
          <Gem className={`w-4 h-4 ${colorClass} fill-current drop-shadow-[0_0_8px_currentColor]`} />
        );
      case 'shield':
        return (
          <ShieldCheck className={`w-4 h-4 ${colorClass} drop-shadow-[0_0_8px_currentColor]`} />
        );
      case 'star':
        return (
          <Star className={`w-4 h-4 ${colorClass} fill-current drop-shadow-[0_0_8px_currentColor]`} />
        );
      case 'flower':
        return (
          <Flower2 className={`w-4 h-4 ${colorClass} drop-shadow-[0_0_8px_currentColor]`} />
        );
      case 'pepe':
        return (
          <span className="text-sm select-none filter drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]">
            👀
          </span>
        );
      default:
        return (
          <Sparkles className={`w-4 h-4 ${colorClass} drop-shadow-[0_0_8px_currentColor]`} />
        );
    }
  };

  const renderBadge = (badge: string) => {
    switch (badge) {
      case 'mod':
        return (
          <span
            key="mod"
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider"
            title="Moderator"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            MOD
          </span>
        );
      case 'vip':
        return (
          <span
            key="vip"
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider"
            title="VIP Member"
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            VIP
          </span>
        );
      case 'top_fan':
        return (
          <span
            key="top_fan"
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 uppercase tracking-wider"
            title="Top Fan"
          >
            <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
            TOP FAN
          </span>
        );
      case 'sub':
        return (
          <span
            key="sub"
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wider"
            title="Subscriber"
          >
            <Award className="w-3 h-3 text-indigo-400" />
            SUB
          </span>
        );
      case 'verified':
        return (
          <span
            key="verified"
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 uppercase tracking-wider"
            title="Verified"
          >
            <CheckCircle2 className="w-3 h-3 text-sky-400" />
          </span>
        );
      default:
        return null;
    }
  };

  const getAvatarRadius = (shape: string) => {
    switch (shape) {
      case 'circle':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-md';
      case 'squircle':
        return 'rounded-xl';
      default:
        return 'rounded-full';
    }
  };

  const isHorizontal = settings.chatLayout === 'horizontal';

  return (
    <div
      className={`w-full h-full flex select-none ${
        isHorizontal
          ? 'flex-row items-center justify-start overflow-x-auto no-scrollbar p-3'
          : 'flex-col justify-end p-4'
      } ${isOBSMode ? 'bg-transparent' : ''}`}
    >
      <div
        className={
          isHorizontal
            ? 'flex flex-row items-center gap-3 w-full min-w-max'
            : `w-full ${activeTheme.containerClass}`
        }
      >
        <AnimatePresence initial={false}>
          {visibleMessages.map((msg) => {
            const isTwitch = !!activeTheme.isTwitchGlow;
            const isComic = !!activeTheme.isComic;
            const comicCfg = activeTheme.comicConfig;

            // 1. EVENT PILL (Resub, Redeem, Cheer Bits, Follow) like in the video
            if (msg.isEvent) {
              let eventIcon = <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" />;
              let eventGlow =
                'shadow-[0_0_20px_rgba(16,185,129,0.45)] border-emerald-500/40 text-emerald-300';

              if (msg.eventType === 'redeem') {
                eventIcon = <Droplets className="w-4 h-4 text-purple-400 fill-purple-400" />;
                eventGlow =
                  'shadow-[0_0_20px_rgba(168,85,247,0.45)] border-purple-500/40 text-purple-300';
              } else if (msg.eventType === 'cheer') {
                eventIcon = <Gem className="w-4 h-4 text-pink-400 fill-pink-400" />;
                eventGlow =
                  'shadow-[0_0_20px_rgba(236,72,153,0.45)] border-pink-500/40 text-pink-300';
              } else if (msg.eventType === 'follow') {
                eventIcon = <UserPlus className="w-4 h-4 text-amber-400 fill-amber-400" />;
                eventGlow =
                  'shadow-[0_0_20px_rgba(245,158,11,0.45)] border-amber-500/40 text-amber-300';
              }

              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92, y: isHorizontal ? 0 : 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  className={`px-4 py-2.5 rounded-full border bg-[#121118]/90 backdrop-blur-xl flex items-center gap-2.5 transition-all duration-200 ${eventGlow} ${
                    isHorizontal ? 'shrink-0' : 'w-full'
                  }`}
                >
                  <div className="shrink-0 drop-shadow-[0_0_6px_currentColor]">
                    {eventIcon}
                  </div>
                  <span className="text-xs sm:text-sm font-semibold tracking-wide truncate">
                    {msg.eventText || `${msg.username} ${msg.message}`}
                  </span>
                </motion.div>
              );
            }

            // 2. TWITCH DARK ROLE GLOW (100% Matching Video)
            if (isTwitch) {
              const twitchStyle = getTwitchStyle(msg, activeTheme.twitchGlowVariant);

              return (
                <motion.div
                  key={msg.id}
                  layout
                  initial={
                    isHorizontal
                      ? { opacity: 0, x: 40, scale: 0.94 }
                      : { opacity: 0, y: 22, scale: 0.96 }
                  }
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                  transition={{ type: 'spring', stiffness: 480, damping: 28 }}
                  className={`relative backdrop-blur-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border bg-[#121118]/90 transition-all duration-200 ${
                    twitchStyle.glowClass
                  } ${
                    isHorizontal
                      ? 'shrink-0 w-[300px] sm:w-[360px]'
                      : 'w-full'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Left Avatar (picture or initial box) */}
                    {settings.chatShowAvatars && (
                      <div className="relative shrink-0 mt-0.5">
                        {msg.avatarUrl ? (
                          <img
                            src={msg.avatarUrl}
                            alt={msg.username}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-xl border border-white/20 shadow-md"
                          />
                        ) : (
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-900/70 border border-purple-500/40 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md">
                            {msg.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      {/* Top Bar: Username + Role Pill + Timestamp + Right Accent Icon */}
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span className="font-black text-xs sm:text-sm text-white tracking-tight uppercase truncate">
                            {msg.username}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-wider shadow-sm ${twitchStyle.badgeBg}`}
                          >
                            {twitchStyle.badgeText}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                          {settings.chatShowTimestamps !== false && (
                            <span className="text-[11px] font-mono text-neutral-400 tracking-tight">
                              {formatTimestamp(msg.timestamp)}
                            </span>
                          )}
                          {renderRightIcon(
                            msg.rightIcon || twitchStyle.icon,
                            twitchStyle.iconColor
                          )}
                        </div>
                      </div>

                      {/* Chat Message Text */}
                      <p className={`text-neutral-100 ${fontSizeClass} leading-relaxed font-normal break-words whitespace-pre-wrap`}>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // 3. COMIC POP & CLASSIC THEMES
            return (
              <motion.div
                key={msg.id}
                layout
                initial={
                  isComic
                    ? { opacity: 0, y: 28, scale: 0.88, rotate: -2 }
                    : activeTheme.is3D
                    ? { opacity: 0, y: 24, rotateX: -12, scale: 0.94 }
                    : { opacity: 0, y: 20, scale: 0.95 }
                }
                animate={
                  isComic
                    ? { opacity: 1, y: 0, scale: 1, rotate: 0 }
                    : { opacity: 1, y: 0, rotateX: 0, scale: 1 }
                }
                exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.22 } }}
                transition={{
                  type: 'spring',
                  stiffness: isComic ? 480 : 450,
                  damping: isComic ? 26 : 30,
                }}
                style={
                  activeTheme.is3D && !isComic
                    ? { transformPerspective: 900 }
                    : undefined
                }
                className={`relative ${
                  isComic
                    ? activeTheme.messageCardClass(msg.highlighted)
                    : `${activeTheme.messageCardClass(msg.highlighted)} ${activeTheme.accentBorder}`
                } ${isHorizontal ? 'shrink-0 w-[300px] sm:w-[360px]' : 'w-full'}`}
              >
                {/* COMIC POP SPECIFIC VISUALS: Starburst sticker, speech tail, and floating particles */}
                {isComic && comicCfg && (
                  <>
                    {comicCfg.tailPosition !== 'burst' && (
                      <div className="absolute -bottom-3.5 left-7 pointer-events-none z-10">
                        <svg
                          width="24"
                          height="16"
                          viewBox="0 0 24 16"
                          className="overflow-visible"
                        >
                          <path
                            d="M 0 0 L 20 0 C 13 7 7 13 0 16 Z"
                            fill={comicCfg.bubbleBg || '#ffffff'}
                            stroke={comicCfg.borderColor || '#18181b'}
                            strokeWidth="3.5"
                            strokeLinejoin="round"
                          />
                          <line
                            x1="2"
                            y1="0"
                            x2="18"
                            y2="0"
                            stroke={comicCfg.bubbleBg || '#ffffff'}
                            strokeWidth="4"
                          />
                        </svg>
                      </div>
                    )}

                    <motion.div
                      initial={{ scale: 0, rotate: -25 }}
                      animate={{ scale: 1, rotate: 12 }}
                      transition={{
                        type: 'spring',
                        stiffness: 550,
                        damping: 18,
                        mass: 0.8,
                      }}
                      className="absolute -top-3.5 -right-2 z-20 pointer-events-none select-none"
                    >
                      <div className="relative flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
                        <svg
                          width="48"
                          height="48"
                          viewBox="0 0 100 100"
                          className="w-11 h-11 sm:w-12 sm:h-12 overflow-visible"
                        >
                          <polygon
                            points="50,2 62,32 94,22 75,48 98,70 68,75 62,98 42,78 18,94 25,65 2,52 28,35 15,10 42,24"
                            fill={comicCfg.burstColor || '#facc15'}
                            stroke={comicCfg.borderColor || '#18181b'}
                            strokeWidth="5"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span
                          className="absolute text-[10px] sm:text-[11px] font-black tracking-wider uppercase drop-shadow-[0_1px_0_rgba(255,255,255,0.8)]"
                          style={{
                            color: comicCfg.textColor || '#0f172a',
                            fontFamily: "'Fredoka', 'Outfit', sans-serif",
                          }}
                        >
                          {comicCfg.word}
                        </span>
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{
                        y: [-2, 2, -2],
                        rotate: [-6, 6, -6],
                        scale: [0.95, 1.12, 0.95],
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -top-2 left-4 z-10 pointer-events-none"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        className="drop-shadow-[0_0_8px_currentColor]"
                        style={{ color: comicCfg.particleColors?.star || '#facc15' }}
                      >
                        <path
                          d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z"
                          fill="currentColor"
                        />
                      </svg>
                    </motion.div>

                    <motion.div
                      animate={{
                        y: [2, -2, 2],
                        scale: [0.95, 1.18, 0.95],
                      }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute -bottom-2.5 right-6 z-10 pointer-events-none"
                    >
                      <Heart
                        className="w-4 h-4 fill-current drop-shadow-[0_0_8px_currentColor]"
                        style={{ color: comicCfg.particleColors?.heart || '#f43f5e' }}
                      />
                    </motion.div>
                  </>
                )}

                <div className="flex items-start gap-3">
                  {settings.chatShowAvatars && (
                    <div className="relative shrink-0 mt-0.5">
                      <img
                        src={msg.avatarUrl}
                        alt={msg.username}
                        referrerPolicy="no-referrer"
                        className={`w-8 h-8 sm:w-9 sm:h-9 object-cover ${
                          isComic
                            ? 'border-[2.5px] border-slate-900 shadow-md rounded-full'
                            : activeTheme.is3D
                            ? 'border-2 border-white/40 shadow-[0_4px_8px_rgba(0,0,0,0.6)]'
                            : 'border border-white/20 shadow-sm'
                        } ${!isComic ? getAvatarRadius(activeTheme.avatarShape) : ''}`}
                      />
                      {msg.badges?.includes('top_fan') && (
                        <span className="absolute -bottom-1 -right-1 text-xs">🔥</span>
                      )}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {settings.chatShowBadges &&
                        msg.badges &&
                        msg.badges.map((b) => renderBadge(b))}
                      <span
                        className={`${activeTheme.usernameClass} text-xs sm:text-sm truncate`}
                        style={
                          isComic && comicCfg
                            ? {
                                color: comicCfg.usernameColor || msg.color,
                                fontFamily: "'Fredoka', 'Outfit', sans-serif",
                              }
                            : { color: msg.color }
                        }
                      >
                        {msg.username}
                      </span>
                      {settings.chatShowTimestamps && (
                        <span className="text-[10px] text-neutral-400 ml-auto font-mono">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                      )}
                    </div>

                    <p
                      className={`${activeTheme.textClass} ${fontSizeClass} break-words whitespace-pre-wrap`}
                      style={
                        isComic
                          ? { fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }
                          : undefined
                      }
                    >
                      {msg.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {visibleMessages.length === 0 && !isOBSMode && (
          <div className="text-center py-8 text-neutral-500 text-xs italic">
            รอข้อความแชทใหม่... (กดจำลองแชทด้านล่างเพื่อทดสอบ)
          </div>
        )}
      </div>
    </div>
  );
};
