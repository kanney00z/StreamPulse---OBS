import { ChatThemeConfig, GiftItem, LikeUser, ChatMessage } from '../types';

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
