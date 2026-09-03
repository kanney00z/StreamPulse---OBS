import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Play,
  Square,
  Check,
  Languages,
  Gauge,
  Sliders,
  Heart,
  Smile,
  Zap,
} from 'lucide-react';
import { OverlayCustomSettings } from '../types';
import { ttsService, TTSVoiceOption } from '../utils/ttsService';

interface ChatTtsControlCardProps {
  settings: OverlayCustomSettings;
  onUpdateSettings: (partial: Partial<OverlayCustomSettings>) => void;
}

interface TonePreset {
  id: 'sweet' | 'cute' | 'soft' | 'natural' | 'custom';
  name: string;
  desc: string;
  icon: string;
  pitch: number;
  speed: number;
  format: 'sweet' | 'nameAndMessage' | 'messageOnly';
  sweetEnding: boolean;
}

const TONE_PRESETS: TonePreset[] = [
  {
    id: 'sweet',
    name: 'สาวหวานใส',
    desc: 'เสียงใส กังวาน อ่อนหวาน น่าฟัง (แนะนำ)',
    icon: '🌸',
    pitch: 1.22,
    speed: 1.05,
    format: 'sweet',
    sweetEnding: true,
  },
  {
    id: 'cute',
    name: 'คิ้วท์ๆ สดใส',
    desc: 'เสียงสูง ร่าเริง สไตล์ไอดอล/อนิเมะ',
    icon: '✨',
    pitch: 1.38,
    speed: 1.10,
    format: 'sweet',
    sweetEnding: true,
  },
  {
    id: 'soft',
    name: 'ละมุน นุ่มนวล',
    desc: 'เสียงอบอุ่น ฟังสบาย จังหวะใจเย็น',
    icon: '🎀',
    pitch: 1.10,
    speed: 0.96,
    format: 'nameAndMessage',
    sweetEnding: true,
  },
  {
    id: 'natural',
    name: 'พูดเป็นธรรมชาติ',
    desc: 'โทนเสียงและจังหวะระดับมาตรฐาน',
    icon: '🎙️',
    pitch: 1.00,
    speed: 1.00,
    format: 'nameAndMessage',
    sweetEnding: false,
  },
  {
    id: 'custom',
    name: 'สตรีมเมอร์ไว',
    desc: 'อ่านเร็ว กระชับ ไม่อ่านชื่อ',
    icon: '⚡',
    pitch: 1.18,
    speed: 1.25,
    format: 'messageOnly',
    sweetEnding: false,
  },
];

export const ChatTtsControlCard: React.FC<ChatTtsControlCardProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [voices, setVoices] = useState<TTSVoiceOption[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const v = ttsService.getAvailableVoices();
      setVoices(v);
    };

    loadVoices();

    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleApplyPreset = (preset: TonePreset) => {
    onUpdateSettings({
      chatTtsTonePreset: preset.id,
      chatTtsPitch: preset.pitch,
      chatTtsSpeed: preset.speed,
      chatTtsFormat: preset.format,
      chatTtsSweetEnding: preset.sweetEnding,
    });

    ttsService.updateOptions({
      pitch: preset.pitch,
      rate: preset.speed,
      format: preset.format,
      sweetEnding: preset.sweetEnding,
    });
  };

  const handleTestSpeech = () => {
    setIsPlayingTest(true);
    ttsService.updateOptions({
      enabled: true,
      format: settings.chatTtsFormat,
      rate: settings.chatTtsSpeed,
      pitch: settings.chatTtsPitch,
      volume: settings.chatTtsVolume,
      voiceURI: settings.chatTtsVoice,
      cleanSpam: settings.chatTtsSkipSpam,
      sweetEnding: settings.chatTtsSweetEnding,
    });

    ttsService.testSpeak();

    setTimeout(() => {
      setIsPlayingTest(false);
    }, 4500);
  };

  const handleStopSpeech = () => {
    ttsService.stop();
    setIsPlayingTest(false);
  };

  if (!isSupported) {
    return (
      <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-4 text-xs text-amber-300">
        เบราว์เซอร์ของคุณยังไม่รองรับ Web Speech API
      </div>
    );
  }

  const thaiVoices = voices.filter((v) => v.isThai);
  const sweetVoices = voices.filter((v) => v.isSweetRecommended);

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Header with Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500/20 to-cyan-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-sm">
            <Volume2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>อ่านแชทสดเสียงไทยหวานใส</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                <span>🌸 โทนเสียงหวานใส</span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              อ่านคอมเมนต์สดอัตโนมัติด้วยน้ำเสียงหวาน ชัดเจน เป็นมิตรกับผู้ชม
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <button
          onClick={() => onUpdateSettings({ chatTtsEnabled: !settings.chatTtsEnabled })}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            settings.chatTtsEnabled
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : 'bg-slate-950 text-slate-400 border border-white/10 hover:text-white'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              settings.chatTtsEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
            }`}
          />
          <span>{settings.chatTtsEnabled ? 'เปิดอ่านแชท' : 'ปิดอ่านแชท'}</span>
        </button>
      </div>

      {/* TTS Active Settings */}
      {settings.chatTtsEnabled && (
        <div className="space-y-4 pt-2 border-t border-white/10 animate-fadeIn">
          {/* Tone Presets Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>เลือกสไตล์เสียงพากย์ (Presets):</span>
              </span>
              <span className="text-[10px] text-pink-400 font-medium">
                คลิกเปลี่ยนโทนหวานใสได้ทันที
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TONE_PRESETS.map((p) => {
                const isSelected =
                  settings.chatTtsTonePreset === p.id ||
                  (Math.abs(settings.chatTtsPitch - p.pitch) < 0.03 &&
                    Math.abs(settings.chatTtsSpeed - p.speed) < 0.03);

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-pink-950/40 to-slate-900 border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                        : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-white">
                        <span>{p.icon}</span>
                        <span>{p.name}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                <span>เสียงผู้พูด (Voice Engine):</span>
              </label>
              {sweetVoices.length > 0 ? (
                <span className="text-[10px] text-pink-400 font-semibold flex items-center gap-1">
                  <span>🌸 แนะนำ: พบเสียงหวานธรรมชาติ</span>
                </span>
              ) : (
                thaiVoices.length > 0 && (
                  <span className="text-[10px] text-emerald-400 font-medium">
                    🇹🇭 พบเสียงไทย {thaiVoices.length} เสียง
                  </span>
                )
              )}
            </div>

            <select
              value={settings.chatTtsVoice}
              onChange={(e) => onUpdateSettings({ chatTtsVoice: e.target.value })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-400"
            >
              <option value="default">
                🌸 เลือกเสียงไทยหวานใสโดยอัตโนมัติ (Auto Sweet Voice)
              </option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.badgeLabel ? `${v.badgeLabel} - ` : v.isThai ? '🇹🇭 ' : '🌐 '}
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sliders: Pitch (Sweetness) & Speed */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Pitch (Sweet & Clear) */}
            <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-pink-400" />
                  <span>ระดับความหวานใส (Pitch):</span>
                </span>
                <span className="font-mono font-bold text-pink-300">
                  {settings.chatTtsPitch.toFixed(2)}x
                  {settings.chatTtsPitch >= 1.2 ? ' (หวานใส)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.6"
                step="0.02"
                value={settings.chatTtsPitch}
                onChange={(e) => {
                  onUpdateSettings({
                    chatTtsPitch: Number(e.target.value),
                    chatTtsTonePreset: 'custom',
                  });
                }}
                className="w-full accent-pink-400 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0.8 ทุ้ม</span>
                <span className="text-slate-400">1.0 ปกติ</span>
                <span className="text-pink-400 font-semibold">1.22 หวานใส ★</span>
                <span>1.60 คิ้วท์</span>
              </div>
            </div>

            {/* Speed */}
            <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  <span>ความเร็วพูด (Speed):</span>
                </span>
                <span className="font-mono font-bold text-cyan-300">
                  {settings.chatTtsSpeed.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={settings.chatTtsSpeed}
                onChange={(e) => {
                  onUpdateSettings({
                    chatTtsSpeed: Number(e.target.value),
                    chatTtsTonePreset: 'custom',
                  });
                }}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0.8 ช้า</span>
                <span className="text-slate-400">1.0 ปานกลาง</span>
                <span className="text-cyan-400 font-semibold">1.05 กำลังดี</span>
                <span>1.5 เร็ว</span>
              </div>
            </div>
          </div>

          {/* Format Selector & Sweet Ending Particle */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <span>รูปแบบประโยคที่อ่าน:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ chatTtsFormat: 'sweet' })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex flex-col justify-between ${
                  settings.chatTtsFormat === 'sweet'
                    ? 'bg-pink-500/15 border-pink-400 text-white shadow-sm'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className="font-bold text-[11px] text-pink-300">🌸 หวานเป็นกันเอง</span>
                  {settings.chatTtsFormat === 'sweet' && (
                    <Check className="w-3.5 h-3.5 text-pink-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  "คุณ ส้ม บอกว่า: ดีค่า"
                </span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ chatTtsFormat: 'nameAndMessage' })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex flex-col justify-between ${
                  settings.chatTtsFormat === 'nameAndMessage'
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-sm'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className="font-bold text-[11px] text-cyan-300">ชื่อ + ข้อความ</span>
                  {settings.chatTtsFormat === 'nameAndMessage' && (
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  "คุณ ส้ม พูดว่า: ดีครับ"
                </span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ chatTtsFormat: 'messageOnly' })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex flex-col justify-between ${
                  settings.chatTtsFormat === 'messageOnly'
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-sm'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className="font-bold text-[11px] text-cyan-300">เฉพาะข้อความ</span>
                  {settings.chatTtsFormat === 'messageOnly' && (
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  "สวัสดีค่ะ" (สั้นกระชับ)
                </span>
              </button>
            </div>
          </div>

          {/* Sweet Particle & Anti-Spam Checkbox */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] text-slate-300 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.chatTtsSweetEnding}
                onChange={(e) => onUpdateSettings({ chatTtsSweetEnding: e.target.checked })}
                className="rounded accent-pink-400"
              />
              <span className="text-pink-300 font-medium">
                🌸 เพิ่มหางเสียงน่ารัก (เติม "ค่า~" ท้ายประโยคสร้างบรรยากาศอบอุ่น)
              </span>
            </label>

            <label className="text-[11px] text-slate-300 flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.chatTtsSkipSpam}
                onChange={(e) => onUpdateSettings({ chatTtsSkipSpam: e.target.checked })}
                className="rounded accent-cyan-400"
              />
              <span>ย่อข้อความซ้ำ (55555 ➔ 555) และข้ามคำสั่ง !บอท</span>
            </label>
          </div>

          {/* Buttons: Test & Stop */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={handleTestSpeech}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-400 hover:to-rose-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPlayingTest ? 'กำลังอ่านเสียงหวานใส...' : 'ทดลองฟังเสียงไทยหวานใส 🌸'}</span>
            </button>

            <button
              type="button"
              onClick={handleStopSpeech}
              className="py-2.5 px-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="หยุดเสียงอ่านที่กำลังพูดทั้งหมด"
            >
              <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
              <span>หยุด</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
