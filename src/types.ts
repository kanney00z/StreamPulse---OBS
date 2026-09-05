export type SubathonThemeId =
  | 'cyberpunk-neon'
  | 'gold-luxury'
  | 'kawaii-pastel'
  | 'retro-arcade'
  | 'midnight-minimal'
  | 'magma-flame';

export interface SubathonThemeConfig {
  id: SubathonThemeId;
  name: string;
  nameTh: string;
  badge: string;
  accentColor: string;
  previewClass: string;
  containerClass: string;
  timerDigitClass: string;
  labelClass: string;
  progressBarClass: string;
  iconName: string;
}

export interface SubathonTimeAddedEvent {
  id: string;
  seconds: number;
  reason: string;
  senderName?: string;
  timestamp: number;
}

export type ChatThemeId =
  | 'cyberpunk-neon'
  | 'minimal-glass'
  | 'kawaii-pastel'
  | 'streamer-dark'
  | 'comic-pop'
  | 'aurora-gradient'
  | 'retro-arcade'
  | 'tiktok-bubble';

export interface ChatBadge {
  type: 'mod' | 'vip' | 'sub' | 'top_fan' | 'verified';
  label: string;
  color: string;
  bgColor: string;
  iconName: string;
}

export interface ChatMessage {
  id: string;
  username: string;
  avatarUrl: string;
  message: string;
  timestamp: number;
  badges?: ('mod' | 'vip' | 'sub' | 'top_fan' | 'verified')[];
  color?: string;
  highlighted?: boolean;
}

export interface ChatThemeConfig {
  id: ChatThemeId;
  name: string;
  tagline: string;
  badge: string;
  previewBg: string;
  containerClass: string;
  messageCardClass: (highlighted?: boolean) => string;
  usernameClass: string;
  textClass: string;
  avatarShape: 'circle' | 'rounded' | 'squircle' | 'hex';
  accentBorder: string;
}

export interface LikeUser {
  id: string;
  name: string;
  avatar: string;
  likeCount: number;
  rank: number;
  badge?: string;
  isRecent?: boolean;
}

export interface FloatingHeartItem {
  id: string;
  x: number; // percentage 0-100
  color: string;
  scale: number;
  icon: string;
}

export type GiftRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface GiftItem {
  id: string;
  name: string;
  nameTh: string;
  icon: string;
  coinValue: number;
  rarity: GiftRarity;
  accentColor: string;
  bgGradient: string;
  soundType: 'pop' | 'chime' | 'fanfare' | 'epic';
}

export interface GiftAlert {
  id: string;
  senderName: string;
  senderAvatar: string;
  gift: GiftItem;
  amount: number;
  comboCount: number;
  customMessage?: string;
  timestamp: number;
}

export interface FollowAlert {
  id: string;
  username: string;
  avatarUrl: string;
  timestamp: number;
  uniqueId?: string;
}

export interface ShareAlert {
  id: string;
  username: string;
  avatarUrl: string;
  timestamp: number;
  shareCount?: number;
  uniqueId?: string;
}

export interface OverlayCustomSettings {
  // Chat
  chatTheme: ChatThemeId;
  chatFontSize: 'sm' | 'base' | 'lg' | 'xl';
  chatAutoHideSeconds: number; // 0 = never
  chatShowAvatars: boolean;
  chatShowBadges: boolean;
  chatDirection: 'up' | 'down';
  chatSoundEnabled: boolean;
  chatMaxMessages: number;

  // TTS (Text-to-Speech อ่านแชทสดอัตโนมัติ ปรับแต่งเสียงได้หลากหลาย)
  chatTtsEnabled: boolean;
  chatTtsFormat: 'sweet' | 'nameAndMessage' | 'messageOnly';
  chatTtsSpeed: number; // 0.7 - 1.5 (0.95 - 1.00 สำหรับเสียงพูดปกติ ไม่เร็วเกิน)
  chatTtsPitch: number; // 0.7 - 1.5 (1.00 สำหรับเสียงปกติ, 0.95 สำหรับเสียงผู้ชาย, 1.15 สำหรับเสียงหวาน)
  chatTtsVolume: number; // 0 - 100
  chatTtsVoice: string; // 'default' | 'male_auto' | 'female_auto' | 'normal_auto' | voiceURI
  chatTtsTonePreset: 'normal' | 'male' | 'female-natural' | 'sweet' | 'cute' | 'soft' | 'natural' | 'custom';
  chatTtsSkipSpam: boolean;
  chatTtsSweetEnding: boolean; // เติมเสียงลงท้ายน่ารัก เช่น "ค่า~"

  // Like Leaderboard
  likeGoal: number;
  currentLikes: number;
  likeStyle: 'compact-ticker' | 'podium-card' | 'glass-list' | 'neon-glow';
  likeShowGoalBar: boolean;
  likeShowTopCount: 3 | 5 | 10;
  likeSoundEnabled: boolean;

  // Gift Alert
  giftSoundEnabled: boolean;
  giftSoundVolume: number; // 0-100
  giftDuration: number; // seconds
  giftShowParticles: boolean;
  giftMinCoinFilter: number;
  giftStyle: 'banner-epic' | 'card-hologram' | 'minimal-modern' | 'kawaii-pop';

  // Follow Alert (คนกดติดตาม)
  followAlertEnabled: boolean;
  followSoundEnabled: boolean;
  followTtsEnabled: boolean;
  followDuration: number; // seconds
  followStyle: 'neon-banner' | 'kawaii-badge' | 'minimal-pill' | 'card-glow';

  // Share Alert (คนกดแชร์)
  shareAlertEnabled: boolean;
  shareSoundEnabled: boolean;
  shareTtsEnabled: boolean;
  shareDuration: number; // seconds
  shareStyle: 'neon-banner' | 'kawaii-badge' | 'minimal-pill' | 'card-glow';

  // Counters
  streamFollowCount: number;
  streamShareCount: number;

  // Subathon Timer (โหมดจับเวลามาราธอน หลากหลายธีม)
  subathonTheme: SubathonThemeId;
  subathonStyle: 'card' | 'frameless'; // 'frameless' = ไม่มีกรอบ (แค่เวลา + หลอดล่าง), 'card' = มีกรอบการ์ด
  subathonStartSeconds?: number; // เวลาเริ่มต้นที่กำหนดเอง (วินาที)
  subathonTitle: string;
  subathonAutoAdd: boolean;
  subathonAddPerFollow: number; // e.g. 30 seconds
  subathonAddPerShare: number; // e.g. 15 seconds
  subathonAddPer100Likes: number; // e.g. 10 seconds
  subathonAddPerCoin: number; // e.g. 1 second per 1 coin
  subathonMaxCapHours: number; // 0 = unlimited, or 6, 12, 24
  subathonShowProgressBar: boolean;
  subathonSoundEnabled: boolean;
}

export type IndoFinityConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface IndoFinityLogItem {
  id: string;
  timestamp: number;
  event: string;
  summary: string;
  sender?: string;
  rawData: any;
}

export interface IndoFinityChatEventData {
  uniqueId: string;
  nickname?: string;
  comment: string;
  profilePictureUrl?: string;
  avatarThumb?: string;
  avatar?: string;
  isModerator?: boolean;
  isSubscriber?: boolean;
  badges?: any[];
  userBadges?: any[];
  msgId?: string;
}

export interface IndoFinityLikeEventData {
  uniqueId: string;
  nickname?: string;
  likeCount?: number;
  totalLikes?: number;
  profilePictureUrl?: string;
}

export interface IndoFinityGiftEventData {
  giftId?: string | number;
  giftName?: string;
  describe?: string;
  diamondCount?: number;
  coins?: number;
  repeatCount?: number;
  combo?: number;
  repeat_count?: number;
  giftPictureUrl?: string;
  image?: string;
  uniqueId: string;
  nickname?: string;
  profilePictureUrl?: string;
}

export interface IndoFinityFollowEventData {
  uniqueId: string;
  nickname?: string;
  profilePictureUrl?: string;
  avatarThumb?: string;
  avatar?: string;
}

export interface IndoFinityShareEventData {
  uniqueId: string;
  nickname?: string;
  profilePictureUrl?: string;
  avatarThumb?: string;
  avatar?: string;
  shareCount?: number;
}

