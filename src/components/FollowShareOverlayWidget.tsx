import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { UserPlus, Share2, Sparkles, Heart, Star, Users } from 'lucide-react';
import { FollowAlert, ShareAlert, OverlayCustomSettings } from '../types';

interface FollowShareOverlayWidgetProps {
  currentFollow?: FollowAlert | null;
  currentShare?: ShareAlert | null;
  settings: OverlayCustomSettings;
  isOBSMode?: boolean;
  mode?: 'both' | 'follow-only' | 'share-only';
}

export const FollowShareOverlayWidget: React.FC<FollowShareOverlayWidgetProps> = ({
  currentFollow,
  currentShare,
  settings,
  isOBSMode = false,
  mode = 'both',
}) => {
  const [pulse, setPulse] = useState(false);

  // Trigger celebratory confetti on new follower or share if enabled
  useEffect(() => {
    if ((currentFollow && mode !== 'share-only') || (currentShare && mode !== 'follow-only')) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 500);

      if (settings.giftShowParticles) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
          colors: currentFollow
            ? ['#ec4899', '#f43f5e', '#a855f7', '#ffd700']
            : ['#06b6d4', '#10b981', '#3b82f6', '#ffd700'],
          disableForReducedMotion: true,
        });
      }

      return () => clearTimeout(t);
    }
  }, [currentFollow, currentShare, mode, settings.giftShowParticles]);

  const showFollow = Boolean(currentFollow && mode !== 'share-only' && settings.followAlertEnabled);
  const showShare = Boolean(currentShare && mode !== 'follow-only' && settings.shareAlertEnabled);

  if (!showFollow && !showShare) {
    if (isOBSMode) return null;
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-2">
          <UserPlus className="w-6 h-6 text-slate-600" />
        </div>
        <p className="text-xs font-medium">รอแจ้งเตือนคนกดติดตาม & กดแชร์ไลฟ์...</p>
        <p className="text-[11px] text-slate-600 mt-0.5">กดปุ่มทดสอบ Follow / Share ด้านล่างเพื่อแสดงผล</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center p-4 select-none ${
        isOBSMode ? 'bg-transparent' : ''
      }`}
    >
      <AnimatePresence mode="wait">
        {/* 1. Follow Alert Banner */}
        {showFollow && currentFollow && (
          <motion.div
            key={`follow-${currentFollow.id}`}
            initial={{ opacity: 0, scale: 0.75, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -25 }}
            transition={{ type: 'spring', stiffness: 450, damping: 26 }}
            className={`relative max-w-md w-full rounded-2xl p-4 border backdrop-blur-xl shadow-2xl transition-all ${
              settings.followStyle === 'kawaii-badge'
                ? 'bg-gradient-to-r from-pink-950/95 via-rose-900/90 to-fuchsia-950/95 border-pink-400/80 shadow-[0_0_35px_rgba(244,63,94,0.45)]'
                : settings.followStyle === 'minimal-pill'
                ? 'bg-slate-950/95 border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
                : 'bg-gradient-to-r from-purple-950/95 via-indigo-950/90 to-slate-950/95 border-purple-400/80 shadow-[0_0_35px_rgba(168,85,247,0.5)]'
            }`}
          >
            {/* Top Ribbon Pill */}
            <div className="absolute -top-3 left-5 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 text-white font-black text-[10px] tracking-wider uppercase shadow-lg border border-white/30">
              <UserPlus className="w-3 h-3 fill-white" />
              <span>NEW FOLLOWER • ผู้ติดตามใหม่</span>
            </div>

            <div className="flex items-center gap-4 mt-1">
              {/* Avatar with energetic pulsing halo */}
              <div className="relative shrink-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 opacity-80 blur-xs"
                />
                <motion.img
                  src={currentFollow.avatarUrl}
                  alt={currentFollow.username}
                  referrerPolicy="no-referrer"
                  animate={{ scale: pulse ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-14 h-14 rounded-full object-cover border-2 border-white/80 shadow-md bg-slate-800"
                />
                <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 text-white text-xs border border-white shadow-md">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                </span>
              </div>

              {/* Follower Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white truncate drop-shadow-md tracking-tight">
                    {currentFollow.username}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-bold shrink-0">
                    + ติดตามแล้ว!
                  </span>
                </div>

                <p className="text-xs text-pink-200/90 font-medium mt-0.5 flex items-center gap-1 drop-shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  ยินดีต้อนรับสู่ครอบครัวสตรีมเมอร์ค่า 🌸
                </p>

                {currentFollow.uniqueId && (
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    @{currentFollow.uniqueId}
                  </p>
                )}
              </div>

              {/* Right Emblem */}
              <div className="shrink-0 flex flex-col items-center justify-center pl-1">
                <motion.div
                  animate={{ scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400 shadow-inner"
                >
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-300" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Share Alert Banner */}
        {showShare && currentShare && (
          <motion.div
            key={`share-${currentShare.id}`}
            initial={{ opacity: 0, scale: 0.75, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: -25 }}
            transition={{ type: 'spring', stiffness: 450, damping: 26 }}
            className={`relative max-w-md w-full rounded-2xl p-4 border backdrop-blur-xl shadow-2xl transition-all ${
              settings.shareStyle === 'kawaii-badge'
                ? 'bg-gradient-to-r from-emerald-950/95 via-teal-900/90 to-cyan-950/95 border-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.45)]'
                : settings.shareStyle === 'minimal-pill'
                ? 'bg-slate-950/95 border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
                : 'bg-gradient-to-r from-cyan-950/95 via-teal-950/90 to-slate-950/95 border-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.5)]'
            }`}
          >
            {/* Top Ribbon Pill */}
            <div className="absolute -top-3 left-5 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-lg border border-white/40">
              <Share2 className="w-3 h-3 stroke-[2.5]" />
              <span>LIVE SHARED • ผู้แชร์ไลฟ์</span>
            </div>

            <div className="flex items-center gap-4 mt-1">
              {/* Avatar with energetic pulsing halo */}
              <div className="relative shrink-0">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 opacity-80 blur-xs"
                />
                <motion.img
                  src={currentShare.avatarUrl}
                  alt={currentShare.username}
                  referrerPolicy="no-referrer"
                  animate={{ scale: pulse ? [1, 1.15, 1] : 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-14 h-14 rounded-full object-cover border-2 border-white/80 shadow-md bg-slate-800"
                />
                <span className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 text-xs border border-white shadow-md">
                  <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              </div>

              {/* Share Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-white truncate drop-shadow-md tracking-tight">
                    {currentShare.username}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold shrink-0">
                    📢 แชร์ไลฟ์แล้ว!
                  </span>
                </div>

                <p className="text-xs text-cyan-200/90 font-medium mt-0.5 flex items-center gap-1 drop-shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  แชร์ไลฟ์สดนี้ไปยังเพื่อนๆ ขอบคุณมากค่า 💖
                </p>

                {currentShare.uniqueId && (
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    @{currentShare.uniqueId}
                  </p>
                )}
              </div>

              {/* Right Emblem */}
              <div className="shrink-0 flex flex-col items-center justify-center pl-1">
                <motion.div
                  animate={{ scale: [1, 1.25, 1], rotate: [0, -12, 12, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner"
                >
                  <Share2 className="w-5 h-5" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
