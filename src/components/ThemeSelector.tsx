import React from 'react';
import { Check, Palette, Sparkles } from 'lucide-react';
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
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            เลือกธีมกล่องแชท (Chat Overlay Themes)
          </h3>
        </div>
        <span className="text-xs text-cyan-300 font-medium flex items-center gap-1.5 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> มีให้เลือก 8 ธีมยอดนิยม
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CHAT_THEMES.map((theme: ChatThemeConfig) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`text-left p-3.5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between overflow-hidden cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                  : 'bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-900/60'
              }`}
            >
              {/* Header with Title & Badge */}
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-xs font-bold text-white tracking-tight truncate">
                  {theme.name}
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-white/10 text-slate-200 border border-white/10">
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
