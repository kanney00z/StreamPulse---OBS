import React, { useEffect, useState } from 'react';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ObsConnectionNotification } from '../types';

interface ObsConnectionToastProps {
  notifications: ObsConnectionNotification[];
  onDismiss: (id: string) => void;
  onOpenObsModal?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const ObsConnectionToast: React.FC<ObsConnectionToastProps> = ({
  notifications,
  onDismiss,
  onOpenObsModal,
  soundEnabled = true,
  onToggleSound,
}) => {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none select-none transition-all duration-300"
      role="region"
      aria-live="polite"
      aria-label="OBS Connection Alerts"
    >
      {notifications.map((item) => (
        <ToastItem
          key={item.id}
          notification={item}
          onDismiss={() => onDismiss(item.id)}
          onOpenObsModal={onOpenObsModal}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  notification: ObsConnectionNotification;
  onDismiss: () => void;
  onOpenObsModal?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({
  notification,
  onDismiss,
  onOpenObsModal,
  soundEnabled,
  onToggleSound,
}) => {
  const isConnected = notification.status === 'connected';
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-dismiss in 4.5 seconds with pause-on-hover
  useEffect(() => {
    if (isPaused) return;

    const duration = 4500;
    const intervalTime = 50;
    const decrement = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - decrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, onDismiss]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`pointer-events-auto relative overflow-hidden rounded-2xl p-4 shadow-2xl backdrop-blur-xl border transition-all duration-300 transform animate-in slide-in-from-right-8 fade-in ${
        isConnected
          ? 'bg-slate-900/95 border-emerald-500/50 shadow-emerald-950/60 text-slate-100'
          : 'bg-slate-900/95 border-amber-500/50 shadow-amber-950/60 text-slate-100'
      }`}
    >
      {/* Background ambient glow */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20 ${
          isConnected ? 'bg-emerald-400' : 'bg-amber-400'
        }`}
      />

      <div className="relative flex items-start gap-3.5">
        {/* Animated Status Icon Indicator */}
        <div className="flex-shrink-0 mt-0.5">
          <div
            className={`relative flex items-center justify-center w-10 h-10 rounded-xl border ${
              isConnected
                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-400'
                : 'bg-amber-500/15 border-amber-400/40 text-amber-400'
            }`}
          >
            {isConnected ? (
              <>
                <Radio className="w-5 h-5 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              </>
            ) : (
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5" /> OBS Live Connected
                </>
              ) : (
                <>
                  <AlertTriangle className="w-2.5 h-2.5" /> OBS Disconnected
                </>
              )}
            </span>

            {notification.overlayTitle && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 truncate bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                <Layers className="w-2.5 h-2.5 text-cyan-400" />
                {notification.overlayTitle}
              </span>
            )}
          </div>

          <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            {isConnected ? 'OBS Browser Source เชื่อมต่อสดแล้ว!' : 'OBS Browser Source ปิดการเชื่อมต่อ'}
            {isConnected && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
          </h4>

          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            {isConnected
              ? 'ตรวจพบหน้าต่าง OBS Browser Source เริ่มทำงาน วิดเจ็ตกำลังซิงก์ภาพและเสียงแบบเรียลไทม์'
              : 'หน้าต่าง Browser Source ใน OBS ถูกปิด รีเฟรช หรืออยู่นอกซีนการถ่ายทอดสด'}
          </p>

          {/* Metadata pill & quick action */}
          <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-800/80 text-[11px]">
            {typeof notification.clientCount === 'number' && (
              <span
                className={`font-mono font-semibold ${
                  isConnected ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {notification.clientCount > 0
                  ? `⚡ กำลังเชื่อมต่อ ${notification.clientCount} จอ`
                  : '⚠️ ไม่มีจอ OBS เปิดอยู่'}
              </span>
            )}

            {notification.transport && (
              <span className="text-slate-400 font-normal">
                • {notification.transport}
              </span>
            )}

            {onOpenObsModal && (
              <button
                type="button"
                onClick={onOpenObsModal}
                className="ml-auto inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium underline underline-offset-2 transition-colors cursor-pointer"
              >
                ดู URL <ExternalLink className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Top Right Controls (Mute / Close) */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="ปิดการแจ้งเตือน"
          >
            <X className="w-4 h-4" />
          </button>

          {onToggleSound && (
            <button
              type="button"
              onClick={onToggleSound}
              className={`p-1 rounded-lg text-xs transition-colors cursor-pointer ${
                soundEnabled
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-rose-400 hover:text-rose-300'
              }`}
              title={soundEnabled ? 'เปิดเสียงแจ้งเตือนอยู่ (คลิกเพื่อปิด)' : 'ปิดเสียงแจ้งเตือนอยู่'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Smooth auto-dismiss countdown progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/60">
        <div
          className={`h-full transition-all duration-75 ${
            isConnected
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
              : 'bg-gradient-to-r from-amber-500 to-rose-400'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
