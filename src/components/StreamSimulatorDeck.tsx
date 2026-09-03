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
} from 'lucide-react';
import { GIFT_ITEMS, SIMULATION_NAMES, RANDOM_CHAT_PHRASES } from '../data/mockData';
import { GiftItem } from '../types';

interface StreamSimulatorDeckProps {
  onAddLikes: (count: number) => void;
  onSendChat: (customText?: string) => void;
  onSendGift: (gift: GiftItem, combo?: number) => void;
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
  onSendChat,
  onSendGift,
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

      {/* 3 Categories Action Rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <p className="text-xs text-slate-400 mb-3">
              จำลองคนดูเคาะจอกดหัวใจ มีแอนิเมชันหัวใจลอย & อัปเดตอันดับ
            </p>
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
                  className="py-1.5 px-2 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-400 hover:bg-emerald-500/10 text-emerald-300 text-xs font-semibold transition-all flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                  title="ทดสอบอ่านออกเสียง TTS"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  ทดสอบเสียงอ่าน
                </button>
              )}
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
      </div>
    </div>
  );
};
