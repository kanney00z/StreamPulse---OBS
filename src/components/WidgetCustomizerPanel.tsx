import React, { useState, useEffect } from 'react';
import {
  Sliders,
  MessageSquare,
  Heart,
  Gift,
  UserPlus,
  Share2,
  Timer,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  Volume2,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
  Settings2,
  Tv,
} from 'lucide-react';
import { OverlayCustomSettings, ChatThemeId } from '../types';
import { CHAT_THEMES } from '../data/mockData';
import { SubathonControlCard } from './SubathonControlCard';
import { ttsService } from '../utils/ttsService';

export type WidgetCategoryKey = 'chat' | 'leaderboard' | 'gift' | 'follow' | 'share' | 'subathon';

interface WidgetCustomizerPanelProps {
  activeWidgetView: 'all' | 'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'subathon';
  onSelectWidgetView: (view: 'all' | 'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'subathon') => void;
  settings: OverlayCustomSettings;
  onUpdateSettings: (patch: Partial<OverlayCustomSettings>) => void;
  totalLikes: number;
  onResetLikes: () => void;
  onOpenGallery: () => void;
  onCopyUrl: (type: 'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'subathon' | 'alerts') => void;
  copiedKey: string | null;
  // Subathon props
  subathonSeconds: number;
  subathonIsRunning: boolean;
  onToggleSubathon: () => void;
  onAddSubathonTime: (sec: number, reason?: string) => void;
  onResetSubathon: (sec?: number) => void;
}

interface CategoryMeta {
  key: WidgetCategoryKey;
  num: number;
  title: string;
  shortTitle: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  bgColor: string;
  obsDimensions: string;
}

const CATEGORIES: CategoryMeta[] = [
  {
    key: 'chat',
    num: 2,
    title: 'กล่องแชทสด (Chat Overlay)',
    shortTitle: '2. แชทสด',
    desc: 'ปรับแต่งธีม Twitch Glow, เลย์เอาต์แนวตั้ง/แนวนอน, ตัวอักษร และเสียงอ่านแชท AI',
    icon: MessageSquare,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-500/10',
    obsDimensions: '420 × 650 px (แนวตั้ง) หรือ 1280 × 140 px (แนวนอน)',
  },
  {
    key: 'leaderboard',
    num: 1,
    title: 'กระดานยอดไลก์ (Like Leaderboard)',
    shortTitle: '1. ยอดไลก์',
    desc: 'ปรับแต่งเป้าหมายยอดไลก์, สไตล์แท่น 3D, แถบความคืบหน้า และรีเซ็ตยอดไลก์',
    icon: Heart,
    color: 'text-pink-400',
    borderColor: 'border-pink-500/40',
    bgColor: 'bg-pink-500/10',
    obsDimensions: '380 × 520 px',
  },
  {
    key: 'gift',
    num: 3,
    title: 'แจ้งเตือนของขวัญ (Gift Overlay)',
    shortTitle: '3. ของขวัญ',
    desc: 'ปรับแต่งสไตล์ป๊อปอัป 3D, ระยะเวลาแสดงบนจอ, ระดับเสียงเอฟเฟกต์ และดาวกระจาย',
    icon: Gift,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    obsDimensions: '450 × 320 px',
  },
  {
    key: 'follow',
    num: 4,
    title: 'แจ้งเตือนผู้ติดตาม (Follow Alert)',
    shortTitle: '4. ผู้ติดตาม',
    desc: 'ปรับแต่งแบนเนอร์แจ้งเตือนคนกดติดตามใหม่, เสียงแจ้งเตือน และ AI ขานชื่อ',
    icon: UserPlus,
    color: 'text-rose-400',
    borderColor: 'border-rose-500/40',
    bgColor: 'bg-rose-500/10',
    obsDimensions: '400 × 120 px',
  },
  {
    key: 'share',
    num: 5,
    title: 'แจ้งเตือนคนแชร์ (Share Alert)',
    shortTitle: '5. คนแชร์ไลฟ์',
    desc: 'ปรับแต่งแบนเนอร์แจ้งเตือนคนแชร์ไลฟ์, เสียงเอฟเฟกต์ และ AI ขอบคุณคนแชร์',
    icon: Share2,
    color: 'text-teal-400',
    borderColor: 'border-teal-500/40',
    bgColor: 'bg-teal-500/10',
    obsDimensions: '400 × 120 px',
  },
  {
    key: 'subathon',
    num: 6,
    title: 'นาฬิกา Subathon (Subathon Timer)',
    shortTitle: '6. Subathon',
    desc: 'ปรับแต่งเวลานับถอยหลัง, ธีมสี, ฟอนต์ตัวเลข, กฎการบวกเวลา และปุ่มควบคุมเวลา',
    icon: Timer,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/10',
    obsDimensions: '480 × 160 px',
  },
];

export const WidgetCustomizerPanel: React.FC<WidgetCustomizerPanelProps> = ({
  activeWidgetView,
  onSelectWidgetView,
  settings,
  onUpdateSettings,
  totalLikes,
  onResetLikes,
  onOpenGallery,
  onCopyUrl,
  copiedKey,
  subathonSeconds,
  subathonIsRunning,
  onToggleSubathon,
  onAddSubathonTime,
  onResetSubathon,
}) => {
  // Determine which category to customize
  // If activeWidgetView is a specific widget, auto-select it. If 'all', default to current internal tab.
  const [selectedCategory, setSelectedCategory] = useState<WidgetCategoryKey>(() => {
    if (activeWidgetView !== 'all') {
      return activeWidgetView as WidgetCategoryKey;
    }
    return 'chat';
  });

  // Sync when user clicks the top HUD selector buttons
  useEffect(() => {
    if (activeWidgetView !== 'all') {
      setSelectedCategory(activeWidgetView as WidgetCategoryKey);
    }
  }, [activeWidgetView]);

  const currentMeta = CATEGORIES.find((c) => c.key === selectedCategory) || CATEGORIES[0];
  const IconComponent = currentMeta.icon;

  const handleSelectCategory = (catKey: WidgetCategoryKey) => {
    setSelectedCategory(catKey);
    // If user specifically picked this category and we are not in HUD all mode, sync with view
    if (activeWidgetView !== 'all') {
      onSelectWidgetView(catKey);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Category Switcher Header Bar - Crystal Clear Division */}
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              เลือกหมวดหมู่ที่ต้องการปรับแต่ง:
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            แยกปรับตามหมวด
          </span>
        </div>

        {/* 6 Clean Category Tabs */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-white/10">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            const CatIcon = cat.icon;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => handleSelectCategory(cat.key)}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  isSelected
                    ? `${cat.bgColor} ${cat.color} ${cat.borderColor} border shadow-lg scale-[1.02]`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
                title={`คลิกเพื่อปรับแต่งเฉพาะ ${cat.title}`}
              >
                <CatIcon className="w-4 h-4" />
                <span className="text-[11px] whitespace-nowrap">{cat.shortTitle}</span>
              </button>
            );
          })}
        </div>

        {/* Informative Sub-header banner showing EXACTLY what you are editing */}
        <div className={`flex items-center justify-between p-2.5 rounded-xl border ${currentMeta.bgColor} ${currentMeta.borderColor}`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded-lg bg-slate-950 ${currentMeta.color}`}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${currentMeta.color}`}>
                  กำลังปรับแต่ง: {currentMeta.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                {currentMeta.desc}
              </p>
            </div>
          </div>

          {/* Quick sync button to isolate on canvas */}
          {activeWidgetView !== selectedCategory && (
            <button
              onClick={() => onSelectWidgetView(selectedCategory)}
              className="px-2 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-950 border border-white/20 text-[10px] font-bold text-slate-200 hover:text-white shrink-0 transition-all cursor-pointer flex items-center gap-1"
              title="แสดงเฉพาะวิดเจ็ตนี้บนจอจำลองด้านซ้าย"
            >
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>ดูเฉพาะอันนี้</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SPECIFIC CONTROLS FOR CHOSEN CATEGORY ONLY (ไม่มีปนกันเด็ดขาด) */}

      {/* ========================================================================= */}
      {/* CATEGORY 2: CHAT OVERLAY ONLY */}
      {/* ========================================================================= */}
      {selectedCategory === 'chat' && (
        <div className="bg-slate-900/80 border border-cyan-500/20 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>ปรับแต่งเฉพาะ: กล่องแชทสด (Chat Overlay)</span>
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
              WIDGET #2
            </span>
          </div>

          {/* 1. Theme Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">ธีมกล่องแชท (Chat Theme):</label>
              <button
                onClick={onOpenGallery}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer flex items-center gap-1"
              >
                <span>ดูแกลเลอรี {CHAT_THEMES.length} ธีม</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <select
              value={settings.chatTheme}
              onChange={(e) => onUpdateSettings({ chatTheme: e.target.value as ChatThemeId })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <optgroup label="💜 Twitch Dark Role Glow (ตามคลิป - 7 สไตล์)">
                {CHAT_THEMES.filter((t) => t.isTwitchGlow).map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    💜 {theme.name} ({theme.badge})
                  </option>
                ))}
              </optgroup>
              <optgroup label="💥 Comic Chat Pop (8 สไตล์)">
                {CHAT_THEMES.filter((t) => t.isComic).map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    💥 {theme.name} ({theme.badge})
                  </option>
                ))}
              </optgroup>
              <optgroup label="✨ ธีม 3 มิตินูนลอย (3D Floating Glass & Clay)">
                {CHAT_THEMES.filter((t) => t.is3D).map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    ✨ {theme.name} ({theme.badge})
                  </option>
                ))}
              </optgroup>
              <optgroup label="🎨 ธีมคลาสสิก & โมเดิร์น (Classic & Modern)">
                {CHAT_THEMES.filter((t) => !t.is3D && !t.isComic && !t.isTwitchGlow).map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name} ({theme.badge})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 2. Layout & Timestamps */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block font-medium">เลย์เอาต์แชท:</label>
              <select
                value={settings.chatLayout || 'vertical'}
                onChange={(e) => onUpdateSettings({ chatLayout: e.target.value as any })}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="vertical">แนวตั้ง (Vertical Stack)</option>
                <option value="horizontal">แนวนอน (Horizontal Ticker ตามคลิป)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 mb-1 block font-medium">แสดงเวลา (Time):</label>
              <button
                type="button"
                onClick={() => onUpdateSettings({ chatShowTimestamps: !settings.chatShowTimestamps })}
                className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  settings.chatShowTimestamps
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-slate-950 text-slate-400 border-white/10'
                }`}
              >
                {settings.chatShowTimestamps ? '✓ เปิด (21:30)' : '✕ ปิด (ซ่อนเวลา)'}
              </button>
            </div>
          </div>

          {/* 3. Font Size & Auto-Hide */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block font-medium">ขนาดฟอนต์แชท:</label>
              <select
                value={settings.chatFontSize}
                onChange={(e) => onUpdateSettings({ chatFontSize: e.target.value as any })}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="sm">เล็ก (Small - 12px)</option>
                <option value="base">กลาง (Medium - 14px)</option>
                <option value="lg">ใหญ่ (Large - 16px)</option>
                <option value="xl">ใหญ่พิเศษ (XL - 18px)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 mb-1 block font-medium">เวลาซ่อนข้อความ:</label>
              <select
                value={settings.chatAutoHideSeconds}
                onChange={(e) => onUpdateSettings({ chatAutoHideSeconds: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value={0}>แสดงตลอดเวลา (ไม่ซ่อน)</option>
                <option value={5}>ซ่อนหลัง 5 วินาที</option>
                <option value={10}>ซ่อนหลัง 10 วินาที</option>
                <option value={15}>ซ่อนหลัง 15 วินาที</option>
                <option value={20}>ซ่อนหลัง 20 วินาที</option>
              </select>
            </div>
          </div>

          {/* 4. Display Toggles */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-xs">
            <button
              type="button"
              onClick={() => onUpdateSettings({ chatShowAvatars: !settings.chatShowAvatars })}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                settings.chatShowAvatars
                  ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold'
                  : 'bg-slate-950 border-white/10 text-slate-400'
              }`}
            >
              รูปอวตาร: {settings.chatShowAvatars ? 'เปิด' : 'ปิด'}
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ chatShowBadges: !settings.chatShowBadges })}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                settings.chatShowBadges
                  ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 font-bold'
                  : 'bg-slate-950 border-white/10 text-slate-400'
              }`}
            >
              ป้ายยศ/Role: {settings.chatShowBadges ? 'เปิด' : 'ปิด'}
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ chatSoundEnabled: !settings.chatSoundEnabled })}
              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                settings.chatSoundEnabled
                  ? 'bg-pink-500/15 border-pink-500/40 text-pink-300 font-bold'
                  : 'bg-slate-950 border-white/10 text-slate-400'
              }`}
            >
              เสียง Sound FX: {settings.chatSoundEnabled ? 'เปิด' : 'ปิด'}
            </button>
          </div>

          {/* 5. AI Sweet TTS Option */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-pink-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-pink-300 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.chatTtsEnabled}
                  onChange={(e) => onUpdateSettings({ chatTtsEnabled: e.target.checked })}
                  className="rounded accent-pink-400"
                />
                <span>🌸 ระบบอ่านแชทเสียงหวานใส AI TTS</span>
              </label>
              <button
                type="button"
                onClick={() => ttsService.speakChat('Streamer', 'ทดสอบเสียงอ่านแชทหวานใสภาษาไทยค่ะ')}
                className="px-2 py-0.5 rounded bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 text-[11px] font-semibold transition-all cursor-pointer"
              >
                ลองฟังเสียง
              </button>
            </div>
            {settings.chatTtsEnabled && (
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">รูปแบบการอ่าน:</span>
                  <select
                    value={settings.chatTtsFormat}
                    onChange={(e) => onUpdateSettings({ chatTtsFormat: e.target.value as any })}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="nameAndMessage">ชื่อ + ข้อความ</option>
                    <option value="messageOnly">ข้อความอย่างเดียว</option>
                    <option value="sweet">เติมคำหวาน (คุณ... พูดว่า)</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">ความเร็วพูด ({settings.chatTtsSpeed.toFixed(2)}x):</span>
                  <input
                    type="range"
                    min="0.7"
                    max="1.3"
                    step="0.05"
                    value={settings.chatTtsSpeed}
                    onChange={(e) => onUpdateSettings({ chatTtsSpeed: Number(e.target.value) })}
                    className="w-full accent-pink-400 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6. OBS Browser Source Link for Chat */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300">ลิงก์ OBS สำหรับกล่องแชท:</span>
              <span className="font-mono text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                ขนาด: {settings.chatLayout === 'horizontal' ? '1280 × 140 px' : '420 × 650 px'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onCopyUrl('chat')}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.15)]"
              >
                {copiedKey === 'chat' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-400">คัดลอกลิงก์ OBS สำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกลิงก์ OBS กล่องแชท</span>
                  </>
                )}
              </button>
              <a
                href={`${window.location.origin}?mode=overlay&overlay=chat&theme=${settings.chatTheme}&layout=${settings.chatLayout}&timestamp=${settings.chatShowTimestamps ? '1' : '0'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                title="เปิดดูตัวอย่าง Overlay ในแท็บใหม่"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY 1: LIKE LEADERBOARD ONLY */}
      {/* ========================================================================= */}
      {selectedCategory === 'leaderboard' && (
        <div className="bg-slate-900/80 border border-pink-500/20 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <span>ปรับแต่งเฉพาะ: กระดานยอดไลก์ (Like Leaderboard)</span>
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-400/10 text-pink-300 border border-pink-400/20">
              WIDGET #1
            </span>
          </div>

          {/* 1. Like Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">สไตล์การแสดงผลกระดาน:</label>
            <select
              value={settings.likeStyle}
              onChange={(e) => onUpdateSettings({ likeStyle: e.target.value as any })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-400"
            >
              <option value="podium-card">Podium Card 3D (แท่นโพเดียม 3 มิติ ยอดนิยม)</option>
              <option value="compact-ticker">Minimal Bar (หลอดสลิม มินิมอล)</option>
              <option value="neon-glow">Neon Cyber Glow (นีออนเรืองแสงล้ำยุค)</option>
              <option value="glass-list">Glass Trophy (การ์ดกระจกถ้วยรางวัล)</option>
            </select>
          </div>

          {/* 2. Goal Slider */}
          <div className="space-y-2 p-3 bg-slate-950/80 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">เป้าหมายยอดไลก์ (Like Goal):</span>
              <span className="font-mono font-bold text-pink-400 text-sm">
                {settings.likeGoal.toLocaleString()} ไลก์
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={settings.likeGoal}
              onChange={(e) => onUpdateSettings({ likeGoal: Number(e.target.value) })}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>5,000</span>
              <span>50,000</span>
              <span>100,000 ไลก์</span>
            </div>
          </div>

          {/* 3. Toggle Options */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block">จำนวน Top Fan ที่แสดง:</label>
              <select
                value={settings.likeShowTopCount}
                onChange={(e) => onUpdateSettings({ likeShowTopCount: Number(e.target.value) as any })}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-pink-400"
              >
                <option value={3}>แสดง Top 3 อันดับ</option>
                <option value={5}>แสดง Top 5 อันดับ</option>
                <option value={10}>แสดง Top 10 อันดับ</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 mb-1 block">แถบความคืบหน้า (Goal Bar):</label>
              <button
                type="button"
                onClick={() => onUpdateSettings({ likeShowGoalBar: !settings.likeShowGoalBar })}
                className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  settings.likeShowGoalBar
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                    : 'bg-slate-950 text-slate-400 border-white/10'
                }`}
              >
                {settings.likeShowGoalBar ? '✓ เปิดแถบเป้าหมาย' : '✕ ปิดแถบเป้าหมาย'}
              </button>
            </div>
          </div>

          {/* 4. Current Count & Reset to 0 Button */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">ยอดไลก์สะสมปัจจุบัน:</span>
              <span className="font-mono font-bold text-pink-300 text-base">
                {totalLikes.toLocaleString()} ไลก์
              </span>
            </div>
            <button
              onClick={onResetLikes}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="รีเซ็ตยอดไลก์และกระดานอันดับเป็น 0 สำหรับเริ่มไลฟ์สดใหม่"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตเป็น 0 ไลก์</span>
            </button>
          </div>

          {/* 5. OBS Browser Source Link for Leaderboard */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-pink-300">ลิงก์ OBS สำหรับ Like Leaderboard:</span>
              <span className="font-mono text-[10px] text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded border border-pink-400/20">
                ขนาด: 380 × 520 px
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onCopyUrl('leaderboard')}
                className="flex-1 py-2 px-3 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/40 text-pink-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.15)]"
              >
                {copiedKey === 'leaderboard' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-400">คัดลอกลิงก์ OBS สำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกลิงก์ OBS ยอดไลก์</span>
                  </>
                )}
              </button>
              <a
                href={`${window.location.origin}?mode=overlay&overlay=leaderboard`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                title="เปิดดูตัวอย่าง Overlay ในแท็บใหม่"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY 3: GIFT OVERLAY ONLY */}
      {/* ========================================================================= */}
      {selectedCategory === 'gift' && (
        <div className="bg-slate-900/80 border border-amber-500/20 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>ปรับแต่งเฉพาะ: การแจ้งเตือนของขวัญ (Gift Overlay)</span>
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
              WIDGET #3
            </span>
          </div>

          {/* 1. Gift Alert Style */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">สไตล์แบนเนอร์ของขวัญ:</label>
            <select
              value={settings.giftStyle}
              onChange={(e) => onUpdateSettings({ giftStyle: e.target.value as any })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="banner-epic">3D Epic Banner (แบนเนอร์ 3 มิตินูนเด่น พร้อมแสงส่อง)</option>
              <option value="card-hologram">Hologram Cyber Card (การ์ดโฮโลแกรมนีออน)</option>
              <option value="kawaii-pop">Kawaii Pop Badge (สไตล์น่ารักสดใส)</option>
              <option value="minimal-modern">Minimal Modern (เรียบหรู คลีน มินิมอล)</option>
            </select>
          </div>

          {/* 2. Duration & Particles */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block font-medium">ระยะเวลาแสดงบนจอ:</label>
              <select
                value={settings.giftDuration}
                onChange={(e) => onUpdateSettings({ giftDuration: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value={3}>3 วินาที (กระชับ)</option>
                <option value={5}>5 วินาที (แนะนำ)</option>
                <option value={8}>8 วินาที (ยาวนาน)</option>
                <option value={10}>10 วินาที</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 mb-1 block font-medium">เอฟเฟกต์ละอองดาว (Confetti):</label>
              <button
                type="button"
                onClick={() => onUpdateSettings({ giftShowParticles: !settings.giftShowParticles })}
                className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  settings.giftShowParticles
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 border-white/10'
                }`}
              >
                {settings.giftShowParticles ? '✓ เปิดละอองดาวกระจาย' : '✕ ปิดละอองดาว'}
              </button>
            </div>
          </div>

          {/* 3. Sound Volume & Sound Toggle */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.giftSoundEnabled}
                  onChange={(e) => onUpdateSettings({ giftSoundEnabled: e.target.checked })}
                  className="rounded accent-amber-400"
                />
                <span>เสียง Sound FX ของขวัญ</span>
              </label>
              <span className="font-mono text-amber-400 text-xs">
                {settings.giftSoundVolume}%
              </span>
            </div>
            {settings.giftSoundEnabled && (
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.giftSoundVolume}
                onChange={(e) => onUpdateSettings({ giftSoundVolume: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            )}
          </div>

          {/* 4. OBS Link for Gift */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300">ลิงก์ OBS สำหรับ Gift Overlay:</span>
              <span className="font-mono text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                ขนาด: 450 × 320 px
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onCopyUrl('gift')}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(245,158,11,0.15)]"
              >
                {copiedKey === 'gift' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-400">คัดลอกลิงก์ OBS สำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกลิงก์ OBS ของขวัญ</span>
                  </>
                )}
              </button>
              <a
                href={`${window.location.origin}?mode=overlay&overlay=gift`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                title="เปิดดูตัวอย่าง Overlay ในแท็บใหม่"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY 4: FOLLOW ALERT ONLY */}
      {/* ========================================================================= */}
      {selectedCategory === 'follow' && (
        <div className="bg-slate-900/80 border border-rose-500/20 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-rose-400" />
              <span>ปรับแต่งเฉพาะ: แจ้งเตือนผู้ติดตาม (Follow Alert)</span>
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-400/10 text-rose-300 border border-rose-400/20">
              WIDGET #4
            </span>
          </div>

          {/* 1. Style Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">สไตล์แบนเนอร์ผู้ติดตามใหม่:</label>
            <select
              value={settings.followStyle}
              onChange={(e) => onUpdateSettings({ followStyle: e.target.value as any })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
            >
              <option value="neon-banner">Neon Ribbon Glow (แถบนีออนเรืองแสงสะดุดตา)</option>
              <option value="kawaii-badge">Kawaii Badge (ป้ายสไตล์น่ารักสดใส)</option>
              <option value="card-glow">Card Glow 3D (การ์ดลอย 3 มิติ)</option>
              <option value="minimal-pill">Minimal Pill (แคปซูลมินิมอล)</option>
            </select>
          </div>

          {/* 2. Duration & Sound */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block font-medium">ระยะเวลาแสดงบนจอ:</label>
              <select
                value={settings.followDuration}
                onChange={(e) => onUpdateSettings({ followDuration: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-400"
              >
                <option value={3}>3 วินาที (กระชับ)</option>
                <option value={5}>5 วินาที (แนะนำ)</option>
                <option value={8}>8 วินาที</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 mb-1 block font-medium">เสียง Sound FX:</label>
              <button
                type="button"
                onClick={() => onUpdateSettings({ followSoundEnabled: !settings.followSoundEnabled })}
                className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  settings.followSoundEnabled
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-950 text-slate-400 border-white/10'
                }`}
              >
                {settings.followSoundEnabled ? '✓ เปิดเสียงแจ้งเตือน' : '✕ ปิดเสียง'}
              </button>
            </div>
          </div>

          {/* 3. Follow TTS Announcement */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">AI TTS ขานชื่อผู้ติดตาม:</span>
              <span className="text-[11px] text-slate-400">เช่น "ขอบคุณ คุณ... ที่กดติดตามนะคะ"</span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ followTtsEnabled: !settings.followTtsEnabled })}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                settings.followTtsEnabled
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900 border-white/10 text-slate-400'
              }`}
            >
              {settings.followTtsEnabled ? '✓ เปิดอ่านชื่อ' : '✕ ปิด'}
            </button>
          </div>

          {/* 4. OBS Link for Follow */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-300">ลิงก์ OBS สำหรับ Follow Alert:</span>
              <span className="font-mono text-[10px] text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20">
                ขนาด: 400 × 120 px
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onCopyUrl('follow')}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(244,63,94,0.15)]"
              >
                {copiedKey === 'follow' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-400">คัดลอกลิงก์ OBS สำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกลิงก์ OBS ผู้ติดตาม</span>
                  </>
                )}
              </button>
              <a
                href={`${window.location.origin}?mode=overlay&overlay=follow`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                title="เปิดดูตัวอย่าง Overlay ในแท็บใหม่"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY 5: SHARE ALERT ONLY */}
      {/* ========================================================================= */}
      {selectedCategory === 'share' && (
        <div className="bg-slate-900/80 border border-teal-500/20 rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-teal-400" />
              <span>ปรับแต่งเฉพาะ: แจ้งเตือนคนแชร์ไลฟ์ (Share Alert)</span>
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-400/10 text-teal-300 border border-teal-400/20">
              WIDGET #5
            </span>
          </div>

          {/* 1. Style Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">สไตล์แบนเนอร์คนแชร์ไลฟ์:</label>
            <select
              value={settings.shareStyle}
              onChange={(e) => onUpdateSettings({ shareStyle: e.target.value as any })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
            >
              <option value="neon-banner">Teal Cyber Glow (แถบไซยานนีออนล้ำสมัย)</option>
              <option value="kawaii-badge">Kawaii Badge (ป้ายสไตล์น่ารักสดใส)</option>
              <option value="card-glow">Card Glow 3D (การ์ดลอย 3 มิติ)</option>
              <option value="minimal-pill">Minimal Pill (แคปซูลมินิมอล)</option>
            </select>
          </div>

          {/* 2. Duration & Sound */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="text-slate-400 mb-1 block font-medium">ระยะเวลาแสดงบนจอ:</label>
              <select
                value={settings.shareDuration}
                onChange={(e) => onUpdateSettings({ shareDuration: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-400"
              >
                <option value={3}>3 วินาที (กระชับ)</option>
                <option value={5}>5 วินาที (แนะนำ)</option>
                <option value={8}>8 วินาที</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 mb-1 block font-medium">เสียง Sound FX:</label>
              <button
                type="button"
                onClick={() => onUpdateSettings({ shareSoundEnabled: !settings.shareSoundEnabled })}
                className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  settings.shareSoundEnabled
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-slate-950 text-slate-400 border-white/10'
                }`}
              >
                {settings.shareSoundEnabled ? '✓ เปิดเสียงแจ้งเตือน' : '✕ ปิดเสียง'}
              </button>
            </div>
          </div>

          {/* 3. Share TTS Announcement */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">AI TTS ขอบคุณคนแชร์:</span>
              <span className="text-[11px] text-slate-400">เช่น "ขอบคุณ คุณ... ที่ช่วยแชร์ไลฟ์นะคะ"</span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ shareTtsEnabled: !settings.shareTtsEnabled })}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                settings.shareTtsEnabled
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                  : 'bg-slate-900 border-white/10 text-slate-400'
              }`}
            >
              {settings.shareTtsEnabled ? '✓ เปิดอ่านขอบคุณ' : '✕ ปิด'}
            </button>
          </div>

          {/* 4. OBS Link for Share */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-300">ลิงก์ OBS สำหรับ Share Alert:</span>
              <span className="font-mono text-[10px] text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20">
                ขนาด: 400 × 120 px
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onCopyUrl('share')}
                className="flex-1 py-2 px-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(20,184,166,0.15)]"
              >
                {copiedKey === 'share' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-400">คัดลอกลิงก์ OBS สำเร็จ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกลิงก์ OBS คนแชร์</span>
                  </>
                )}
              </button>
              <a
                href={`${window.location.origin}?mode=overlay&overlay=share`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer"
                title="เปิดดูตัวอย่าง Overlay ในแท็บใหม่"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CATEGORY 6: SUBATHON TIMER ONLY */}
      {/* ========================================================================= */}
      {selectedCategory === 'subathon' && (
        <div className="space-y-4">
          <SubathonControlCard
            seconds={subathonSeconds}
            isRunning={subathonIsRunning}
            onTogglePlay={onToggleSubathon}
            onAddSeconds={onAddSubathonTime}
            onResetTimer={onResetSubathon}
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onCopyObsUrl={(type) => onCopyUrl(type as any)}
          />
        </div>
      )}

      {/* 3. Dedicated OBS Universal Bundle Helper - Always helpful at bottom */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-950 to-cyan-950/20 border border-white/10 rounded-3xl p-4 text-xs space-y-2">
        <div className="flex items-center justify-between text-slate-300">
          <span className="font-bold flex items-center gap-1.5 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>คัดลอกด่วนสำหรับ OBS Studio:</span>
          </span>
          <span className="text-[10px] text-slate-400">คลิกเพื่อคัดลอก URL</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => onCopyUrl('chat')}
            className="py-1.5 px-2 rounded-xl bg-slate-950 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 text-[11px] font-bold truncate transition-all cursor-pointer"
          >
            {copiedKey === 'chat' ? '✓ 2. แชทสด' : '2. ลิงก์แชทสด'}
          </button>
          <button
            onClick={() => onCopyUrl('leaderboard')}
            className="py-1.5 px-2 rounded-xl bg-slate-950 border border-pink-500/30 hover:border-pink-400 text-pink-300 text-[11px] font-bold truncate transition-all cursor-pointer"
          >
            {copiedKey === 'leaderboard' ? '✓ 1. ยอดไลก์' : '1. ลิงก์ยอดไลก์'}
          </button>
          <button
            onClick={() => onCopyUrl('subathon')}
            className="py-1.5 px-2 rounded-xl bg-slate-950 border border-purple-500/30 hover:border-purple-400 text-purple-300 text-[11px] font-bold truncate transition-all cursor-pointer"
          >
            {copiedKey === 'subathon' ? '✓ 6. Subathon' : '6. ลิงก์ Subathon'}
          </button>
          <button
            onClick={() => onCopyUrl('gift')}
            className="py-1.5 px-2 rounded-xl bg-slate-950 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-[11px] font-bold truncate transition-all cursor-pointer"
          >
            {copiedKey === 'gift' ? '✓ 3. ของขวัญ' : '3. ของขวัญ'}
          </button>
          <button
            onClick={() => onCopyUrl('follow')}
            className="py-1.5 px-2 rounded-xl bg-slate-950 border border-rose-500/30 hover:border-rose-400 text-rose-300 text-[11px] font-bold truncate transition-all cursor-pointer"
          >
            {copiedKey === 'follow' ? '✓ 4. Follow' : '4. ผู้ติดตาม'}
          </button>
          <button
            onClick={() => onCopyUrl('share')}
            className="py-1.5 px-2 rounded-xl bg-slate-950 border border-teal-500/30 hover:border-teal-400 text-teal-300 text-[11px] font-bold truncate transition-all cursor-pointer"
          >
            {copiedKey === 'share' ? '✓ 5. Share' : '5. คนแชร์'}
          </button>
        </div>
      </div>
    </div>
  );
};
