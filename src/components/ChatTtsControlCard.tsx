import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Mic,
  Settings2,
  Sparkles,
  Play,
  Square,
  Check,
  Languages,
  Gauge,
  Sliders,
} from 'lucide-react';
import { OverlayCustomSettings } from '../types';
import { ttsService, TTSVoiceOption } from '../utils/ttsService';

interface ChatTtsControlCardProps {
  settings: OverlayCustomSettings;
  onUpdateSettings: (partial: Partial<OverlayCustomSettings>) => void;
}

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

    // Listen to voice change events
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const handleTestSpeech = () => {
    setIsPlayingTest(true);
    ttsService.updateOptions({
      enabled: true,
      format: settings.chatTtsFormat,
      rate: settings.chatTtsSpeed,
      volume: settings.chatTtsVolume,
      voiceURI: settings.chatTtsVoice,
      cleanSpam: settings.chatTtsSkipSpam,
    });

    const sample = settings.chatTtsFormat === 'nameAndMessage'
      ? 'คุณ สมชาย พูดว่า: สวัสดีครับ ยินดีต้อนรับสู่ไลฟ์สตรีมครับ'
      : 'ยินดีต้อนรับสู่ไลฟ์สตรีมครับ ระบบอ่านแชทอัตโนมัติพร้อมทำงานแล้วครับ';

    ttsService.testSpeak(sample);

    setTimeout(() => {
      setIsPlayingTest(false);
    }, 3500);
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

  return (
    <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Header with Switch */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>อ่านแชทสดอัตโนมัติ (TTS Voice)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              เมื่อมีผู้ชมพิมพ์คอมเมนต์มา ระบบจะอ่านออกเสียงทันที
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
        <div className="space-y-3 pt-2 border-t border-white/10 animate-fadeIn">
          {/* Format Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
              <span>รูปแบบการอ่าน:</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
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
                  <span className="font-bold text-[11px] text-cyan-300">อ่านชื่อ + ข้อความ</span>
                  {settings.chatTtsFormat === 'nameAndMessage' && (
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 truncate">
                  "คุณ สมชาย พูดว่า: สวัสดี"
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
                  "สวัสดีครับ" (กระชับ)
                </span>
              </button>
            </div>
          </div>

          {/* Voice Selector */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                <span>เสียงผู้พูด (Voice):</span>
              </label>
              {thaiVoices.length > 0 && (
                <span className="text-[10px] text-emerald-400 font-medium">
                  🇹🇭 พบเสียงไทย {thaiVoices.length} เสียง
                </span>
              )}
            </div>

            <select
              value={settings.chatTtsVoice}
              onChange={(e) => onUpdateSettings({ chatTtsVoice: e.target.value })}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="default">ค่าเริ่มต้นของระบบ (System Default Thai)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.isThai ? '🇹🇭 ' : '🌐 '}
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed & Volume Slider */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Speed */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-400" /> ความเร็ว:
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
                onChange={(e) => onUpdateSettings({ chatTtsSpeed: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
              />
            </div>

            {/* Volume */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-cyan-400" /> ระดับเสียง:
                </span>
                <span className="font-mono font-bold text-cyan-300">
                  {settings.chatTtsVolume}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={settings.chatTtsVolume}
                onChange={(e) => onUpdateSettings({ chatTtsVolume: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg"
              />
            </div>
          </div>

          {/* Clean Spam & Emojis Checkbox */}
          <div className="flex items-center justify-between pt-1">
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
              className="flex-1 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPlayingTest ? 'กำลังทดลองอ่าน...' : 'ทดลองฟังเสียงอ่าน'}</span>
            </button>

            <button
              type="button"
              onClick={handleStopSpeech}
              className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
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
