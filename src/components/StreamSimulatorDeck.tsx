import React, { useState } from 'react';
import {
  Heart,
  MessageSquare,
  Gift,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Plus,
  Send,
  Sparkles,
  Flame,
  UserPlus,
  Share2,
  RotateCcw,
} from 'lucide-react';
import { GIFT_ITEMS, SIMULATION_NAMES, RANDOM_CHAT_PHRASES } from '../data/mockData';
import { GiftItem } from '../types';

interface StreamSimulatorDeckProps {
  onAddLikes: (count: number) => void;
  onResetLikes?: () => void;
  totalLikes?: number;
  onSendChat: (customText?: string, rolePreset?: 'queen' | 'mod' | 'vip' | 'sub' | 'coder' | 'memer' | 'event') => void;
  onSendGift: (gift: GiftItem, combo?: number) => void;
  onSendFollow?: (username?: string) => void;
  onSendShare?: (username?: string) => void;
  streamFollowCount?: number;
  streamShareCount?: number;
  isAutoSimulating: boolean;
  onToggleAutoSim: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ttsEnabled?: boolean;
  onToggleTts?: () => void;
  onTestTts?: () => void;
}

export const StreamSimulatorDeck: React.FC<StreamSimulatorDeckProps> = ({
  onAddLikes,
  onResetLikes,
  totalLikes = 0,
  onSendChat,
  onSendGift,
  onSendFollow,
  onSendShare,
  streamFollowCount = 0,
  streamShareCount = 0,
  isAutoSimulating,
  onToggleAutoSim,
  soundEnabled,
  onToggleSound,
  ttsEnabled = true,
  onToggleTts,
  onTestTts,
}) => {
  const [customMsg, setCustomMsg] = useState('');
  const [lastGiftId, setLastGiftId] = useState<string | null>(null);
  const [comboCount, setComboCount] = useState(1);
  const [lastGiftTimestamp, setLastGiftTimestamp] = useState(0);

  const handleGiftClick = (gift: GiftItem) => {
    const now = Date.now();
    let newCombo = 1;

    // If same gift clicked within 2.5 seconds, increment combo
    if (lastGiftId === gift.id && now - lastGiftGiftTimestamp < 2500) {
      newCombo = comboCount + 1;
    }

    setLastGiftId(gift.id);
    setLastGiftTimestamp(now);
    setComboCount(newCombo);

    onSendGift(gift, newCombo);
  };
  const lastGiftGiftTimestamp = lastGiftTimestamp;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMsg.trim()) return;
    onSendChat(customMsg);
    setCustomMsg('');
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-5">
      {/* Top Bar: Title & Global Simulator Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            แผงควบคุมจำลองการสตรีม (Live Test Deck)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            กดทดสอบการทำงานของทั้ง 3 วิดเจ็ตได้ทันที หรือเปิดโหมดออโต้เพื่อชมการจำลองสด
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* TTS Voice Toggle in Top Bar */}
          {onToggleTts && (
            <button
              onClick={onToggleTts}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                ttsEnabled
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:border-emerald-400'
                  : 'bg-slate-950 text-slate-400 border-white/10'
              }`}
              title="เปิด/ปิดการอ่านแชทอัตโนมัติด้วยเสียง TTS"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  ttsEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span>{ttsEnabled ? 'อ่านแชท TTS: ON' : 'TTS: OFF'}</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-slate-950 text-slate-200 border-white/10 hover:border-white/20'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/60'
            }`}
            title="เปิด/ปิดเสียงเอฟเฟกต์การแจ้งเตือน"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            <span>{soundEnabled ? 'เปิดเสียง FX' : 'ปิดเสียง FX'}</span>
          </button>

          {/* Auto Stream Simulation */}
          <button
            onClick={onToggleAutoSim}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-md cursor-pointer ${
              isAutoSimulating
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
            }`}
          >
            {isAutoSimulating ? (
              <>
                <Pause className="w-4 h-4" />
                <span>หยุดจำลองสด (Auto ON)</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>เริ่มจำลองไลฟ์สดอัตโนมัติ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Like Controls */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                1. Like Leaderboard
              </span>
              <span className="text-[10px] bg-pink-500/10 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/20">
                เคาะจอไลก์
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              จำลองคนดูเคาะจอกดหัวใจ มีแอนิเมชันหัวใจลอย & อัปเดตอันดับ
            </p>
            <div className="flex items-center justify-between text-[11px] mb-3 px-2 py-1 rounded-lg bg-slate-900 border border-white/5">
              <span className="text-slate-400">
                ไลก์ขณะนี้: <strong className="text-pink-300 font-mono">{totalLikes.toLocaleString()}</strong>
              </span>
              {onResetLikes && (
                <button
                  onClick={onResetLikes}
                  className="flex items-center gap-1 text-[10px] text-rose-300 hover:text-white bg-rose-500/20 hover:bg-rose-500/30 px-2 py-0.5 rounded border border-rose-500/30 font-bold transition-all cursor-pointer active:scale-95"
                  title="รีเซ็ตยอดไลก์เป็น 0 (เริ่มไลฟ์ใหม่)"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  รีเซ็ตเป็น 0
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onAddLikes(10)}
              className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-slate-900 border border-white/10 hover:border-pink-500 hover:bg-pink-500/10 text-slate-200 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
              +10
            </button>
            <button
              onClick={() => onAddLikes(50)}
              className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-slate-900 border border-white/10 hover:border-pink-500 hover:bg-pink-500/10 text-pink-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              +50
            </button>
            <button
              onClick={() => onAddLikes(250)}
              className="flex items-center justify-center gap-1 py-2 px-1 rounded-xl bg-gradient-to-r from-pink-900/40 to-rose-900/40 border border-pink-500/40 hover:border-pink-400 text-pink-200 text-xs font-black transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              +250
            </button>
          </div>
        </div>

        {/* 2. Chat Controls */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                2. Chat Overlay
              </span>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/20">
                สุ่มข้อความ/พิมพ์เอง
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              ส่งข้อความจำลองพร้อมเหรียญตรา (Mod, VIP, Sub)
            </p>
          </div>

          <div className="space-y-2">
            <form onSubmit={handleCustomSubmit} className="flex gap-1.5">
              <input
                type="text"
                placeholder="พิมพ์ข้อความทดสอบ..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="flex-1 min-w-0 bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.3)]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onSendChat()}
                className="py-1.5 px-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-200 text-xs font-semibold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                สุ่มแชทสด
              </button>

              {onTestTts && (
                <button
                  type="button"
                  onClick={onTestTts}
                  className="py-1.5 px-2 rounded-xl bg-slate-900 border border-pink-500/30 hover:border-pink-400 hover:bg-pink-500/10 text-pink-300 text-xs font-semibold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  title="ทดสอบอ่านออกเสียง TTS ภาษาไทยโทนหวานใส"
                >
                  <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                  🌸 ฟังเสียงหวานใส
                </button>
              )}
            </div>

            {/* Quick Twitch Role & Event Tester (ตามคลิป) */}
            <div className="pt-1.5 border-t border-white/10 space-y-1">
              <span className="text-[10px] text-purple-300/80 font-bold uppercase tracking-wider block">
                ทดสอบ Role & Event ตามคลิป:
              </span>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => onSendChat(undefined, 'queen')}
                  className="py-1 px-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-[10px] font-bold text-center transition-all active:scale-95 cursor-pointer"
                  title="แชทบทบาท QUEEN พร้อมมงกุฎเรืองแสง"
                >
                  👑 Queen
                </button>
                <button
                  type="button"
                  onClick={() => onSendChat(undefined, 'mod')}
                  className="py-1 px-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold text-center transition-all active:scale-95 cursor-pointer"
                  title="แชทบทบาท MOD พร้อมโล่เขียว"
                >
                  🛡️ Mod
                </button>
                <button
                  type="button"
                  onClick={() => onSendChat(undefined, 'vip')}
                  className="py-1 px-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-[10px] font-bold text-center transition-all active:scale-95 cursor-pointer"
                  title="แชทบทบาท VIP พร้อมเพชรชมพู"
                >
                  💎 VIP
                </button>
                <button
                  type="button"
                  onClick={() => onSendChat(undefined, 'event')}
                  className="py-1 px-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 text-[10px] font-bold text-center transition-all active:scale-95 cursor-pointer shadow-sm"
                  title="Event Pill (Resub / Redeem / Bits)"
                >
                  💧 Event
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Gift Controls */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-400" />
                3. Gift Alert Overlay
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
                มี Combo x2, x5, x10
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              คลิกซ้ำของขวัญอันเดิมเพื่อเพิ่ม Combo Multiplier
            </p>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {GIFT_ITEMS.map((g) => (
              <button
                key={g.id}
                onClick={() => handleGiftClick(g)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-400 hover:bg-amber-500/10 text-left transition-all active:scale-95 group cursor-pointer"
                title={`${g.nameTh} (${g.coinValue} เหรียญ)`}
              >
                <span className="text-base group-hover:scale-125 transition-transform">
                  {g.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-white truncate">{g.nameTh.split(' ')[0]}</div>
                  <div className="text-[9px] text-amber-400 font-medium">{g.coinValue} 🪙</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Follow & Share Controls */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-pink-400" />
                4. ติดตาม & แชร์ (Follow / Share)
              </span>
              <span className="text-[10px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold">
                ใหม่
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              จำลองแจ้งเตือนคนกดติดตาม และกดแชร์ไลฟ์สด
            </p>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onSendFollow && onSendFollow()}
                className="py-2 px-2 rounded-xl bg-pink-600/20 border border-pink-500/40 hover:border-pink-400 hover:bg-pink-500/30 text-pink-200 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-sm"
                title="ทดสอบคนกดติดตาม พร้อมเสียงกระดิ่ง และเสียงหวานใสทักทาย"
              >
                <UserPlus className="w-3.5 h-3.5 text-pink-400" />
                + ติดตาม
              </button>

              <button
                type="button"
                onClick={() => onSendShare && onSendShare()}
                className="py-2 px-2 rounded-xl bg-teal-600/20 border border-teal-500/40 hover:border-teal-400 hover:bg-teal-500/30 text-teal-200 text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer shadow-sm"
                title="ทดสอบคนกดแชร์ไลฟ์ พร้อมเสียงกระดิ่ง และเสียงหวานใสขอบคุณ"
              >
                <Share2 className="w-3.5 h-3.5 text-teal-400" />
                + แชร์ไลฟ์
              </button>
            </div>

            {/* Counters Badge */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-pink-400" />
                ติดตาม: <strong className="text-pink-300 font-bold">{streamFollowCount}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                แชร์: <strong className="text-teal-300 font-bold">{streamShareCount}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
