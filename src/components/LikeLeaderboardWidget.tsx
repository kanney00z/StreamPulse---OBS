import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Trophy, Crown, Flame, Sparkles } from 'lucide-react';
import { LikeUser, OverlayCustomSettings, FloatingHeartItem } from '../types';

interface LikeLeaderboardWidgetProps {
  users: LikeUser[];
  totalLikes: number;
  recentHearts: FloatingHeartItem[];
  settings: OverlayCustomSettings;
  isOBSMode?: boolean;
}

export const LikeLeaderboardWidget: React.FC<LikeLeaderboardWidgetProps> = ({
  users,
  totalLikes,
  recentHearts,
  settings,
  isOBSMode = false,
}) => {
  const [pulseGoal, setPulseGoal] = useState(false);

  useEffect(() => {
    setPulseGoal(true);
    const t = setTimeout(() => setPulseGoal(false), 600);
    return () => clearTimeout(t);
  }, [totalLikes]);

  const topUsers = users.slice(0, settings.likeShowTopCount);
  const goalProgress = Math.min(100, Math.round((totalLikes / settings.likeGoal) * 100));

  const rankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-neutral-950 font-black text-xs shadow-[0_0_8px_rgba(251,191,36,0.6)]">
            1
          </span>
        );
      case 2:
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-neutral-950 font-black text-xs shadow-sm">
            2
          </span>
        );
      case 3:
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-700 to-orange-800 text-white font-black text-xs shadow-sm">
            3
          </span>
        );
      default:
        return (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-800 text-neutral-400 font-bold text-xs border border-neutral-700">
            {rank}
          </span>
        );
    }
  };

  return (
    <div
      className={`relative w-full h-full flex flex-col justify-between p-4 overflow-hidden select-none ${
        isOBSMode ? 'bg-transparent' : ''
      }`}
    >
      {/* Floating Hearts Animation Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        <AnimatePresence>
          {recentHearts.map((heart) => (
            <div
              key={heart.id}
              className="absolute bottom-6 floating-heart flex items-center justify-center"
              style={{
                left: `${heart.x}%`,
                color: heart.color,
                transform: `scale(${heart.scale})`,
              }}
            >
              <Heart className="w-7 h-7 fill-current drop-shadow-[0_2px_10px_rgba(244,63,94,0.6)]" />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main Leaderboard Content */}
      <div className="relative z-10 flex flex-col gap-3">
        {/* Header: Title & Total Likes */}
        <div className="flex items-center justify-between bg-neutral-950/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-rose-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-[0_0_12px_rgba(244,63,94,0.4)]">
              <Heart className="w-4 h-4 text-white fill-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
                TOP LIKERS
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </h3>
              <p className="text-[11px] text-neutral-400">กระดานอันดับกดไลก์</p>
            </div>
          </div>

          <div className="text-right">
            <motion.div
              animate={pulseGoal ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-base font-black tracking-tight text-white flex items-center justify-end gap-1"
            >
              <span className="text-rose-400">{totalLikes.toLocaleString()}</span>
              <span className="text-xs font-normal text-neutral-400">ไลก์</span>
            </motion.div>
          </div>
        </div>

        {/* Optional Like Goal Bar */}
        {settings.likeShowGoalBar && (
          <div className="bg-neutral-950/75 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-neutral-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> เป้าหมายไลก์ไลฟ์นี้
              </span>
              <span className="font-bold text-rose-300">
                {goalProgress}% ({totalLikes.toLocaleString()} / {settings.likeGoal.toLocaleString()})
              </span>
            </div>
            <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        )}

        {/* Empty State when no one has liked yet */}
        {topUsers.length === 0 && (
          <div className="bg-neutral-950/80 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col items-center justify-center text-center gap-3 animate-fadeIn">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.25)]">
                <Heart className="w-7 h-7 text-rose-400 fill-rose-500/30 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-pink-500"></span>
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">รอคนดูเคาะจอกดหัวใจ</h4>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-[220px]">
                ยังไม่มีใครกดไลก์ เคาะหน้าจอตอนนี้เพื่อขึ้นสู่อันดับ 1 👑
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-rose-300 font-medium">
              <span>💖 แตะหน้าจอ 2 ครั้งเพื่อส่งไลก์</span>
            </div>
          </div>
        )}

        {/* Podium View for Top 3 (if style is podium-card and >= 3 likers) */}
        {settings.likeStyle === 'podium-card' && topUsers.length >= 3 && (
          <div className="bg-neutral-950/80 backdrop-blur-xl p-3.5 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-end justify-center gap-2 pt-4 pb-2">
              {/* Rank 2 (Silver) */}
              <div className="flex-1 flex flex-col items-center">
                <div className="relative mb-1">
                  <img
                    src={topUsers[1].avatar}
                    alt={topUsers[1].name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-300 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-black font-black text-[10px] flex items-center justify-center border border-neutral-900">
                    2
                  </span>
                </div>
                <span className="text-xs font-semibold text-neutral-200 truncate w-full text-center">
                  {topUsers[1].name.split(' ')[0]}
                </span>
                <span className="text-[11px] font-bold text-slate-300">
                  {topUsers[1].likeCount.toLocaleString()}
                </span>
                <div className="w-full h-9 mt-1 rounded-t-lg bg-gradient-to-t from-slate-800 to-slate-700/80 flex items-center justify-center text-[10px] font-bold text-slate-300">
                  2ND
                </div>
              </div>

              {/* Rank 1 (Gold - Center, taller) */}
              <div className="flex-1 flex flex-col items-center">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce mb-0.5" />
                <div className="relative mb-1">
                  <img
                    src={topUsers[0].avatar}
                    alt={topUsers[0].name}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.6)] ring-2 ring-amber-400/30"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black font-black text-[10px] flex items-center justify-center border border-neutral-900 shadow">
                    1
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-300 truncate w-full text-center">
                  {topUsers[0].name.split(' ')[0]}
                </span>
                <span className="text-[11px] font-black text-amber-400">
                  {topUsers[0].likeCount.toLocaleString()}
                </span>
                <div className="w-full h-14 mt-1 rounded-t-lg bg-gradient-to-t from-amber-600/70 to-yellow-500/80 flex items-center justify-center text-[10px] font-black text-neutral-950 shadow-md">
                  👑 1ST
                </div>
              </div>

              {/* Rank 3 (Bronze) */}
              <div className="flex-1 flex flex-col items-center">
                <div className="relative mb-1">
                  <img
                    src={topUsers[2].avatar}
                    alt={topUsers[2].name}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border-2 border-amber-700 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white font-black text-[10px] flex items-center justify-center border border-neutral-900">
                    3
                  </span>
                </div>
                <span className="text-xs font-semibold text-neutral-200 truncate w-full text-center">
                  {topUsers[2].name.split(' ')[0]}
                </span>
                <span className="text-[11px] font-bold text-amber-500">
                  {topUsers[2].likeCount.toLocaleString()}
                </span>
                <div className="w-full h-7 mt-1 rounded-t-lg bg-gradient-to-t from-amber-950 to-amber-900/80 flex items-center justify-center text-[10px] font-bold text-amber-300">
                  3RD
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Rank List (Rank 1 to N if podium is active and <3, or Rank 4+ if podium is active and >=3) */}
        {topUsers.length > 0 && (
          <div className="space-y-1.5">
            {((settings.likeStyle === 'podium-card' && topUsers.length >= 3)
              ? topUsers.slice(3)
              : topUsers
            ).map((user) => (
              <motion.div
                key={user.id}
                layout
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between px-3 py-2 rounded-xl backdrop-blur-md transition-all ${
                  user.rank === 1
                    ? 'bg-amber-500/15 border border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                    : 'bg-neutral-950/75 border border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {rankBadge(user.rank)}
                  <img
                    src={user.avatar}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-white/20 shrink-0"
                  />
                  <span className="text-xs font-medium text-neutral-100 truncate">{user.name}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-xs font-bold text-rose-300">
                    {user.likeCount.toLocaleString()}
                  </span>
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
