import React, { useState } from 'react';

export interface DurationCustomizerControlProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  presets?: number[];
  presetLabels?: Record<number, string>;
  themeColor?: 'cyan' | 'amber' | 'rose' | 'teal' | 'purple' | 'emerald' | 'pink';
  allowZero?: boolean;
  zeroLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  compact?: boolean;
  subNote?: string;
}

export const DurationCustomizerControl: React.FC<DurationCustomizerControlProps> = ({
  label,
  value,
  onChange,
  presets = [2, 3, 5, 8, 10, 15, 20],
  presetLabels = {},
  themeColor = 'cyan',
  allowZero = false,
  zeroLabel = 'แสดงตลอดเวลา (ไม่ซ่อน)',
  min = allowZero ? 0 : 1,
  max = 600,
  step = 1,
  unit = 'วินาที',
  compact = false,
  subNote,
}) => {
  // Check if current value is in standard presets
  const [isCustomMode, setIsCustomMode] = useState<boolean>(() => !presets.includes(value));

  // Color mappings
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/40 focus:border-cyan-400',
      activeBorder: 'border-cyan-400/50',
      text: 'text-cyan-300',
      textHover: 'hover:text-cyan-200',
      bgActive: 'bg-cyan-500/20',
      btnHover: 'hover:bg-cyan-500/30',
      badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    },
    amber: {
      border: 'border-amber-500/40 focus:border-amber-400',
      activeBorder: 'border-amber-400/50',
      text: 'text-amber-300',
      textHover: 'hover:text-amber-200',
      bgActive: 'bg-amber-500/20',
      btnHover: 'hover:bg-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    rose: {
      border: 'border-rose-500/40 focus:border-rose-400',
      activeBorder: 'border-rose-400/50',
      text: 'text-rose-300',
      textHover: 'hover:text-rose-200',
      bgActive: 'bg-rose-500/20',
      btnHover: 'hover:bg-rose-500/30',
      badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    pink: {
      border: 'border-pink-500/40 focus:border-pink-400',
      activeBorder: 'border-pink-400/50',
      text: 'text-pink-300',
      textHover: 'hover:text-pink-200',
      bgActive: 'bg-pink-500/20',
      btnHover: 'hover:bg-pink-500/30',
      badge: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
    },
    teal: {
      border: 'border-teal-500/40 focus:border-teal-400',
      activeBorder: 'border-teal-400/50',
      text: 'text-teal-300',
      textHover: 'hover:text-teal-200',
      bgActive: 'bg-teal-500/20',
      btnHover: 'hover:bg-teal-500/30',
      badge: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    },
    purple: {
      border: 'border-purple-500/40 focus:border-purple-400',
      activeBorder: 'border-purple-400/50',
      text: 'text-purple-300',
      textHover: 'hover:text-purple-200',
      bgActive: 'bg-purple-500/20',
      btnHover: 'hover:bg-purple-500/30',
      badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    },
    emerald: {
      border: 'border-emerald-500/40 focus:border-emerald-400',
      activeBorder: 'border-emerald-400/50',
      text: 'text-emerald-300',
      textHover: 'hover:text-emerald-200',
      bgActive: 'bg-emerald-500/20',
      btnHover: 'hover:bg-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    },
  };

  const theme = colorMap[themeColor] || colorMap.cyan;

  const handleDecrement = () => {
    const next = Math.max(min, Number((value - step).toFixed(1)));
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, Number((value + step).toFixed(1)));
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(min);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      onChange(clamped);
    }
  };

  // Compact inline mode (Used in toolbars / OBSLinkHub)
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {label && <span className="text-slate-400">{label}</span>}
        <select
          value={presets.includes(value) ? value : 'custom'}
          onChange={(e) => {
            if (e.target.value !== 'custom') {
              onChange(Number(e.target.value));
            }
          }}
          className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
        >
          {presets.map((sec) => (
            <option key={sec} value={sec}>
              {sec === 0 && allowZero ? zeroLabel : presetLabels[sec] || `${sec} ${unit}`}
            </option>
          ))}
          <option value="custom">กำหนดเอง ({value} {unit})</option>
        </select>

        {/* Direct number input stepper */}
        <div className="flex items-center bg-slate-950 border border-white/15 rounded-lg px-1.5 py-0.5 gap-1 focus-within:border-cyan-400">
          <button
            type="button"
            onClick={handleDecrement}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            title={`ลด ${step} ${unit}`}
          >
            -
          </button>
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleInputChange}
            className={`w-11 bg-transparent ${theme.text} font-mono text-xs font-bold text-center focus:outline-none`}
            title={`พิมพ์${unit}ที่ต้องการได้เอง`}
          />
          <button
            type="button"
            onClick={handleIncrement}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            title={`เพิ่ม ${step} ${unit}`}
          >
            +
          </button>
          <span className="text-[10px] text-slate-400 select-none">{unit === 'วินาที' ? 'วิ' : unit}</span>
        </div>
      </div>
    );
  }

  // Full Rich Mode (Used in WidgetCustomizerPanel)
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-slate-400 block font-medium text-xs">{label}</label>
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            className={`text-[11px] ${theme.text} ${theme.textHover} font-medium flex items-center gap-1 cursor-pointer transition-colors`}
            title="สลับระหว่างเลือกเวลาสำเร็จรูป หรือพิมพ์วินาทีเองอิสระ"
          >
            {isCustomMode ? (
              <span className="flex items-center gap-1">
                <span>📋</span>
                <span className="underline">เลือกสำเร็จรูป</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span>✏️</span>
                <span className="underline">กำหนดเอง</span>
              </span>
            )}
          </button>
        </div>
      )}

      {!isCustomMode ? (
        <select
          value={presets.includes(value) ? value : 'custom'}
          onChange={(e) => {
            if (e.target.value === 'custom') {
              setIsCustomMode(true);
            } else {
              onChange(Number(e.target.value));
            }
          }}
          className={`w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none ${theme.border}`}
        >
          {presets.map((sec) => (
            <option key={sec} value={sec}>
              {sec === 0 && allowZero ? zeroLabel : presetLabels[sec] || `${sec} ${unit}`}
            </option>
          ))}
          <option value="custom">⚙️ กำหนดเวลาเอง (พิมพ์วินาทีอิสระ)...</option>
        </select>
      ) : (
        <div className={`space-y-1.5 p-2 bg-slate-950 rounded-xl border ${theme.border}`}>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleDecrement}
              className={`w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 ${theme.text} font-bold flex items-center justify-center text-sm cursor-pointer transition-colors shadow-sm`}
              title={`ลด ${step} ${unit}`}
            >
              -
            </button>
            <div className="flex-1 relative flex items-center">
              <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={handleInputChange}
                className={`w-full bg-slate-900 border ${theme.border} rounded-lg pl-3 pr-10 py-1.5 text-center font-mono font-bold ${theme.text} text-sm focus:outline-none`}
                placeholder="5"
              />
              <span className="absolute right-2 text-[10px] text-slate-400 pointer-events-none select-none">
                {unit}
              </span>
            </div>
            <button
              type="button"
              onClick={handleIncrement}
              className={`w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 ${theme.text} font-bold flex items-center justify-center text-sm cursor-pointer transition-colors shadow-sm`}
              title={`เพิ่ม ${step} ${unit}`}
            >
              +
            </button>
          </div>

          <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-white/5 flex-wrap">
            <span className="text-[10px] text-slate-400 truncate">
              {value === 0 && allowZero ? '✨ ไม่ซ่อน (แสดงตลอด)' : `⏳ แสดง ${value} ${unit}`}
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {presets.slice(0, 6).map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => onChange(sec)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    value === sec
                      ? `${theme.badge} font-bold`
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                >
                  {sec === 0 && allowZero ? 'ตลอด' : `${sec}s`}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {subNote && <p className="text-[10px] text-slate-500 italic mt-0.5">{subNote}</p>}
    </div>
  );
};
