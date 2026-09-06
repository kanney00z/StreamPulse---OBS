import React, { useState } from 'react';
import { Check, Palette, Sparkles, Box } from 'lucide-react';
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
  const [filter, setFilter] = useState<'all' | '3d' | 'classic'>('all');

  const filteredThemes = CHAT_THEMES.filter((t) => {
    if (filter === '3d') return t.is3D;
    if (filter === 'classic') return !t.is3D;
    return true;
  });

  const count3D = CHAT_THEMES.filter((t) => t.is3D).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            เลือกธีมกล่องแชท (Chat Overlay Themes)
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-cyan-300 font-medium flex items-center gap-1.5 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> มีให้เลือก {CHAT_THEMES.length} ธีม (ใหม่ 3D {count3D} ธีม)
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
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
          <span>✨ ธีม 3D มิติลอย ({count3D} ธีม)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-400 text-slate-950 font-black">
            NEW
          </span>
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
          คลาสสิก & โมเดิร์น ({CHAT_THEMES.length - count3D})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredThemes.map((theme: ChatThemeConfig) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`text-left p-3.5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between overflow-hidden cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                  : 'bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-900/60'
              } ${theme.is3D ? 'hover:-translate-y-0.5' : ''}`}
            >
              {/* Header with Title & Badge */}
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-white tracking-tight truncate flex items-center gap-1">
                  {theme.name}
                </span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                  theme.is3D
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                    : 'bg-white/10 text-slate-200 border-white/10'
                }`}>
                  {theme.badge}
                </span>
              </div>

              {/* Theme Mini Mock Preview */}
              <div
                className={`w-full p-2.5 rounded-xl mb-2.5 transition-transform group-hover:scale-[1.02] ${theme.previewBg}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-4 h-4 rounded-full bg-slate-400/40 shrink-0" />
                  <div className="h-2 w-14 rounded bg-white/40" />
                </div>
                <div className="h-2.5 w-full rounded bg-white/60 mb-1" />
                <div className="h-2 w-3/4 rounded bg-white/30" />
              </div>

              {/* Tagline & Selection Indicator */}
              <div className="flex items-center justify-between w-full mt-auto pt-2 border-t border-white/10">
                <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug">
                  {theme.tagline}
                </p>
                {isSelected ? (
                  <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 text-slate-950 flex items-center justify-center shrink-0 ml-1.5 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
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
