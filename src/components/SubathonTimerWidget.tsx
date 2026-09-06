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
  Cuboid,
  Gem,
  Shield,
  Cylinder,
} from 'lucide-react';
import { SubathonThemeId, SubathonTimeAddedEvent, SubathonFontId } from '../types';
import { SUBATHON_THEMES, SUBATHON_FONTS } from '../data/mockData';

interface SubathonTimerWidgetProps {
  seconds: number;
  initialSeconds?: number;
  maxCapSeconds?: number;
  isRunning: boolean;
  theme?: SubathonThemeId;
  font?: SubathonFontId;
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
  font = 'orbitron',
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

  // Find current 3D font config
  const currentFont = useMemo(() => {
    return SUBATHON_FONTS.find((f) => f.id === font) || SUBATHON_FONTS[0];
  }, [font]);

  const digitFontStyle: React.CSSProperties = useMemo(() => ({
    fontFamily: currentFont.fontFamily,
    letterSpacing: currentFont.letterSpacing || undefined,
  }), [currentFont]);

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
      case '3d-gold-bullion':
        return <Crown className={`${iconClass} text-amber-400`} />;
      case 'kawaii-pastel':
      case '3d-clay-bubble':
        return <Heart className={`${iconClass} text-pink-400 fill-pink-400`} />;
      case 'retro-arcade':
        return <Gamepad2 className={`${iconClass} text-emerald-400`} />;
      case 'magma-flame':
        return <Flame className={`${iconClass} text-orange-400 fill-orange-400/50 animate-pulse`} />;
      case 'midnight-minimal':
        return <Sparkles className={`${iconClass} text-slate-300`} />;
      case '3d-cyber-holo':
        return <Cuboid className={`${iconClass} text-cyan-400`} />;
      case '3d-crystal-glass':
        return <Gem className={`${iconClass} text-purple-400`} />;
      case '3d-mecha-titan':
        return <Shield className={`${iconClass} text-red-400`} />;
      case '3d-neon-capsule':
        return <Cylinder className={`${iconClass} text-emerald-400`} />;
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
          {/* Main Countdown Digits (Crisp, High-Contrast with Text-Glow & 3D Depth) */}
          <div
            style={digitFontStyle}
            className="flex items-center justify-center py-1 sm:py-2 gap-1.5 sm:gap-3 drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
          >
            {/* Hours */}
            <div
              className={`flex flex-col items-center justify-center transition-all ${
                currentTheme.digitBlockClass || ''
              }`}
            >
              <span
                style={digitFontStyle}
                className={`text-4xl sm:text-6xl font-black tracking-tight ${currentTheme.timerDigitClass} drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]`}
              >
                {pad(hours)}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] mt-0.5">
                ชั่วโมง
              </span>
            </div>

            <span
              style={digitFontStyle}
              className={`text-3xl sm:text-5xl font-black ${
                currentTheme.timerDigitClass
              } ${currentTheme.digitBlockClass ? 'pb-1' : 'pb-3 sm:pb-4'} drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${
                isRunning ? 'animate-pulse' : ''
              }`}
            >
              :
            </span>

            {/* Minutes */}
            <div
              className={`flex flex-col items-center justify-center transition-all ${
                currentTheme.digitBlockClass || ''
              }`}
            >
              <span
                style={digitFontStyle}
                className={`text-4xl sm:text-6xl font-black tracking-tight ${currentTheme.timerDigitClass} drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]`}
              >
                {pad(minutes)}
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] mt-0.5">
                นาที
              </span>
            </div>

            <span
              style={digitFontStyle}
              className={`text-3xl sm:text-5xl font-black ${
                currentTheme.timerDigitClass
              } ${currentTheme.digitBlockClass ? 'pb-1' : 'pb-3 sm:pb-4'} drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${
                isRunning ? 'animate-pulse' : ''
              }`}
            >
              :
            </span>

            {/* Seconds */}
            <div
              className={`flex flex-col items-center justify-center transition-all ${
                currentTheme.digitBlockClass || ''
              }`}
            >
              <span
                style={digitFontStyle}
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
              <div className="w-full h-2.5 sm:h-3.5 rounded-full bg-black/85 overflow-hidden p-0.5 border border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.85),inset_0_2px_4px_rgba(0,0,0,0.9)] backdrop-blur-md relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out shadow-lg relative overflow-hidden ${currentTheme.progressBarClass}`}
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />
                </div>
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
          {/* Top Reflection Sheen for 3D and Luxury Themes */}
          {currentTheme.reflectionSheen && (
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none rounded-t-3xl" />
          )}

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
          {theme === '3d-cyber-holo' && (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.18),transparent_70%)] pointer-events-none" />
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />
            </>
          )}
          {theme === '3d-crystal-glass' && (
            <>
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-gradient-to-br from-fuchsia-500/20 via-purple-400/20 to-cyan-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-gradient-to-tr from-cyan-400/20 to-purple-500/20 rounded-full blur-2xl pointer-events-none" />
            </>
          )}
          {theme === '3d-gold-bullion' && (
            <>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute top-2 left-3 text-[9px] font-mono tracking-widest text-amber-400/60 uppercase pointer-events-none">
                ★ 999.9 FINE GOLD 3D ★
              </div>
            </>
          )}
          {theme === '3d-clay-bubble' && (
            <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-pink-400/25 rounded-full blur-xl pointer-events-none" />
          )}
          {theme === '3d-mecha-titan' && (
            <>
              <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-neutral-600 border border-neutral-400/60 shadow-inner" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-neutral-600 border border-neutral-400/60 shadow-inner" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-neutral-600 border border-neutral-400/60 shadow-inner" />
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-neutral-600 border border-neutral-400/60 shadow-inner" />
              <div className="absolute top-0 inset-x-8 h-[2px] bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            </>
          )}
          {theme === '3d-neon-capsule' && (
            <>
              <div className="absolute inset-x-8 top-1 h-1 bg-gradient-to-r from-transparent via-emerald-200/60 to-transparent rounded-full pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-emerald-500/10 pointer-events-none rounded-3xl" />
            </>
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
          <div
            style={digitFontStyle}
            className="flex items-center justify-center py-2 sm:py-3 gap-1.5 sm:gap-2.5"
          >
            {/* Hours */}
            <div
              className={`flex flex-col items-center justify-center transition-all ${
                currentTheme.digitBlockClass || ''
              }`}
            >
              <span
                style={digitFontStyle}
                className={`text-3xl sm:text-5xl font-black ${currentTheme.timerDigitClass}`}
              >
                {pad(hours)}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                ชั่วโมง
              </span>
            </div>

            <span
              style={digitFontStyle}
              className={`text-2xl sm:text-4xl font-black ${
                currentTheme.timerDigitClass
              } ${currentTheme.digitBlockClass ? 'pb-1' : 'pb-4 sm:pb-5'} ${isRunning ? 'animate-pulse' : ''}`}
            >
              :
            </span>

            {/* Minutes */}
            <div
              className={`flex flex-col items-center justify-center transition-all ${
                currentTheme.digitBlockClass || ''
              }`}
            >
              <span
                style={digitFontStyle}
                className={`text-3xl sm:text-5xl font-black ${currentTheme.timerDigitClass}`}
              >
                {pad(minutes)}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                นาที
              </span>
            </div>

            <span
              style={digitFontStyle}
              className={`text-2xl sm:text-4xl font-black ${
                currentTheme.timerDigitClass
              } ${currentTheme.digitBlockClass ? 'pb-1' : 'pb-4 sm:pb-5'} ${isRunning ? 'animate-pulse' : ''}`}
            >
              :
            </span>

            {/* Seconds */}
            <div
              className={`flex flex-col items-center justify-center transition-all ${
                currentTheme.digitBlockClass || ''
              }`}
            >
              <span
                style={digitFontStyle}
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
            <div className="mt-2.5 space-y-1">
              <div className="w-full h-2.5 sm:h-3 rounded-full bg-black/80 overflow-hidden p-0.5 border border-white/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden ${currentTheme.progressBarClass}`}
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium px-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>เหลือเวลา {Math.round(progressPercent)}%</span>
                </span>
                <span className="font-mono text-slate-200">
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
