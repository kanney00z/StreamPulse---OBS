import React from 'react';

// Official Platform Icons matching video exactly
export const TwitchIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
  </svg>
);

export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const KickIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 2h5.5v6.5l4.5-6.5h6l-6.8 9.5L21 22h-6l-4.5-7.5V22H3V2z" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .59.04.86.13V9.41a6.33 6.33 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.58c1.37.98 3.04 1.56 4.85 1.56V6.69h-.08z" />
  </svg>
);

// Cute Stickers / Emotes (matching SpacelabsGaming in video 00:03 - 00:08)
export const ShibaSticker: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <span className={`inline-flex items-center justify-center select-none ${className} animate-bounce-subtle`}>
    <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
      {/* Dog Head */}
      <circle cx="24" cy="24" r="20" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
      {/* Ears */}
      <polygon points="8,10 18,6 14,18" fill="#d97706" stroke="#78350f" strokeWidth="2" />
      <polygon points="10,11 16,8 13,16" fill="#fef3c7" />
      <polygon points="40,10 30,6 34,18" fill="#d97706" stroke="#78350f" strokeWidth="2" />
      <polygon points="38,11 32,8 35,16" fill="#fef3c7" />
      {/* White Muzzle */}
      <ellipse cx="24" cy="29" rx="11" ry="8.5" fill="#fef3c7" />
      {/* Eyebrows */}
      <circle cx="16" cy="17" r="2.2" fill="#ffffff" />
      <circle cx="32" cy="17" r="2.2" fill="#ffffff" />
      {/* Eyes */}
      <ellipse cx="16" cy="23" rx="2.5" ry="3.2" fill="#18181b" />
      <ellipse cx="32" cy="23" rx="2.5" ry="3.2" fill="#18181b" />
      <circle cx="17.2" cy="22" r="1" fill="#ffffff" />
      <circle cx="33.2" cy="22" r="1" fill="#ffffff" />
      {/* Nose */}
      <ellipse cx="24" cy="26.5" rx="2.2" ry="1.6" fill="#18181b" />
      {/* Tongue */}
      <path d="M22 29 Q24 35 26 29 Z" fill="#f43f5e" />
      {/* Cheeks */}
      <circle cx="11" cy="27" r="3" fill="#f472b6" opacity="0.75" />
      <circle cx="37" cy="27" r="3" fill="#f472b6" opacity="0.75" />
    </svg>
  </span>
);

export const AnimeCheerSticker: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <span className={`inline-flex items-center justify-center select-none ${className} animate-pulse`}>
    <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
      {/* Hair back */}
      <circle cx="24" cy="23" r="19" fill="#ec4899" />
      {/* Face */}
      <circle cx="24" cy="24" r="15" fill="#fef08a" />
      {/* Hair bangs */}
      <path d="M10 18 Q16 10 24 14 Q32 10 38 18 Q35 12 24 10 Q13 12 10 18 Z" fill="#db2777" />
      {/* Star Eyes Excited */}
      <path d="M17 21 L18.5 24 L21 24 L19 25.5 L19.8 28 L17 26.5 L14.2 28 L15 25.5 L13 24 L15.5 24 Z" fill="#a855f7" />
      <path d="M31 21 L32.5 24 L35 24 L33 25.5 L33.8 28 L31 26.5 L28.2 28 L29 25.5 L27 24 L29.5 24 Z" fill="#a855f7" />
      {/* Big Open Laugh Mouth */}
      <path d="M19 29 Q24 37 29 29 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
      <path d="M21 32 Q24 36 27 32 Z" fill="#f472b6" />
      {/* Blushing cheeks */}
      <ellipse cx="14" cy="28" rx="3.5" ry="2" fill="#fb7185" />
      <ellipse cx="34" cy="28" rx="3.5" ry="2" fill="#fb7185" />
      {/* Hands Up */}
      <circle cx="8" cy="24" r="4" fill="#fef08a" stroke="#db2777" strokeWidth="1.5" />
      <circle cx="40" cy="24" r="4" fill="#fef08a" stroke="#db2777" strokeWidth="1.5" />
    </svg>
  </span>
);
