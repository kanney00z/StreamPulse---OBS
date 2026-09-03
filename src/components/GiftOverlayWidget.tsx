import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Sparkles, Flame, Coins } from 'lucide-react';
import { GiftAlert, OverlayCustomSettings } from '../types';

interface GiftOverlayWidgetProps {
  currentAlert: GiftAlert | null;
  settings: OverlayCustomSettings;
  isOBSMode?: boolean;
}

export const GiftOverlayWidget: React.FC<GiftOverlayWidgetProps> = ({
  currentAlert,
  settings,
  isOBSMode = false,
}) => {
  const [comboPulse, setComboPulse] = useState(false);

  useEffect(() => {
    if (!currentAlert) return;

    setComboPulse(true);
    const t = setTimeout(() => setComboPulse(false), 400);

    // Trigger celebratory confetti for rare, epic, legendary, or mythic gifts
    if (settings.giftShowParticles && currentAlert.gift.coinValue >= 200) {
      const count = currentAlert.gift.coinValue >= 3000 ? 90 : 40;
      confetti({
        particleCount: count,
        spread: 70,
        origin: { y: 0.6 },
        colors: [currentAlert.gift.accentColor, '#ffd700', '#ff69b4', '#00ffff'],
        disableForReducedMotion: true,
      });
    }

    return () => clearTimeout(t);
  }, [currentAlert, settings.giftShowParticles]);

  if (!currentAlert) {
    if (isOBSMode) return null;
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-500">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-2">
          <Sparkles className="w-6 h-6 text-neutral-600" />
        </div>
        <p className="text-xs font-medium">รอการแจ้งเตือนของขวัญ / โดเนท...</p>
        <p className="text-[11px] text-neutral-600 mt-0.5">กดปุ่มทดสอบส่งของขวัญด้านล่างเพื่อแสดงผล</p>
      </div>
    );
  }

  const { gift, senderName, senderAvatar, amount, comboCount, customMessage } = currentAlert;

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'mythic':
        return 'shadow-[0_0_35px_rgba(168,85,247,0.7)] border-purple-400/80 bg-gradient-to-r from-purple-950/90 via-fuchsia-950/80 to-slate-950/90';
      case 'legendary':
        return 'shadow-[0_0_30px_rgba(234,179,8,0.6)] border-amber-400/80 bg-gradient-to-r from-yellow-950/90 via-amber-950/80 to-slate-950/90';
      case 'epic':
        return 'shadow-[0_0_25px_rgba(236,72,153,0.5)] border-pink-400/70 bg-gradient-to-r from-pink-950/90 via-rose-950/80 to-slate-950/90';
      case 'rare':
        return 'shadow-[0_0_20px_rgba(56,189,248,0.4)] border-sky-400/60 bg-gradient-to-r from-sky-950/90 via-slate-950/80 to-slate-950/90';
      default:
        return 'shadow-[0_0_15px_rgba(244,63,94,0.3)] border-rose-500/40 bg-slate-950/90';
    }
  };

  return (
    <div
      className={`w-full h-full flex items-center justify-center p-4 select-none ${
        isOBSMode ? 'bg-transparent' : ''
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAlert.id + comboCount}
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -25 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`relative max-w-md w-full rounded-2xl p-4 border backdrop-blur-xl ${getRarityGlow(
            gift.rarity
          )}`}
        >
          {/* Top Banner Tag */}
          <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-neutral-950 font-black text-[10px] tracking-wider uppercase shadow-md">
            <Sparkles className="w-3 h-3 fill-neutral-950" />
            <span>GIFT ALERT</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sender Avatar */}
            <div className="relative shrink-0">
              <motion.img
                src={senderAvatar}
                alt={senderName}
                referrerPolicy="no-referrer"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-14 h-14 rounded-full object-cover border-2 shadow-md"
                style={{ borderColor: gift.accentColor }}
              />
              <span className="absolute -bottom-1 -right-1 text-base">🎁</span>
            </div>

            {/* Gift Details & Supporter */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate drop-shadow-sm">
                  {senderName}
                </span>
                <span className="text-xs text-neutral-300">ส่ง</span>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="text-base font-extrabold tracking-tight"
                  style={{ color: gift.accentColor }}
                >
                  {gift.nameTh} ({gift.name})
                </span>
              </div>

              {/* Coin / Value info */}
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-300">
                <span className="flex items-center gap-1 text-amber-300 font-semibold">
                  <Coins className="w-3 h-3 text-amber-400" />
                  {(gift.coinValue * amount).toLocaleString()} เหรียญ
                </span>
                <span>•</span>
                <span className="text-neutral-400 capitalize">{gift.rarity} Tier</span>
              </div>

              {/* Custom message if provided */}
              {customMessage && (
                <div className="mt-2 text-xs text-neutral-200 bg-black/40 px-2.5 py-1.5 rounded-lg border border-white/10 italic">
                  "{customMessage}"
                </div>
              )}
            </div>

            {/* Animated Gift Graphic & Combo Multiplier */}
            <div className="relative flex flex-col items-center justify-center shrink-0 pl-2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 8, -8, 0],
                }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                className="text-4xl filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              >
                {gift.icon}
              </motion.div>

              {/* Combo Multiplier Badge */}
              {comboCount > 1 && (
                <motion.div
                  animate={comboPulse ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-1 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white font-black text-xs tracking-tight shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                >
                  <Flame className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                  <span>x{comboCount}</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
