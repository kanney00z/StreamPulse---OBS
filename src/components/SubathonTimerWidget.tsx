import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Timer,
  Pause,
  Zap,
  Crown,
  Heart,
  Gamepad2,
  Sparkles,
  Flame,
  PlusCircle,
  Minus,
  Clock,
  Radio,
} from 'lucide-react';
import { SubathonThemeId, SubathonTimeAddedEvent } from '../types';
import { SUBATHON_THEMES } from '../data/mockData';

interface SubathonTimerWidgetProps {
  seconds: number;
  initialSeconds?: number;
  maxCapSeconds?: number;
  isRunning: boolean;
  theme?: SubathonThemeId;
  style?: 'card' | 'frameless';
  title?: string;
  addedEvents?: SubathonTimeAddedEvent[];
  showProgressBar?: boolean;
  standalone?: boolean;
}

export const SubathonTimerWidget: React.FC<SubathonTimerWidgetProps> = ({
  seconds,
  initialSeconds = 7200,
  maxCapSeconds = 43200, // 12 hours
  isRunning,
  theme = 'cyberpunk-neon',
  style = 'frameless',
  title = 'SUBATHON MARATHON',
  addedEvents = [],
  showProgressBar = true,
  standalone = false,
}) => {
  // Find current theme config
  const currentTheme = useMemo(() => {
    return SUBATHON_THEMES.find((t) => t.id === theme) || SUBATHON_THEMES[0];
  }, [theme]);

  // Format time components
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  // Percentage for progress bar
  const progressPercent = useMemo(() => {
    if (maxCapSeconds > 0) {
      return Math.min(100, Math.max(0, (seconds / maxCapSeconds) * 100));
    }
    return Math.min(100, Math.max(0, (seconds / Math.max(initialSeconds, 1)) * 100));
  }, [seconds, maxCapSeconds, initialSeconds]);

  const isLowTime = seconds <= 300 && seconds > 0; // less than 5 minutes
  const isTimeUp = seconds <= 0;

  // Icon selector based on theme
  const renderThemeIcon = () => {
    const iconClass = 'w-4 h-4';
    switch (currentTheme.id) {
      case 'gold-luxury':
        return <Crown className={`${iconClass} text-amber-400`} />;
      case 'kawaii-pastel':
        return <Heart className={`${iconClass} text-pink-400 fill-pink-400`} />;
      case 'retro-arcade':
        return <Gamepad2 className={`${iconClass} text-emerald-400`} />;
      case 'magma-flame':
        return <Flame className={`${iconClass} text-orange-400 fill-orange-400/50 animate-pulse`} />;
      case 'midnight-minimal':
        return <Sparkles className={`${iconClass} text-slate-300`} />;
      default:
        return <Zap className={`${iconClass} text-cyan-400 fill-cyan-400/30`} />;
    }
  };

  return (
    <div
      className={`relative select-none transition-all duration-300 ${
        standalone ? 'w-full max-w-xl mx-auto p-4' : 'w-full max-w-md'
      }`}
    >
      {/* Floating Added Time Notifications */}
      <div className="absolute -top-10 right-4 pointer-events-none z-30 flex flex-col items-end gap-1.5 overflow-visible">
        <AnimatePresence>
          {addedEvents.slice(-3).map((event) => {
            const isMinus = event.seconds < 0;
            const absSec = Math.abs(event.seconds);
            const timeStr = absSec >= 60 ? `${Math.floor(absSec / 60)}m` : `${absSec}s`;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.35 }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-white font-bold text-xs backdrop-blur-md whitespace-nowrap border ${
                  isMinus
                    ? 'bg-rose-500/90 shadow-[0_0_15px_rgba(244,63,94,0.5)] border-rose-300/40'
                    : 'bg-emerald-500/90 shadow-[0_0_15px_rgba(16,185,129,0.5)] border-emerald-300/40'
                }`}
              >
                {isMinus ? <Minus className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5 fill-white/20" />}
                <span>
                  {isMinus ? `-${timeStr}` : `+${timeStr}`}
                </span>
                <span className={`text-[10px] font-medium ${isMinus ? 'text-rose-100' : 'text-emerald-100'}`}>
                  ({event.reason})
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Main Subathon Widget: Either Frameless (Just time + bottom bar) or Card (Full Box) */}
      {style === 'frameless' ? (
        <div
          className={`relative flex flex-col items-center justify-center p-2 sm:p-3 select-none transition-all duration-300 ${
            isLowTime ? 'animate-pulse' : ''
          }`}
        >
          {/* Main Countdown Digits (Crisp, High-Contrast with Text-Glow) */}
          <div className="flex items-baseline justify-center py-1 sm:py-2 gap-1.5 sm:gap-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <span
                className={`text-4xl sm:text-6xl font-black tracking-tight ${currentTheme.timerDigitClass} drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]`}
              >
                {pad(hours)}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] mt-0.5">
                ชั่วโมง
              </span>
            </div>

            <span
              className={`text-3xl sm:text-5xl font-bold ${
                currentTheme.timerDigitClass
              } pb-3 sm:pb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${isRunning ? 'animate-pulse' : ''}`}
            >
              :
            </span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <span
                className={`text-4xl sm:text-6xl font-black tracking-tight ${currentTheme.timerDigitClass} drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]`}
              >
                {pad(minutes)}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] mt-0.5">
                นาที
              </span>
            </div>

            <span
              className={`text-3xl sm:text-5xl font-bold ${
                currentTheme.timerDigitClass
              } pb-3 sm:pb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${isRunning ? 'animate-pulse' : ''}`}
            >
              :
            </span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <span
                className={`text-4xl sm:text-6xl font-black tracking-tight ${currentTheme.timerDigitClass} drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] ${
                  isLowTime ? 'text-rose-400' : ''
                }`}
              >
                {pad(secs)}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] mt-0.5">
                วินาที
              </span>
            </div>
          </div>

          {/* Bottom Progress Bar (หลอดล่าง) */}
          {showProgressBar && (
            <div className="w-full max-w-sm sm:max-w-md mt-2 space-y-1 px-1">
              <div className="w-full h-2.5 sm:h-3 rounded-full bg-black/75 overflow-hidden p-0.5 border border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.85)] backdrop-blur-md">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out shadow-lg ${currentTheme.progressBarClass}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] px-1">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                    }`}
                  />
                  <span>เหลือเวลา {Math.round(progressPercent)}%</span>
                </span>
                <span className="font-mono text-slate-200">
                  {hours > 0 ? `${hours} ชม. ` : ''}
                  {minutes} นาที {secs} วิ
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Main Subathon Card (Card Mode with Frame) */
        <div
          className={`relative overflow-hidden p-4 sm:p-5 backdrop-blur-xl ${currentTheme.containerClass} ${
            isLowTime ? 'ring-2 ring-rose-500/80 animate-pulse' : ''
          }`}
        >
          {/* Decorative Theme Elements */}
          {theme === 'cyberpunk-neon' && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          )}
          {theme === 'gold-luxury' && (
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
          )}
          {theme === 'magma-flame' && (
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-orange-600/15 to-transparent pointer-events-none" />
          )}

          {/* Header: Title, Theme Badge & Live Status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 shrink-0">
                {renderThemeIcon()}
              </div>
              <div className="min-w-0">
                <h3 className={`text-xs sm:text-sm font-bold truncate ${currentTheme.labelClass}`}>
                  {title}
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{currentTheme.nameTh}</span>
                  {maxCapSeconds > 0 && (
                    <>
                      <span>•</span>
                      <span>Cap: {Math.floor(maxCapSeconds / 3600)} ชม.</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Running State Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              {isTimeUp ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                  หมดเวลา
                </span>
              ) : isRunning ? (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span>กำลังนับถอยหลัง</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                  <Pause className="w-2.5 h-2.5" />
                  <span>หยุดชั่วคราว</span>
                </span>
              )}
            </div>
          </div>

          {/* Main Countdown Display */}
          <div className="flex items-baseline justify-center py-2 sm:py-3 gap-1 sm:gap-2">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <span className={`text-3xl sm:text-5xl font-black ${currentTheme.timerDigitClass}`}>
                {pad(hours)}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                ชั่วโมง
              </span>
            </div>

            <span
              className={`text-2xl sm:text-4xl font-bold ${
                currentTheme.timerDigitClass
              } pb-4 sm:pb-5 ${isRunning ? 'animate-pulse' : ''}`}
            >
              :
            </span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <span className={`text-3xl sm:text-5xl font-black ${currentTheme.timerDigitClass}`}>
                {pad(minutes)}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                นาที
              </span>
            </div>

            <span
              className={`text-2xl sm:text-4xl font-bold ${
                currentTheme.timerDigitClass
              } pb-4 sm:pb-5 ${isRunning ? 'animate-pulse' : ''}`}
            >
              :
            </span>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <span
                className={`text-3xl sm:text-5xl font-black ${currentTheme.timerDigitClass} ${
                  isLowTime ? 'text-rose-400' : ''
                }`}
              >
                {pad(secs)}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                วินาที
              </span>
            </div>
          </div>

          {/* Optional Progress Bar */}
          {showProgressBar && (
            <div className="mt-2 space-y-1">
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${currentTheme.progressBarClass}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>เหลือเวลา {Math.round(progressPercent)}%</span>
                </span>
                <span>
                  {hours > 0 ? `${hours} ชม. ` : ''}
                  {minutes} นาที {secs} วิ
                </span>
              </div>
            </div>
          )}

          {/* Footer info: Rules hint */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                ส่งของขวัญ / โดเนท = เพิ่มเวลาไลฟ์
              </span>
            </div>
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 uppercase">
              {currentTheme.badge}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
