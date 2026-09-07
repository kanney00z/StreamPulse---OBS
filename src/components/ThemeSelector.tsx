import React, { useState } from 'react';
import { Check, Palette, Sparkles, Box, Flame, Tv } from 'lucide-react';
import { ChatThemeId, ChatThemeConfig } from '../types';
import { CHAT_THEMES } from '../data/mockData';

interface ThemeSelectorProps {
  selectedTheme: ChatThemeId;
  onSelectTheme: (id: ChatThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onSelectTheme,
}) => {
  const [filter, setFilter] = useState<'all' | 'twitch' | 'comic' | '3d' | 'classic'>('twitch');

  const countTwitch = CHAT_THEMES.filter((t) => t.isTwitchGlow).length;
  const countComic = CHAT_THEMES.filter((t) => t.isComic).length;
  const count3D = CHAT_THEMES.filter((t) => t.is3D).length;

  const filteredThemes = CHAT_THEMES.filter((t) => {
    if (filter === 'twitch') return t.isTwitchGlow;
    if (filter === 'comic') return t.isComic;
    if (filter === '3d') return t.is3D;
    if (filter === 'classic') return !t.is3D && !t.isComic && !t.isTwitchGlow;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            เลือกธีมกล่องแชท (Chat Overlay Themes)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-purple-300 font-medium flex items-center gap-1.5 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/25 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> รวม {CHAT_THEMES.length} ธีม (ใหม่ Twitch Dark Glow & แนวนอน!)
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setFilter('twitch')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === 'twitch'
              ? 'bg-gradient-to-r from-purple-600/40 via-fuchsia-600/30 to-pink-600/40 text-white border border-purple-400/80 shadow-[0_0_18px_rgba(168,85,247,0.4)] ring-1 ring-purple-400/60'
              : 'bg-slate-900/70 text-slate-300 border border-white/10 hover:border-purple-500/40'
          }`}
        >
          <Tv className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
          <span>💜 Twitch Dark Role Glow ({countTwitch} สไตล์ตามคลิป)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500 text-white font-black animate-pulse">
            VIDEO
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('comic')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === 'comic'
              ? 'bg-gradient-to-r from-pink-500/30 via-rose-500/25 to-amber-500/30 text-white border border-pink-400/70 shadow-[0_0_18px_rgba(244,63,94,0.35)] ring-1 ring-pink-400/50'
              : 'bg-slate-900/70 text-slate-300 border border-white/10 hover:border-pink-500/40'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
          <span>💥 Comic Chat Pop ({countComic})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('3d')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === '3d'
              ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-white border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400/40'
              : 'bg-slate-900/60 text-slate-300 border border-white/10 hover:border-cyan-500/30'
          }`}
        >
          <Box className="w-3.5 h-3.5 text-cyan-400" />
          <span>✨ ธีม 3D มิติลอย ({count3D})</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('classic')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'classic'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-slate-200'
          }`}
        >
          คลาสสิก & มินิมอล ({CHAT_THEMES.length - count3D - countComic - countTwitch})
        </button>

        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-slate-200'
          }`}
        >
          ทั้งหมด ({CHAT_THEMES.length})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredThemes.map((theme: ChatThemeConfig) => {
          const isSelected = selectedTheme === theme.id;
          const isTwitch = !!theme.isTwitchGlow;
          const isComic = !!theme.isComic;
          const comic = theme.comicConfig;

          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`text-left p-3.5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between overflow-hidden cursor-pointer ${
                isSelected
                  ? isTwitch
                    ? 'bg-slate-900 border-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.4)] ring-2 ring-purple-400/60'
                    : isComic
                    ? 'bg-slate-900 border-pink-400 shadow-[0_0_22px_rgba(244,63,94,0.35)] ring-2 ring-pink-400/60'
                    : 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                  : 'bg-slate-950/70 border-white/10 hover:border-white/20 hover:bg-slate-900/60'
              } ${theme.is3D || isComic || isTwitch ? 'hover:-translate-y-0.5' : ''}`}
            >
              {/* Header with Title & Badge */}
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-white tracking-tight truncate flex items-center gap-1">
                  {theme.name}
                </span>
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded border shrink-0 ${
                    isTwitch
                      ? 'bg-purple-950 text-purple-300 border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                      : isComic
                      ? 'bg-yellow-400 text-slate-950 border-slate-900 shadow-[0_2px_0_#18181b]'
                      : theme.is3D
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                      : 'bg-white/10 text-slate-200 border-white/10'
                  }`}
                >
                  {theme.badge}
                </span>
              </div>

              {/* Theme Mini Mock Preview */}
              <div
                className={`w-full p-2.5 rounded-xl mb-2.5 relative transition-transform group-hover:scale-[1.02] ${theme.previewBg}`}
              >
                {/* Comic mini starburst sticker in preview */}
                {isComic && comic && (
                  <div className="absolute -top-2 -right-1.5 select-none pointer-events-none z-10">
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-black text-slate-950 border border-slate-900 shadow-[0_1.5px_0_#000]"
                      style={{ backgroundColor: comic.burstColor }}
                    >
                      {comic.word}
                    </span>
                  </div>
                )}

                {/* Twitch glow right accent in preview */}
                {isTwitch && (
                  <div className="absolute top-2 right-2 select-none pointer-events-none z-10">
                    <span className="text-[10px] drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]">
                      ✨
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className={`w-4 h-4 shrink-0 ${
                      isTwitch
                        ? 'rounded-md bg-purple-500/60 border border-purple-400/50'
                        : isComic
                        ? 'rounded-full border border-slate-900 bg-pink-400'
                        : 'rounded-full bg-slate-400/40'
                    }`}
                  />
                  <div
                    className={`h-2 rounded ${
                      isTwitch
                        ? 'w-16 bg-white/70 font-mono'
                        : isComic
                        ? 'w-14 bg-slate-900/60'
                        : 'w-14 bg-white/40'
                    }`}
                  />
                  {isTwitch && (
                    <div className="h-1.5 w-6 rounded bg-purple-500/60 ml-auto" />
                  )}
                </div>
                <div
                  className={`h-2.5 w-full rounded mb-1 ${
                    isTwitch
                      ? 'bg-neutral-200/80'
                      : isComic
                      ? 'bg-slate-900/80 font-bold'
                      : 'bg-white/60'
                  }`}
                />
                <div
                  className={`h-2 w-3/4 rounded ${
                    isTwitch
                      ? 'bg-neutral-400/60'
                      : isComic
                      ? 'bg-slate-900/40'
                      : 'bg-white/30'
                  }`}
                />
              </div>

              {/* Tagline & Selection Indicator */}
              <div className="flex items-center justify-between w-full mt-auto pt-2 border-t border-white/10">
                <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">
                  {theme.tagline}
                </p>
                {isSelected ? (
                  <span
                    className={`w-5 h-5 rounded-full text-slate-950 flex items-center justify-center shrink-0 ml-1.5 ${
                      isTwitch
                        ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.7)]'
                        : isComic
                        ? 'bg-pink-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                        : 'bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full border border-white/20 shrink-0 ml-1.5 group-hover:border-white/40" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
