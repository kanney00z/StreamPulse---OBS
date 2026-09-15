import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  MessageSquare,
  Gift,
  Heart,
  Play,
  RotateCcw,
  Sliders,
  Eye,
  Smile,
  Zap,
  Check,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { OverlayCustomSettings } from '../types';
import { CUTE_ANIMAL_SPECIES, SHIBA_BREEDS } from './StreamAvatarSprites';

interface StreamAvatarControlCardProps {
  settings: OverlayCustomSettings;
  onUpdateSettings: (newSettings: Partial<OverlayCustomSettings>) => void;
  onTriggerAvatarChat?: (text?: string) => void;
  onTriggerAvatarJump?: () => void;
  onTriggerAvatarCheer?: () => void;
  onTriggerAvatarGift?: () => void;
  onTriggerFollow?: () => void;
  onTriggerShare?: () => void;
}

export const StreamAvatarControlCard: React.FC<StreamAvatarControlCardProps> = ({
  settings,
  onUpdateSettings,
  onTriggerAvatarChat,
  onTriggerAvatarJump,
  onTriggerAvatarCheer,
  onTriggerAvatarGift,
  onTriggerFollow,
  onTriggerShare,
}) => {
  const [testSpeech, setTestSpeech] = useState('');

  const handleSpeechSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onTriggerAvatarChat) {
      onTriggerAvatarChat(testSpeech.trim() || 'สวัสดีครับทุกคน! มาดูสตรีมกันเยอะๆ นะ ✨');
      setTestSpeech('');
    }
  };

  const avatarStyles = [
    {
      id: 'shiba-squad' as const,
      name: 'Chubby Shiba Squad',
      nameTh: 'แก๊งชิบะดุ๊กดิ๊ก (BigBoy & Friends)',
      desc: 'น้องหมาชิบะแก้มยุ้ย หางม้วนดุ๊กดิ๊ก แว่นกลม แฟชั่นหลากสี รองรับคำสั่ง !spawn',
      icon: '🐕',
      badge: 'แนะนำตามคลิป!',
    },
    {
      id: 'cute-animals' as const,
      name: 'Cute Animals',
      nameTh: 'แก๊งสัตว์น่ารัก (16 ชนิด)',
      desc: 'กะปิบาร่า, ชิบะ, แพนด้า, กระต่าย, แพนด้าแดง, แอกโซลอเติล, แฮมสเตอร์, นาก, จิ้งจอก, สลอธ ฯลฯ',
      icon: '🐾',
      badge: '16 ชนิดใหม่!',
    },
    {
      id: 'chibi-pixel' as const,
      name: 'Chibi Pixel',
      nameTh: 'ตัวละครพิกเซล Chibi',
      desc: 'อัศวิน, นักเวทย์, สาวแมว Neko, นินจา, ไอดอล',
      icon: '🧙‍♂️',
      badge: 'ฮิตสุด',
    },
    {
      id: 'kawaii-slimes' as const,
      name: 'Kawaii Slimes',
      nameTh: 'สไลม์เยลลี่เด้งดึ๋ง',
      desc: 'สไลม์เจลลี่หลากสี พร้อมมงกุฎ หัวใจ ดาวเรืองแสง',
      icon: '🫧',
      badge: 'สดใส',
    },
    {
      id: 'cyber-mecha' as const,
      name: 'Cyber Mecha',
      nameTh: 'หุ่นยนต์ไซเบอร์พังค์',
      desc: 'บอทนักรบเรืองแสง ไวเซอร์นีออน เสาอากาศส่งสัญญาณ',
      icon: '🤖',
      badge: 'ล้ำยุค',
    },
  ];

  const floorStyles = [
    { id: 'transparent' as const, name: 'โปร่งใส (Transparent)', desc: 'เหมาะซ้อนทับภาพเกม OBS ไร้กรอบ' },
    { id: 'neon-line' as const, name: 'เส้นนีออน (Neon Line)', desc: 'แถบขอบไฟไซยานเรืองแสง' },
    { id: 'grass-platform' as const, name: 'สนามหญ้า (Grass)', desc: 'พื้นหญ้าเขียวพร้อมดอกเดซี่' },
    { id: 'cyber-grid' as const, name: 'กริดไซเบอร์ (Cyber Grid)', desc: 'ตารางนีออนม่วงชมพู' },
  ];

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-2xl space-y-6">
      {/* Header: Title & Master Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 p-0.5 shadow-[0_0_15px_rgba(236,72,153,0.4)] flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Users className="w-5 h-5 text-pink-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Stream Avatars (ตัวละครเดินบนจอ)
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse">
                LIVE INTERACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ตัวละครตัวแทนคนดูเดินเล่นบนหน้าจอ กระโดด เต้น และคุยผ่านบอลลูนข้อความ
            </p>
          </div>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-2.5 bg-slate-950 p-1.5 px-3 rounded-2xl border border-white/10">
          <span className="text-xs font-semibold text-slate-300">
            {settings.avatarEnabled ? 'เปิดใช้งาน (Active)' : 'ปิดไว้ (Disabled)'}
          </span>
          <button
            onClick={() => onUpdateSettings({ avatarEnabled: !settings.avatarEnabled })}
            className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
              settings.avatarEnabled ? 'bg-pink-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-md ${
                settings.avatarEnabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Viewer Count Controller (Slider + Quick Spawners) */}
      <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              จำนวนตัวละครคนดูที่กำลังเดิน (Viewer Count):
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-cyan-300 font-mono">
              {settings.avatarViewerCount}
            </span>
            <span className="text-xs text-slate-400">ตัว</span>
          </div>
        </div>

        {/* Range Slider (Supports 0 to 30 viewers) */}
        <input
          type="range"
          min="0"
          max="30"
          value={settings.avatarViewerCount ?? 8}
          onChange={(e) => onUpdateSettings({ avatarViewerCount: Number(e.target.value) })}
          className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
        />

        {/* Dynamic Presence Status & Quick presets */}
        <div className="flex items-center justify-between gap-1.5 pt-1 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* 0 Viewers Test Button: "ถ้าไม่มีคนดูก็ให้มันหายไป" */}
            <button
              onClick={() => onUpdateSettings({ avatarViewerCount: 0 })}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                settings.avatarViewerCount === 0
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-400/60 shadow-sm'
                  : 'bg-slate-900 text-rose-400 hover:text-rose-300 border border-rose-500/20'
              }`}
            >
              <span>😴</span>
              <span>0 คนดู (ให้หายไป)</span>
            </button>

            {[3, 6, 12, 20].map((cnt) => (
              <button
                key={cnt}
                onClick={() => onUpdateSettings({ avatarViewerCount: cnt })}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  settings.avatarViewerCount === cnt
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {cnt} คนดู
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() =>
                onUpdateSettings({
                  avatarViewerCount: Math.min(30, (settings.avatarViewerCount || 0) + 1),
                })
              }
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-pink-500/20 text-pink-300 border border-pink-400/40 hover:bg-pink-500/30 transition-all cursor-pointer"
            >
              +1 เรียกคนดูเพิ่ม
            </button>
          </div>
        </div>

        {/* Note on Dynamic Presence */}
        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 bg-slate-900/60 p-2 rounded-xl border border-white/5">
          <span className="text-amber-400">💡</span>
          <span>
            {settings.avatarViewerCount === 0
              ? 'สถานะ: ไม่มีคนดู (0 คน) — ตัวละครจะโบกมือลาและเดินออกจากจออย่างนุ่มนวล'
              : `สถานะ: มีคนดู ${settings.avatarViewerCount} คน — ตัวละครกำลังเดินเล่น ทำท่าทาง และพูดคุย`}
          </span>
        </div>
      </div>

      {/* Interactive Trigger Deck for Streamer */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-pink-950/30 to-cyan-950/40 border border-pink-500/20 space-y-3">
        <span className="text-xs font-bold text-pink-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>ปุ่มสั่งแอนิเมชันโต้ตอบตัวละคร (Interactive Actions):</span>
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          <button
            onClick={onTriggerAvatarJump}
            className="py-2 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-xs font-bold text-white transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:border-cyan-400"
          >
            <span>🦘</span>
            <span>กระโดด</span>
          </button>

          <button
            onClick={onTriggerAvatarCheer}
            className="py-2 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-xs font-bold text-pink-300 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:border-pink-400"
          >
            <span>💃</span>
            <span>ส่งเสียงเชียร์</span>
          </button>

          <button
            onClick={onTriggerAvatarGift}
            className="py-2 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-xs font-bold text-amber-300 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:border-amber-400"
          >
            <span>🎁</span>
            <span>ของขวัญ</span>
          </button>

          {/* Follow Simulation: "พวกกดติดตาม" */}
          <button
            onClick={onTriggerFollow}
            className="py-2 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-400/40 text-xs font-bold text-amber-300 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:border-amber-300"
          >
            <span>⭐</span>
            <span>กดติดตาม</span>
          </button>

          {/* Share Simulation: "พวกกดแชร์" */}
          <button
            onClick={onTriggerShare}
            className="py-2 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-400/40 text-xs font-bold text-cyan-300 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:border-cyan-300"
          >
            <span>📢</span>
            <span>กดแชร์</span>
          </button>

          <button
            onClick={() => onTriggerAvatarChat?.('ขอบคุณที่ติดตามสตรีมครับ! ❤️')}
            className="py-2 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-xs font-bold text-emerald-300 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm hover:border-emerald-400"
          >
            <span>💬</span>
            <span>สุ่มคุย</span>
          </button>
        </div>

        {/* Custom Speech Balloon Input */}
        <form onSubmit={handleSpeechSubmit} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            placeholder="พิมพ์ข้อความให้ตัวละครพูดบนจอ (เช่น: ยินดีต้อนรับทุกคนครับ)..."
            value={testSpeech}
            onChange={(e) => setTestSpeech(e.target.value)}
            className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold text-xs transition-all shadow-md cursor-pointer whitespace-nowrap"
          >
            ส่งบอลลูน 💬
          </button>
        </form>
      </div>

      {/* Avatar Style Selector (4 Themes) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎭 สไตล์ตัวละคร (Character Theme):</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {avatarStyles.map((theme) => {
            const isSelected = settings.avatarStyle === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onUpdateSettings({ avatarStyle: theme.id })}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 relative ${
                  isSelected
                    ? 'bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-slate-900 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.25)] ring-1 ring-pink-400/40'
                    : 'bg-slate-950/80 border-white/10 hover:border-white/20 hover:bg-slate-900'
                }`}
              >
                <div className="text-2xl pt-0.5">{theme.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-xs font-bold text-white truncate">{theme.nameTh}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-pink-500/20 text-pink-300 font-extrabold border border-pink-400/30">
                      {theme.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{theme.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* 🐕 Chubby Shiba Squad Showcase (Matching Video) */}
        {settings.avatarStyle === 'shiba-squad' && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-slate-950 border border-amber-500/40 space-y-3.5 mt-3 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐕</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-200">
                      แก๊งชิบะดุ๊กดิ๊ก (Chubby Shiba Squad)
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400/40 font-extrabold">
                      ตามคลิปวิดีโอ 100%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    หางม้วนดุ๊กดิ๊ก แก้มยุ้ย ขาสั้นเตาะแตะ หน้ากากขาว จุดคิ้วขาว และแว่นตาสุดคิ้วท์
                  </p>
                </div>
              </div>

              {/* Quick !spawn Simulator Button */}
              {onTriggerAvatarChat && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onTriggerAvatarChat('!spawn')}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>กดจำลอง !spawn</span>
                  </button>
                  <button
                    onClick={() => onTriggerAvatarChat('Hello stream! 🐶')}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer"
                  >
                    บ๊อกๆ
                  </button>
                </div>
              )}
            </div>

            {/* Roster Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SHIBA_BREEDS.map((breed) => (
                <div
                  key={breed.id}
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-amber-400/50 transition-all space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full border border-white/30 shrink-0"
                        style={{ backgroundColor: breed.coat }}
                      />
                      <span className="text-[11px] font-bold text-white group-hover:text-amber-300 truncate">
                        {breed.name}
                      </span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-white/10 text-slate-300">
                      {breed.badge}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    {breed.accessory === 'glasses' && <span>👓 แว่นกลม</span>}
                    {breed.accessory === 'bell-collar' && <span>🔔 กระดิ่งทอง</span>}
                    {breed.accessory === 'bandana' && <span>🧣 ผ้าพันคอ</span>}
                    {breed.accessory === 'flower' && <span>🌸 ดอกไม้</span>}
                    {breed.accessory === 'crown' && <span>👑 มงกุฎ</span>}
                    {breed.accessory === 'none' && <span>🐾 แก้มยุ้ย</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Feature Tip Card */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/20 flex items-start gap-2.5">
              <span className="text-base shrink-0">💡</span>
              <div className="text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-amber-300">ระบบคำสั่งแชทสด !spawn:</strong> ผู้ชมในช่องแชท YouTube / TikTok สามารถพิมพ์ <code className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">!spawn</code> เพื่อเรียกตัวละครน้องชิบะส่วนตัวพร้อมชื่อตนเองขึ้นมาเดินเล่นบนหน้าจอสตรีมได้ทันที!
              </div>
            </div>
          </div>
        )}

        {/* 🐾 Cute Animals Zoo Gallery (16 Species) */}
        {settings.avatarStyle === 'cute-animals' && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-950 border border-amber-500/30 space-y-3 mt-3 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🐾</span>
                <span className="text-xs font-bold text-amber-300">
                  แก๊งสัตว์น่ารักทั้ง 16 ชนิด (Cute Animal Roster)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30 font-bold">
                  16 ชนิด
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                เดินเล่นบนจอพร้อมกันตามจำนวนผู้ชมที่ตั้งไว้
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CUTE_ANIMAL_SPECIES.map((animal) => (
                <div
                  key={animal.id}
                  className="p-2 rounded-xl bg-slate-900/85 border border-white/10 hover:border-amber-400/40 transition-all flex items-center gap-2.5 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/20 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                    {animal.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-white truncate group-hover:text-amber-300">
                      {animal.nameTh}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate">
                      {animal.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Display Customization Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Size */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300">ขนาดตัวละคร (Size):</label>
          <div className="grid grid-cols-3 gap-1">
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <button
                key={s}
                onClick={() => onUpdateSettings({ avatarSize: s })}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  settings.avatarSize === s
                    ? 'bg-pink-500/25 text-pink-300 border border-pink-400/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {s === 'sm' ? 'เล็ก' : s === 'md' ? 'กลาง' : 'ใหญ่'}
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300">ความเร็วเดิน (Speed):</label>
          <div className="grid grid-cols-3 gap-1">
            {[1.5, 2.5, 4].map((spd, i) => (
              <button
                key={spd}
                onClick={() => onUpdateSettings({ avatarSpeed: spd })}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  settings.avatarSpeed === spd
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                }`}
              >
                {i === 0 ? 'ช้า' : i === 1 ? 'ปกติ' : 'ว่องไว'}
              </button>
            ))}
          </div>
        </div>

        {/* Floor Style */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 space-y-1.5">
          <label className="text-[11px] font-bold text-slate-300">พื้นเดิน (Floor Style):</label>
          <select
            value={settings.avatarFloorStyle}
            onChange={(e) =>
              onUpdateSettings({
                avatarFloorStyle: e.target.value as any,
              })
            }
            className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
          >
            {floorStyles.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feature Checkbox Toggles */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={settings.avatarShowNametags}
            onChange={(e) => onUpdateSettings({ avatarShowNametags: e.target.checked })}
            className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400 bg-slate-900 border-white/20"
          />
          <span>แสดงป้ายชื่อคนดู & ยศ (VIP / MOD)</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={settings.avatarShowChatBubbles}
            onChange={(e) => onUpdateSettings({ avatarShowChatBubbles: e.target.checked })}
            className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400 bg-slate-900 border-white/20"
          />
          <span>บอลลูนข้อความแชทสดลอยขึ้นจากตัวละคร (Speech Bubbles)</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={settings.avatarShowLikesReaction}
            onChange={(e) => onUpdateSettings({ avatarShowLikesReaction: e.target.checked })}
            className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400 bg-slate-900 border-white/20"
          />
          <span>หัวใจพุ่ง & กระโดดเมื่อมีคนกดไลก์ (Like Reaction)</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
          <input
            type="checkbox"
            checked={settings.avatarShowGiftsReaction}
            onChange={(e) => onUpdateSettings({ avatarShowGiftsReaction: e.target.checked })}
            className="w-4 h-4 rounded text-pink-500 focus:ring-pink-400 bg-slate-900 border-white/20"
          />
          <span>เต้นและแสดงข้อความขอบคุณเมื่อมีคนเปย์ของขวัญ (Gift Reaction)</span>
        </label>

        {/* Dynamic Presence Checkbox: ถ้าไม่มีคนดู (0 คน) ให้หายไป */}
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-amber-200 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
          <input
            type="checkbox"
            checked={settings.avatarDynamicPresence !== false}
            onChange={(e) => onUpdateSettings({ avatarDynamicPresence: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-white/20"
          />
          <span>🚶‍♂️ ถ้ามีคนเข้ามาดูก็ให้มีตัวละครเดินได้ แต่ถ้าไม่มี (0 คน) ก็ให้มันหายไป</span>
        </label>

        {/* Follow Reaction Checkbox: พวกกดติดตาม */}
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-amber-300 bg-slate-900/60 p-2 rounded-xl border border-white/10">
          <input
            type="checkbox"
            checked={settings.avatarShowFollowReaction !== false}
            onChange={(e) => onUpdateSettings({ avatarShowFollowReaction: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-white/20"
          />
          <span>⭐ พวกกดติดตาม: ตัวละครกระโดดดีใจ & มีตัวแทนคนติดตามเดินออกมา (Follow Reaction)</span>
        </label>

        {/* Share Reaction Checkbox: พวกกดแชร์ */}
        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-cyan-300 bg-slate-900/60 p-2 rounded-xl border border-white/10">
          <input
            type="checkbox"
            checked={settings.avatarShowShareReaction !== false}
            onChange={(e) => onUpdateSettings({ avatarShowShareReaction: e.target.checked })}
            className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-white/20"
          />
          <span>📢 พวกกดแชร์: ตัวละครเต้นฉลอง & มีตัวแทนคนแชร์จรวดเดินออกมา (Share Reaction)</span>
        </label>
      </div>
    </div>
  );
};
