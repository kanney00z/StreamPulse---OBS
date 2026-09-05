import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  Play,
  Square,
  Check,
  Languages,
  Gauge,
  Sliders,
  User,
  UserCheck,
  MessageSquare,
} from 'lucide-react';
import { OverlayCustomSettings } from '../types';
import { ttsService, TTSVoiceOption } from '../utils/ttsService';

interface ChatTtsControlCardProps {
  settings: OverlayCustomSettings;
  onUpdateSettings: (partial: Partial<OverlayCustomSettings>) => void;
}

interface TonePreset {
  id: 'normal' | 'male' | 'female-natural' | 'sweet' | 'cute' | 'soft' | 'custom';
  name: string;
  desc: string;
  icon: string;
  pitch: number;
  speed: number;
  format: 'sweet' | 'nameAndMessage' | 'messageOnly';
  sweetEnding: boolean;
  voiceURI?: string;
  badge?: string;
}

const TONE_PRESETS: TonePreset[] = [
  {
    id: 'female-natural',
    name: 'เสียงผู้หญิงธรรมชาติ',
    desc: 'เสียงผู้หญิงสุภาพ ฟังสบาย ชัดถ้อยชัดคำ (รับประกันมีเสียงผู้หญิง 100%)',
    icon: '👩',
    pitch: 1.05,
    speed: 0.86,
    format: 'nameAndMessage',
    sweetEnding: false,
    voiceURI: 'ai_female_kore',
    badge: '★ แนะนำ',
  },
  {
    id: 'sweet',
    name: 'สาวหวานใส มีเสน่ห์',
    desc: 'เสียงใส อ่อนหวาน สร้างบรรยากาศสดใสในไลฟ์',
    icon: '🌸',
    pitch: 1.18,
    speed: 0.88,
    format: 'sweet',
    sweetEnding: true,
    voiceURI: 'ai_female_kore',
    badge: 'ยอดนิยม',
  },
  {
    id: 'soft',
    name: 'หญิงละมุน นุ่มนวล',
    desc: 'เสียงอบอุ่น ฟังสบาย จังหวะใจเย็น ละมุนหู',
    icon: '🎀',
    pitch: 1.04,
    speed: 0.80,
    format: 'nameAndMessage',
    sweetEnding: false,
    voiceURI: 'ai_female_zephyr',
    badge: 'ช้าชัด',
  },
  {
    id: 'male',
    name: 'เสียงหนุ่มสุภาพ',
    desc: 'เสียงผู้ชาย นุ่มนวล ชัดเจน จังหวะสบาย',
    icon: '👨',
    pitch: 0.95,
    speed: 0.86,
    format: 'nameAndMessage',
    sweetEnding: false,
    voiceURI: 'ai_male_puck',
    badge: 'ผู้ชาย',
  },
  {
    id: 'normal',
    name: 'ช้าชัดเจนเป็นพิเศษ',
    desc: 'พูดช้า ชัดเจน ไม่เร็วเกินไป ฟังง่าย',
    icon: '🎙️',
    pitch: 1.02,
    speed: 0.78,
    format: 'nameAndMessage',
    sweetEnding: false,
    voiceURI: 'ai_female_kore',
    badge: '0.78x',
  },
  {
    id: 'cute',
    name: 'คิ้วท์ๆ สดใส',
    desc: 'เสียงสดใส ร่าเริง น่ารัก มีพลังบวก',
    icon: '✨',
    pitch: 1.25,
    speed: 0.90,
    format: 'sweet',
    sweetEnding: true,
    voiceURI: 'ai_female_kore',
  },
];

const SPEED_PRESETS = [
  { label: '🐢 ช้าชัดเจน (0.78x)', value: 0.78 },
  { label: '🎙️ ปกติ ไม่เร็วเกิน (0.86x)', value: 0.86, recommended: true },
  { label: '📻 ปานกลาง (0.92x)', value: 0.92 },
  { label: '⚡ มาตรฐานไว (1.00x)', value: 1.00 },
];

const SAMPLE_PHRASES = [
  {
    label: '👩 เสียงผู้หญิงสุภาพ',
    text: 'คุณ ชาลิดา พูดว่า: สวัสดีค่ะ ยินดีต้อนรับสู่ไลฟ์สตรีมนะคะ พูดจังหวะปกติ ไม่เร็วเกินไปค่ะ',
  },
  {
    label: '🌸 หวานสดใส',
    text: 'คุณ แซนดี้ บอกว่า: สวัสดีค่ะ สตรีมเมอร์เล่นเก่งมากเลย ขอบคุณสำหรับไลฟ์สนุกๆ ค่า',
  },
  {
    label: '👨 เสียงผู้ชาย',
    text: 'คุณ สมชาย พูดว่า: สวัสดีครับ ยินดีต้อนรับสู่ไลฟ์สตรีมครับ พูดจังหวะปกติ ไม่เร็วเกินไปครับ',
  },
];

export const ChatTtsControlCard: React.FC<ChatTtsControlCardProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [voices, setVoices] = useState<TTSVoiceOption[]>([]);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [customTestText, setCustomTestText] = useState(
    'คุณ ชาลิดา พูดว่า: สวัสดีค่ะ ยินดีต้อนรับสู่ไลฟ์สตรีมนะคะ พูดจังหวะปกติ ฟังสบาย ไม่เร็วเกินไปค่ะ'
  );

  useEffect(() => {
    const loadVoices = () => {
      const v = ttsService.getAvailableVoices();
      setVoices(v);
    };

    loadVoices();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleApplyPreset = (preset: TonePreset) => {
    const updates: Partial<OverlayCustomSettings> = {
      chatTtsTonePreset: preset.id,
      chatTtsPitch: preset.pitch,
      chatTtsSpeed: preset.speed,
      chatTtsFormat: preset.format,
      chatTtsSweetEnding: preset.sweetEnding,
    };

    if (preset.voiceURI) {
      updates.chatTtsVoice = preset.voiceURI;
    }

    onUpdateSettings(updates);

    ttsService.updateOptions({
      pitch: preset.pitch,
      rate: preset.speed,
      format: preset.format,
      sweetEnding: preset.sweetEnding,
      voiceURI: preset.voiceURI || settings.chatTtsVoice,
    });

    // Update test phrase accordingly with matching polite particles
    if (preset.id === 'male') {
      setCustomTestText('คุณ ชัยวัฒน์ พูดว่า: สวัสดีครับ ยินดีต้อนรับสู่ไลฟ์ครับ วันนี้มาคุยกันสบายๆ ครับ');
    } else if (preset.id === 'sweet' || preset.id === 'cute') {
      setCustomTestText('คุณ แซนดี้ บอกว่า: สวัสดีค่ะ ยินดีต้อนรับสู่ไลฟ์สตรีมนะคะ ขอให้สนุกกับไลฟ์ค่า');
    } else {
      setCustomTestText('คุณ ชาลิดา พูดว่า: สวัสดีค่ะ ยินดีต้อนรับสู่ไลฟ์สตรีมนะคะ พูดจังหวะปกติ ฟังสบาย ไม่เร็วเกินไปค่ะ');
    }
  };

  const handleTestSpeech = (textToSay?: string) => {
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

    const phrase = textToSay || customTestText;
    ttsService.testSpeak(phrase);

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

  const aiVoices = voices.filter((v) => v.isAi);
  const localVoices = voices.filter((v) => !v.isAi);
  const thaiVoices = localVoices.filter((v) => v.isThai);
  const maleVoices = thaiVoices.filter((v) => v.isMale);
  const femaleVoices = thaiVoices.filter((v) => !v.isMale);

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Header with Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
            <Volume2 className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>อ่านแชทสดอัตโนมัติ (Live Chat TTS)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span>🎙️ ปรับจังหวะปกติ & เลือกเสียงได้</span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              อ่านคอมเมนต์สดอัตโนมัติ จังหวะปกติ ไม่เร็วเกินไป พร้อมเลือกเสียงคนพูดได้อิสระ
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
          {/* Quick Voice Gender Switcher (เลือกเพศเสียงชัดเจน) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>เลือกเพศเสียงคนพูด (Voice Gender):</span>
              </span>
              <span className="text-[10px] text-slate-400">
                สลับเสียงผู้หญิง / เสียงผู้ชายทันที
              </span>
            </label>
            <div className="bg-slate-950 p-1.5 rounded-2xl border border-white/10 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateSettings({
                    chatTtsVoice: 'female_auto',
                    chatTtsTonePreset: 'female-natural',
                    chatTtsPitch: 1.05,
                    chatTtsSpeed: 0.86,
                  });
                  ttsService.updateOptions({
                    voiceURI: 'female_auto',
                    pitch: 1.05,
                    rate: 0.86,
                  });
                  const phrase = 'คุณ ชาลิดา พูดว่า: สวัสดีค่ะ ยินดีต้อนรับสู่ไลฟ์สตรีมนะคะ พูดจังหวะปกติ ไม่เร็วเกินไปค่ะ';
                  setCustomTestText(phrase);
                  ttsService.testSpeak(phrase);
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  settings.chatTtsVoice === 'female_auto' ||
                  settings.chatTtsVoice === 'sweet_auto' ||
                  settings.chatTtsTonePreset === 'female-natural' ||
                  settings.chatTtsTonePreset === 'sweet' ||
                  settings.chatTtsTonePreset === 'soft'
                    ? 'bg-gradient-to-r from-pink-500/25 to-purple-500/25 border border-pink-400 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="text-base">👩</span>
                <div className="text-left">
                  <span className="block leading-tight">เสียงผู้หญิง (แนะนำ)</span>
                  <span className="text-[10px] text-pink-300 font-normal">ธรรมชาติ ฟังสบาย</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateSettings({
                    chatTtsVoice: 'male_auto',
                    chatTtsTonePreset: 'male',
                    chatTtsPitch: 0.95,
                    chatTtsSpeed: 0.86,
                  });
                  ttsService.updateOptions({
                    voiceURI: 'male_auto',
                    pitch: 0.95,
                    rate: 0.86,
                  });
                  const phrase = 'คุณ สมชาย พูดว่า: สวัสดีครับ ยินดีต้อนรับสู่ไลฟ์สตรีมครับ พูดจังหวะปกติ ไม่เร็วเกินไปครับ';
                  setCustomTestText(phrase);
                  ttsService.testSpeak(phrase);
                }}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  settings.chatTtsVoice === 'male_auto' || settings.chatTtsTonePreset === 'male'
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="text-base">👨</span>
                <div className="text-left">
                  <span className="block leading-tight">เสียงผู้ชาย</span>
                  <span className="text-[10px] text-cyan-300 font-normal">หนุ่มสุภาพ คมชัด</span>
                </div>
              </button>
            </div>
          </div>

          {/* Tone & Voice Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>สไตล์เสียงพูด (Voice Presets):</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-medium">
                คลิกเปลี่ยนเสียงได้ทันที
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TONE_PRESETS.map((p) => {
                const isSelected =
                  settings.chatTtsTonePreset === p.id ||
                  (p.voiceURI && settings.chatTtsVoice === p.voiceURI) ||
                  (Math.abs(settings.chatTtsPitch - p.pitch) < 0.03 &&
                    Math.abs(settings.chatTtsSpeed - p.speed) < 0.03);

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-cyan-950/40 to-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-white">
                        <span>{p.icon}</span>
                        <span>{p.name}</span>
                      </span>
                      {isSelected ? (
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      ) : p.badge ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-cyan-300">
                          {p.badge}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[10px] text-slate-400 line-clamp-1 leading-tight">
                      {p.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Selector (เปลี่ยนเสียงคนอื่น) */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                <span>เลือกเสียงเฉพาะตัวในเครื่อง (Voice Engine):</span>
              </label>
              <div className="flex items-center gap-1.5">
                {femaleVoices.length > 0 && (
                  <span className="text-[10px] text-pink-300 font-medium bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                    👩 หญิง {femaleVoices.length}
                  </span>
                )}
                {maleVoices.length > 0 && (
                  <span className="text-[10px] text-cyan-300 font-medium bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    👨 ชาย {maleVoices.length}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={settings.chatTtsVoice}
                onChange={(e) => {
                  onUpdateSettings({ chatTtsVoice: e.target.value, chatTtsTonePreset: 'custom' });
                  ttsService.updateOptions({ voiceURI: e.target.value });
                }}
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <optgroup label="✨ เสียง AI สตูดิโอ (มีเสียงผู้หญิงแท้ 100% ทุกระบบ)">
                  <option value="ai_female_kore">✨ 👩 AI Kore: หญิงหวานใส สุภาพธรรมชาติ (แนะนำที่สุด ★)</option>
                  <option value="ai_female_zephyr">✨ 👩 AI Zephyr: หญิงอบอุ่น นุ่มนวล ละมุนหู</option>
                  <option value="ai_male_puck">✨ 👨 AI Puck: ชายหนุ่มสดใส คมชัด เป็นกันเอง</option>
                </optgroup>

                <optgroup label="🇹🇭 ระบบเสียงอัตโนมัติ (Auto Engine)">
                  <option value="female_auto">👩 อัตโนมัติ: เสียงผู้หญิง (ระบบเลือกเสียงผู้หญิงที่ดีที่สุด)</option>
                  <option value="sweet_auto">🌸 อัตโนมัติ: เสียงสาวหวานใส</option>
                  <option value="male_auto">👨 อัตโนมัติ: เสียงผู้ชาย (Auto Thai Male)</option>
                  <option value="default">🎙️ อัตโนมัติ: เสียงมาตรฐานของระบบ</option>
                </optgroup>

                {femaleVoices.length > 0 && (
                  <optgroup label="👩 เสียงผู้หญิงที่ติดตั้งในเครื่อง (Installed Local Female Voices)">
                    {femaleVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        👩 {v.badgeLabel ? `${v.badgeLabel}` : v.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                {maleVoices.length > 0 && (
                  <optgroup label="👨 เสียงผู้ชายที่ติดตั้งในเครื่อง (Installed Local Male Voices)">
                    {maleVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        👨 {v.badgeLabel ? `${v.badgeLabel}` : v.name}
                      </option>
                    ))}
                  </optgroup>
                )}

                <optgroup label="🌐 เสียงภาษาอื่นๆ ในระบบ (Other System Voices)">
                  {voices
                    .filter((v) => !v.isThai && !v.isAi)
                    .slice(0, 30)
                    .map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        🌐 {v.name} ({v.lang})
                      </option>
                    ))}
                </optgroup>
              </select>

              <button
                type="button"
                onClick={() => handleTestSpeech()}
                className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95"
                title="ทดลองฟังเสียงนี้ทันที"
              >
                🔊 ฟังเสียงนี้
              </button>
            </div>

            {femaleVoices.length === 0 && (
              <div className="flex items-start gap-2 bg-pink-500/10 border border-pink-500/20 rounded-xl p-2.5 text-xs text-pink-200 mt-2">
                <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-pink-300">
                    💡 ระบบ Windows ในเครื่องของคุณไม่มีเสียงผู้หญิงติดตั้งไว้
                  </p>
                  <p className="text-[11px] text-pink-200/80 mt-0.5">
                    ไม่ต้องกังวล! ระบบเปิดใช้ <strong>เสียงผู้หญิง AI Studio (AI Kore)</strong> ให้อัตโนมัติ เพื่อรับประกันว่าจะมีเสียงผู้หญิงพูดจริง 100% เสียงหวานชัดเจนค่ะ
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Speed Selector (ความเร็วพูด - เน้นย้ำไม่เร็วเกิน) */}
          <div className="space-y-2 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span>ความเร็วในการพูด (Speech Rate):</span>
              </span>
              <span className="font-mono font-bold text-cyan-300">
                {settings.chatTtsSpeed.toFixed(2)}x
                {settings.chatTtsSpeed <= 1.0 ? ' (จังหวะปกติ ไม่เร็วเกิน ★)' : ' (ไว)'}
              </span>
            </div>

            {/* Quick Speed Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {SPEED_PRESETS.map((sp) => {
                const isSelected = Math.abs(settings.chatTtsSpeed - sp.value) < 0.02;
                return (
                  <button
                    key={sp.value}
                    type="button"
                    onClick={() => {
                      onUpdateSettings({ chatTtsSpeed: sp.value, chatTtsTonePreset: 'custom' });
                      ttsService.updateOptions({ rate: sp.value });
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all border text-center cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {sp.label}
                  </button>
                );
              })}
            </div>

            {/* Speed Range Slider */}
            <div className="space-y-1 pt-1">
              <input
                type="range"
                min="0.75"
                max="1.35"
                step="0.02"
                value={settings.chatTtsSpeed}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onUpdateSettings({
                    chatTtsSpeed: val,
                    chatTtsTonePreset: 'custom',
                  });
                  ttsService.updateOptions({ rate: val });
                }}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0.75x ช้ามาก</span>
                <span className="text-cyan-400 font-bold">0.96x ปกติ ไม่เร็วเกิน ★</span>
                <span className="text-slate-400">1.00x มาตรฐาน</span>
                <span>1.35x ไว</span>
              </div>
            </div>
          </div>

          {/* Pitch & Tone Slider */}
          <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>ระดับโทนเสียง (Pitch):</span>
              </span>
              <span className="font-mono font-bold text-purple-300">
                {settings.chatTtsPitch.toFixed(2)}x
                {settings.chatTtsPitch < 0.98
                  ? ' (ทุ้ม/หนุ่ม)'
                  : settings.chatTtsPitch <= 1.05
                  ? ' (ปกติธรรมชาติ)'
                  : ' (หวานใส)'}
              </span>
            </div>
            <input
              type="range"
              min="0.80"
              max="1.40"
              step="0.02"
              value={settings.chatTtsPitch}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateSettings({
                  chatTtsPitch: val,
                  chatTtsTonePreset: 'custom',
                });
                ttsService.updateOptions({ pitch: val });
              }}
              className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-900 rounded-lg"
            />
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span className="text-cyan-400">0.95x เสียงผู้ชาย</span>
              <span className="text-purple-400 font-bold">1.00x เสียงปกติธรรมชาติ ★</span>
              <span className="text-pink-400">1.16x หวานใส</span>
              <span>1.40x คิ้วท์</span>
            </div>
          </div>

          {/* Format Selector & Particles */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>รูปแบบประโยคที่อ่าน:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
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
                  <span className="font-bold text-[11px] text-cyan-300">ชื่อ + ข้อความ (มาตรฐาน)</span>
                  {settings.chatTtsFormat === 'nameAndMessage' && (
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  "คุณ สมชาย พูดว่า: ดีครับ"
                </span>
              </button>

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
                  <span className="font-bold text-[11px] text-pink-300">🌸 สไตล์หวาน</span>
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
                onClick={() => onUpdateSettings({ chatTtsFormat: 'messageOnly' })}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer flex flex-col justify-between ${
                  settings.chatTtsFormat === 'messageOnly'
                    ? 'bg-purple-500/15 border-purple-400 text-white shadow-sm'
                    : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-0.5">
                  <span className="font-bold text-[11px] text-purple-300">เฉพาะข้อความ</span>
                  {settings.chatTtsFormat === 'messageOnly' && (
                    <Check className="w-3.5 h-3.5 text-purple-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  "สวัสดีครับ" (สั้นกระชับ)
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
              <span className="text-slate-300 font-medium">
                🌸 เติมหางเสียงหวานท้ายประโยค ("ค่า~")
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

          {/* Interactive Custom Test Text Box */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>ทดสอบพิมพ์ข้อความลองฟังเสียง:</span>
              </label>
              <div className="flex gap-1">
                {SAMPLE_PHRASES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setCustomTestText(sample.text);
                      handleTestSpeech(sample.text);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10 transition-all cursor-pointer"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customTestText}
                onChange={(e) => setCustomTestText(e.target.value)}
                placeholder="พิมพ์ข้อความที่ต้องการทดลองฟัง..."
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => handleTestSpeech(customTestText)}
                className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] active:scale-95 cursor-pointer shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isPlayingTest ? 'กำลังพูด...' : 'ทดลองฟัง'}</span>
              </button>
              <button
                type="button"
                onClick={handleStopSpeech}
                className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                title="หยุดเสียงอ่าน"
              >
                <Square className="w-3.5 h-3.5 fill-current text-rose-400" />
                <span>หยุด</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
