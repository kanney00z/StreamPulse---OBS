import React, { useState } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Sparkles,
  Settings2,
  Copy,
  Check,
  ExternalLink,
  Flame,
  Crown,
  Zap,
  Heart,
  Gamepad2,
  Sliders,
} from 'lucide-react';
import { SubathonThemeId, OverlayCustomSettings } from '../types';
import { SUBATHON_THEMES } from '../data/mockData';

interface SubathonControlCardProps {
  seconds: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onAddSeconds: (sec: number, reason?: string) => void;
  onResetTimer: (newSeconds?: number) => void;
  settings: OverlayCustomSettings;
  onUpdateSettings: (newSettings: Partial<OverlayCustomSettings>) => void;
  onCopyObsUrl?: (type: string) => void;
}

export const SubathonControlCard: React.FC<SubathonControlCardProps> = ({
  seconds,
  isRunning,
  onTogglePlay,
  onAddSeconds,
  onResetTimer,
  settings,
  onUpdateSettings,
  onCopyObsUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'control' | 'theme' | 'rules'>('control');

  // Format display
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const obsSubathonUrl = `${origin}?mode=overlay&overlay=subathon&theme=${settings.subathonTheme}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(obsSubathonUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onCopyObsUrl) onCopyObsUrl('subathon');
  };

  const getThemeIcon = (id: SubathonThemeId) => {
    switch (id) {
      case 'gold-luxury':
        return <Crown className="w-3.5 h-3.5 text-amber-400" />;
      case 'kawaii-pastel':
        return <Heart className="w-3.5 h-3.5 text-pink-400" />;
      case 'retro-arcade':
        return <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'magma-flame':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'midnight-minimal':
        return <Sparkles className="w-3.5 h-3.5 text-slate-300" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Subathon Timer (จับเวลามาราธอน)</span>
            </h3>
            <p className="text-[11px] text-slate-400">นับถอยหลังพร้อมเพิ่มเวลาอัตโนมัติจากของขวัญ</p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-white/10 text-[11px]">
          <button
            onClick={() => setActiveTab('control')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'control'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ควบคุม
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'theme'
                ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ธีม ({SUBATHON_THEMES.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            เงื่อนไขเวลา
          </button>
        </div>
      </div>

      {/* Main Countdown Mini Readout with Play/Pause */}
      <div className="bg-slate-950/90 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-mono block">เวลาคงเหลือ</span>
          <div className="text-3xl font-black font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
            {pad(hours)}:{pad(minutes)}:{pad(secs)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-lg ${
              isRunning
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>พักเวลา</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>เริ่มนับถอยหลัง</span>
              </>
            )}
          </button>

          <button
            onClick={() => onResetTimer(settings.subathonMaxCapHours > 0 ? settings.subathonMaxCapHours * 3600 : 7200)}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
            title="รีเซ็ตเวลาใหม่"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab 1: Control & Quick Add */}
      {activeTab === 'control' && (
        <div className="space-y-3 animate-fadeIn">
          {/* Quick Add and Subtract Time Buttons */}
          <div className="space-y-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Plus className="w-3 h-3 text-cyan-400" />
                  <span>เพิ่มเวลาด่วน (+Time):</span>
                </span>
                <span className="text-[10px] text-slate-500">คลิกเพื่อต่อเวลาทันที</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { sec: 30, label: '+30 วิ' },
                  { sec: 60, label: '+1 นาที' },
                  { sec: 300, label: '+5 นาที' },
                  { sec: 600, label: '+10 นาที' },
                  { sec: 1800, label: '+30 นาที' },
                  { sec: 3600, label: '+1 ชม.' },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => onAddSeconds(btn.sec, 'แอดมินเพิ่มเวลา')}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/30"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-rose-300">
                  <Minus className="w-3 h-3 text-rose-400" />
                  <span>ลบเวลา / ลดเวลา (-Time):</span>
                </span>
                <span className="text-[10px] text-rose-400/80">หักเวลาลดลงทันที</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { sec: -30, label: '-30 วิ' },
                  { sec: -60, label: '-1 นาที' },
                  { sec: -300, label: '-5 นาที' },
                  { sec: -600, label: '-10 นาที' },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => onAddSeconds(btn.sec, 'แอดมินลบเวลา')}
                    className="py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-0.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white border border-rose-500/30"
                  >
                    <Minus className="w-2.5 h-2.5" />
                    <span>{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reset presets */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
              ตั้งค่าเวลาเริ่มต้น (Presets):
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {[
                { sec: 1800, label: '30 นาที' },
                { sec: 3600, label: '1 ชั่วโมง' },
                { sec: 7200, label: '2 ชั่วโมง' },
                { sec: 14400, label: '4 ชั่วโมง' },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => onResetTimer(p.sec)}
                  className="py-1 px-2 rounded-lg bg-slate-950 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 text-[11px] font-medium transition-all cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Theme Selector */}
      {activeTab === 'theme' && (
        <div className="space-y-2.5 animate-fadeIn">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>เลือกสไตล์ธีม Subathon ({SUBATHON_THEMES.length} ธีม):</span>
            <span className="text-[10px] text-cyan-400">เปลี่ยนบนจอทันที</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            {SUBATHON_THEMES.map((theme) => {
              const isSelected = settings.subathonTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => onUpdateSettings({ subathonTheme: theme.id })}
                  className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                      : 'bg-slate-950 border-white/10 hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      {getThemeIcon(theme.id)}
                      <span className="text-xs font-bold text-white truncate">{theme.name}</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                      {theme.badge}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{theme.nameTh}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Title Editor */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              ข้อความหัวข้อ (Title):
            </label>
            <input
              type="text"
              value={settings.subathonTitle}
              onChange={(e) => onUpdateSettings({ subathonTitle: e.target.value })}
              placeholder="เช่น สตรีมมาราธอน 24 ชม., SUBATHON LIVE"
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      )}

      {/* Tab 3: Auto Add Rules */}
      {activeTab === 'rules' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-white/10">
            <div>
              <span className="text-xs font-bold text-white block">เพิ่มเวลาอัตโนมัติ (Auto-Add)</span>
              <span className="text-[10px] text-slate-400">
                เมื่อคนดูส่งของขวัญ / กดติดตาม / กดแชร์
              </span>
            </div>
            <button
              onClick={() => onUpdateSettings({ subathonAutoAdd: !settings.subathonAutoAdd })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.subathonAutoAdd ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.subathonAutoAdd ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {/* Follow */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">กดติดตาม 1 ครั้ง:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="600"
                  value={settings.subathonAddPerFollow}
                  onChange={(e) => onUpdateSettings({ subathonAddPerFollow: Number(e.target.value) })}
                  className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-white/10 text-right text-cyan-400 font-bold focus:outline-none"
                />
                <span className="text-slate-400 text-[11px]">วินาที</span>
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">กดแชร์ไลฟ์ 1 ครั้ง:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="600"
                  value={settings.subathonAddPerShare}
                  onChange={(e) => onUpdateSettings({ subathonAddPerShare: Number(e.target.value) })}
                  className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-white/10 text-right text-teal-400 font-bold focus:outline-none"
                />
                <span className="text-slate-400 text-[11px]">วินาที</span>
              </div>
            </div>

            {/* Likes */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">เคาะจอ 100 ไลก์:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="600"
                  value={settings.subathonAddPer100Likes}
                  onChange={(e) => onUpdateSettings({ subathonAddPer100Likes: Number(e.target.value) })}
                  className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-white/10 text-right text-pink-400 font-bold focus:outline-none"
                />
                <span className="text-slate-400 text-[11px]">วินาที</span>
              </div>
            </div>

            {/* Coins */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">ของขวัญ 1 เหรียญ (Coin):</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  max="60"
                  value={settings.subathonAddPerCoin}
                  onChange={(e) => onUpdateSettings({ subathonAddPerCoin: Number(e.target.value) })}
                  className="w-16 px-2 py-1 rounded-lg bg-slate-950 border border-white/10 text-right text-amber-400 font-bold focus:outline-none"
                />
                <span className="text-slate-400 text-[11px]">วินาที</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OBS Link Banner */}
      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-950 to-pink-950/30 border border-cyan-500/20">
          <div className="min-w-0 pr-2">
            <span className="text-xs font-bold text-cyan-300 block truncate">
              ลิงก์ OBS Subathon Timer
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              ความละเอียดแนะนำ: 560 × 200 (พื้นหลังใส)
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอกลิงก์</span>
                </>
              )}
            </button>
            <a
              href={obsSubathonUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
              title="เปิดดูในหน้าต่างใหม่"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
