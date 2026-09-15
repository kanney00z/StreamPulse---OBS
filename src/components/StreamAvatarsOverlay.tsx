import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  OverlayCustomSettings,
  StreamAvatarEntity,
  StreamAvatarAction,
  ChatMessage,
  GiftAlert,
  FollowAlert,
  ShareAlert,
} from '../types';
import { StreamAvatarSprite } from './StreamAvatarSprites';
import { Heart, Sparkles, MessageCircle, UserPlus, Share2, UserCheck, PlusCircle } from 'lucide-react';

interface StreamAvatarsOverlayProps {
  settings: OverlayCustomSettings;
  viewerCount?: number;
  lastMessage?: ChatMessage | null;
  lastGift?: GiftAlert | null;
  lastFollow?: FollowAlert | null;
  lastShare?: ShareAlert | null;
  totalLikes?: number;
  isOBSMode?: boolean;
  onAddViewer?: () => void;
}

// Preset Thai / Global streamer viewer names & colors
const DEFAULT_AVATAR_NAMES = [
  { name: 'น้องแมวส้ม', badge: 'VIP' as const, color: '#f97316' },
  { name: 'Kaito_Dev', badge: 'MOD' as const, color: '#06b6d4' },
  { name: 'Sakura_Chan', badge: 'SUB' as const, color: '#ec4899' },
  { name: 'พี่บาสซ่า', badge: 'FAN' as const, color: '#3b82f6' },
  { name: 'Luna_Mew', badge: 'TOP' as const, color: '#a855f7' },
  { name: 'Captain_G', badge: 'SUB' as const, color: '#eab308' },
  { name: 'บีมเมอร์_007', badge: 'FAN' as const, color: '#10b981' },
  { name: 'Alice_Wonder', badge: 'VIP' as const, color: '#f43f5e' },
  { name: 'เด็กหลังห้อง', badge: 'FAN' as const, color: '#64748b' },
  { name: 'Miku_Fan_99', badge: 'SUB' as const, color: '#14b8a6' },
  { name: 'น้องกะปิ', badge: 'TOP' as const, color: '#84cc16' },
  { name: 'CyberSamurai', badge: 'MOD' as const, color: '#6366f1' },
  { name: 'สายเปย์_ตัวจริง', badge: 'VIP' as const, color: '#e11d48' },
  { name: 'Zeta_Bot', badge: 'FAN' as const, color: '#0284c7' },
  { name: 'คุณหนู_แพรว', badge: 'SUB' as const, color: '#f472b6' },
  { name: 'Gamer_TH', badge: 'FAN' as const, color: '#22c55e' },
];

// Preset names for 16 Cute Animal Companions
const DEFAULT_ANIMAL_NAMES = [
  { name: 'น้องกะปิส้ม', badge: 'VIP' as const, color: '#92592d' },
  { name: 'ชิบะคุง', badge: 'MOD' as const, color: '#d97706' },
  { name: 'เคโระตาโต', badge: 'SUB' as const, color: '#16a34a' },
  { name: 'เจ้าแมวส้ม', badge: 'TOP' as const, color: '#ea580c' },
  { name: 'เป็ดน้อยก้าบ', badge: 'FAN' as const, color: '#eab308' },
  { name: 'เพนกวินโบว์แดง', badge: 'VIP' as const, color: '#38bdf8' },
  { name: 'แพนด้ากินไผ่', badge: 'TOP' as const, color: '#64748b' },
  { name: 'ต่ายขาวแครอท', badge: 'SUB' as const, color: '#f43f5e' },
  { name: 'แพนด้าแดง', badge: 'FAN' as const, color: '#c2410c' },
  { name: 'แฮมทาโร่', badge: 'VIP' as const, color: '#f59e0b' },
  { name: 'หมีช็อกโก', badge: 'FAN' as const, color: '#92400e' },
  { name: 'แอกโซลอตชมพู', badge: 'MOD' as const, color: '#ec4899' },
  { name: 'เจี๊ยบหมวกไข่', badge: 'SUB' as const, color: '#fbbf24' },
  { name: 'นากพุงนุ่ม', badge: 'FAN' as const, color: '#a855f7' },
  { name: 'จิ้งจอกหูโต', badge: 'VIP' as const, color: '#f97316' },
  { name: 'สลอธสายชิล', badge: 'FAN' as const, color: '#78716c' },
];

// Preset names for Chubby Shiba Squad (matching video BigBoy, Thua, Max, PlayB, etc.)
const DEFAULT_SHIBA_NAMES = [
  { name: 'BigBoy', badge: 'VIP' as const, color: '#f59e0b' },
  { name: 'Thua', badge: 'MOD' as const, color: '#4ade80' },
  { name: 'Max', badge: 'SUB' as const, color: '#c084fc' },
  { name: 'PlayB', badge: 'TOP' as const, color: '#f472b6' },
  { name: 'Sky', badge: 'FAN' as const, color: '#38bdf8' },
  { name: 'Kuro', badge: 'VIP' as const, color: '#334155' },
  { name: 'Momo', badge: 'SUB' as const, color: '#fb923c' },
  { name: 'Shiro', badge: 'TOP' as const, color: '#f8fafc' },
  { name: 'Ruby', badge: 'VIP' as const, color: '#f43f5e' },
  { name: 'Boba', badge: 'FAN' as const, color: '#d4a373' },
  { name: 'Hachi', badge: 'MOD' as const, color: '#f59e0b' },
  { name: 'Charmy', badge: 'FAN' as const, color: '#f472b6' },
  { name: 'Yuzu', badge: 'SUB' as const, color: '#eab308' },
  { name: 'Cookie', badge: 'VIP' as const, color: '#d97706' },
  { name: 'Matcha', badge: 'FAN' as const, color: '#22c55e' },
  { name: 'Puff', badge: 'TOP' as const, color: '#a855f7' },
];

export const StreamAvatarsOverlay: React.FC<StreamAvatarsOverlayProps> = ({
  settings,
  viewerCount: propViewerCount,
  lastMessage,
  lastGift,
  lastFollow,
  lastShare,
  totalLikes = 0,
  isOBSMode = false,
  onAddViewer,
}) => {
  // Target viewer count strictly respects 0 (0 = no viewers, avatars leave/disappear)
  const targetViewerCount =
    propViewerCount !== undefined
      ? propViewerCount
      : settings.avatarViewerCount !== undefined
      ? settings.avatarViewerCount
      : 8;

  const [avatars, setAvatars] = useState<StreamAvatarEntity[]>([]);
  const [floatingHearts, setFloatingHearts] = useState<
    { id: string; x: number; y: number; color: string }[]
  >([]);
  const [giftCelebrations, setGiftCelebrations] = useState<
    { id: string; x: number; text: string }[]
  >([]);

  const prevLikesRef = useRef<number>(totalLikes);
  const prevMsgIdRef = useRef<string | null>(null);
  const prevGiftIdRef = useRef<string | null>(null);
  const prevFollowIdRef = useRef<string | null>(null);
  const prevShareIdRef = useRef<string | null>(null);
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  // Initialize and scale avatars list to match targetViewerCount gracefully
  useEffect(() => {
    const isShibaTheme = settings.avatarStyle === 'shiba-squad';
    const isAnimalTheme = settings.avatarStyle === 'cute-animals';
    const namePool = isShibaTheme
      ? DEFAULT_SHIBA_NAMES
      : isAnimalTheme
      ? DEFAULT_ANIMAL_NAMES
      : DEFAULT_AVATAR_NAMES;

    setAvatars((prev) => {
      // If target is 0, start graceful despawn for any active avatar ("ถ้าไม่มีก็ให้มันหายไป")
      if (targetViewerCount === 0) {
        if (prev.length === 0) return prev;
        return prev.map((av) => ({
          ...av,
          isLeaving: true,
          action: 'walk',
          direction: av.x < 50 ? 'left' : 'right',
          targetX: av.x < 50 ? -12 : 112,
          actionTimer: 6,
          speechBubble: av.speechBubble || {
            text: 'บ๊ายบายทุกคน! 👋 ไว้เจอกันใหม่นะงับ',
            timestamp: Date.now(),
          },
        }));
      }

      // Filter active (non-leaving) avatars
      const activeAvatars = prev.filter((a) => !a.isLeaving);
      const currentCount = activeAvatars.length;

      // If count matches, update theme names and sprite indexes seamlessly
      if (currentCount === targetViewerCount) {
        return prev.map((av, i) => {
          if (av.isLeaving) return av;
          const info = namePool[i % namePool.length];
          return {
            ...av,
            name:
              av.badge === 'FOLLOW' || av.badge === 'SHARE'
                ? av.name
                : `${info.name}${i >= namePool.length ? ` #${i + 1}` : ''}`,
            color: av.color || info.color,
            badge: av.badge || info.badge,
            spriteIndex: av.spriteIndex !== undefined ? av.spriteIndex : i % 16,
          };
        });
      }

      // If we need more avatars (viewer joined: "ถ้ามีคนเข้ามาดูก็ให้มีตัวละครเดินได้")
      if (currentCount < targetViewerCount) {
        const added: StreamAvatarEntity[] = [];
        const diff = targetViewerCount - currentCount;
        for (let i = 0; i < diff; i++) {
          const idx = currentCount + i;
          const info = namePool[idx % namePool.length];
          // Spawn naturally from edge or drop in
          const spawnFromEdge = Math.random() > 0.4;
          const fromLeft = Math.random() > 0.5;
          const initialX = spawnFromEdge
            ? (fromLeft ? 3 : 97)
            : Math.min(
                92,
                Math.max(
                  8,
                  10 +
                    (80 / Math.max(1, targetViewerCount)) * idx +
                    (Math.random() * 6 - 3)
                )
              );

          const targetX = Math.min(92, Math.max(8, 12 + Math.random() * 76));

          added.push({
            id: `avatar-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
            name: `${info.name}${idx >= namePool.length ? ` #${idx + 1}` : ''}`,
            color: info.color,
            badge: info.badge,
            spriteIndex: idx % 16,
            x: initialX,
            targetX,
            vx: 0,
            vy: spawnFromEdge ? 0 : -18,
            direction: targetX >= initialX ? 'right' : 'left',
            action: 'walk',
            actionTimer: Math.random() * 4 + 3,
            yOffset: spawnFromEdge ? 0 : -1,
            stepPhase: Math.random() * 2,
            speedScale: 0.85 + (idx % 5) * 0.08,
            opacity: 1,
            speechBubble:
              Math.random() < 0.35
                ? {
                    text: 'หวัดดีงับ! เพิ่งแวะเข้ามาดู ✨',
                    timestamp: Date.now(),
                  }
                : undefined,
          });
        }
        return [...prev, ...added];
      }

      // If we need fewer avatars (viewers left)
      if (currentCount > targetViewerCount) {
        const excessCount = currentCount - targetViewerCount;
        let marked = 0;
        return prev.map((av) => {
          if (!av.isLeaving && marked < excessCount) {
            marked++;
            return {
              ...av,
              isLeaving: true,
              action: 'walk',
              direction: av.x < 50 ? 'left' : 'right',
              targetX: av.x < 50 ? -12 : 112,
              actionTimer: 6,
            };
          }
          return av;
        });
      }

      return prev;
    });
  }, [targetViewerCount, settings.avatarStyle]);

  // Handle incoming chat messages -> Trigger speech bubble & support !spawn command
  useEffect(() => {
    if (!lastMessage) return;
    if (prevMsgIdRef.current === lastMessage.id) return;
    prevMsgIdRef.current = lastMessage.id;

    const rawMsg = (lastMessage.message || '').trim();
    const lowerMsg = rawMsg.toLowerCase();
    const isSpawnCmd =
      lowerMsg.startsWith('!spawn') ||
      lowerMsg.startsWith('!shiba') ||
      lowerMsg.startsWith('!join');

    const authorRaw =
      lastMessage.username || (lastMessage as any).user?.name || 'Viewer';
    const authorName = authorRaw.toLowerCase();

    // If !spawn command received, emit celebratory hearts & jump
    if (isSpawnCmd) {
      setFloatingHearts((prev) => [
        ...prev.slice(-15),
        {
          id: `spawn-heart-${Date.now()}-1`,
          x: 40 + Math.random() * 20,
          y: 35,
          color: '#f59e0b',
        },
        {
          id: `spawn-heart-${Date.now()}-2`,
          x: 45 + Math.random() * 20,
          y: 40,
          color: '#ec4899',
        },
      ]);
    }

    setAvatars((prev) => {
      // Find avatar with same username
      let targetIndex = prev.findIndex(
        (a) => a.name.toLowerCase() === authorName
      );

      // If !spawn is called and avatar doesn't exist yet, spawn a new customized avatar!
      if (isSpawnCmd && targetIndex === -1) {
        const isShibaTheme = settings.avatarStyle === 'shiba-squad';
        const isAnimalTheme = settings.avatarStyle === 'cute-animals';
        const namePool = isShibaTheme
          ? DEFAULT_SHIBA_NAMES
          : isAnimalTheme
          ? DEFAULT_ANIMAL_NAMES
          : DEFAULT_AVATAR_NAMES;

        const info = namePool[prev.length % namePool.length];
        const newX = Math.min(92, Math.max(8, 20 + Math.random() * 60));
        const newAvatar: StreamAvatarEntity = {
          id: `spawned-${Date.now()}-${authorName}`,
          name: authorRaw,
          color: info.color,
          badge: (lastMessage as any).badge || 'FAN',
          spriteIndex: prev.length % 16,
          x: newX,
          targetX: Math.min(92, Math.max(8, newX + (Math.random() * 16 - 8))),
          vx: 0,
          vy: -26,
          direction: Math.random() > 0.5 ? 'right' : 'left',
          action: 'jump',
          actionTimer: 3,
          yOffset: -1,
          stepPhase: 0,
          speedScale: 1.05,
          speechBubble: settings.avatarShowChatBubbles
            ? {
                text: `✨ !spawn สำเร็จ! บ๊อกๆ 🐾`,
                timestamp: Date.now(),
              }
            : undefined,
        };
        return [...prev, newAvatar];
      }

      if (prev.length === 0) return prev;

      if (targetIndex === -1) {
        targetIndex = Math.floor(Math.random() * prev.length);
      }

      const next = [...prev];
      const target = { ...next[targetIndex] };

      if (settings.avatarShowChatBubbles) {
        target.speechBubble = {
          text: isSpawnCmd ? `✨ Woof! มาแล้วว 🐾` : lastMessage.message,
          timestamp: Date.now(),
        };
      }
      // Make avatar jump excitedly when talking or spawning
      target.action = 'jump';
      target.vy = isSpawnCmd ? -26 : -20;
      target.yOffset = -1;
      target.actionTimer = isSpawnCmd ? 3 : 2.5;

      next[targetIndex] = target;
      return next;
    });
  }, [lastMessage, settings.avatarShowChatBubbles, settings.avatarStyle]);

  // Handle Likes reaction -> All avatars jump & float hearts
  useEffect(() => {
    if (totalLikes > prevLikesRef.current && settings.avatarShowLikesReaction) {
      const diff = totalLikes - prevLikesRef.current;
      prevLikesRef.current = totalLikes;

      // Spawn floating hearts from random avatars
      if (avatars.length > 0) {
        const heartsToAdd: { id: string; x: number; y: number; color: string }[] = [];
        const count = Math.min(5, Math.max(1, Math.floor(diff / 5) || 2));
        for (let i = 0; i < count; i++) {
          const randomAv = avatars[Math.floor(Math.random() * avatars.length)];
          heartsToAdd.push({
            id: `heart-${Date.now()}-${Math.random()}`,
            x: randomAv.x + (Math.random() * 4 - 2),
            y: 35 + Math.random() * 15,
            color: ['#f43f5e', '#ec4899', '#f472b6', '#fb7185'][Math.floor(Math.random() * 4)],
          });
        }
        setFloatingHearts((prev) => [...prev.slice(-15), ...heartsToAdd]);
      }

      // Small natural parabolic hop for some avatars
      setAvatars((prev) =>
        prev.map((a) => {
          if (Math.random() < 0.6) {
            return {
              ...a,
              action: 'jump',
              vy: -18 - Math.random() * 10,
              yOffset: -1,
              actionTimer: 1.6,
            };
          }
          return a;
        })
      );
    } else {
      prevLikesRef.current = totalLikes;
    }
  }, [totalLikes, settings.avatarShowLikesReaction, avatars.length]);

  // Handle Gift Alert -> Avatars cheer & dance!
  useEffect(() => {
    if (!lastGift || !settings.avatarShowGiftsReaction) return;
    if (prevGiftIdRef.current === lastGift.id) return;
    prevGiftIdRef.current = lastGift.id;

    // Add celebration banner
    const randomX = Math.random() * 60 + 20;
    const giftTitle = lastGift.gift?.nameTh || lastGift.gift?.name || (lastGift as any).giftName || 'ของขวัญ';
    const sender = lastGift.senderName || 'ผู้ชมในไลฟ์';
    setGiftCelebrations((prev) => [
      ...prev.slice(-4),
      {
        id: `gift-celeb-${Date.now()}`,
        x: randomX,
        text: `🎉 ${giftTitle} ขอบคุณ ${sender}! ✨`,
      },
    ]);

    // All avatars jump and celebrate with smooth parabolic physics!
    setAvatars((prev) =>
      prev.map((a) => ({
        ...a,
        action: Math.random() > 0.4 ? 'dance' : 'cheer',
        vy: -22 - Math.random() * 12,
        yOffset: -1,
        celebrating: true,
        actionTimer: 4.5,
      }))
    );
  }, [lastGift, settings.avatarShowGiftsReaction]);

  // Handle Follower Alert -> Spawn or celebrate Follower Avatar! ("พวกกดติดตาม")
  useEffect(() => {
    if (!lastFollow || settings.avatarShowFollowReaction === false) return;
    if (prevFollowIdRef.current === lastFollow.id) return;
    prevFollowIdRef.current = lastFollow.id;

    const followerName = lastFollow.username || 'Follower';

    // Spawn overhead celebration banner
    const bannerX = Math.random() * 50 + 25;
    setGiftCelebrations((prev) => [
      ...prev.slice(-3),
      {
        id: `follow-celeb-${Date.now()}`,
        x: bannerX,
        text: `⭐ @${followerName} ติดตามช่องแล้ว! ขอบคุณงับ 🎉`,
      },
    ]);

    // Float golden stars & hearts
    setFloatingHearts((prev) => [
      ...prev.slice(-12),
      { id: `flw-star-${Date.now()}-1`, x: bannerX - 6, y: 40, color: '#f59e0b' },
      { id: `flw-star-${Date.now()}-2`, x: bannerX, y: 52, color: '#fbbf24' },
      { id: `flw-star-${Date.now()}-3`, x: bannerX + 6, y: 45, color: '#ec4899' },
    ]);

    setAvatars((prev) => {
      // Find if this follower already has an avatar on screen
      const existingIdx = prev.findIndex(
        (a) => a.name.toLowerCase() === followerName.toLowerCase()
      );

      if (existingIdx !== -1) {
        // Upgrade existing avatar to FOLLOW badge and excited jump
        return prev.map((av, i) => {
          if (i === existingIdx) {
            return {
              ...av,
              badge: 'FOLLOW',
              action: 'jump',
              vy: -28,
              yOffset: -1,
              celebrating: true,
              actionTimer: 5,
              isSpecialEvent: 'follow',
              speechBubble: {
                text: `⭐ กดติดตามช่องแล้วนะ! ฝากตัวด้วยงับ 💖`,
                timestamp: Date.now(),
              },
            };
          }
          // Surrounding avatars cheer/jump along!
          return {
            ...av,
            action: Math.random() < 0.6 ? 'jump' : av.action,
            vy: Math.random() < 0.6 ? -18 : (av.vy || 0),
            celebrating: true,
            actionTimer: 3.5,
          };
        });
      }

      // Otherwise, spawn a dedicated Follower Avatar into the stream!
      const spawnX = Math.random() > 0.5 ? 8 : 92;
      const targetX = 25 + Math.random() * 50;
      const newFollower: StreamAvatarEntity = {
        id: `avatar-follow-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: followerName,
        color: '#f59e0b',
        badge: 'FOLLOW',
        spriteIndex: Math.floor(Math.random() * 16),
        x: spawnX,
        targetX,
        vx: 0,
        vy: -26,
        direction: targetX >= spawnX ? 'right' : 'left',
        action: 'jump',
        actionTimer: 5,
        yOffset: -1,
        speedScale: 1.15,
        celebrating: true,
        isSpecialEvent: 'follow',
        opacity: 1,
        speechBubble: {
          text: `⭐ @${followerName} กดติดตามแล้วงับ! 💖`,
          timestamp: Date.now(),
        },
      };

      // Also make other avatars celebrate the newcomer
      const cheeredOthers = prev.map((a) => ({
        ...a,
        action: Math.random() < 0.6 ? 'jump' : a.action,
        vy: Math.random() < 0.6 ? -16 : (a.vy || 0),
        celebrating: true,
        actionTimer: 3,
      }));

      return [...cheeredOthers, newFollower];
    });
  }, [lastFollow, settings.avatarShowFollowReaction]);

  // Handle Share Alert -> Spawn or celebrate Sharer Avatar! ("พวกกดแชร์")
  useEffect(() => {
    if (!lastShare || settings.avatarShowShareReaction === false) return;
    if (prevShareIdRef.current === lastShare.id) return;
    prevShareIdRef.current = lastShare.id;

    const sharerName = lastShare.username || 'Sharer';
    const shareCount = lastShare.shareCount || 1;

    // Overhead banner
    const bannerX = Math.random() * 50 + 25;
    setGiftCelebrations((prev) => [
      ...prev.slice(-3),
      {
        id: `share-celeb-${Date.now()}`,
        x: bannerX,
        text: `📢 @${sharerName} ช่วยแชร์ไลฟ์ ${shareCount > 1 ? `x${shareCount} ` : ''}แล้ว! 🚀`,
      },
    ]);

    // Float cyan/magenta share rockets & hearts
    setFloatingHearts((prev) => [
      ...prev.slice(-12),
      { id: `shr-icon-${Date.now()}-1`, x: bannerX - 5, y: 42, color: '#06b6d4' },
      { id: `shr-icon-${Date.now()}-2`, x: bannerX + 4, y: 48, color: '#38bdf8' },
    ]);

    setAvatars((prev) => {
      const existingIdx = prev.findIndex(
        (a) => a.name.toLowerCase() === sharerName.toLowerCase()
      );

      if (existingIdx !== -1) {
        return prev.map((av, i) => {
          if (i === existingIdx) {
            return {
              ...av,
              badge: 'SHARE',
              action: 'dance',
              vy: -24,
              yOffset: -1,
              celebrating: true,
              actionTimer: 5,
              isSpecialEvent: 'share',
              speechBubble: {
                text: `📢 ช่วยแชร์ไลฟ์ให้แล้วนะงับ! 🚀`,
                timestamp: Date.now(),
              },
            };
          }
          return {
            ...av,
            action: Math.random() < 0.6 ? 'dance' : av.action,
            celebrating: true,
            actionTimer: 3.5,
          };
        });
      }

      // Spawn dedicated Sharer Avatar
      const spawnX = Math.random() > 0.5 ? 10 : 90;
      const targetX = 30 + Math.random() * 40;
      const newSharer: StreamAvatarEntity = {
        id: `avatar-share-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: sharerName,
        color: '#06b6d4',
        badge: 'SHARE',
        spriteIndex: Math.floor(Math.random() * 16),
        x: spawnX,
        targetX,
        vx: 0,
        vy: -24,
        direction: targetX >= spawnX ? 'right' : 'left',
        action: 'dance',
        actionTimer: 5,
        yOffset: -1,
        speedScale: 1.1,
        celebrating: true,
        isSpecialEvent: 'share',
        opacity: 1,
        speechBubble: {
          text: `📢 @${sharerName} ช่วยแชร์ไลฟ์แล้วงับ! 🚀`,
          timestamp: Date.now(),
        },
      };

      const cheeredOthers = prev.map((a) => ({
        ...a,
        action: Math.random() < 0.6 ? 'dance' : a.action,
        celebrating: true,
        actionTimer: 3,
      }));

      return [...cheeredOthers, newSharer];
    });
  }, [lastShare, settings.avatarShowShareReaction]);

  // Clean expired floating hearts & celebrations
  useEffect(() => {
    const cleanInterval = setInterval(() => {
      setFloatingHearts((prev) => prev.slice(-10));
      setGiftCelebrations((prev) => prev.slice(-2));
    }, 4000);
    return () => clearInterval(cleanInterval);
  }, []);

  // Main 60fps Movement & Natural Physics Engine Loop
  useEffect(() => {
    // avatarSpeed setting default is ~2.2
    const baseWalkSpeed = settings.avatarSpeed || 2.2;

    const updatePhysics = () => {
      const now = performance.now();
      // Cap dt so background tabs or frame drops never cause avatars to warp/leap across screen
      const dt = Math.min(0.035, Math.max(0.001, (now - lastTimeRef.current) / 1000));
      lastTimeRef.current = now;

      setAvatars((prev) => {
        if (prev.length === 0) return prev;

        return prev.map((avatar) => {
          let {
            x,
            targetX,
            vx,
            vy = 0,
            action,
            actionTimer,
            direction,
            yOffset,
            stepPhase = 0,
            speedScale = 1,
            speechBubble,
            celebrating,
          } = avatar;

          // Decrement action timer
          actionTimer -= dt;

          // Check if speech bubble expired (4.5 seconds)
          if (speechBubble && Date.now() - speechBubble.timestamp > 4500) {
            speechBubble = undefined;
          }

          // Smooth Parabolic Vertical Gravity & Jumps
          if (yOffset < 0 || vy !== 0) {
            vy += 105 * dt; // Gravity pulling down smoothly
            yOffset += vy * dt;
            if (yOffset >= 0) {
              yOffset = 0;
              vy = 0;
              if (action === 'jump') {
                action = 'idle';
                actionTimer = Math.random() * 3 + 1.5;
              }
            }
          }

          // State Machine: When action timer expires, pick a new natural behavior
          if (actionTimer <= 0) {
            celebrating = false;
            const roll = Math.random();

            if (roll < 0.62) {
              // Natural wander: short to medium strolls, like real mini companions
              action = 'walk';
              // 75% wander nearby (7% to 18%), 25% explore slightly further (18% to 32%)
              const wanderDistance =
                Math.random() < 0.75
                  ? (Math.random() * 11 + 7) * (Math.random() > 0.5 ? 1 : -1)
                  : (Math.random() * 14 + 18) * (Math.random() > 0.5 ? 1 : -1);

              let newTarget = x + wanderDistance;
              // Keep within stage boundaries [6%, 94%]
              if (newTarget < 6) newTarget = 6 + Math.random() * 16;
              if (newTarget > 94) newTarget = 94 - Math.random() * 16;

              targetX = Math.round(newTarget * 10) / 10;
              actionTimer = Math.random() * 6 + 3.5;
            } else if (roll < 0.88) {
              // Idle: pause in place, look around, breathe
              action = 'idle';
              actionTimer = Math.random() * 4.5 + 2.5;
            } else if (roll < 0.96 && settings.avatarAllowCheer) {
              // Cute hop / jump
              action = 'jump';
              vy = -24 - Math.random() * 8;
              yOffset = -1;
              actionTimer = Math.random() * 2 + 1;
            } else {
              // Happy little wiggle / dance
              action = 'dance';
              actionTimer = Math.random() * 3 + 1.5;
            }
          }

          // Natural Walking Movement with Smooth Acceleration & Deceleration (Easing)
          if (action === 'walk') {
            const dist = targetX - x;
            const absDist = Math.abs(dist);

            if (absDist > 0.25) {
              // Top walking speed for this avatar (percentage per second, e.g. ~4.5% to 7.5%/s)
              const topSpeed = baseWalkSpeed * speedScale * 2.2;
              // Smooth deceleration easing as it arrives at destination
              const targetSpeed = Math.min(topSpeed, Math.max(0.6, absDist * 1.8)) * Math.sign(dist);

              // Acceleration & deceleration rate
              const accel = 16 * dt;
              if (vx < targetSpeed) {
                vx = Math.min(targetSpeed, vx + accel);
              } else {
                vx = Math.max(targetSpeed, vx - accel);
              }

              // Update position
              x += vx * dt;

              // Face direction of movement (with a stable deadband to prevent flipping jitter)
              if (vx > 0.3) direction = 'right';
              else if (vx < -0.3) direction = 'left';

              // Advance walk footsteps cycle proportional to distance traveled
              stepPhase += Math.abs(vx) * dt * 0.9;
            } else {
              // Arrived naturally at destination
              x = targetX;
              vx = 0;
              action = 'idle';
              actionTimer = Math.random() * 4 + 2;
            }
          } else {
            // Decelerate smoothly to complete stop if not walking
            if (Math.abs(vx) > 0.05) {
              vx *= Math.max(0, 1 - 14 * dt);
              x += vx * dt;
            } else {
              vx = 0;
            }
          }

          // Keep in bounds [5%, 95%] only if NOT currently leaving
          if (!avatar.isLeaving) {
            if (x <= 5) {
              x = 5;
              vx = 0;
              if (action === 'walk') {
                targetX = 14 + Math.random() * 20;
                direction = 'right';
              }
            } else if (x >= 95) {
              x = 95;
              vx = 0;
              if (action === 'walk') {
                targetX = 86 - Math.random() * 20;
                direction = 'left';
              }
            }
          }

          // Handle smooth leaving fade-out
          let opacity = avatar.opacity !== undefined ? avatar.opacity : 1;
          if (avatar.isLeaving) {
            opacity = Math.max(0, opacity - 0.7 * dt);
          }

          return {
            ...avatar,
            x,
            targetX,
            vx,
            vy,
            action,
            actionTimer,
            direction,
            yOffset,
            stepPhase,
            speedScale,
            speechBubble,
            celebrating,
            opacity,
          };
        }).filter((avatar) => {
          // Clean up avatars that finished leaving or walked off the screen
          if (avatar.isLeaving) {
            if (
              (avatar.opacity !== undefined && avatar.opacity <= 0.04) ||
              avatar.x <= -10 ||
              avatar.x >= 110
            ) {
              return false;
            }
          }
          return true;
        });
      });

      requestRef.current = requestAnimationFrame(updatePhysics);
    };

    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(requestRef.current);
  }, [settings.avatarSpeed, settings.avatarAllowCheer]);

  // Determine floor styling
  const floorStyle = settings.avatarFloorStyle || 'transparent';

  return (
    <div className="relative w-full h-full min-h-[140px] flex flex-col justify-end overflow-hidden select-none pointer-events-none">
      {/* Empty Stage Helper (when 0 viewers / all avatars left, shown in Dashboard mode, invisible in OBS mode) */}
      {avatars.length === 0 && !isOBSMode && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-10 px-4">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/15 text-white shadow-2xl flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-base">
              😴
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>ไม่มีคนดูในไลฟ์ (0 คน) — ตัวละครหายไปตามคำสั่ง</span>
              </p>
              <p className="text-[10px] text-slate-400">
                เมื่อมีคนดูเข้ามา กดติดตาม หรือแชร์ ตัวละครจะเดินออกมาทันที
              </p>
            </div>
            {onAddViewer && (
              <button
                onClick={onAddViewer}
                className="ml-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+1 คนดู</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active Avatars Stage Area */}
      <div className="relative w-full h-36 sm:h-44">
        {/* Floating Celebrations / Gift Banners */}
        {giftCelebrations.map((celeb) => (
          <div
            key={celeb.id}
            style={{ left: `${celeb.x}%` }}
            className="absolute top-2 -translate-x-1/2 z-30 animate-bounce"
          >
            <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg border border-white/40 flex items-center gap-1.5 whitespace-nowrap">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
              <span>{celeb.text}</span>
            </div>
          </div>
        ))}

        {/* Floating Hearts & Stars from Likes, Follows, Shares */}
        {floatingHearts.map((heart) => (
          <div
            key={heart.id}
            style={{ left: `${heart.x}%`, bottom: `${heart.y}%` }}
            className="absolute z-25 pointer-events-none animate-floatUp transition-all duration-700"
          >
            <Heart
              className="w-4 h-4 fill-current drop-shadow-md"
              style={{ color: heart.color }}
            />
          </div>
        ))}

        {/* Render each Viewer Avatar */}
        {avatars.map((avatar) => {
          const isJumping = avatar.yOffset < -1;
          const isDancing = avatar.action === 'dance' || avatar.action === 'cheer';
          const isWalking = avatar.action === 'walk' && Math.abs(avatar.vx) > 0.2;
          // Step cycle advances only when moving; when stopped, feet remain planted
          const avatarStepFrame = isWalking
            ? Math.floor(avatar.stepPhase || 0) % 2
            : 0;

          return (
            <div
              key={avatar.id}
              style={{
                left: `${avatar.x}%`,
                bottom: '12px',
                transform: `translate(-50%, ${avatar.yOffset}px)`,
                opacity: avatar.opacity !== undefined ? avatar.opacity : 1,
                willChange: 'left, transform, opacity',
              }}
              className="absolute z-20 flex flex-col items-center justify-end transition-opacity duration-300"
            >
              {/* 💬 Speech Bubble (when this avatar chatted, followed, or shared) */}
              {settings.avatarShowChatBubbles && avatar.speechBubble && (
                <div className="mb-1.5 max-w-[170px] sm:max-w-[220px] animate-fadeIn z-30 pointer-events-auto">
                  <div
                    className={`relative px-2.5 py-1 rounded-2xl shadow-xl text-center border ${
                      avatar.isSpecialEvent === 'follow'
                        ? 'bg-amber-50 text-slate-900 border-amber-400'
                        : avatar.isSpecialEvent === 'share'
                        ? 'bg-cyan-50 text-slate-900 border-cyan-400'
                        : 'bg-white text-slate-900 border-pink-400'
                    }`}
                  >
                    <p className="text-[11px] sm:text-xs font-semibold leading-tight break-words line-clamp-2">
                      {avatar.speechBubble.text}
                    </p>
                    {/* Speech bubble pointy arrow */}
                    <div
                      className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[5px] border-x-transparent border-t-[6px] ${
                        avatar.isSpecialEvent === 'follow'
                          ? 'border-t-amber-50'
                          : avatar.isSpecialEvent === 'share'
                          ? 'border-t-cyan-50'
                          : 'border-t-white'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Special Event Overhead Particles (Follower / Sharer) */}
              {avatar.isSpecialEvent === 'follow' && (
                <div className="absolute -top-7 flex items-center gap-1 text-amber-400 animate-bounce">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                  <span className="text-[9.5px] font-black tracking-wider text-amber-300 uppercase drop-shadow">
                    NEW FOLLOWER!
                  </span>
                </div>
              )}

              {avatar.isSpecialEvent === 'share' && (
                <div className="absolute -top-7 flex items-center gap-1 text-cyan-400 animate-bounce">
                  <Share2 className="w-3.5 h-3.5 text-cyan-300" />
                  <span className="text-[9.5px] font-black tracking-wider text-cyan-300 uppercase drop-shadow">
                    SHARED LIVE!
                  </span>
                </div>
              )}

              {/* Celebrating Sparkle / Hearts indicator */}
              {!avatar.isSpecialEvent && avatar.celebrating && (
                <div className="absolute -top-6 flex items-center gap-1 text-pink-400 animate-bounce">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="text-[10px] font-black tracking-wider text-pink-300">
                    CHEER!
                  </span>
                </div>
              )}

              {/* 🏷️ Name Tag & Badge Pill */}
              {settings.avatarShowNametags && (
                <div className="mb-1 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/15 text-[9.5px] sm:text-[10px] font-bold text-white tracking-tight shadow-md whitespace-nowrap">
                  {avatar.badge && (
                    <span
                      style={{
                        backgroundColor:
                          avatar.badge === 'FOLLOW'
                            ? '#f59e0b'
                            : avatar.badge === 'SHARE'
                            ? '#06b6d4'
                            : avatar.badge === 'VIP'
                            ? '#e11d48'
                            : avatar.badge === 'MOD'
                            ? '#0891b2'
                            : avatar.badge === 'SUB'
                            ? '#ec4899'
                            : '#6366f1',
                      }}
                      className="px-1 py-0.2 rounded text-[8px] font-black text-white uppercase flex items-center gap-0.5 shadow-sm"
                    >
                      {avatar.badge === 'FOLLOW' && '⭐'}
                      {avatar.badge === 'SHARE' && '📢'}
                      {avatar.badge}
                    </span>
                  )}
                  <span className="truncate max-w-[80px] sm:max-w-[100px]">{avatar.name}</span>
                </div>
              )}

              {/* Character Animated Sprite */}
              <div
                className={`relative ${
                  isDancing ? 'animate-bounce' : isJumping ? 'drop-shadow-lg' : ''
                }`}
              >
                <StreamAvatarSprite
                  avatar={avatar}
                  style={settings.avatarStyle || 'chibi-pixel'}
                  size={settings.avatarSize || 'md'}
                  stepFrame={avatarStepFrame}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Ground Floor / Platform Rendering */}
      {floorStyle === 'neon-line' && (
        <div className="w-full h-3 bg-slate-950 border-t-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)] relative z-10 flex items-center justify-center">
          <div className="w-full h-[1px] bg-cyan-300 opacity-60" />
        </div>
      )}

      {floorStyle === 'grass-platform' && (
        <div className="w-full h-4 bg-gradient-to-t from-emerald-800 to-emerald-500 border-t-2 border-emerald-400 relative z-10">
          <div className="flex justify-around items-start -mt-1.5 opacity-80">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="text-[10px] select-none">
                {i % 4 === 0 ? '🌼' : '🌱'}
              </span>
            ))}
          </div>
        </div>
      )}

      {floorStyle === 'cyber-grid' && (
        <div className="w-full h-4 bg-purple-950/80 border-t border-pink-500/80 relative z-10 [background-size:16px_16px] bg-[linear-gradient(to_right,#ec489922_1px,transparent_1px),linear-gradient(to_bottom,#ec489922_1px,transparent_1px)] shadow-[0_0_12px_rgba(236,72,153,0.4)]" />
      )}

      {floorStyle === 'transparent' && (
        /* Transparent invisible floor line */
        <div className="w-full h-1 relative z-10" />
      )}
    </div>
  );
};
