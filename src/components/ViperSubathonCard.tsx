import React, { useMemo } from 'react';
import { Clock, Pause } from 'lucide-react';
import { SubathonThemeConfig, SubathonFontConfig, ViperThemeConfig } from '../types';

interface ViperSubathonCardProps {
  seconds: number;
  initialSeconds?: number;
  maxCapSeconds?: number;
  isRunning: boolean;
  themeConfig: SubathonThemeConfig;
  fontConfig: SubathonFontConfig;
  title?: string;
  progressPercent: number;
  isLowTime: boolean;
  isTimeUp: boolean;
}

const defaultViperConfig: ViperThemeConfig = {
  cardBg: 'bg-gradient-to-br from-[#0c0919]/95 via-[#130d2a]/95 to-[#1a1135]/95 backdrop-blur-2xl',
  borderClass: 'border-2 border-pink-500/80',
  borderGlow: 'shadow-[0_0_32px_rgba(236,72,153,0.4)]',
  accentGlow: 'from-cyan-400/20 to-pink-500/20',
  rivetColor: '#06b6d4',
  dialTrackColor: 'rgba(255, 255, 255, 0.1)',
  dialProgressGradient: ['#06b6d4', '#f43f5e'],
  dialTicksColor: '#06b6d4',
  dialTextColor: '#ffffff',
  gear1Color: '#06b6d4',
  gear2Color: '#ec4899',
  titlePillBg: 'bg-[#090714]',
  titlePillBorder: 'border-pink-500/80 shadow-[0_0_12px_rgba(236,72,153,0.5)]',
  titlePillText: 'text-pink-300',
  statusBorder: 'border-cyan-400/70 shadow-[0_0_10px_rgba(6,182,212,0.5)]',
  statusColor: 'text-cyan-300',
  numeralsColor: 'text-white',
  numeralsShadow: 'drop-shadow-[0_0_16px_rgba(236,72,153,0.9)] drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]',
  controlsSubtextColor: 'text-slate-400',
  ledActiveGradient: 'from-cyan-400 via-pink-400 to-rose-400',
  ledInactiveColor: 'bg-slate-800/60 border-white/10',
  ofTargetColor: 'text-slate-300',
  manualTagColor: 'text-slate-400',
};

// Realistic Mechanical Gear Component with central axle and cutouts
const MechanicalGear: React.FC<{
  size: number;
  color: string;
  teeth?: number;
  isClockwise?: boolean;
  isRunning?: boolean;
  speedSec?: number;
  className?: string;
}> = ({
  size,
  color,
  teeth = 8,
  isClockwise = true,
  isRunning = true,
  speedSec = 8,
  className = '',
}) => {
  const toothAngles = useMemo(() => {
    return Array.from({ length: teeth }, (_, i) => (360 / teeth) * i);
  }, [teeth]);

  const animationStyle: React.CSSProperties = isRunning
    ? {
        animation: `${isClockwise ? 'spin' : 'spinReverse'} ${speedSec}s linear infinite`,
      }
    : {};

  return (
    <div
      style={{ width: size, height: size, ...animationStyle }}
      className={`relative select-none pointer-events-none ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="overflow-visible"
      >
        <defs>
          <radialGradient id={`gear-rad-${color.replace('#', '')}`} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="60%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <g>
          {/* Gear Teeth */}
          {toothAngles.map((angle, idx) => (
            <rect
              key={idx}
              x="42"
              y="4"
              width="16"
              height="20"
              rx="3.5"
              fill={color}
              transform={`rotate(${angle} 50 50)`}
            />
          ))}
          {/* Main Gear Disc */}
          <circle cx="50" cy="50" r="36" fill={`url(#gear-rad-${color.replace('#', '')})`} />
          {/* Inner Groove Ring */}
          <circle cx="50" cy="50" r="24" fill="none" stroke="#000000" strokeWidth="2.5" opacity="0.4" />
          {/* Center Axle Cutout */}
          <circle cx="50" cy="50" r="14" fill="#0c0a18" />
          <circle cx="50" cy="50" r="11" fill="none" stroke={color} strokeWidth="2" opacity="0.8" />
          {/* 4 Inner Bolt Dots */}
          {[0, 90, 180, 270].map((deg) => (
            <circle
              key={deg}
              cx="50"
              cy="28"
              r="2.5"
              fill="#0c0a18"
              opacity="0.6"
              transform={`rotate(${deg} 50 50)`}
            />
          ))}
        </g>
      </svg>
    </div>
  );
};

// Corner Rivet / Screw Component
const CornerRivet: React.FC<{ color: string; className: string }> = ({ color, className }) => (
  <div className={`absolute w-3 h-3 rounded-full flex items-center justify-center pointer-events-none z-10 ${className}`}>
    <div
      className="w-2.5 h-2.5 rounded-full border flex items-center justify-center shadow-inner relative"
      style={{ backgroundColor: `${color}33`, borderColor: color }}
    >
      <div className="w-1.5 h-[1.5px] rounded-full" style={{ backgroundColor: color }} />
      <div className="h-1.5 w-[1.5px] rounded-full absolute" style={{ backgroundColor: color }} />
    </div>
  </div>
);

export const ViperSubathonCard: React.FC<ViperSubathonCardProps> = ({
  seconds,
  initialSeconds = 7200,
  maxCapSeconds = 43200,
  isRunning,
  themeConfig,
  fontConfig,
  title = 'STARTING SOON',
  progressPercent,
  isLowTime,
  isTimeUp,
}) => {
  const viper = themeConfig.viperConfig || defaultViperConfig;

  // Format time components
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  // Format initial / target time for the top-right OF display
  const ofTimeStr = useMemo(() => {
    const target = initialSeconds || 1800;
    const th = Math.floor(target / 3600);
    const tm = Math.floor((target % 3600) / 60);
    const ts = target % 60;
    if (th > 0) {
      return `${pad(th)}:${pad(tm)}:${pad(ts)}`;
    }
    return `${pad(tm)}:${pad(ts)}`;
  }, [initialSeconds]);

  // Radius for the circular progress gauge
  const dialRadius = 32;
  const dialCircumference = 2 * Math.PI * dialRadius; // ~201.06
  const dialOffset = dialCircumference * (1 - Math.min(100, Math.max(0, progressPercent)) / 100);

  // Gradient ID safe string
  const gradientId = `viper-dial-${themeConfig.id}`;

  return (
    <div
      className={`relative w-full max-w-[620px] rounded-[28px] overflow-hidden ${viper.cardBg} ${viper.borderClass} ${viper.borderGlow} transition-all duration-300 select-none ${
        isLowTime ? 'ring-2 ring-rose-500/80 animate-pulse' : ''
      }`}
    >
      {/* Corner Rivets / Screws */}
      <CornerRivet color={viper.rivetColor} className="top-2.5 left-2.5" />
      <CornerRivet color={viper.rivetColor} className="top-2.5 right-2.5" />
      <CornerRivet color={viper.rivetColor} className="bottom-2.5 left-2.5" />
      <CornerRivet color={viper.rivetColor} className="bottom-2.5 right-2.5" />

      {/* Decorative Dashed Perimeter Border Frame */}
      <div
        className="absolute inset-2 rounded-[22px] border border-dashed pointer-events-none opacity-30"
        style={{ borderColor: themeConfig.accentColor }}
      />

      {/* Ambient Top Glow */}
      <div
        className={`absolute -top-12 inset-x-12 h-20 bg-gradient-to-b ${viper.accentGlow} blur-2xl pointer-events-none`}
      />

      {/* Sakura Floral Accent in Top Right for Sakura Mint theme */}
      {viper.hasSakuraAccent && (
        <div className="absolute top-1.5 right-6 pointer-events-none opacity-85 z-10">
          <svg width="70" height="38" viewBox="0 0 100 50" fill="none">
            {/* Branches */}
            <path
              d="M95 8 C75 14, 55 10, 35 22 C22 30, 12 36, 5 44"
              stroke="#854d0e"
              strokeWidth="2.2"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M55 10 C44 4, 38 2, 28 5"
              stroke="#854d0e"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.4"
            />
            {/* Sakura Blossoms */}
            <circle cx="35" cy="22" r="5" fill="#f472b6" />
            <circle cx="35" cy="22" r="2.2" fill="#fb7185" />
            <circle cx="55" cy="10" r="5.5" fill="#f472b6" />
            <circle cx="55" cy="10" r="2.5" fill="#f43f5e" />
            <circle cx="28" cy="5" r="4.5" fill="#fbcfe8" />
            <circle cx="12" cy="38" r="4" fill="#f472b6" />
            <circle cx="75" cy="12" r="5" fill="#fbcfe8" />
          </svg>
        </div>
      )}

      {/* Main 3-Column Content Layout */}
      <div className="relative z-10 px-4 sm:px-6 py-4 flex items-center justify-between gap-2 sm:gap-4">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Circular Gauge + Interlocking Mechanical Gears */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center justify-center shrink-0 w-[110px] sm:w-[124px]">
          {/* Circular Clock Dial */}
          <div className="relative w-[96px] h-[96px] sm:w-[104px] sm:h-[104px] flex items-center justify-center">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              className="overflow-visible"
            >
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={viper.dialProgressGradient[0]} />
                  <stop offset="100%" stopColor={viper.dialProgressGradient[1]} />
                </linearGradient>
              </defs>

              {/* 36 Radial Ticks around perimeter */}
              {Array.from({ length: 36 }).map((_, i) => {
                const angle = i * 10;
                const isMajor = i % 9 === 0;
                return (
                  <line
                    key={i}
                    x1="50"
                    y1={isMajor ? '6' : '9'}
                    x2="50"
                    y2="13"
                    stroke={viper.dialTicksColor}
                    strokeWidth={isMajor ? '2' : '1'}
                    strokeOpacity={isMajor ? '0.9' : '0.4'}
                    transform={`rotate(${angle} 50 50)`}
                  />
                );
              })}

              {/* Progress Track Circle */}
              <circle
                cx="50"
                cy="50"
                r={dialRadius}
                fill="none"
                stroke={viper.dialTrackColor}
                strokeWidth="4.5"
              />

              {/* Animated Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r={dialRadius}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth="4.5"
                strokeDasharray={dialCircumference}
                strokeDashoffset={dialOffset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{
                  transition: 'stroke-dashoffset 0.6s ease-out',
                }}
              />
            </svg>

            {/* Center Content: Clock Icon, Large Percent, REMAINING Subtitle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <Clock
                className="w-3.5 h-3.5 mb-0.5"
                style={{ color: viper.dialTextColor, opacity: 0.85 }}
              />
              <span
                className="text-base sm:text-lg font-black tracking-tight leading-none"
                style={{ color: viper.dialTextColor }}
              >
                {Math.round(progressPercent)}%
              </span>
              <span
                className="text-[7.5px] sm:text-[8px] font-bold uppercase tracking-widest mt-0.5 opacity-70"
                style={{ color: viper.dialTextColor }}
              >
                REMAINING
              </span>
            </div>
          </div>

          {/* Interlocking Mechanical Gears (Dual animated gears at bottom of dial) */}
          <div className="relative -mt-3.5 flex items-center justify-center w-full h-[36px]">
            {/* Left Gear (Larger, spins counter-clockwise) */}
            <MechanicalGear
              size={34}
              color={viper.gear1Color}
              teeth={8}
              isClockwise={false}
              isRunning={isRunning}
              speedSec={9}
              className="z-10 -mr-2"
            />
            {/* Right Gear (Interlocking, spins clockwise) */}
            <MechanicalGear
              size={28}
              color={viper.gear2Color}
              teeth={8}
              isClockwise={true}
              isRunning={isRunning}
              speedSec={6.8}
              className="z-0"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER COLUMN: Header Pills + Giant Bold Numerals + Controls Subtitle */}
        {/* ========================================================= */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1 sm:px-2">
          {/* Top Header Row with Status & Title Pills */}
          <div className="flex items-center justify-center gap-2 mb-2 sm:mb-2.5 flex-wrap">
            {/* Left Title Pill */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border ${viper.titlePillBg} ${viper.titlePillBorder} ${viper.titlePillText}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span className="truncate max-w-[140px] sm:max-w-[180px]">
                {title || 'STARTING SOON'}
              </span>
            </div>

            {/* Right Live Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase border bg-black/40 backdrop-blur-md ${viper.statusBorder} ${viper.statusColor}`}
            >
              {isTimeUp ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-rose-400">TIME UP</span>
                </>
              ) : isRunning ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                  <span>RUNNING</span>
                </>
              ) : (
                <>
                  <Pause className="w-2.5 h-2.5" />
                  <span>PAUSED</span>
                </>
              )}
            </div>
          </div>

          {/* Giant Countdown Numerals Display */}
          <div className="my-0.5 sm:my-1 flex items-center justify-center">
            {hours > 0 ? (
              /* If hours > 0, show HH : MM : SS */
              <div
                style={{ fontFamily: fontConfig.fontFamily }}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 leading-none select-none ${viper.numeralsColor} ${viper.numeralsShadow}`}
              >
                <span className="text-4xl sm:text-6xl font-black tracking-tight">{pad(hours)}</span>
                <span className="text-2xl sm:text-4xl font-bold opacity-60 pb-1">:</span>
                <span className="text-4xl sm:text-6xl font-black tracking-tight">{pad(minutes)}</span>
                <span className="text-2xl sm:text-4xl font-bold opacity-60 pb-1">:</span>
                <span className="text-4xl sm:text-6xl font-black tracking-tight">{pad(secs)}</span>
              </div>
            ) : (
              /* If hours === 0, show MM  SS (exact look from video: e.g. 00  30) */
              <div
                style={{ fontFamily: fontConfig.fontFamily }}
                className={`flex items-center justify-center gap-3 sm:gap-5 leading-none select-none ${viper.numeralsColor} ${viper.numeralsShadow}`}
              >
                <span className="text-5xl sm:text-7xl font-black tracking-tight">{pad(minutes)}</span>
                <span className="text-5xl sm:text-7xl font-black tracking-tight">{pad(secs)}</span>
              </div>
            )}
          </div>

          {/* Bottom Subtitle / Controls Line */}
          <div
            className={`mt-1 sm:mt-1.5 flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-mono font-bold tracking-widest uppercase ${viper.controlsSubtextColor}`}
          >
            <span>—</span>
            <span>PANEL CONTROLS</span>
            <span>—</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Target Time + Segmented LED Meter + Tag */}
        {/* ========================================================= */}
        <div className="flex flex-col items-center justify-between shrink-0 w-[65px] sm:w-[75px] self-stretch py-1">
          {/* Top: Target / Cap Info */}
          <div className="text-center">
            <span
              className={`block text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${viper.ofTargetColor} opacity-75`}
            >
              OF
            </span>
            <span
              className={`font-mono font-bold text-[11px] sm:text-xs leading-tight ${viper.ofTargetColor}`}
            >
              {ofTimeStr}
            </span>
          </div>

          {/* Center: Vertical Segmented LED VU-Meter (14 pill segments) */}
          <div className="flex flex-col items-center gap-[3px] py-1">
            {Array.from({ length: 14 }).map((_, idx) => {
              // idx 0 is top, idx 13 is bottom
              const segmentLevel = ((14 - idx) / 14) * 100;
              const isLit = progressPercent >= segmentLevel;
              return (
                <div
                  key={idx}
                  className={`w-6 sm:w-7 h-[4.5px] rounded-full transition-all duration-300 ${
                    isLit
                      ? `bg-gradient-to-r ${viper.ledActiveGradient} shadow-[0_0_8px_rgba(236,72,153,0.7)]`
                      : viper.ledInactiveColor
                  }`}
                />
              );
            })}
          </div>

          {/* Bottom: Manual / Live Monospace Tag */}
          <div className="text-center">
            <span
              className={`font-mono font-bold text-[8.5px] sm:text-[9px] tracking-wider uppercase ${viper.manualTagColor}`}
            >
              :: MANUAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
