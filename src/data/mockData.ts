import { ChatThemeConfig, GiftItem, LikeUser, ChatMessage, SubathonFontConfig } from '../types';

export const CHAT_THEMES: ChatThemeConfig[] = [
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    tagline: 'นีออนไซเบอร์ ขอบสะท้อนแสง สไตล์สตรีมเมอร์เกมมิ่ง',
    badge: 'HOT 🔥',
    previewBg: 'bg-slate-950 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    containerClass: 'space-y-2.5 font-sans',
    messageCardClass: (highlighted) =>
      `relative backdrop-blur-md px-3.5 py-2.5 rounded-lg border transition-all duration-200 ${
        highlighted
          ? 'bg-gradient-to-r from-purple-950/90 via-cyan-950/80 to-slate-950/90 border-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.4)]'
          : 'bg-slate-950/85 border-cyan-500/30 hover:border-cyan-400/60 shadow-[0_4px_12px_rgba(0,0,0,0.5)]'
      }`,
    usernameClass: 'font-semibold tracking-wide text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]',
    textClass: 'text-neutral-100 font-normal leading-relaxed',
    avatarShape: 'squircle',
    accentBorder: 'border-l-4 border-l-cyan-400',
  },
  {
    id: 'minimal-glass',
    name: 'Minimal Frosted Glass',
    tagline: 'มินิมอล กระจกฝ้าคลีน หรูหรา สบายตา ไม่บดบังเกม',
    badge: 'CLEAN ✨',
    previewBg: 'bg-white/10 backdrop-blur-md border border-white/20',
    containerClass: 'space-y-2',
    messageCardClass: (highlighted) =>
      `backdrop-blur-xl px-4 py-2.5 rounded-2xl border transition-all duration-200 ${
        highlighted
          ? 'bg-white/25 border-white/50 shadow-[0_8px_32px_rgba(255,255,255,0.15)]'
          : 'bg-black/35 border-white/15 hover:bg-black/45 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
      }`,
    usernameClass: 'font-medium text-white/90 tracking-tight',
    textClass: 'text-white/80 font-light leading-relaxed',
    avatarShape: 'circle',
    accentBorder: 'border-white/20',
  },
  {
    id: 'kawaii-pastel',
    name: 'Kawaii Pastel Sweet',
    tagline: 'พาสเทล นุ่มฟู น่ารัก เหมาะกับสตรีมเมอร์สาย Cute & VTuber',
    badge: 'CUTE 💖',
    previewBg: 'bg-pink-950/60 border border-pink-400/30',
    containerClass: 'space-y-2.5',
    messageCardClass: (highlighted) =>
      `px-3.5 py-2.5 rounded-2xl border-2 transition-all duration-200 ${
        highlighted
          ? 'bg-gradient-to-r from-pink-500/25 to-purple-500/25 border-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.35)]'
          : 'bg-neutral-900/80 border-pink-300/40 hover:border-pink-400 shadow-[0_4px_12px_rgba(244,114,182,0.15)]'
      }`,
    usernameClass: 'font-semibold text-pink-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
    textClass: 'text-pink-50 font-normal leading-relaxed',
    avatarShape: 'circle',
    accentBorder: 'border-l-4 border-l-pink-400',
  },
  {
    id: 'streamer-dark',
    name: 'Streamer Pro Dark',
    tagline: 'ดำด้าน สปอร์ต โปรเฟสชันแนล สำหรับแนว Valorant / FPS',
    badge: 'PRO ⚡',
    previewBg: 'bg-neutral-900 border border-neutral-700',
    containerClass: 'space-y-2',
    messageCardClass: (highlighted) =>
      `px-3.5 py-2 rounded-lg border transition-all duration-200 ${
        highlighted
          ? 'bg-neutral-800 border-amber-500/70 shadow-lg'
          : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 shadow-md'
      }`,
    usernameClass: 'font-bold text-amber-400 tracking-tight',
    textClass: 'text-neutral-200 text-sm leading-relaxed',
    avatarShape: 'rounded',
    accentBorder: 'border-l-2 border-l-amber-500',
  },
  {
    id: 'comic-pop',
    name: 'Manga / Comic Pop',
    tagline: 'สไตล์การ์ตูนคอมมิค เส้นขอบเข้ม ป๊อปสะดุดตา',
    badge: 'POP 💥',
    previewBg: 'bg-amber-400 text-black border-2 border-black shadow-[3px_3px_0px_#000]',
    containerClass: 'space-y-2.5',
    messageCardClass: (highlighted) =>
      `px-3.5 py-2 rounded-xl border-2 border-black comic-dots transition-transform duration-150 ${
        highlighted
          ? 'bg-yellow-300 text-black shadow-[4px_4px_0px_#000]'
          : 'bg-white text-black shadow-[3px_3px_0px_#000]'
      }`,
    usernameClass: 'font-black text-black uppercase tracking-wider',
    textClass: 'text-black font-bold leading-tight',
    avatarShape: 'squircle',
    accentBorder: 'border-2 border-black',
  },
  {
    id: 'aurora-gradient',
    name: 'Aurora Gradient Pulse',
    tagline: 'แสงเหนือ ไล่เฉดสีม่วงครามมรกต พริ้วไหว ดูมีมิติระดับท็อป',
    badge: 'MODERN 🌌',
    previewBg: 'bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-emerald-900/80 border border-purple-500/30',
    containerClass: 'space-y-2.5',
    messageCardClass: (highlighted) =>
      `px-4 py-2.5 rounded-xl border transition-all duration-200 ${
        highlighted
          ? 'bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-pink-900/90 border-indigo-400/80 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
          : 'bg-slate-900/80 border-slate-700/60 hover:border-indigo-400/40 shadow-lg'
      }`,
    usernameClass: 'font-semibold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent',
    textClass: 'text-slate-100 font-normal leading-relaxed',
    avatarShape: 'circle',
    accentBorder: 'border-l-4 border-l-purple-500',
  },
  {
    id: 'retro-arcade',
    name: 'Retro 8-Bit Arcade',
    tagline: 'กลิ่นอายเกมตู้ยุค 90s พิกเซลไฟเขียวสะท้อนแสง',
    badge: 'RETRO 👾',
    previewBg: 'bg-black border-2 border-emerald-500/60 text-emerald-400',
    containerClass: 'space-y-2 font-mono',
    messageCardClass: (highlighted) =>
      `px-3 py-2 rounded-none border-2 transition-all ${
        highlighted
          ? 'bg-neutral-950 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
          : 'bg-neutral-950/90 border-emerald-700/50 hover:border-emerald-500 shadow-sm'
      }`,
    usernameClass: 'font-bold text-emerald-400 tracking-wider font-mono uppercase',
    textClass: 'text-emerald-100 font-mono text-sm leading-normal',
    avatarShape: 'rounded',
    accentBorder: 'border-l-4 border-l-emerald-400',
  },
  {
    id: 'tiktok-bubble',
    name: 'TikTok / Shorts Live Bubble',
    tagline: 'ฟองสบู่ยอดนิยมสำหรับไลฟ์ติ๊กต็อกและช็อตส์ โดดเด่นอ่านง่าย',
    badge: 'TRENDING 📱',
    previewBg: 'bg-neutral-900/90 border border-rose-500/30',
    containerClass: 'space-y-2',
    messageCardClass: (highlighted) =>
      `px-3.5 py-2 rounded-full border backdrop-blur-md transition-all duration-200 ${
        highlighted
          ? 'bg-neutral-900/95 border-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.3)]'
          : 'bg-neutral-900/80 border-neutral-700 hover:border-rose-400/40 shadow'
      }`,
    usernameClass: 'font-semibold text-rose-300',
    textClass: 'text-neutral-100 text-sm font-normal',
    avatarShape: 'circle',
    accentBorder: 'border-rose-500/30',
    category: 'modern',
  },
  {
    id: '3d-glass-prism',
    name: '3D Prism Glass',
    tagline: 'กระจก 3D ปริซึมลอยตัว แสงสะท้อนมิติเหลี่ยมแก้วเงาแวววาว ล้ำยุคสมจริง',
    badge: '3D PRISM 🔮',
    is3D: true,
    category: '3d',
    previewBg: 'bg-gradient-to-br from-cyan-950/80 via-slate-900 to-purple-950/80 border-t border-t-cyan-300/60 border-b-2 border-b-purple-900 shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)]',
    containerClass: 'space-y-3 font-sans',
    messageCardClass: (highlighted) =>
      `px-4 py-3 rounded-2xl border-t border-t-cyan-300/60 border-b-[3px] border-b-purple-950 border-x border-x-white/20 backdrop-blur-xl transition-all duration-200 ${
        highlighted
          ? 'bg-gradient-to-r from-purple-900/90 via-slate-900/90 to-cyan-900/90 shadow-[0_12px_28px_-4px_rgba(6,182,212,0.4),0_0_20px_rgba(168,85,247,0.3),inset_0_2px_2px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.7)] ring-1 ring-cyan-400/60'
          : 'bg-slate-950/80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.85),0_2px_8px_rgba(6,182,212,0.15),inset_0_1.5px_1px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.6)] hover:shadow-[0_14px_30px_-5px_rgba(0,0,0,0.9),inset_0_2px_2px_rgba(255,255,255,0.45)]'
      }`,
    usernameClass: 'font-bold tracking-wide text-cyan-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]',
    textClass: 'text-slate-100 font-normal leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]',
    avatarShape: 'squircle',
    accentBorder: 'border-l-4 border-l-cyan-400 shadow-[-4px_0_12px_rgba(34,211,238,0.4)]',
  },
  {
    id: '3d-cyber-isometric',
    name: '3D Cyber Isometric',
    tagline: 'บล็อก 3 มิติหนานูน ลอยตัวมีขอบข้างมิติ ไอโซเมตริกเกมมิ่งสุดเท่',
    badge: '3D BLOCK 🧊',
    is3D: true,
    category: '3d',
    previewBg: 'bg-slate-900 border-t border-t-cyan-400 border-l border-l-cyan-500/60 border-r border-r-indigo-900 border-b-4 border-b-indigo-950 shadow-[0_6px_0_#0f172a]',
    containerClass: 'space-y-3.5',
    messageCardClass: (highlighted) =>
      `px-4 py-2.5 rounded-xl border-t border-t-cyan-400/80 border-l-2 border-l-cyan-500/60 border-r-2 border-r-slate-900 border-b-[5px] transition-all duration-200 ${
        highlighted
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b-cyan-600 shadow-[0_6px_0_#0e7490,0_16px_25px_rgba(6,182,212,0.35),inset_0_1px_0_rgba(255,255,255,0.3)]'
          : 'bg-slate-950/90 border-b-indigo-950 shadow-[0_6px_0_#020617,0_12px_20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] hover:border-b-indigo-900'
      }`,
    usernameClass: 'font-black uppercase tracking-wider text-cyan-300 drop-shadow-[0_2px_0_#020617]',
    textClass: 'text-neutral-100 font-medium leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]',
    avatarShape: 'rounded',
    accentBorder: 'border-l-4 border-l-cyan-400',
  },
  {
    id: '3d-tactile-clay',
    name: '3D Claymorphism Soft',
    tagline: 'ผิวนูนนุ่ม 3 มิติ เคลย์มอร์ฟิซึม แสงตกกระทบละมุน ฟีลจับต้องได้จริง',
    badge: '3D CLAY 🫧',
    is3D: true,
    category: '3d',
    previewBg: 'bg-slate-800/90 border border-white/20 shadow-[4px_4px_12px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)]',
    containerClass: 'space-y-3',
    messageCardClass: (highlighted) =>
      `px-4 py-3 rounded-3xl border border-white/20 transition-all duration-200 ${
        highlighted
          ? 'bg-gradient-to-br from-purple-900/90 via-slate-800/90 to-purple-950/95 shadow-[6px_6px_20px_rgba(168,85,247,0.35),-3px_-3px_10px_rgba(255,255,255,0.15),inset_0_3px_6px_rgba(255,255,255,0.45),inset_0_-3px_6px_rgba(0,0,0,0.5)]'
          : 'bg-gradient-to-br from-slate-800/90 via-slate-850 to-slate-900/95 shadow-[6px_6px_18px_rgba(0,0,0,0.65),-3px_-3px_10px_rgba(255,255,255,0.08),inset_0_2.5px_5px_rgba(255,255,255,0.3),inset_0_-3px_5px_rgba(0,0,0,0.45)]'
      }`,
    usernameClass: 'font-bold text-violet-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
    textClass: 'text-slate-100 font-normal leading-relaxed',
    avatarShape: 'circle',
    accentBorder: 'border-l-4 border-l-violet-400',
  },
  {
    id: '3d-floating-capsule',
    name: '3D Floating Capsule',
    tagline: 'แคปซูล 3 มิติทรงกระบอกโค้งมน แสงไฮไลท์นูนเงา ลอยตัวเหนือฉาก',
    badge: '3D PILL 💊',
    is3D: true,
    category: '3d',
    previewBg: 'bg-slate-900 rounded-full border-t border-t-white/40 border-b-2 border-b-black shadow-[0_8px_16px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.4)]',
    containerClass: 'space-y-3',
    messageCardClass: (highlighted) =>
      `px-4 py-2.5 rounded-full border-t-2 border-t-white/45 border-b-[3px] border-b-black/90 border-x border-x-white/10 transition-all duration-200 ${
        highlighted
          ? 'bg-gradient-to-r from-rose-950 via-slate-900 to-pink-950 shadow-[0_12px_24px_-2px_rgba(244,63,94,0.35),0_4px_8px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.7)] ring-1 ring-rose-400/40'
          : 'bg-gradient-to-b from-slate-800/95 via-slate-900/95 to-slate-950/95 shadow-[0_10px_20px_-3px_rgba(0,0,0,0.85),0_3px_6px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.35),inset_0_-2px_4px_rgba(0,0,0,0.6)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.9)]'
      }`,
    usernameClass: 'font-bold text-rose-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
    textClass: 'text-neutral-100 font-normal text-sm leading-relaxed',
    avatarShape: 'circle',
    accentBorder: 'border-l-4 border-l-rose-400',
  },
  {
    id: '3d-luxury-gold',
    name: '3D Gold Metallic VIP',
    tagline: 'ทองคำ 3 มิติสลักขอบนูน แสงเมทัลลิกประกายทอง หรูหราไฮเอนด์ระดับ VIP',
    badge: '3D GOLD 👑',
    is3D: true,
    category: '3d',
    previewBg: 'bg-neutral-950 border-t-2 border-t-amber-300/90 border-b-4 border-b-amber-900 border-x border-x-amber-600/50 shadow-[0_6px_0_#451a03]',
    containerClass: 'space-y-3 font-sans',
    messageCardClass: (highlighted) =>
      `px-4 py-3 rounded-xl border-t-2 border-t-amber-300/90 border-b-[4px] border-x border-x-amber-600/50 transition-all duration-200 ${
        highlighted
          ? 'bg-gradient-to-b from-amber-950/90 via-neutral-950 to-amber-950/90 border-b-amber-500 shadow-[0_6px_0_#b45309,0_16px_30px_rgba(245,158,11,0.35),inset_0_2px_3px_rgba(254,240,138,0.7),inset_0_-2px_4px_rgba(0,0,0,0.8)] ring-1 ring-amber-400/50'
          : 'bg-gradient-to-b from-neutral-950/95 via-neutral-900/90 to-neutral-950/95 border-b-amber-900/90 shadow-[0_6px_0_#451a03,0_12px_22px_rgba(0,0,0,0.85),inset_0_1.5px_2px_rgba(253,230,138,0.45),inset_0_-2px_4px_rgba(0,0,0,0.75)]'
      }`,
    usernameClass: 'font-black tracking-wide bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]',
    textClass: 'text-amber-50/90 font-normal leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
    avatarShape: 'squircle',
    accentBorder: 'border-l-4 border-l-amber-400 shadow-[-3px_0_8px_rgba(251,191,36,0.5)]',
  },
  {
    id: '3d-gaming-crystal',
    name: '3D Crystal Emerald',
    tagline: 'ผลึกแก้วคริสตัลมรกต 3 มิติ เหลี่ยมมุมเฉียบคม เรืองแสงนีออนมรกตสะกดสายตา',
    badge: '3D GEM 💎',
    is3D: true,
    category: '3d',
    previewBg: 'bg-emerald-950/90 border-t-2 border-t-emerald-300 border-b-4 border-b-emerald-950 border-x border-x-emerald-500/40 shadow-[0_8px_16px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(167,243,208,0.4)]',
    containerClass: 'space-y-3 font-sans',
    messageCardClass: (highlighted) =>
      `px-4 py-2.5 rounded-2xl border-t-2 border-t-emerald-300/80 border-b-[4px] border-l-2 border-l-emerald-400/50 border-r border-r-teal-900/80 transition-all duration-200 ${
        highlighted
          ? 'bg-gradient-to-br from-emerald-950/90 via-slate-950/95 to-teal-950/90 border-b-emerald-600 shadow-[0_8px_0_#065f46,0_16px_30px_rgba(16,185,129,0.4),0_0_25px_rgba(52,211,153,0.35),inset_0_2px_3px_rgba(255,255,255,0.6),inset_0_-2px_4px_rgba(0,0,0,0.7)]'
          : 'bg-gradient-to-br from-slate-950/95 via-emerald-950/80 to-slate-950/95 border-b-emerald-950 shadow-[0_6px_0_#022c22,0_12px_22px_rgba(0,0,0,0.85),0_0_15px_rgba(16,185,129,0.2),inset_0_1.5px_2px_rgba(167,243,208,0.4),inset_0_-2px_4px_rgba(0,0,0,0.75)]'
      }`,
    usernameClass: 'font-bold text-emerald-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]',
    textClass: 'text-emerald-50 font-normal leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]',
    avatarShape: 'squircle',
    accentBorder: 'border-l-4 border-l-emerald-400 shadow-[-3px_0_10px_rgba(52,211,153,0.5)]',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-1',
    username: 'Kaitoon_Gamer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    message: 'สตรีมภาพชัดมากกก เสียงไมค์นุ่มดีครับพี่! 🎧✨',
    timestamp: Date.now() - 25000,
    badges: ['mod', 'sub'],
    color: '#38bdf8',
  },
  {
    id: 'chat-2',
    username: 'NongPraew_Cat',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    message: 'เคาะจอช่วยดันไลก์ให้รัวๆ เลยยยย สู้ๆ ค่ะ 💖🐱',
    timestamp: Date.now() - 18000,
    badges: ['top_fan'],
    color: '#f472b6',
  },
  {
    id: 'chat-3',
    username: 'ShadowNinja_TH',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    message: 'ช็อตเมื่อกี้โคตรตึงงงง ดักหัวสวยมากก 55555 🎯🔥',
    timestamp: Date.now() - 11000,
    badges: ['vip'],
    color: '#fbbf24',
    highlighted: true,
  },
  {
    id: 'chat-4',
    username: 'Somchai_Dev',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    message: 'ยินดีกับผู้ติดตามครบ 10,000 ซับด้วยคร้าบ 🎉👏',
    timestamp: Date.now() - 4000,
    badges: ['sub', 'verified'],
    color: '#34d399',
  },
];

export const GIFT_ITEMS: GiftItem[] = [
  {
    id: 'rose',
    name: 'Rose Heart',
    nameTh: 'กุหลาบหัวใจ',
    icon: '🌹',
    coinValue: 1,
    rarity: 'common',
    accentColor: '#f43f5e',
    bgGradient: 'from-rose-500/20 via-pink-500/10 to-transparent',
    soundType: 'pop',
  },
  {
    id: 'boba',
    name: 'Pearl Milk Tea',
    nameTh: 'ชานมไข่มุกหวานร้อย',
    icon: '🧋',
    coinValue: 50,
    rarity: 'common',
    accentColor: '#f59e0b',
    bgGradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    soundType: 'pop',
  },
  {
    id: 'diamond',
    name: 'Blue Diamond',
    nameTh: 'เพชรน้ำหนึ่ง',
    icon: '💎',
    coinValue: 300,
    rarity: 'rare',
    accentColor: '#38bdf8',
    bgGradient: 'from-cyan-500/30 via-blue-500/20 to-transparent',
    soundType: 'chime',
  },
  {
    id: 'sports_car',
    name: 'Cyber Supercar',
    nameTh: 'ซูเปอร์คาร์ไซเบอร์',
    icon: '🏎️',
    coinValue: 1200,
    rarity: 'epic',
    accentColor: '#ec4899',
    bgGradient: 'from-purple-600/30 via-pink-600/20 to-indigo-900/40',
    soundType: 'fanfare',
  },
  {
    id: 'dragon',
    name: 'Golden Dragon',
    nameTh: 'มังกรทองสวรรค์',
    icon: '🐉',
    coinValue: 3500,
    rarity: 'legendary',
    accentColor: '#eab308',
    bgGradient: 'from-yellow-500/40 via-amber-600/30 to-orange-950/60',
    soundType: 'fanfare',
  },
  {
    id: 'galaxy',
    name: 'Cosmic Galaxy',
    nameTh: 'จักรวาลคอสมิก',
    icon: '🌌',
    coinValue: 10000,
    rarity: 'mythic',
    accentColor: '#a855f7',
    bgGradient: 'from-fuchsia-600/50 via-purple-600/40 to-cyan-950/80',
    soundType: 'epic',
  },
];

export const INITIAL_LIKE_LEADERBOARD: LikeUser[] = [
  {
    id: 'user-1',
    name: 'NongPraew_Cat 💖',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    likeCount: 4280,
    rank: 1,
    badge: '👑 MVP Liker',
  },
  {
    id: 'user-2',
    name: 'Kaitoon_Gamer 🎮',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    likeCount: 3140,
    rank: 2,
    badge: '🥈 Top 2',
  },
  {
    id: 'user-3',
    name: 'ShadowNinja_TH 🥷',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    likeCount: 2210,
    rank: 3,
    badge: '🥉 Top 3',
  },
  {
    id: 'user-4',
    name: 'Bank_Nonthaburi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    likeCount: 1450,
    rank: 4,
  },
  {
    id: 'user-5',
    name: 'Mint_Kawaii',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    likeCount: 980,
    rank: 5,
  },
];

export const SIMULATION_NAMES = [
  { name: 'Boss_Za55', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
  { name: 'Alice_Wonder', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
  { name: 'Tee_Chonburi', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80' },
  { name: 'Fah_Streamer', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
  { name: 'Krit_GGWP', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' },
];

export const RANDOM_CHAT_PHRASES = [
  'สวัสดีครับพี่สตรีมเมอร์คนเก่งงง 👋',
  'วันนี้เล่นเกมอะไรต่อครับ?',
  'ขอเพลงมันส์ๆ หน่อยคร้าบบบ 🎵',
  'ช็อตนี้ 10/10 ไม่หักเลยพี่! 🔥',
  'ช่วยแชร์ไลฟ์ให้แล้วนะคับบ 🙏',
  'กดติดตามเรียบร้อย สนุกมากครับ ✨',
  '55555555 ขำจะขิต เกือบหลับแต่กลับมาได้ 🤣',
  'ยินดีด้วยกับ Rank ใหม่คับบ ปังมาก!',
  'ของขวัญจัดไปชุดใหญ่ไฟกะพริบ! 🎁🚀',
];

export const SUBATHON_THEMES = [
  {
    id: 'cyberpunk-neon' as const,
    name: 'Cyberpunk Neon',
    nameTh: 'นีออนไซเบอร์พังก์',
    badge: 'HOT 🔥',
    accentColor: '#06b6d4',
    previewClass: 'from-cyan-950 via-slate-900 to-pink-950 border-cyan-500/40',
    containerClass: 'bg-neutral-950/85 border border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.25)] rounded-2xl',
    timerDigitClass: 'text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 font-mono tracking-wider drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]',
    labelClass: 'text-cyan-400 font-mono tracking-widest',
    progressBarClass: 'bg-gradient-to-r from-cyan-500 via-teal-400 to-pink-500 shadow-[0_0_15px_rgba(6,182,212,0.7)]',
    iconName: 'Zap',
  },
  {
    id: 'gold-luxury' as const,
    name: 'Royal Gold Luxury',
    nameTh: 'โกลด์ลักชัวรี่ พรีเมียม',
    badge: 'VIP 👑',
    accentColor: '#f59e0b',
    previewClass: 'from-amber-950 via-neutral-900 to-yellow-950 border-amber-500/40',
    containerClass: 'bg-neutral-950/90 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.2)] rounded-2xl',
    timerDigitClass: 'text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-yellow-500 font-mono tracking-wider drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    labelClass: 'text-amber-300 tracking-wider',
    progressBarClass: 'bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]',
    iconName: 'Crown',
  },
  {
    id: 'kawaii-pastel' as const,
    name: 'Kawaii Pastel Pink',
    nameTh: 'พาสเทลน่ารักสดใส',
    badge: 'CUTE 🌸',
    accentColor: '#f43f5e',
    previewClass: 'from-pink-950 via-purple-950 to-rose-950 border-pink-400/40',
    containerClass: 'bg-pink-950/40 border-2 border-pink-400/40 shadow-[0_0_30px_rgba(244,63,94,0.25)] rounded-3xl backdrop-blur-xl',
    timerDigitClass: 'text-transparent bg-clip-text bg-gradient-to-b from-white via-pink-200 to-rose-300 font-mono tracking-wider drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]',
    labelClass: 'text-pink-300 font-bold',
    progressBarClass: 'bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 shadow-[0_0_15px_rgba(244,63,94,0.6)]',
    iconName: 'Heart',
  },
  {
    id: 'retro-arcade' as const,
    name: 'Retro 8-Bit Arcade',
    nameTh: 'เรโทรอาเขต ยุค 80s',
    badge: 'PIXEL 🕹️',
    accentColor: '#10b981',
    previewClass: 'from-emerald-950 via-slate-900 to-green-950 border-emerald-500/40',
    containerClass: 'bg-slate-950/90 border-2 border-emerald-400/50 shadow-[0_0_25px_rgba(16,185,129,0.3)] rounded-xl',
    timerDigitClass: 'text-emerald-300 font-mono tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]',
    labelClass: 'text-emerald-400 font-mono uppercase tracking-widest',
    progressBarClass: 'bg-gradient-to-r from-emerald-500 via-lime-400 to-yellow-400 shadow-[0_0_15px_rgba(16,185,129,0.7)]',
    iconName: 'Gamepad2',
  },
  {
    id: 'midnight-minimal' as const,
    name: 'Midnight Studio',
    nameTh: 'มิดไนท์มินิมอล โมเดิร์น',
    badge: 'CLEAN ✨',
    accentColor: '#94a3b8',
    previewClass: 'from-slate-900 via-neutral-900 to-slate-950 border-white/20',
    containerClass: 'bg-slate-950/80 border border-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-2xl backdrop-blur-2xl',
    timerDigitClass: 'text-white font-mono tracking-tight drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]',
    labelClass: 'text-slate-400 font-medium tracking-wide',
    progressBarClass: 'bg-gradient-to-r from-slate-400 via-white to-slate-300 shadow-[0_0_10px_rgba(255,255,255,0.4)]',
    iconName: 'Sparkles',
  },
  {
    id: 'magma-flame' as const,
    name: 'Magma Flame Rush',
    nameTh: 'เปลวเพลิงแม็กม่า สตรีมเดือด',
    badge: 'RUSH 🔥',
    accentColor: '#f97316',
    previewClass: 'from-orange-950 via-red-950 to-amber-950 border-orange-500/40',
    containerClass: 'bg-neutral-950/90 border border-orange-500/50 shadow-[0_0_35px_rgba(249,115,22,0.3)] rounded-2xl',
    timerDigitClass: 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-orange-400 to-red-500 font-mono tracking-wider drop-shadow-[0_0_15px_rgba(249,115,22,0.7)]',
    labelClass: 'text-orange-400 font-extrabold tracking-wider',
    progressBarClass: 'bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 shadow-[0_0_20px_rgba(249,115,22,0.8)]',
    iconName: 'Flame',
  },
  {
    id: '3d-cyber-holo' as const,
    name: '3D Cyber Hologram',
    nameTh: 'โฮโลแกรมไซเบอร์ คอร์ 3D',
    badge: '3D HOLO 💠',
    accentColor: '#06b6d4',
    is3D: true,
    reflectionSheen: true,
    previewClass: 'from-cyan-900 via-slate-900 to-fuchsia-950 border-cyan-400/60 shadow-[0_8px_20px_rgba(6,182,212,0.4)]',
    containerClass: 'bg-gradient-to-b from-slate-950/95 via-cyan-950/50 to-slate-950/95 border-2 border-cyan-400/60 shadow-[0_16px_36px_-6px_rgba(6,182,212,0.4),0_8px_0_0_#0e7490,inset_0_2px_1px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.8)] rounded-3xl backdrop-blur-2xl',
    timerDigitClass: 'font-mono tracking-wider text-cyan-200 [text-shadow:0_1px_0_#0891b2,0_2px_0_#0e7490,0_3px_0_#155e75,0_4px_0_#164e63,0_6px_14px_rgba(6,182,212,0.85)]',
    digitBlockClass: 'bg-gradient-to-b from-cyan-950/80 via-slate-900/90 to-slate-950 border border-cyan-400/50 rounded-2xl px-3 py-1.5 shadow-[0_6px_0_0_#0e7490,0_10px_20px_rgba(0,0,0,0.8),inset_0_1.5px_0_rgba(255,255,255,0.4)]',
    labelClass: 'text-cyan-300 font-mono tracking-widest uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]',
    progressBarClass: 'bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-500 shadow-[0_0_20px_rgba(6,182,212,0.8),inset_0_1px_1px_rgba(255,255,255,0.7)]',
    iconName: 'Cuboid',
  },
  {
    id: '3d-crystal-glass' as const,
    name: '3D Prism Crystal Glass',
    nameTh: 'คริสตัลแก้วปริซึม 3D หรูหรา',
    badge: '3D GLASS 💎',
    accentColor: '#a855f7',
    is3D: true,
    reflectionSheen: true,
    previewClass: 'from-indigo-950 via-purple-950 to-pink-950 border-purple-300/60 shadow-[0_8px_20px_rgba(168,85,247,0.4)]',
    containerClass: 'bg-gradient-to-b from-white/20 via-white/5 to-white/10 border-2 border-white/45 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.85),0_8px_0_0_rgba(255,255,255,0.15),inset_0_2px_0_rgba(255,255,255,0.85),inset_0_-2px_0_rgba(0,0,0,0.5),0_0_35px_rgba(168,85,247,0.35)] rounded-3xl backdrop-blur-2xl',
    timerDigitClass: 'font-mono tracking-wider text-white [text-shadow:0_1px_0_#e2e8f0,0_2px_0_#cbd5e1,0_3px_0_#94a3b8,0_4px_0_#64748b,0_6px_16px_rgba(168,85,247,0.8)]',
    digitBlockClass: 'bg-gradient-to-b from-white/25 via-white/10 to-white/5 border border-white/45 rounded-2xl px-3 py-1.5 shadow-[0_6px_0_0_rgba(255,255,255,0.25),0_10px_22px_rgba(0,0,0,0.7),inset_0_2px_0_rgba(255,255,255,0.8)] backdrop-blur-md',
    labelClass: 'text-purple-200 font-semibold tracking-wider [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]',
    progressBarClass: 'bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-300 shadow-[0_0_20px_rgba(236,72,153,0.75),inset_0_1px_2px_rgba(255,255,255,0.85)]',
    iconName: 'Gem',
  },
  {
    id: '3d-gold-bullion' as const,
    name: '3D Royal Gold Bullion',
    nameTh: 'ทองคำแท่งพรีเมียม 3D คลาสสิก',
    badge: '3D GOLD 🏆',
    accentColor: '#eab308',
    is3D: true,
    reflectionSheen: true,
    previewClass: 'from-amber-900 via-yellow-950 to-neutral-950 border-yellow-400/60 shadow-[0_8px_20px_rgba(234,179,8,0.4)]',
    containerClass: 'bg-gradient-to-b from-amber-950/90 via-neutral-950 to-amber-950/95 border-2 border-yellow-400/70 shadow-[0_16px_36px_-6px_rgba(234,179,8,0.4),0_8px_0_0_#78350f,inset_0_2px_0_rgba(254,240,138,0.7),inset_0_-2px_0_rgba(120,53,15,0.9)] rounded-3xl',
    timerDigitClass: 'font-mono tracking-wider text-yellow-100 [text-shadow:0_1px_0_#ca8a04,0_2px_0_#a16207,0_3px_0_#854d0e,0_4px_0_#713f12,0_6px_15px_rgba(234,179,8,0.85)]',
    digitBlockClass: 'bg-gradient-to-b from-yellow-900/70 via-neutral-900 to-neutral-950 border border-yellow-400/50 rounded-2xl px-3 py-1.5 shadow-[0_6px_0_0_#854d0e,0_10px_20px_rgba(0,0,0,0.8),inset_0_2px_0_rgba(254,240,138,0.6)]',
    labelClass: 'text-amber-300 font-bold tracking-wider [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]',
    progressBarClass: 'bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400 shadow-[0_0_20px_rgba(234,179,8,0.85),inset_0_1px_1px_rgba(255,255,255,0.85)]',
    iconName: 'Crown',
  },
  {
    id: '3d-clay-bubble' as const,
    name: '3D Claymorphism Bubble',
    nameTh: 'เคลย์มอร์ฟิซึม นุ่มน่ารัก 3D',
    badge: '3D CLAY 🫧',
    accentColor: '#ec4899',
    is3D: true,
    reflectionSheen: true,
    previewClass: 'from-rose-900 via-pink-900 to-purple-900 border-pink-400/60 shadow-[0_8px_20px_rgba(236,72,153,0.4)]',
    containerClass: 'bg-gradient-to-b from-pink-900/85 via-rose-950/80 to-purple-950/90 border-2 border-pink-300/60 shadow-[0_16px_32px_rgba(236,72,153,0.35),0_8px_0_0_#9d174d,inset_0_3px_2px_rgba(255,255,255,0.5),inset_0_-3px_3px_rgba(0,0,0,0.5)] rounded-3xl backdrop-blur-xl',
    timerDigitClass: 'font-mono tracking-wider text-pink-100 [text-shadow:0_2px_0_#db2777,0_4px_0_#be185d,0_6px_0_#9d174d,0_8px_16px_rgba(236,72,153,0.85)]',
    digitBlockClass: 'bg-gradient-to-b from-pink-800/80 via-pink-900/90 to-pink-950 border-2 border-pink-300/50 rounded-3xl px-3.5 py-1.5 shadow-[0_6px_0_0_#831843,0_10px_20px_rgba(0,0,0,0.6),inset_0_3px_2px_rgba(255,255,255,0.45)]',
    labelClass: 'text-pink-200 font-bold tracking-wide [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]',
    progressBarClass: 'bg-gradient-to-r from-pink-400 via-rose-300 to-purple-400 shadow-[0_0_20px_rgba(244,63,94,0.75),inset_0_2px_2px_rgba(255,255,255,0.75)]',
    iconName: 'Heart',
  },
  {
    id: '3d-mecha-titan' as const,
    name: '3D Mecha Obsidian Armor',
    nameTh: 'เกราะเมคาร์ ไททันดุดัน 3D',
    badge: '3D MECHA 🛡️',
    accentColor: '#ef4444',
    is3D: true,
    reflectionSheen: true,
    previewClass: 'from-red-950 via-neutral-900 to-zinc-950 border-red-500/60 shadow-[0_8px_20px_rgba(239,68,68,0.4)]',
    containerClass: 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-neutral-700 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.9),0_8px_0_0_#18181b,inset_0_2px_0_rgba(255,255,255,0.3),inset_0_-2px_0_rgba(0,0,0,0.95)] rounded-2xl',
    timerDigitClass: 'font-mono tracking-wider text-red-100 [text-shadow:0_1px_0_#dc2626,0_2px_0_#b91c1c,0_3px_0_#991b1b,0_4px_0_#7f1d1d,0_6px_15px_rgba(239,68,68,0.85)]',
    digitBlockClass: 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border border-zinc-600 rounded-xl px-3 py-1.5 shadow-[0_6px_0_0_#09090b,0_10px_18px_rgba(0,0,0,0.85),inset_0_1.5px_0_rgba(255,255,255,0.25)]',
    labelClass: 'text-red-400 font-extrabold tracking-widest uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]',
    progressBarClass: 'bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 shadow-[0_0_20px_rgba(239,68,68,0.85),inset_0_1px_1px_rgba(255,255,255,0.6)]',
    iconName: 'Shield',
  },
  {
    id: '3d-neon-capsule' as const,
    name: '3D Neon Vacuum Tube',
    nameTh: 'หลอดนีออนสูญญากาศ 3D',
    badge: '3D TUBE ⚡',
    accentColor: '#10b981',
    is3D: true,
    reflectionSheen: true,
    previewClass: 'from-emerald-950 via-slate-900 to-teal-950 border-emerald-400/60 shadow-[0_8px_20px_rgba(16,185,129,0.4)]',
    containerClass: 'bg-gradient-to-b from-slate-950/95 via-emerald-950/40 to-slate-950/95 border-2 border-emerald-400/60 shadow-[0_16px_36px_-6px_rgba(16,185,129,0.4),0_7px_0_0_#064e3b,inset_0_2px_0_rgba(167,243,208,0.5),inset_0_-2px_0_rgba(0,0,0,0.85)] rounded-3xl backdrop-blur-xl',
    timerDigitClass: 'font-mono tracking-wider text-emerald-100 [text-shadow:0_1px_0_#059669,0_2px_0_#047857,0_3px_0_#065f46,0_4px_0_#064e3b,0_6px_15px_rgba(16,185,129,0.85)]',
    digitBlockClass: 'bg-gradient-to-b from-emerald-950/80 via-slate-900/90 to-slate-950 border border-emerald-400/45 rounded-2xl px-3 py-1.5 shadow-[0_6px_0_0_#064e3b,0_10px_18px_rgba(0,0,0,0.8),inset_0_1.5px_0_rgba(167,243,208,0.45)]',
    labelClass: 'text-emerald-300 font-mono tracking-widest uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]',
    progressBarClass: 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 shadow-[0_0_20px_rgba(16,185,129,0.85),inset_0_1px_1px_rgba(255,255,255,0.7)]',
    iconName: 'Cylinder',
  },
];

export const SUBATHON_FONTS: SubathonFontConfig[] = [
  {
    id: 'orbitron',
    name: 'Orbitron 3D Cyber',
    nameTh: 'ไซเบอร์ โฮโล คมเหลี่ยม 3D',
    badge: 'CYBER 💠',
    category: 'cyber',
    fontFamily: "'Orbitron', sans-serif",
    fontClass: "font-['Orbitron',sans-serif] font-black",
    letterSpacing: '0.08em',
    sampleDigits: '08:42:19',
    description: 'ตัวเลขอวกาศไซเบอร์ คมเฉี่ยว มิติลึกเรืองแสงสไตล์ Sci-Fi',
  },
  {
    id: 'russo-one',
    name: 'Russo One 3D Heavy',
    nameTh: 'บล็อกหนา แน่นทรงพลัง 3D',
    badge: 'SOLID 🧱',
    category: 'heavy',
    fontFamily: "'Russo One', sans-serif",
    fontClass: "font-['Russo_One',sans-serif] font-black",
    letterSpacing: '0.04em',
    sampleDigits: '08:42:19',
    description: 'ตัวอักษรหนาตัน มีน้ำหนัก มิติเงาตกกระทบชัดเจน',
  },
  {
    id: 'bungee',
    name: 'Bungee 3D Chunky',
    nameTh: 'ชังกี้ป๊อป นูนลอยหนาเตอะ 3D',
    badge: 'CHUNKY 💥',
    category: 'heavy',
    fontFamily: "'Bungee', cursive",
    fontClass: "font-['Bungee',cursive]",
    letterSpacing: '0.03em',
    sampleDigits: '08:42:19',
    description: 'บล็อกทรงสตรีทป๊อป นูนลอยเด่นชัดเห็นแต่ไกลสะดุดตา',
  },
  {
    id: 'black-ops',
    name: 'Black Ops 3D Armor',
    nameTh: 'เกราะรบ สเตนซิลเมคาร์ 3D',
    badge: 'ARMOR 🛡️',
    category: 'heavy',
    fontFamily: "'Black Ops One', cursive",
    fontClass: "font-['Black_Ops_One',cursive]",
    letterSpacing: '0.06em',
    sampleDigits: '08:42:19',
    description: 'รอยฉลุสเตนซิลสไตล์เกราะรบ มีมิติเลเยอร์สองชั้น',
  },
  {
    id: 'chakra-petch',
    name: 'Chakra Petch 3D Tech',
    nameTh: 'สปอร์ตไฮเทค มิติเฉียบคม 3D',
    badge: 'TECH ⚡',
    category: 'tech',
    fontFamily: "'Chakra Petch', sans-serif",
    fontClass: "font-['Chakra_Petch',sans-serif] font-extrabold",
    letterSpacing: '0.05em',
    sampleDigits: '08:42:19',
    description: 'เหลี่ยมมุมตัด Facet สไตล์ยานอวกาศและเกราะหุ่นยนต์',
  },
  {
    id: 'press-start',
    name: 'Arcade 8-Bit 3D',
    nameTh: 'พิกเซลเกมตู้ 8-บิต นูนลอย 3D',
    badge: 'PIXEL 🕹️',
    category: 'retro',
    fontFamily: "'Press Start 2P', monospace",
    fontClass: "font-['Press_Start_2P',monospace]",
    letterSpacing: '-0.02em',
    sampleDigits: '08:42:19',
    description: 'คลาสสิกอาเขต 8-Bit บล็อกพิกเซลนูนมีมิติย้อนยุค',
  },
  {
    id: 'righteous',
    name: 'Righteous 3D Synth',
    nameTh: 'ซินธ์เวฟ โค้งมนนีออน 3D',
    badge: 'SYNTH 🌌',
    category: 'retro',
    fontFamily: "'Righteous', cursive",
    fontClass: "font-['Righteous',cursive]",
    letterSpacing: '0.05em',
    sampleDigits: '08:42:19',
    description: 'ความโค้งมนโมเดิร์น สไตล์นีออนเรโทรเวฟยุค 80s',
  },
  {
    id: 'fredoka',
    name: 'Fredoka 3D Bubble',
    nameTh: 'บับเบิ้ลกลมนุ่ม เคลย์ 3D',
    badge: 'BUBBLE 🫧',
    category: 'bubble',
    fontFamily: "'Fredoka', sans-serif",
    fontClass: "font-['Fredoka',sans-serif] font-black",
    letterSpacing: '0.02em',
    sampleDigits: '08:42:19',
    description: 'ตัวกลมนุ่มฟู นูนเด้งสไตล์ดินน้ำมัน Claymorphism น่ารัก',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains 3D Matrix',
    nameTh: 'ดิจิทัลโมโน สเปซเป๊ะ 3D',
    badge: 'MONO 💻',
    category: 'tech',
    fontFamily: "'JetBrains Mono', monospace",
    fontClass: "font-['JetBrains_Mono',monospace] font-extrabold",
    letterSpacing: '0.04em',
    sampleDigits: '08:42:19',
    description: 'ฟอนต์โมโนสเปซ ความกว้างเท่ากันเป๊ะ นิ่งไม่แกว่งเวลาเลขขยับ',
  },
  {
    id: 'outfit',
    name: 'Outfit 3D Streamer',
    nameTh: 'โมเดิร์น มินิมอลทรงพลัง 3D',
    badge: 'CLEAN ✨',
    category: 'tech',
    fontFamily: "'Outfit', sans-serif",
    fontClass: "font-['Outfit',sans-serif] font-black",
    letterSpacing: '0.02em',
    sampleDigits: '08:42:19',
    description: 'เรขาคณิตคลีน คมชัด สไตล์สตรีมเมอร์ระดับโลก',
  },
];


