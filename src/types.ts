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

  // TTS (Text-to-Speech อ่านแชทสดอัตโนมัติ)
  chatTtsEnabled: boolean;
  chatTtsFormat: 'nameAndMessage' | 'messageOnly';
  chatTtsSpeed: number; // 0.8 - 1.5
  chatTtsVolume: number; // 0 - 100
  chatTtsVoice: string; // 'default' or voiceURI
  chatTtsSkipSpam: boolean;

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

