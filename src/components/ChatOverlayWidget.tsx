import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ShieldCheck, Star, Heart, Award, CheckCircle2 } from 'lucide-react';
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

  return (
    <div
      className={`w-full h-full flex flex-col justify-end p-4 select-none ${
        isOBSMode ? 'bg-transparent' : ''
      }`}
    >
      <div className={`w-full ${activeTheme.containerClass}`}>
        <AnimatePresence initial={false}>
          {visibleMessages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              className={`${activeTheme.messageCardClass(msg.highlighted)} ${activeTheme.accentBorder}`}
            >
              <div className="flex items-start gap-2.5">
                {settings.chatShowAvatars && (
                  <div className="relative shrink-0 mt-0.5">
                    <img
                      src={msg.avatarUrl}
                      alt={msg.username}
                      referrerPolicy="no-referrer"
                      className={`w-8 h-8 object-cover border border-white/20 shadow-sm ${getAvatarRadius(
                        activeTheme.avatarShape
                      )}`}
                    />
                    {msg.badges?.includes('top_fan') && (
                      <span className="absolute -bottom-1 -right-1 text-xs">🔥</span>
                    )}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Header: Badges & Name */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    {settings.chatShowBadges &&
                      msg.badges &&
                      msg.badges.map((b) => renderBadge(b))}
                    <span
                      className={`${activeTheme.usernameClass} text-xs sm:text-sm font-semibold truncate`}
                      style={{ color: msg.color }}
                    >
                      {msg.username}
                    </span>
                  </div>

                  {/* Message Content */}
                  <p
                    className={`${activeTheme.textClass} ${fontSizeClass} break-words whitespace-pre-wrap`}
                  >
                    {msg.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
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
