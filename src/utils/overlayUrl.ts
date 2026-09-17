import { OverlayCustomSettings } from '../types';

/**
 * Generates a clean, modern Real-Time Live Sync OBS URL.
 * OBS loads this URL once, and automatically syncs all live settings and duration changes
 * from the Dashboard in real-time (without needing to re-copy or re-paste the link).
 */
export function generateCleanRealtimeOverlayUrl(
  type: 'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'alerts' | 'subathon' | 'avatars' | 'all',
  origin: string = typeof window !== 'undefined' ? window.location.origin : '',
  wsPort: string = '62024'
): string {
  const cleanOrigin = origin && origin.startsWith('http')
    ? origin
    : (typeof window !== 'undefined' ? window.location.origin : '');
  const params = new URLSearchParams();
  params.set('mode', 'overlay');
  params.set('overlay', type);
  if (wsPort && wsPort.trim() !== '62024') {
    params.set('ws', `ws://localhost:${wsPort.trim()}`);
  }
  return `${cleanOrigin}?${params.toString()}`;
}

/**
 * Generates the full OBS Browser Source URL with all custom settings embedded as URL parameters.
 * Supports flexible parameters:
 * - generateOverlayUrl(type, settings)
 * - generateOverlayUrl(type, settings, wsPort)
 * - generateOverlayUrl(type, settings, origin, wsPort)
 */
export function generateOverlayUrl(
  type: 'leaderboard' | 'chat' | 'gift' | 'follow' | 'share' | 'alerts' | 'subathon' | 'avatars' | 'all',
  settings: OverlayCustomSettings,
  originOrWsPort?: string,
  maybeWsPort?: string
): string {
  let resolvedOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  let resolvedWsPort = '62024';

  if (originOrWsPort) {
    if (originOrWsPort.startsWith('http://') || originOrWsPort.startsWith('https://')) {
      resolvedOrigin = originOrWsPort;
      if (maybeWsPort) resolvedWsPort = maybeWsPort;
    } else if (/^\d+$/.test(originOrWsPort.trim())) {
      // User passed a port number like "62024" as 3rd arg
      resolvedWsPort = originOrWsPort.trim();
    }
  }

  const params = new URLSearchParams();
  params.set('mode', 'overlay');
  params.set('overlay', type);
  params.set('ws', `ws://localhost:${resolvedWsPort}`);

  if (type === 'chat' || type === 'all') {
    if (settings.chatTheme) params.set('theme', settings.chatTheme);
    if (settings.chatLayout) params.set('layout', settings.chatLayout);
    if (settings.chatFontSize) params.set('fontsize', settings.chatFontSize);
    if (typeof settings.chatAutoHideSeconds === 'number') {
      params.set('autohide', settings.chatAutoHideSeconds.toString());
    }
    params.set('timestamp', settings.chatShowTimestamps ? '1' : '0');
    params.set('avatars', settings.chatShowAvatars ? '1' : '0');
    params.set('badges', settings.chatShowBadges ? '1' : '0');
    params.set('sound', settings.chatSoundEnabled ? '1' : '0');

    if (settings.chatTtsEnabled) {
      params.set('tts', '1');
      if (settings.chatTtsFormat) params.set('ttsformat', settings.chatTtsFormat);
      if (settings.chatTtsSpeed) params.set('ttsspeed', settings.chatTtsSpeed.toString());
      if (settings.chatTtsPitch) params.set('ttspitch', settings.chatTtsPitch.toString());
      if (settings.chatTtsVolume) params.set('ttsvol', settings.chatTtsVolume.toString());
      if (settings.chatTtsVoice) params.set('ttsvoice', settings.chatTtsVoice);
      params.set('ttssweet', settings.chatTtsSweetEnding ? '1' : '0');
    } else {
      params.set('tts', '0');
    }
  }

  if (type === 'leaderboard' || type === 'all') {
    if (settings.likeStyle) params.set('style', settings.likeStyle);
    if (settings.likeGoal) params.set('goal', settings.likeGoal.toString());
    if (settings.likeShowTopCount) params.set('top', settings.likeShowTopCount.toString());
    params.set('showgoal', settings.likeShowGoalBar ? '1' : '0');
    params.set('sound', settings.likeSoundEnabled ? '1' : '0');
  }

  if (type === 'gift' || type === 'alerts' || type === 'all') {
    if (settings.giftStyle) params.set('giftstyle', settings.giftStyle);
    if (settings.giftDuration) params.set('duration', settings.giftDuration.toString());
    params.set('particles', settings.giftShowParticles ? '1' : '0');
    params.set('sound', settings.giftSoundEnabled ? '1' : '0');
    if (settings.giftSoundVolume) params.set('volume', settings.giftSoundVolume.toString());
    if (settings.giftMinCoinFilter) params.set('mincoin', settings.giftMinCoinFilter.toString());
  }

  if (type === 'follow' || type === 'alerts' || type === 'all') {
    params.set('follow', settings.followAlertEnabled ? '1' : '0');
    if (settings.followStyle) params.set('followstyle', settings.followStyle);
    if (settings.followDuration) params.set('followdur', settings.followDuration.toString());
    params.set('followsound', settings.followSoundEnabled ? '1' : '0');
    params.set('followtts', settings.followTtsEnabled ? '1' : '0');
  }

  if (type === 'share' || type === 'alerts' || type === 'all') {
    params.set('share', settings.shareAlertEnabled ? '1' : '0');
    if (settings.shareStyle) params.set('sharestyle', settings.shareStyle);
    if (settings.shareDuration) params.set('sharedur', settings.shareDuration.toString());
    params.set('sharesound', settings.shareSoundEnabled ? '1' : '0');
    params.set('sharetts', settings.shareTtsEnabled ? '1' : '0');
  }

  if (type === 'subathon' || type === 'all') {
    if (settings.subathonTheme) params.set('subathontheme', settings.subathonTheme);
    if (settings.subathonFont) params.set('subathonfont', settings.subathonFont);
    if (settings.subathonStyle) params.set('subathonstyle', settings.subathonStyle);
    if (settings.subathonTitle) params.set('subathontitle', settings.subathonTitle);
    if (settings.subathonMaxCapHours) params.set('subathoncap', settings.subathonMaxCapHours.toString());
    if (settings.subathonStartSeconds) params.set('subathonsec', settings.subathonStartSeconds.toString());
    params.set('subathonsound', settings.subathonSoundEnabled ? '1' : '0');
    params.set('subathonbar', settings.subathonShowProgressBar ? '1' : '0');
  }

  if (type === 'avatars' || type === 'all') {
    if (typeof settings.avatarViewerCount === 'number') {
      params.set('avatarcount', settings.avatarViewerCount.toString());
    }
    if (settings.avatarStyle) params.set('avatarstyle', settings.avatarStyle);
    if (settings.avatarSize) params.set('avatarsize', settings.avatarSize);
    if (settings.avatarFloorStyle) params.set('avatarfloor', settings.avatarFloorStyle);
    if (typeof settings.avatarSpeed === 'number') {
      params.set('avatarspeed', settings.avatarSpeed.toString());
    }
    params.set('avatarnames', settings.avatarShowNametags ? '1' : '0');
    params.set('avatarbubbles', settings.avatarShowChatBubbles ? '1' : '0');
    params.set('avatarcheer', settings.avatarAllowCheer ? '1' : '0');
  }

  return `${origin}?${params.toString()}`;
}
