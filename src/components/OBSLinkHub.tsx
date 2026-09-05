import React, { useState } from 'react';
import {
  Copy,
  Check,
  ExternalLink,
  Sliders,
  HelpCircle,
  Sparkles,
  Heart,
  MessageSquare,
  Gift,
  Layers,
  MonitorPlay,
  Radio,
  Wifi,
  UserPlus,
  Share2,
  Bell,
  Timer,
  Flame,
  Crown,
  Zap,
} from 'lucide-react';
import { OverlayCustomSettings, ChatThemeId, SubathonThemeId } from '../types';
import { CHAT_THEMES, SUBATHON_THEMES } from '../data/mockData';

interface OBSLinkHubProps {
  settings: OverlayCustomSettings;
  onUpdateSettings: (newSettings: Partial<OverlayCustomSettings>) => void;
  onSelectPreviewTab: (tab: 'chat' | 'leaderboard' | 'gift' | 'follow' | 'share' | 'alerts' | 'subathon' | 'all') => void;
  onSelectIndoFinityTab?: () => void;
}

export const OBSLinkHub: React.FC<OBSLinkHubProps> = ({
  settings,
  onUpdateSettings,
  onSelectPreviewTab,
  onSelectIndoFinityTab,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customWsPort, setCustomWsPort] = useState('62024');

  // Get current window origin or fallback
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const getOverlayUrl = (type: 'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'alerts' | 'subathon' | 'all') => {
    const params = new URLSearchParams();
    params.set('mode', 'overlay');
    params.set('overlay', type);
    params.set('ws', `ws://localhost:${customWsPort.trim() || '62024'}`);

    if (type === 'chat' || type === 'all') {
      params.set('theme', settings.chatTheme);
      params.set('autohide', settings.chatAutoHideSeconds.toString());
      params.set('fontsize', settings.chatFontSize);
      params.set('avatars', settings.chatShowAvatars ? '1' : '0');
      if (settings.chatTtsEnabled) {
        params.set('tts', '1');
        params.set('ttsformat', settings.chatTtsFormat);
        params.set('ttsspeed', settings.chatTtsSpeed.toString());
        params.set('ttspitch', settings.chatTtsPitch.toString());
        params.set('ttsvol', settings.chatTtsVolume.toString());
        params.set('ttssweet', settings.chatTtsSweetEnding ? '1' : '0');
        if (settings.chatTtsVoice && settings.chatTtsVoice !== 'default') {
          params.set('ttsvoice', settings.chatTtsVoice);
        }
      }
    }

    if (type === 'leaderboard' || type === 'all') {
      params.set('style', settings.likeStyle);
      params.set('goal', settings.likeGoal.toString());
      params.set('top', settings.likeShowTopCount.toString());
      params.set('showgoal', settings.likeShowGoalBar ? '1' : '0');
    }

    if (type === 'gift' || type === 'alerts' || type === 'all') {
      params.set('duration', settings.giftDuration.toString());
      params.set('particles', settings.giftShowParticles ? '1' : '0');
    }

    if (type === 'follow' || type === 'alerts' || type === 'all') {
      params.set('follow', settings.followAlertEnabled ? '1' : '0');
      params.set('followtts', settings.followTtsEnabled ? '1' : '0');
      params.set('followdur', settings.followDuration.toString());
      params.set('followstyle', settings.followStyle);
    }

    if (type === 'share' || type === 'alerts' || type === 'all') {
      params.set('share', settings.shareAlertEnabled ? '1' : '0');
      params.set('sharetts', settings.shareTtsEnabled ? '1' : '0');
      params.set('sharedur', settings.shareDuration.toString());
      params.set('sharestyle', settings.shareStyle);
    }

    if (type === 'subathon') {
      params.set('subathontheme', settings.subathonTheme);
      params.set('subathontitle', settings.subathonTitle);
      params.set('subathoncap', settings.subathonMaxCapHours.toString());
    }

    return `${origin}?${params.toString()}`;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Immersive UI Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">OBS Browser Sources</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-emerald-400 text-xs font-medium">100% Transparent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Active Overlay Links</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            เลือกและคัดลอก URL ไปใส่ใน OBS Studio / Streamlabs เป็น Browser Source ได้ทันที
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSelectIndoFinityTab && (
            <button
              onClick={onSelectIndoFinityTab}
              className="bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold px-4 py-2.5 rounded-full transition-all text-xs flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>IndoFinity Bridge (62024)</span>
            </button>
          )}

          <button
            onClick={() => onSelectPreviewTab('all')}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] text-xs flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>พรีวิวบนจอสด (Live HUD)</span>
          </button>
        </div>
      </div>

      {/* IndoFinity Auto-Bridge Notice & Port Switcher */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-purple-950/30 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">รองรับ IndoFinity WebSocket (ws://localhost:62024)</span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                พร้อมใช้งาน
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              ทุกลิงก์ด้านล่างจะเชื่อมต่อกับโปรแกรม IndoFinity ในเครื่องของคุณโดยอัตโนมัติเมื่อเปิดใน OBS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs text-slate-400">พอร์ต WebSocket:</span>
          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-xl border border-white/10">
            <span className="text-[11px] text-slate-500 font-mono">ws://localhost:</span>
            <input
              type="text"
              value={customWsPort}
              onChange={(e) => setCustomWsPort(e.target.value)}
              className="w-14 bg-transparent text-cyan-300 font-mono text-xs focus:outline-none font-bold"
              placeholder="62024"
            />
          </div>
        </div>
      </div>

      {/* Main Categorized Cards - Horizontal Immersive UI Layout */}
      <div className="flex-1 grid grid-cols-1 gap-4">
        {/* Card 1: Like Leaderboard */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 flex flex-col lg:flex-row items-start lg:items-center gap-6 relative group overflow-hidden transition-all shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Mini Mock Screen */}
          <div className="w-full sm:w-44 h-28 bg-slate-950 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shrink-0 p-2.5">
            <div className="text-[10px] text-pink-400 space-y-1.5 w-full">
              <div className="bg-pink-500/15 p-1 rounded-lg border border-pink-500/30 flex items-center justify-between font-bold">
                <span>❤️ 14.2k ไลก์</span>
                <span className="bg-pink-500 text-white text-[9px] px-1.5 py-0.2 rounded font-black">1st</span>
              </div>
              <div className="bg-white/5 p-1 rounded-lg flex items-center justify-between opacity-70 text-slate-300">
                <span>❤️ 9.8k</span>
                <span>2nd</span>
              </div>
            </div>
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">380x540</div>
          </div>

          {/* Card Info & Customizer */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 text-xs font-bold uppercase tracking-widest">Featured • หมวดหมู่ 1</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 font-bold">
                เคาะจอสด
              </span>
            </div>
            <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
              1. Like Leaderboard (กระดานจัดอันดับไลก์)
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              กระดานจัดอันดับผู้กดไลก์สูงสุดแบบเรียลไทม์ พร้อมแท่น Podium แอนิเมชันหัวใจลอย และแถบเป้าหมายการกดไลก์
            </p>

            <div className="flex items-center gap-4 text-xs pt-1 flex-wrap text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>รูปแบบ:</span>
                <select
                  value={settings.likeStyle}
                  onChange={(e) =>
                    onUpdateSettings({
                      likeStyle: e.target.value as 'podium-card' | 'compact-ticker' | 'glass-list' | 'neon-glow',
                    })
                  }
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="podium-card">Podium 1st-3rd + รายชื่อ</option>
                  <option value="glass-list">รายชื่อ Minimal Glass</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>เป้าหมาย:</span>
                <span className="font-mono text-pink-300 font-bold">{settings.likeGoal.toLocaleString()} ไลก์</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span>ขนาดแนะนำ:</span>
                <span className="font-mono text-[11px] text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                  380 × 540 px
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0 justify-end">
            <button
              onClick={() => onSelectPreviewTab('leaderboard')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Customize</span>
            </button>
            <button
              onClick={() => copyToClipboard(getOverlayUrl('leaderboard'), 'leaderboard')}
              className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              {copiedKey === 'leaderboard' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">คัดลอกสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy OBS URL</span>
                </>
              )}
            </button>
            <a
              href={getOverlayUrl('leaderboard')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-center text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>เปิดทดสอบ</span>
            </a>
          </div>
        </div>

        {/* Card 2: Chat Overlay */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 flex flex-col lg:flex-row items-start lg:items-center gap-6 relative group overflow-hidden transition-all shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Mini Mock Screen */}
          <div className="w-full sm:w-44 h-28 bg-slate-950 rounded-xl border border-white/10 flex flex-col justify-center relative overflow-hidden shrink-0 p-2.5">
            <div className="space-y-1.5 w-full">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0"></div>
                <div className="h-2 w-16 bg-white/20 rounded"></div>
              </div>
              <div className="h-2 w-full bg-cyan-400/20 rounded"></div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shrink-0"></div>
                <div className="h-2 w-20 bg-white/15 rounded"></div>
              </div>
            </div>
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">420x650</div>
          </div>

          {/* Card Info & Customizer */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Utility • หมวดหมู่ 2</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                8 Themes
              </span>
            </div>
            <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              2. Chat Overlay (Glassmorphism & Cyber Themes)
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ultra-smooth message animations with blurred backdrop, multi-theme selector, and streamer badge support.
            </p>

            <div className="flex items-center gap-4 text-xs pt-1 flex-wrap text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>ธีมปัจจุบัน:</span>
                <select
                  value={settings.chatTheme}
                  onChange={(e) =>
                    onUpdateSettings({
                      chatTheme: e.target.value as ChatThemeId,
                    })
                  }
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 max-w-[150px] truncate"
                >
                  {CHAT_THEMES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>ซ่อนข้อความ:</span>
                <select
                  value={settings.chatAutoHideSeconds}
                  onChange={(e) =>
                    onUpdateSettings({
                      chatAutoHideSeconds: Number(e.target.value),
                    })
                  }
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value={0}>ไม่ซ่อน (แสดงตลอด)</option>
                  <option value={5}>5 วินาที</option>
                  <option value={10}>10 วินาที</option>
                  <option value={20}>20 วินาที</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>ขนาดแนะนำ:</span>
                <span className="font-mono text-[11px] text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                  420 × 650 px
                </span>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1 rounded-lg border border-white/10 hover:border-cyan-400/40 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.chatTtsEnabled}
                  onChange={(e) => onUpdateSettings({ chatTtsEnabled: e.target.checked })}
                  className="rounded accent-cyan-400"
                />
                <span className={settings.chatTtsEnabled ? 'text-pink-300 font-bold' : 'text-slate-400'}>
                  🌸 อ่านแชทเสียงหวานใส ({settings.chatTtsEnabled ? 'ON' : 'OFF'})
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0 justify-end">
            <button
              onClick={() => onSelectPreviewTab('chat')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Customize</span>
            </button>
            <button
              onClick={() => copyToClipboard(getOverlayUrl('chat'), 'chat')}
              className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              {copiedKey === 'chat' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">คัดลอกสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy OBS URL</span>
                </>
              )}
            </button>
            <a
              href={getOverlayUrl('chat')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-center text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>เปิดทดสอบ</span>
            </a>
          </div>
        </div>

        {/* Card 3: Gift Overlay */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 flex flex-col lg:flex-row items-start lg:items-center gap-6 relative group overflow-hidden transition-all shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Mini Mock Screen */}
          <div className="w-full sm:w-44 h-28 bg-slate-950 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shrink-0 p-2.5">
            <div className="text-3xl text-amber-400 animate-pulse mb-1">🎁</div>
            <div className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
              x5 COMBO!
            </div>
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">550x360</div>
          </div>

          {/* Card Info & Customizer */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Revenue • หมวดหมู่ 3</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                Combo Multiplier
              </span>
            </div>
            <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              3. Gift Alert Overlay (Neon Burst & Audio FX)
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Flashy alerts for virtual gifts with custom Web Audio sound triggers, confetti particles, and screen shake.
            </p>

            <div className="flex items-center gap-4 text-xs pt-1 flex-wrap text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>ระยะเวลา:</span>
                <select
                  value={settings.giftDuration}
                  onChange={(e) =>
                    onUpdateSettings({
                      giftDuration: Number(e.target.value),
                    })
                  }
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value={3}>3 วินาที</option>
                  <option value={5}>5 วินาที</option>
                  <option value={8}>8 วินาที</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>พลุกระดาษ:</span>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      giftShowParticles: !settings.giftShowParticles,
                    })
                  }
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    settings.giftShowParticles
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-950 text-slate-400 border border-white/10'
                  }`}
                >
                  {settings.giftShowParticles ? 'เปิด' : 'ปิด'}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span>ขนาดแนะนำ:</span>
                <span className="font-mono text-[11px] text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                  550 × 360 px
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0 justify-end">
            <button
              onClick={() => onSelectPreviewTab('gift')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Customize</span>
            </button>
            <button
              onClick={() => copyToClipboard(getOverlayUrl('gift'), 'gift')}
              className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              {copiedKey === 'gift' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">คัดลอกสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy OBS URL</span>
                </>
              )}
            </button>
            <a
              href={getOverlayUrl('gift')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-center text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>เปิดทดสอบ</span>
            </a>
          </div>
        </div>

        {/* Card 4: Follow Alert Overlay */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-pink-500/50 flex flex-col lg:flex-row items-start lg:items-center gap-6 relative group overflow-hidden transition-all shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Mini Mock Screen */}
          <div className="w-full sm:w-44 h-28 bg-slate-950 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shrink-0 p-2.5">
            <div className="text-3xl text-pink-400 animate-bounce mb-1">💖</div>
            <div className="text-[10px] font-bold text-pink-300 bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-500/30">
              NEW FOLLOWER!
            </div>
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">460x180</div>
          </div>

          {/* Card Info & Customizer */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-pink-400 text-xs font-bold uppercase tracking-widest">Community • หมวดหมู่ 4</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-300 border border-pink-500/20 font-bold">
                เสียงไทยหวานใส
              </span>
            </div>
            <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-pink-400" />
              4. Follow Alert (แจ้งเตือนผู้ติดตามใหม่)
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              แจ้งเตือนคนกดติดตามแบบเรียลไทม์ ป้ายแบนเนอร์ประกายวิ้งวับ พร้อมเสียงกระดิ่งคริสตัลใส และเสียงพูดไทยหวานใสขอบคุณอัตโนมัติ
            </p>

            <div className="flex items-center gap-4 text-xs pt-1 flex-wrap text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>ระยะเวลา:</span>
                <select
                  value={settings.followDuration}
                  onChange={(e) =>
                    onUpdateSettings({
                      followDuration: Number(e.target.value),
                    })
                  }
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-pink-400"
                >
                  <option value={3}>3 วินาที</option>
                  <option value={4}>4 วินาที</option>
                  <option value={6}>6 วินาที</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>เสียงพูดหวานใส:</span>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      followTtsEnabled: !settings.followTtsEnabled,
                    })
                  }
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    settings.followTtsEnabled
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                      : 'bg-slate-950 text-slate-400 border border-white/10'
                  }`}
                >
                  {settings.followTtsEnabled ? 'เปิดเสียงพูด' : 'ปิดเสียง'}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span>ขนาดแนะนำ:</span>
                <span className="font-mono text-[11px] text-pink-300 bg-pink-400/10 px-2 py-0.5 rounded border border-pink-400/20">
                  480 × 200 px
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0 justify-end">
            <button
              onClick={() => onSelectPreviewTab('follow')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Customize</span>
            </button>
            <button
              onClick={() => copyToClipboard(getOverlayUrl('follow'), 'follow')}
              className="px-4 py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-400 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(244,63,94,0.15)] cursor-pointer"
            >
              {copiedKey === 'follow' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">คัดลอกสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Follow Link</span>
                </>
              )}
            </button>
            <a
              href={getOverlayUrl('follow')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-center text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>เปิดทดสอบ</span>
            </a>
          </div>
        </div>

        {/* Card 5: Share Alert Overlay */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-teal-500/50 flex flex-col lg:flex-row items-start lg:items-center gap-6 relative group overflow-hidden transition-all shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Mini Mock Screen */}
          <div className="w-full sm:w-44 h-28 bg-slate-950 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shrink-0 p-2.5">
            <div className="text-3xl text-teal-400 animate-pulse mb-1">🚀</div>
            <div className="text-[10px] font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded-full border border-teal-500/30">
              SHARED LIVE!
            </div>
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">460x180</div>
          </div>

          {/* Card Info & Customizer */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-teal-400 text-xs font-bold uppercase tracking-widest">Viral • หมวดหมู่ 5</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-bold">
                แชร์ไลฟ์สด
              </span>
            </div>
            <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Share2 className="w-5 h-5 text-teal-400" />
              5. Share Alert (แจ้งเตือนคนกดแชร์ไลฟ์)
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              แจ้งเตือนคนกดแชร์ไลฟ์สด เพิ่มเอนเกจเมนต์และขอบคุณคนดูให้ช่วยดันช่อง มีเสียงระฆังแก้วกังวานและเสียงหวานใสขอบคุณ
            </p>

            <div className="flex items-center gap-4 text-xs pt-1 flex-wrap text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>ระยะเวลา:</span>
                <select
                  value={settings.shareDuration}
                  onChange={(e) =>
                    onUpdateSettings({
                      shareDuration: Number(e.target.value),
                    })
                  }
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-teal-400"
                >
                  <option value={3}>3 วินาที</option>
                  <option value={4}>4 วินาที</option>
                  <option value={6}>6 วินาที</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>เสียงพูดหวานใส:</span>
                <button
                  onClick={() =>
                    onUpdateSettings({
                      shareTtsEnabled: !settings.shareTtsEnabled,
                    })
                  }
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    settings.shareTtsEnabled
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                      : 'bg-slate-950 text-slate-400 border border-white/10'
                  }`}
                >
                  {settings.shareTtsEnabled ? 'เปิดเสียงพูด' : 'ปิดเสียง'}
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span>ขนาดแนะนำ:</span>
                <span className="font-mono text-[11px] text-teal-300 bg-teal-400/10 px-2 py-0.5 rounded border border-teal-400/20">
                  480 × 200 px
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0 justify-end">
            <button
              onClick={() => onSelectPreviewTab('share')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Customize</span>
            </button>
            <button
              onClick={() => copyToClipboard(getOverlayUrl('share'), 'share')}
              className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-400 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(20,184,166,0.15)] cursor-pointer"
            >
              {copiedKey === 'share' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">คัดลอกสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Share Link</span>
                </>
              )}
            </button>
            <a
              href={getOverlayUrl('share')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-center text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>เปิดทดสอบ</span>
            </a>
          </div>
        </div>

        {/* Card 6: Subathon Timer Overlay */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/50 flex flex-col lg:flex-row items-start lg:items-center gap-6 relative group overflow-hidden transition-all shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Mini Mock Screen */}
          <div className="w-full sm:w-44 h-28 bg-slate-950 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shrink-0 p-2.5">
            <div className="text-xs font-mono font-bold text-cyan-400 mb-1">02:00:00</div>
            <div className="text-[10px] font-bold text-slate-200 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/30 flex items-center gap-1">
              <Timer className="w-2.5 h-2.5 text-cyan-400" />
              <span>SUBATHON</span>
            </div>
            <div className="w-28 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-pink-500 w-3/4 rounded-full" />
            </div>
            <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">560x200</div>
          </div>

          {/* Card Info & Customizer */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Marathon • หมวดหมู่ 6</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
                6 ธีมภาพเคลื่อนไหว
              </span>
            </div>
            <h4 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Timer className="w-5 h-5 text-cyan-400" />
              6. Subathon Timer (นาฬิกาจับเวลามาราธอน เพิ่มเวลาอัตโนมัติ)
            </h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              นาฬิกานับถอยหลังไลฟ์มาราธอน เพิ่มเวลาอัตโนมัติเมื่อมีคนส่งของขวัญ / เคาะจอ / กดติดตาม / กดแชร์ พร้อมเสียงและ Floating Alert
            </p>

            {/* Theme Selector Pills */}
            <div className="flex items-center gap-3 text-xs pt-1 flex-wrap text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>เลือกธีม:</span>
                <select
                  value={settings.subathonTheme}
                  onChange={(e) =>
                    onUpdateSettings({
                      subathonTheme: e.target.value as SubathonThemeId,
                    })
                  }
                  className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                >
                  {SUBATHON_THEMES.map((th) => (
                    <option key={th.id} value={th.id}>
                      {th.name} ({th.nameTh})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span>เพิ่มเวลาอัตโนมัติ:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    settings.subathonAutoAdd
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-950 text-slate-400 border border-white/10'
                  }`}
                >
                  {settings.subathonAutoAdd ? 'เปิดอยู่' : 'ปิด'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span>ขนาดแนะนำ:</span>
                <span className="font-mono text-[11px] text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                  560 × 200 px
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0 justify-end">
            <button
              onClick={() => onSelectPreviewTab('subathon')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Customize</span>
            </button>
            <button
              onClick={() => copyToClipboard(getOverlayUrl('subathon'), 'subathon')}
              className="px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(6,182,212,0.15)] cursor-pointer"
            >
              {copiedKey === 'subathon' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span className="text-emerald-400">คัดลอกสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Subathon Link</span>
                </>
              )}
            </button>
            <a
              href={getOverlayUrl('subathon')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-center text-slate-400 hover:text-slate-200 text-xs flex items-center justify-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>เปิดทดสอบ</span>
            </a>
          </div>
        </div>
      </div>

      {/* Pro & Quick Setup Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* OBS Setup Guide Box */}
        <div className="md:col-span-8 bg-slate-900/80 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                วิธีนำลิงก์ไปใส่ในโปรแกรม OBS Studio / Streamlabs
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">4 ขั้นตอนง่ายๆ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center mb-2 border border-cyan-500/30">
                  1
                </span>
                <p className="font-bold text-white mb-1">เพิ่ม Browser Source</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  ใน OBS ใต้แท็บ <strong>Sources</strong> กดปุ่ม <strong>+</strong> แล้วเลือก <strong>Browser</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center mb-2 border border-cyan-500/30">
                  2
                </span>
                <p className="font-bold text-white mb-1">วาง URL</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  กดปุ่ม <strong>Copy OBS URL</strong> จากการ์ดด้านบน แล้วนำไปวางในช่อง <strong>URL</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center mb-2 border border-cyan-500/30">
                  3
                </span>
                <p className="font-bold text-white mb-1">ตั้งค่าขนาด Width × Height</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  กรอกความกว้างและความสูงตามที่ระบุในแต่ละหมวดหมู่
                </p>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-white/5 flex flex-col justify-between">
              <div>
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center mb-2 border border-cyan-500/30">
                  4
                </span>
                <p className="font-bold text-white mb-1">พื้นหลังใสอัตโนมัติ</p>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  ระบบตัดพื้นหลังใสให้อัตโนมัติ สามารถวางทับหน้าต่างเกมได้ทันที
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Subscription / Trial Card from Immersive UI Spec */}
        <div className="md:col-span-4 bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">StreamPulse Pro</span>
              <span className="text-[10px] bg-cyan-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">
                ACTIVE
              </span>
            </div>
            <h4 className="text-base font-bold text-white mb-1">Pro Streamer Tier</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              เข้าถึง 8 ธีมแชทระดับพรีเมียม, 60 FPS GPU hardware acceleration, และไม่มีลายน้ำ
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
              <span>สถานะการใช้งาน</span>
              <span className="text-cyan-300 font-mono font-bold">60 FPS Ultra</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              เชื่อมต่อเซิร์ฟเวอร์เรียลไทม์ พร้อมใช้งานทุกเวลา
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
