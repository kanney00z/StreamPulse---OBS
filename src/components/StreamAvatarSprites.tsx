import React from 'react';
import { StreamAvatarEntity } from '../types';

interface AvatarSpriteProps {
  avatar: StreamAvatarEntity;
  style: 'chibi-pixel' | 'cute-animals' | 'kawaii-slimes' | 'cyber-mecha';
  size: 'sm' | 'md' | 'lg';
  stepFrame: number; // 0 or 1 for walk cycle
}

// -------------------------------------------------------------
// 1. Chibi Pixel Characters (Humanoid Chibi Sprites)
// -------------------------------------------------------------
const renderChibiPixel = (spriteIndex: number, color: string, stepFrame: number, isJumping: boolean) => {
  const legOffset1 = isJumping ? -3 : stepFrame === 0 ? 2 : -2;
  const legOffset2 = isJumping ? -3 : stepFrame === 0 ? -2 : 2;
  const bobY = !isJumping && stepFrame === 1 ? -1 : 0;

  // 6 distinct Chibi classes based on spriteIndex % 6
  const variant = spriteIndex % 6;

  return (
    <g transform={`translate(0, ${bobY})`}>
      {/* Shadow */}
      <ellipse cx="24" cy="45" rx="12" ry="3.5" fill="#000000" opacity="0.3" />

      {/* Legs / Boots */}
      <rect x="18" y={38 + legOffset1} width="4" height="6" rx="1.5" fill="#1e293b" />
      <rect x="26" y={38 + legOffset2} width="4" height="6" rx="1.5" fill="#1e293b" />

      {/* Body / Outfit */}
      {variant === 0 && (
        /* Adventurer / Knight: Blue tunic + gold buckle */
        <g>
          <rect x="16" y="24" width="16" height="14" rx="3" fill="#3b82f6" />
          <rect x="16" y="32" width="16" height="3" fill="#1e293b" />
          <rect x="22" y="31.5" width="4" height="4" rx="1" fill="#fbbf24" />
          {/* Wooden / Iron small sword on back */}
          <rect x="31" y="21" width="3" height="15" rx="1" fill="#94a3b8" transform="rotate(18 31 21)" />
        </g>
      )}

      {variant === 1 && (
        /* Mage: Purple robe + starry cape */
        <g>
          <path d="M16 26 L14 38 L34 38 L32 26 Z" fill="#8b5cf6" />
          <path d="M18 26 L24 38 L30 26 Z" fill="#c084fc" opacity="0.6" />
          <circle cx="24" cy="30" r="2" fill="#fbbf24" />
          {/* Wand with crystal */}
          <rect x="31" y="18" width="2" height="18" rx="1" fill="#78350f" transform="rotate(15 31 18)" />
          <polygon points="34,17 38,19 36,23 32,21" fill="#38bdf8" />
        </g>
      )}

      {variant === 2 && (
        /* Catgirl / Neko: Pink dress + tail */
        <g>
          <rect x="17" y="24" width="14" height="13" rx="3" fill="#ec4899" />
          <rect x="20" y="25" width="8" height="5" rx="2" fill="#ffffff" />
          {/* Waving Cat Tail */}
          <path
            d="M17 35 Q10 32 12 24"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      )}

      {variant === 3 && (
        /* Ninja: Dark suit + red fluttering scarf */
        <g>
          <rect x="17" y="24" width="14" height="13" rx="3" fill="#0f172a" />
          <rect x="16" y="31" width="16" height="3" fill="#dc2626" />
          {/* Fluttering Scarf */}
          <path
            d={`M18 24 Q10 ${25 + (stepFrame ? 3 : -2)} 7 28`}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
      )}

      {variant === 4 && (
        /* Cyberpunk Runner: Neon green/cyan jacket */
        <g>
          <rect x="16" y="24" width="16" height="14" rx="3" fill="#0284c7" />
          <rect x="20" y="24" width="8" height="14" fill="#06b6d4" />
          <circle cx="24" cy="28" r="2" fill="#22c55e" />
        </g>
      )}

      {variant === 5 && (
        /* Kawaii Maid / Idol: White apron + pink skirt */
        <g>
          <rect x="16" y="25" width="16" height="13" rx="3" fill="#f43f5e" />
          <path d="M19 25 L21 38 L27 38 L29 25 Z" fill="#ffffff" />
          <circle cx="24" cy="27" r="1.5" fill="#f43f5e" />
        </g>
      )}

      {/* Head / Face */}
      <rect x="14" y="10" width="20" height="16" rx="6" fill="#fde047" opacity="0.3" />
      <rect x="14" y="10" width="20" height="16" rx="5" fill="#fed7aa" />

      {/* Hair Styles */}
      {variant === 0 && (
        /* Brown spiky adventurer hair */
        <g>
          <rect x="13" y="8" width="22" height="7" rx="3" fill="#78350f" />
          <polygon points="13,11 10,13 13,15" fill="#78350f" />
          <polygon points="35,11 38,13 35,15" fill="#78350f" />
          <polygon points="21,15 24,18 27,15" fill="#78350f" />
        </g>
      )}

      {variant === 1 && (
        /* Wizard pointed hat over hair */
        <g>
          <rect x="12" y="10" width="24" height="4" rx="2" fill="#4c1d95" />
          <polygon points="15,10 24,0 33,10" fill="#6d28d9" />
          <polygon points="23,3 25,3 24,0" fill="#fbbf24" />
        </g>
      )}

      {variant === 2 && (
        /* Neko Cat Ears + pink bangs */
        <g>
          <rect x="13" y="8" width="22" height="7" rx="3" fill="#f472b6" />
          {/* Left Cat Ear */}
          <polygon points="14,9 12,2 20,7" fill="#f43f5e" />
          <polygon points="15,8 14,4 18,7" fill="#fbcfe8" />
          {/* Right Cat Ear */}
          <polygon points="34,9 36,2 28,7" fill="#f43f5e" />
          <polygon points="33,8 34,4 30,7" fill="#fbcfe8" />
        </g>
      )}

      {variant === 3 && (
        /* Ninja Headband + mask */
        <g>
          <rect x="13" y="7" width="22" height="7" rx="2" fill="#1e293b" />
          <rect x="13" y="10" width="22" height="4" fill="#334155" />
          <rect x="22" y="10" width="4" height="4" fill="#cbd5e1" />
          {/* Ninja mouth mask */}
          <rect x="16" y="20" width="16" height="6" rx="2" fill="#0f172a" />
        </g>
      )}

      {variant === 4 && (
        /* Cyber Neon Visor Hair */
        <g>
          <rect x="13" y="7" width="22" height="7" rx="3" fill="#0284c7" />
          {/* Glowing Neon Visor */}
          <rect x="16" y="14" width="16" height="5" rx="2" fill="#06b6d4" />
          <line x1="17" y1="16.5" x2="31" y2="16.5" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
        </g>
      )}

      {variant === 5 && (
        /* Maid headdress + twin buns */
        <g>
          <rect x="13" y="8" width="22" height="6" rx="2" fill="#f43f5e" />
          <rect x="15" y="6" width="18" height="3" rx="1.5" fill="#ffffff" />
          <circle cx="12" cy="11" r="3.5" fill="#f43f5e" />
          <circle cx="36" cy="11" r="3.5" fill="#f43f5e" />
        </g>
      )}

      {/* Eyes & Blushing (if not masked or visored) */}
      {variant !== 3 && variant !== 4 && (
        <g>
          {/* Big anime eyes */}
          <circle cx="19" cy="17" r="2.2" fill="#0f172a" />
          <circle cx="29" cy="17" r="2.2" fill="#0f172a" />
          {/* Eye light gleam */}
          <circle cx="18.5" cy="16.5" r="0.8" fill="#ffffff" />
          <circle cx="28.5" cy="16.5" r="0.8" fill="#ffffff" />
          {/* Rosy Blush Cheeks */}
          <circle cx="16" cy="20" r="1.8" fill="#fb7185" opacity="0.6" />
          <circle cx="32" cy="20" r="1.8" fill="#fb7185" opacity="0.6" />
          {/* Happy smile */}
          <path d="M22.5 21 Q24 23 25.5 21" fill="none" stroke="#78350f" strokeWidth="1" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// -------------------------------------------------------------
// 2. Cute Animals (Capybara, Shiba, Frog, Cat, Duck, Penguin)
// -------------------------------------------------------------
const renderCuteAnimal = (spriteIndex: number, color: string, stepFrame: number, isJumping: boolean) => {
  const legOffset1 = isJumping ? -3 : stepFrame === 0 ? 2 : -2;
  const legOffset2 = isJumping ? -3 : stepFrame === 0 ? -2 : 2;
  // 16 unique animal species!
  const animalType = spriteIndex % 16;

  return (
    <g>
      {/* Shadow */}
      <ellipse cx="24" cy="45" rx="14" ry="4" fill="#000000" opacity="0.25" />

      {animalType === 0 && (
        /* 0. Capybara with Orange/Yuzu on head */
        <g>
          {/* 4 Little feet */}
          <rect x="14" y={38 + legOffset1} width="4" height="6" rx="2" fill="#5c3818" />
          <rect x="20" y={38 + legOffset2} width="4" height="6" rx="2" fill="#5c3818" />
          <rect x="28" y={38 + legOffset1} width="4" height="6" rx="2" fill="#5c3818" />
          <rect x="34" y={38 + legOffset2} width="4" height="6" rx="2" fill="#5c3818" />
          {/* Chubby Brown Body */}
          <rect x="12" y="20" width="28" height="20" rx="9" fill="#92592d" />
          <rect x="18" y="16" width="22" height="18" rx="8" fill="#a46938" />
          {/* Snout */}
          <rect x="30" y="22" width="10" height="11" rx="4" fill="#703f19" />
          <circle cx="36" cy="25" r="1.5" fill="#1e1005" />
          {/* Peaceful Closed Eyes */}
          <path d="M26 23 Q29 20 31 23" fill="none" stroke="#2c1a0e" strokeWidth="1.6" strokeLinecap="round" />
          {/* Tiny Ear */}
          <circle cx="20" cy="18" r="2.5" fill="#703f19" />
          {/* Orange Yuzu on head */}
          <circle cx="28" cy="12" r="4.5" fill="#f97316" />
          <path d="M28 8 Q30 6 32 8" fill="none" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {animalType === 1 && (
        /* 1. Shiba Inu Dog: Golden puppy with wagging tail */
        <g>
          {/* Paws */}
          <rect x="16" y={38 + legOffset1} width="4" height="6" rx="2" fill="#ffffff" />
          <rect x="28" y={38 + legOffset2} width="4" height="6" rx="2" fill="#ffffff" />
          {/* Body */}
          <rect x="13" y="22" width="22" height="18" rx="9" fill="#d97706" />
          <ellipse cx="22" cy="32" rx="7" ry="6" fill="#fef3c7" />
          {/* Curled Tail */}
          <path
            d={`M13 28 Q8 ${22 + (stepFrame ? 3 : -3)} 11 16`}
            fill="none"
            stroke="#d97706"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Head */}
          <circle cx="29" cy="20" r="9" fill="#d97706" />
          <ellipse cx="32" cy="22" rx="5" ry="4" fill="#fef3c7" />
          {/* Shiba pointy ears */}
          <polygon points="25,14 27,6 31,13" fill="#b45309" />
          <polygon points="31,14 34,7 37,13" fill="#b45309" />
          {/* Cute face */}
          <circle cx="29" cy="19" r="1.5" fill="#1e293b" />
          <circle cx="34" cy="20" r="1.8" fill="#1e293b" />
          <circle cx="27" cy="23" r="1.8" fill="#f43f5e" opacity="0.7" />
        </g>
      )}

      {animalType === 2 && (
        /* 2. Kawaii Froggy: Green with huge blush cheeks */
        <g>
          {/* Webbed feet */}
          <ellipse cx="16" cy={42 + legOffset1} rx="4" ry="2" fill="#15803d" />
          <ellipse cx="32" cy={42 + legOffset2} rx="4" ry="2" fill="#15803d" />
          {/* Round Frog Body */}
          <ellipse cx="24" cy="30" rx="14" ry="12" fill="#22c55e" />
          <ellipse cx="24" cy="32" rx="9" ry="8" fill="#bbf7d0" />
          {/* Big Big Frog Eyes on Top */}
          <circle cx="16" cy="18" r="6" fill="#22c55e" />
          <circle cx="32" cy="18" r="6" fill="#22c55e" />
          <circle cx="16" cy="18" r="4" fill="#ffffff" />
          <circle cx="32" cy="18" r="4" fill="#ffffff" />
          <circle cx="17" cy="18" r="2.2" fill="#0f172a" />
          <circle cx="31" cy="18" r="2.2" fill="#0f172a" />
          {/* Pink Cheeks & Wide Happy Mouth */}
          <circle cx="13" cy="28" r="2.5" fill="#fb7185" opacity="0.7" />
          <circle cx="35" cy="28" r="2.5" fill="#fb7185" opacity="0.7" />
          <path d="M20 28 Q24 33 28 28" fill="none" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )}

      {animalType === 3 && (
        /* 3. Bouncing Kitten (Orange / Calico) */
        <g>
          {/* Paws */}
          <circle cx="17" cy={40 + legOffset1} r="2.5" fill="#ffffff" />
          <circle cx="31" cy={40 + legOffset2} r="2.5" fill="#ffffff" />
          {/* Body */}
          <ellipse cx="24" cy="28" rx="12" ry="11" fill="#ea580c" />
          <ellipse cx="24" cy="30" rx="7" ry="8" fill="#ffedd5" />
          {/* Cat Ears */}
          <polygon points="14,16 16,7 22,14" fill="#ea580c" />
          <polygon points="16,14 17,9 20,13" fill="#fecdd3" />
          <polygon points="34,16 32,7 26,14" fill="#ea580c" />
          <polygon points="32,14 31,9 28,13" fill="#fecdd3" />
          {/* Cute Eyes & Whiskers */}
          <circle cx="19" cy="23" r="1.8" fill="#0f172a" />
          <circle cx="29" cy="23" r="1.8" fill="#0f172a" />
          <circle cx="24" cy="26" r="1.2" fill="#f43f5e" />
          {/* Whiskers */}
          <line x1="12" y1="25" x2="16" y2="25" stroke="#7c2d12" strokeWidth="1" />
          <line x1="32" y1="25" x2="36" y2="25" stroke="#7c2d12" strokeWidth="1" />
          {/* Waving tail */}
          <path d="M12 34 Q8 26 12 20" fill="none" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {animalType === 4 && (
        /* 4. Yellow Duckling with Flower Hat */
        <g>
          {/* Orange feet */}
          <ellipse cx="17" cy={41 + legOffset1} rx="3.5" ry="2" fill="#ea580c" />
          <ellipse cx="31" cy={41 + legOffset2} rx="3.5" ry="2" fill="#ea580c" />
          {/* Chubby Yellow Body */}
          <circle cx="24" cy="28" r="13" fill="#facc15" />
          {/* Orange Beak */}
          <ellipse cx="31" cy="26" rx="5" ry="3" fill="#f97316" />
          {/* Big sparkling duck eye */}
          <circle cx="26" cy="22" r="2.2" fill="#1e293b" />
          <circle cx="25.5" cy="21.5" r="0.8" fill="#ffffff" />
          {/* Rosy Cheek */}
          <circle cx="22" cy="26" r="2" fill="#f43f5e" opacity="0.6" />
          {/* Tiny Daisy Flower on head */}
          <circle cx="22" cy="13" r="2" fill="#f59e0b" />
          <circle cx="19" cy="13" r="1.8" fill="#ffffff" />
          <circle cx="25" cy="13" r="1.8" fill="#ffffff" />
          <circle cx="22" cy="10" r="1.8" fill="#ffffff" />
        </g>
      )}

      {animalType === 5 && (
        /* 5. Penguin with red bowtie */
        <g>
          {/* Orange flipper feet */}
          <ellipse cx="17" cy={41 + legOffset1} rx="4" ry="2" fill="#f97316" />
          <ellipse cx="31" cy={41 + legOffset2} rx="4" ry="2" fill="#f97316" />
          {/* Black Penguin Body */}
          <rect x="13" y="16" width="22" height="24" rx="10" fill="#0f172a" />
          {/* White Belly */}
          <ellipse cx="24" cy="30" rx="8" ry="10" fill="#ffffff" />
          {/* Flippers */}
          <ellipse cx="11" cy="28" rx="2.5" ry="7" fill="#0f172a" transform="rotate(15 11 28)" />
          <ellipse cx="37" cy="28" rx="2.5" ry="7" fill="#0f172a" transform="rotate(-15 37 28)" />
          {/* Face & Beak */}
          <circle cx="20" cy="21" r="1.8" fill="#0f172a" />
          <circle cx="28" cy="21" r="1.8" fill="#0f172a" />
          <polygon points="22,23 26,23 24,27" fill="#f97316" />
          {/* Red Bowtie */}
          <polygon points="21,30 27,30 24,32" fill="#ef4444" />
          <polygon points="21,34 27,34 24,32" fill="#ef4444" />
        </g>
      )}

      {animalType === 6 && (
        /* 6. Panda Bear: Black & White with Bamboo */
        <g>
          {/* Paws */}
          <rect x="15" y={38 + legOffset1} width="5" height="6" rx="2.5" fill="#0f172a" />
          <rect x="28" y={38 + legOffset2} width="5" height="6" rx="2.5" fill="#0f172a" />
          {/* White Body */}
          <ellipse cx="24" cy="29" rx="13" ry="11" fill="#f8fafc" />
          {/* Black shoulder vest */}
          <path d="M11 25 Q24 33 37 25 L36 31 Q24 37 12 31 Z" fill="#0f172a" />
          {/* Panda Head */}
          <ellipse cx="24" cy="20" rx="11" ry="9.5" fill="#f8fafc" />
          {/* Round Black Ears */}
          <circle cx="15" cy="12" r="3.8" fill="#0f172a" />
          <circle cx="33" cy="12" r="3.8" fill="#0f172a" />
          {/* Black Eye Patches */}
          <ellipse cx="19" cy="19" rx="3.2" ry="2.6" fill="#0f172a" transform="rotate(-15 19 19)" />
          <ellipse cx="29" cy="19" rx="3.2" ry="2.6" fill="#0f172a" transform="rotate(15 29 19)" />
          <circle cx="19" cy="18.5" r="1.1" fill="#ffffff" />
          <circle cx="29" cy="18.5" r="1.1" fill="#ffffff" />
          {/* Nose & Smile */}
          <ellipse cx="24" cy="22.5" rx="1.8" ry="1.2" fill="#0f172a" />
          <circle cx="16" cy="22" r="1.8" fill="#f43f5e" opacity="0.5" />
          <circle cx="32" cy="22" r="1.8" fill="#f43f5e" opacity="0.5" />
          {/* Bamboo stalk held in paw */}
          <rect x="30" y="20" width="3" height="18" rx="1" fill="#22c55e" transform="rotate(-20 30 20)" />
          <polygon points="32,18 38,15 35,21" fill="#4ade80" />
        </g>
      )}

      {animalType === 7 && (
        /* 7. Fluffy White Bunny: Long ears & Carrot */
        <g>
          {/* Feet */}
          <ellipse cx="17" cy={41 + legOffset1} rx="4" ry="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
          <ellipse cx="31" cy={41 + legOffset2} rx="4" ry="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
          {/* Cotton ball tail */}
          <circle cx="10" cy="32" r="3.5" fill="#f8fafc" />
          {/* Chubby White Body */}
          <ellipse cx="24" cy="30" rx="12" ry="11" fill="#ffffff" />
          <ellipse cx="24" cy="32" rx="7" ry="6" fill="#fef2f2" />
          {/* Long Bunny Ears */}
          <ellipse cx="18" cy="11" rx="3.5" ry="9" fill="#ffffff" transform="rotate(-10 18 11)" />
          <ellipse cx="18" cy="11" rx="2" ry="7" fill="#fecdd3" transform="rotate(-10 18 11)" />
          <ellipse cx="30" cy="11" rx="3.5" ry="9" fill="#ffffff" transform="rotate(10 30 11)" />
          <ellipse cx="30" cy="11" rx="2" ry="7" fill="#fecdd3" transform="rotate(10 30 11)" />
          {/* Head */}
          <circle cx="24" cy="22" r="8.5" fill="#ffffff" />
          {/* Pink/Ruby Eyes */}
          <circle cx="20" cy="21" r="1.8" fill="#e11d48" />
          <circle cx="19.5" cy="20.5" r="0.7" fill="#ffffff" />
          <circle cx="28" cy="21" r="1.8" fill="#e11d48" />
          <circle cx="27.5" cy="20.5" r="0.7" fill="#ffffff" />
          {/* Pink Nose */}
          <polygon points="23,24 25,24 24,25.5" fill="#fb7185" />
          {/* Whiskers */}
          <line x1="13" y1="23" x2="17" y2="24" stroke="#94a3b8" strokeWidth="0.8" />
          <line x1="31" y1="24" x2="35" y2="23" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Mini Carrot */}
          <polygon points="27,29 33,36 30,37" fill="#ea580c" />
          <polygon points="26,27 28,30 30,28" fill="#22c55e" />
        </g>
      )}

      {animalType === 8 && (
        /* 8. Red Panda: Auburn Fur with Striped Tail */
        <g>
          {/* Paws */}
          <rect x="15" y={38 + legOffset1} width="4.5" height="6" rx="2" fill="#1e1005" />
          <rect x="28.5" y={38 + legOffset2} width="4.5" height="6" rx="2" fill="#1e1005" />
          {/* Striped Ring Tail */}
          <path d="M12 32 Q6 24 10 14" fill="none" stroke="#c2410c" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M10 28 Q8 25 10 22" fill="none" stroke="#451a03" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M9 19 Q9 16 10 14" fill="none" stroke="#fed7aa" strokeWidth="4.5" strokeLinecap="round" />
          {/* Body */}
          <ellipse cx="24" cy="29" rx="12" ry="10.5" fill="#c2410c" />
          <ellipse cx="24" cy="32" rx="7" ry="6" fill="#1e1005" />
          {/* Head */}
          <ellipse cx="24" cy="20" rx="9" ry="8" fill="#c2410c" />
          {/* Ear tufts */}
          <polygon points="15,15 17,7 22,14" fill="#c2410c" />
          <polygon points="17,13 18,9 20,13" fill="#ffffff" />
          <polygon points="33,15 31,7 26,14" fill="#c2410c" />
          <polygon points="31,13 30,9 28,13" fill="#ffffff" />
          {/* White facial markings */}
          <circle cx="19" cy="18" r="2.5" fill="#ffffff" />
          <circle cx="29" cy="18" r="2.5" fill="#ffffff" />
          <circle cx="19" cy="18" r="1.4" fill="#1e1005" />
          <circle cx="29" cy="18" r="1.4" fill="#1e1005" />
          <polygon points="23,22 25,22 24,23.5" fill="#1e1005" />
        </g>
      )}

      {animalType === 9 && (
        /* 9. Chubby Hamster: Seed in paws */
        <g>
          {/* Paws */}
          <ellipse cx="18" cy={41 + legOffset1} rx="3" ry="1.8" fill="#fed7aa" />
          <ellipse cx="30" cy={41 + legOffset2} rx="3" ry="1.8" fill="#fed7aa" />
          {/* Round Chubby Body */}
          <ellipse cx="24" cy="29" rx="13" ry="12" fill="#d97706" />
          <ellipse cx="24" cy="31" rx="8" ry="8" fill="#fef3c7" />
          {/* Ears */}
          <circle cx="15" cy="17" r="3.5" fill="#d97706" />
          <circle cx="15" cy="17" r="2" fill="#fecdd3" />
          <circle cx="33" cy="17" r="3.5" fill="#d97706" />
          <circle cx="33" cy="17" r="2" fill="#fecdd3" />
          {/* Cheek Pouches */}
          <ellipse cx="16" cy="26" rx="4.5" ry="4" fill="#fef3c7" />
          <ellipse cx="32" cy="26" rx="4.5" ry="4" fill="#fef3c7" />
          {/* Eyes */}
          <circle cx="19" cy="22" r="2" fill="#1e293b" />
          <circle cx="18.5" cy="21.5" r="0.7" fill="#ffffff" />
          <circle cx="29" cy="22" r="2" fill="#1e293b" />
          <circle cx="28.5" cy="21.5" r="0.7" fill="#ffffff" />
          <circle cx="24" cy="24" r="1.2" fill="#f43f5e" />
          {/* Sunflower Seed in paws */}
          <ellipse cx="24" cy="30" rx="3.2" ry="4.8" fill="#1e293b" />
          <ellipse cx="24" cy="30" rx="1.6" ry="3.6" fill="#94a3b8" />
        </g>
      )}

      {animalType === 10 && (
        /* 10. Teddy Bear: Cocoa Brown with Honey Pot */
        <g>
          {/* Paws */}
          <rect x="16" y={38 + legOffset1} width="4.5" height="6" rx="2" fill="#78350f" />
          <rect x="27.5" y={38 + legOffset2} width="4.5" height="6" rx="2" fill="#78350f" />
          {/* Warm Cocoa Body */}
          <ellipse cx="24" cy="29" rx="12" ry="11" fill="#92400e" />
          <ellipse cx="24" cy="31" rx="7" ry="7" fill="#fde68a" />
          {/* Round Bear Ears */}
          <circle cx="16" cy="15" r="4" fill="#92400e" />
          <circle cx="16" cy="15" r="2" fill="#fde68a" />
          <circle cx="32" cy="15" r="4" fill="#92400e" />
          <circle cx="32" cy="15" r="2" fill="#fde68a" />
          {/* Head & Muzzle */}
          <circle cx="24" cy="21" r="8" fill="#92400e" />
          <ellipse cx="24" cy="23" rx="4.5" ry="3.5" fill="#fde68a" />
          <circle cx="24" cy="22" r="1.5" fill="#451a03" />
          <circle cx="20" cy="19.5" r="1.5" fill="#1e1005" />
          <circle cx="28" cy="19.5" r="1.5" fill="#1e1005" />
          {/* Golden Honey Pot */}
          <rect x="29" y="27" width="7" height="8" rx="2" fill="#f59e0b" />
          <path d="M29 27 Q32.5 29 36 27" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
        </g>
      )}

      {animalType === 11 && (
        /* 11. Pink Axolotl: Kawaii Sea Pet with Feathery Gills */
        <g>
          {/* Feet */}
          <rect x="16" y={39 + legOffset1} width="3.5" height="5" rx="1.5" fill="#f472b6" />
          <rect x="28.5" y={39 + legOffset2} width="3.5" height="5" rx="1.5" fill="#f472b6" />
          {/* Translucent Tail with Fin */}
          <path d="M12 32 Q6 30 8 24 Q11 26 13 28 Z" fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.8" />
          {/* Round Pale Pink Body */}
          <ellipse cx="24" cy="29" rx="11" ry="10" fill="#fce7f3" />
          <ellipse cx="24" cy="30" rx="7" ry="6" fill="#ffffff" />
          {/* Axolotl Head */}
          <ellipse cx="24" cy="20" rx="10" ry="8" fill="#fce7f3" />
          {/* Feathery External Gills */}
          <path d="M14 18 Q8 15 10 12" fill="none" stroke="#ec4899" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M13 20 Q7 20 8 18" fill="none" stroke="#ec4899" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M14 22 Q9 25 11 26" fill="none" stroke="#ec4899" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M34 18 Q40 15 38 12" fill="none" stroke="#ec4899" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M35 20 Q41 20 40 18" fill="none" stroke="#ec4899" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M34 22 Q39 25 37 26" fill="none" stroke="#ec4899" strokeWidth="2.4" strokeLinecap="round" />
          {/* Button Eyes */}
          <circle cx="19" cy="19" r="1.8" fill="#0f172a" />
          <circle cx="18.5" cy="18.5" r="0.6" fill="#ffffff" />
          <circle cx="29" cy="19" r="1.8" fill="#0f172a" />
          <circle cx="28.5" cy="18.5" r="0.6" fill="#ffffff" />
          {/* Rosy Blush & Sweet Smile */}
          <circle cx="16" cy="22" r="2.2" fill="#fb7185" opacity="0.6" />
          <circle cx="32" cy="22" r="2.2" fill="#fb7185" opacity="0.6" />
          <path d="M22 22 Q24 24 26 22" fill="none" stroke="#ec4899" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )}

      {animalType === 12 && (
        /* 12. Baby Chick with Cracked Eggshell Hat */
        <g>
          {/* Feet */}
          <rect x="18" y={40 + legOffset1} width="3" height="4" rx="1.5" fill="#f97316" />
          <rect x="27" y={40 + legOffset2} width="3" height="4" rx="1.5" fill="#f97316" />
          {/* Round Fluffy Body */}
          <circle cx="24" cy="28" r="12" fill="#fde047" />
          {/* Wings */}
          <ellipse cx="14" cy="28" rx="2.5" ry="4" fill="#eab308" transform="rotate(-15 14 28)" />
          <ellipse cx="34" cy="28" rx="2.5" ry="4" fill="#eab308" transform="rotate(15 34 28)" />
          {/* Eyes */}
          <circle cx="20" cy="24" r="1.8" fill="#0f172a" />
          <circle cx="28" cy="24" r="1.8" fill="#0f172a" />
          {/* Beak & Blush */}
          <polygon points="22,25 26,25 24,28" fill="#ea580c" />
          <circle cx="17" cy="26" r="1.8" fill="#f43f5e" opacity="0.5" />
          <circle cx="31" cy="26" r="1.8" fill="#f43f5e" opacity="0.5" />
          {/* Cracked Eggshell Hat */}
          <path d="M14 19 L17 15 L20 18 L24 13 L28 18 L31 15 L34 19 Q24 8 14 19 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
        </g>
      )}

      {animalType === 13 && (
        /* 13. Sea Otter with Clam Shell */
        <g>
          {/* Paws */}
          <rect x="17" y={39 + legOffset1} width="4" height="5" rx="2" fill="#593a1f" />
          <rect x="27" y={39 + legOffset2} width="4" height="5" rx="2" fill="#593a1f" />
          {/* Tail */}
          <path d="M13 32 Q7 36 9 40" fill="none" stroke="#784924" strokeWidth="3.5" strokeLinecap="round" />
          {/* Sleek Brown Body */}
          <ellipse cx="24" cy="29" rx="11" ry="11" fill="#784924" />
          <ellipse cx="24" cy="30" rx="7" ry="7" fill="#fef3c7" />
          {/* Head & Muzzle */}
          <ellipse cx="24" cy="19" rx="9" ry="8" fill="#784924" />
          <ellipse cx="24" cy="21" rx="5" ry="4" fill="#fef3c7" />
          <circle cx="24" cy="19.5" r="1.5" fill="#1e1005" />
          <circle cx="19" cy="17.5" r="1.5" fill="#1e1005" />
          <circle cx="29" cy="17.5" r="1.5" fill="#1e1005" />
          {/* Ears */}
          <circle cx="16" cy="14" r="2" fill="#593a1f" />
          <circle cx="32" cy="14" r="2" fill="#593a1f" />
          {/* Purple Clam Shell on chest */}
          <ellipse cx="24" cy="29" rx="4" ry="3" fill="#a855f7" />
          <path d="M21 29 Q24 26 27 29" stroke="#d8b4fe" strokeWidth="0.8" fill="none" />
        </g>
      )}

      {animalType === 14 && (
        /* 14. Fennec Fox: Huge Ears & Fluffy Tail */
        <g>
          {/* Paws */}
          <rect x="17" y={39 + legOffset1} width="3.5" height="5" rx="1.5" fill="#d97706" />
          <rect x="28" y={39 + legOffset2} width="3.5" height="5" rx="1.5" fill="#d97706" />
          {/* Fluffy tail with white tip */}
          <path d="M12 30 Q6 25 8 18" fill="none" stroke="#d97706" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="8" cy="18" r="2.2" fill="#ffffff" />
          {/* Cream Body */}
          <ellipse cx="24" cy="29" rx="10" ry="9.5" fill="#fef3c7" />
          {/* Giant Ears */}
          <polygon points="12,17 9,5 20,13" fill="#fde68a" />
          <polygon points="13,15 11,8 18,13" fill="#fecdd3" />
          <polygon points="36,17 39,5 28,13" fill="#fde68a" />
          <polygon points="35,15 37,8 30,13" fill="#fecdd3" />
          {/* Head & Face */}
          <circle cx="24" cy="20" r="7.5" fill="#fef3c7" />
          <circle cx="20" cy="19" r="1.5" fill="#78350f" />
          <circle cx="28" cy="19" r="1.5" fill="#78350f" />
          <polygon points="23,22.5 25,22.5 24,24" fill="#0f172a" />
        </g>
      )}

      {animalType === 15 && (
        /* 15. Gentle Sloth: Peaceful smile & green leaf */
        <g>
          {/* Claws */}
          <rect x="16" y={39 + legOffset1} width="4" height="5" rx="2" fill="#64748b" />
          <rect x="28" y={39 + legOffset2} width="4" height="5" rx="2" fill="#64748b" />
          {/* Body */}
          <ellipse cx="24" cy="29" rx="12" ry="11" fill="#78716c" />
          <ellipse cx="24" cy="30" rx="7.5" ry="7.5" fill="#e7e5e4" />
          {/* Sloth Mask */}
          <circle cx="24" cy="20" r="8" fill="#e7e5e4" />
          <ellipse cx="19" cy="19" rx="3.5" ry="2" fill="#44403c" transform="rotate(15 19 19)" />
          <ellipse cx="29" cy="19" rx="3.5" ry="2" fill="#44403c" transform="rotate(-15 29 19)" />
          {/* Eyes & Gentle Smile */}
          <circle cx="19" cy="19" r="1.1" fill="#ffffff" />
          <circle cx="29" cy="19" r="1.1" fill="#ffffff" />
          <ellipse cx="24" cy="22" rx="1.8" ry="1.2" fill="#1c1917" />
          <path d="M21 24 Q24 26 27 24" fill="none" stroke="#1c1917" strokeWidth="1" strokeLinecap="round" />
          {/* Leaf in hand */}
          <polygon points="32,28 38,26 35,31" fill="#22c55e" />
        </g>
      )}
    </g>
  );
};

export const CUTE_ANIMAL_SPECIES = [
  { id: 0, name: 'Capybara', nameTh: 'กะปิบาร่าส้มยูซุ', emoji: '🦫', desc: 'หัวส้มยูซุ เดินชิลล์' },
  { id: 1, name: 'Shiba Inu', nameTh: 'หมาชิบะอินุ', emoji: '🐕', desc: 'แก้มยุ้ย หางม้วนดุ๊กดิ๊ก' },
  { id: 2, name: 'Kawaii Froggy', nameTh: 'กบเขียวตาโต', emoji: '🐸', desc: 'แก้มชมพู ตาแป๋วสดใส' },
  { id: 3, name: 'Orange Kitten', nameTh: 'แมวส้มเหมียว', emoji: '🐱', desc: 'หนวดกระดิก หางสะบัด' },
  { id: 4, name: 'Yellow Duckling', nameTh: 'เป็ดน้อยหมวกดอกไม้', emoji: '🦆', desc: 'ปากส้ม หมวกเดซี่' },
  { id: 5, name: 'Gentleman Penguin', nameTh: 'เพนกวินทักซิโด้', emoji: '🐧', desc: 'โบว์แดง ทรงสุภาพบุรุษ' },
  { id: 6, name: 'Bamboo Panda', nameTh: 'หมีแพนด้ากินไผ่', emoji: '🐼', desc: 'พุงขาวอ้วน ถือต้นไผ่' },
  { id: 7, name: 'Fluffy Bunny', nameTh: 'กระต่ายขาวฟู', emoji: '🐰', desc: 'หูยาวชมพู ถือมินิแครอท' },
  { id: 8, name: 'Red Panda', nameTh: 'แพนด้าแดงหางลาย', emoji: '🦊', desc: 'ขนสีส้มแดง หางเป็นปล้อง' },
  { id: 9, name: 'Chubby Hamster', nameTh: 'หนูแฮมสเตอร์แก้มตุ่ย', emoji: '🐹', desc: 'แก้มอมเมล็ดทานตะวัน' },
  { id: 10, name: 'Teddy Bear', nameTh: 'หมีน้อยสีน้ำตาล', emoji: '🐻', desc: 'หมีช็อกโกแลตถือโถน้ำผึ้ง' },
  { id: 11, name: 'Pink Axolotl', nameTh: 'แอกโซลอเติลชมพู', emoji: '🦎', desc: 'หมาน้ำเหงือกขนนกเรืองแสง' },
  { id: 12, name: 'Baby Chick', nameTh: 'ลูกเจี๊ยบหมวกไข่', emoji: '🐥', desc: 'ลูกเจี๊ยบใส่เปลือกไข่แตก' },
  { id: 13, name: 'Sea Otter', nameTh: 'นากทะเลถือหอย', emoji: '🦦', desc: 'พุงนุ่มถือหอยตลับสีม่วง' },
  { id: 14, name: 'Fennec Fox', nameTh: 'จิ้งจอกทะเลทราย', emoji: '🦊', desc: 'หูโตยักษ์ หางปุกปุยปลายขาว' },
  { id: 15, name: 'Gentle Sloth', nameTh: 'สลอธน้อยใจดี', emoji: '🦥', desc: 'ยิ้มละมุน ถือใบไม้เขียว' },
];

// -------------------------------------------------------------
const renderKawaiiSlime = (spriteIndex: number, color: string, stepFrame: number, isJumping: boolean) => {
  const slimeVariant = spriteIndex % 5;
  const squishY = !isJumping && stepFrame === 1 ? 2 : 0;
  const squishX = !isJumping && stepFrame === 1 ? 2 : 0;

  const slimeColors = [
    { main: '#f43f5e', light: '#fda4af', dark: '#be123c', decor: 'heart' },
    { main: '#06b6d4', light: '#67e8f9', dark: '#0e7490', decor: 'star' },
    { main: '#eab308', light: '#fde047', dark: '#a16207', decor: 'crown' },
    { main: '#10b981', light: '#6ee7b7', dark: '#047857', decor: 'leaf' },
    { main: '#8b5cf6', light: '#c4b5fd', dark: '#6d28d9', decor: 'sparkle' },
  ];
  const sc = slimeColors[slimeVariant];

  return (
    <g transform={`translate(0, ${squishY})`}>
      {/* Shadow */}
      <ellipse cx="24" cy="45" rx={14 + squishX} ry="4" fill="#000000" opacity="0.3" />

      {/* Main Slime Jelly Blob */}
      <path
        d={`M10,40 C8,30 14,16 24,14 C34,16 40,30 38,40 C38,44 10,44 10,40 Z`}
        fill={sc.main}
      />
      {/* Gelatin Highlight */}
      <ellipse cx="20" cy="20" rx="4" ry="2.5" fill="#ffffff" opacity="0.6" transform="rotate(-20 20 20)" />

      {/* Accessory on top */}
      {sc.decor === 'crown' && (
        <polygon points="17,14 19,7 24,11 29,7 31,14" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
      )}
      {sc.decor === 'heart' && (
        <path
          d="M24 13 C22 10 18 11 18 14 C18 17 24 20 24 20 C24 20 30 17 30 14 C30 11 26 10 24 13 Z"
          fill="#f43f5e"
          transform="translate(0, -6)"
        />
      )}
      {sc.decor === 'leaf' && (
        <path d="M24 14 Q28 8 32 9 Q28 13 24 14" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
      )}
      {sc.decor === 'star' && (
        <polygon points="24,6 26,10 30,10 27,13 28,17 24,14 20,17 21,13 18,10 22,10" fill="#38bdf8" />
      )}

      {/* Slime Face */}
      <circle cx="18" cy="27" r="2.2" fill="#0f172a" />
      <circle cx="30" cy="27" r="2.2" fill="#0f172a" />
      <circle cx="17.5" cy="26.5" r="0.8" fill="#ffffff" />
      <circle cx="29.5" cy="26.5" r="0.8" fill="#ffffff" />
      {/* Blushing cheeks */}
      <circle cx="14" cy="30" r="2" fill={sc.dark} opacity="0.4" />
      <circle cx="34" cy="30" r="2" fill={sc.dark} opacity="0.4" />
      {/* Tiny happy open mouth */}
      <path d="M22 30 Q24 33 26 30" fill="none" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
};

// -------------------------------------------------------------
// 4. Cyberpunk Mecha / Arcade Bots
// -------------------------------------------------------------
const renderCyberMecha = (spriteIndex: number, color: string, stepFrame: number, isJumping: boolean) => {
  const mechaVariant = spriteIndex % 4;
  const legOffset1 = isJumping ? -3 : stepFrame === 0 ? 2 : -2;
  const legOffset2 = isJumping ? -3 : stepFrame === 0 ? -2 : 2;

  return (
    <g>
      {/* Shadow */}
      <ellipse cx="24" cy="45" rx="12" ry="3.5" fill="#06b6d4" opacity="0.3" />

      {/* Mechanical Legs */}
      <rect x="17" y={36 + legOffset1} width="4" height="7" rx="1.5" fill="#334155" />
      <rect x="27" y={36 + legOffset2} width="4" height="7" rx="1.5" fill="#334155" />
      <rect x="16" y={41 + legOffset1} width="6" height="2.5" rx="1" fill="#0ea5e9" />
      <rect x="26" y={41 + legOffset2} width="6" height="2.5" rx="1" fill="#0ea5e9" />

      {/* Torso Box */}
      <rect x="14" y="22" width="20" height="15" rx="3" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
      <circle cx="24" cy="29" r="4" fill="#06b6d4" />
      <circle cx="24" cy="29" r="2" fill="#ffffff" />

      {/* Head / Helmet */}
      <rect x="13" y="9" width="22" height="13" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />

      {/* Glowing Eye Visor Display */}
      {mechaVariant === 0 && (
        <rect x="16" y="13" width="16" height="5" rx="2" fill="#22c55e" />
      )}
      {mechaVariant === 1 && (
        <rect x="16" y="13" width="16" height="5" rx="2" fill="#ec4899" />
      )}
      {mechaVariant === 2 && (
        <rect x="16" y="13" width="16" height="5" rx="2" fill="#f59e0b" />
      )}
      {mechaVariant === 3 && (
        <rect x="16" y="13" width="16" height="5" rx="2" fill="#06b6d4" />
      )}

      {/* Antenna */}
      <line x1="24" y1="9" x2="24" y2="4" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="3" r="2" fill="#ef4444" />
    </g>
  );
};

// -------------------------------------------------------------
// 5. Chubby Shiba Squad (Interactive Stream Puppies as seen in video)
// -------------------------------------------------------------
export interface ShibaBreed {
  id: number;
  name: string;
  nameTh: string;
  tag: string;
  coat: string;
  shade: string;
  belly: string;
  eyebrow: string;
  innerEar: string;
  accessory: 'none' | 'glasses' | 'bell-collar' | 'bandana' | 'flower' | 'crown';
  badge: 'VIP' | 'MOD' | 'SUB' | 'TOP' | 'FAN';
}

export const SHIBA_BREEDS: ShibaBreed[] = [
  {
    id: 0,
    name: 'BigBoy',
    nameTh: 'ชิบะสีทอง BigBoy',
    tag: 'BigBoy',
    coat: '#f59e0b',
    shade: '#d97706',
    belly: '#fffbeb',
    eyebrow: '#ffffff',
    innerEar: '#fecdd3',
    accessory: 'bell-collar',
    badge: 'VIP',
  },
  {
    id: 1,
    name: 'Thua',
    nameTh: 'ชิบะเขียวมินต์ Thua',
    tag: 'Thua',
    coat: '#4ade80',
    shade: '#16a34a',
    belly: '#f0fdf4',
    eyebrow: '#ffffff',
    innerEar: '#bbf7d0',
    accessory: 'none',
    badge: 'MOD',
  },
  {
    id: 2,
    name: 'Max',
    nameTh: 'ชิบะม่วงลาเวนเดอร์ Max',
    tag: 'Max',
    coat: '#c084fc',
    shade: '#9333ea',
    belly: '#faf5ff',
    eyebrow: '#ffffff',
    innerEar: '#e9d5ff',
    accessory: 'bell-collar',
    badge: 'SUB',
  },
  {
    id: 3,
    name: 'PlayB',
    nameTh: 'ชิบะชมพูแว่นกลม PlayB',
    tag: 'PlayB',
    coat: '#f472b6',
    shade: '#db2777',
    belly: '#fff1f2',
    eyebrow: '#ffffff',
    innerEar: '#fce7f3',
    accessory: 'glasses',
    badge: 'TOP',
  },
  {
    id: 4,
    name: 'Sky',
    nameTh: 'ชิบะฟ้าคราม Sky',
    tag: 'Sky',
    coat: '#38bdf8',
    shade: '#0284c7',
    belly: '#f0f9ff',
    eyebrow: '#ffffff',
    innerEar: '#bae6fd',
    accessory: 'bandana',
    badge: 'FAN',
  },
  {
    id: 5,
    name: 'Kuro',
    nameTh: 'ชิบะดำ Kuro Black & Tan',
    tag: 'Kuro',
    coat: '#334155',
    shade: '#1e293b',
    belly: '#fed7aa',
    eyebrow: '#fed7aa',
    innerEar: '#fed7aa',
    accessory: 'bell-collar',
    badge: 'VIP',
  },
  {
    id: 6,
    name: 'Peach',
    nameTh: 'ชิบะส้มพีช Momo',
    tag: 'Momo',
    coat: '#fb923c',
    shade: '#ea580c',
    belly: '#fff7ed',
    eyebrow: '#ffffff',
    innerEar: '#fed7aa',
    accessory: 'flower',
    badge: 'SUB',
  },
  {
    id: 7,
    name: 'Shiro',
    nameTh: 'ชิบะขาวหิมะ Shiro',
    tag: 'Shiro',
    coat: '#f8fafc',
    shade: '#cbd5e1',
    belly: '#ffffff',
    eyebrow: '#e2e8f0',
    innerEar: '#fecdd3',
    accessory: 'crown',
    badge: 'TOP',
  },
  {
    id: 8,
    name: 'Ruby',
    nameTh: 'ชิบะแดงทับทิม Ruby',
    tag: 'Ruby',
    coat: '#f43f5e',
    shade: '#be123c',
    belly: '#fff1f2',
    eyebrow: '#ffffff',
    innerEar: '#fecdd3',
    accessory: 'bell-collar',
    badge: 'VIP',
  },
  {
    id: 9,
    name: 'Boba',
    nameTh: 'ชิบะชานม Boba',
    tag: 'Boba',
    coat: '#d4a373',
    shade: '#bc6c25',
    belly: '#fefae0',
    eyebrow: '#ffffff',
    innerEar: '#faedcd',
    accessory: 'glasses',
    badge: 'FAN',
  },
];

const renderShibaSquad = (
  spriteIndex: number,
  overrideColor: string,
  stepFrame: number,
  isJumping: boolean
) => {
  const breed = SHIBA_BREEDS[spriteIndex % SHIBA_BREEDS.length];
  const coat = breed.coat;
  const shade = breed.shade;
  const belly = breed.belly;
  const eyebrow = breed.eyebrow;
  const innerEar = breed.innerEar;
  const accessory = breed.accessory;

  // Natural walking leg offsets (isometric 4-legged trot)
  const fLeg1 = isJumping ? -4 : stepFrame === 0 ? 3 : -3;
  const fLeg2 = isJumping ? -4 : stepFrame === 0 ? -3 : 3;
  const bLeg1 = isJumping ? -2 : stepFrame === 0 ? -2.5 : 2.5;
  const bLeg2 = isJumping ? -2 : stepFrame === 0 ? 2.5 : -2.5;

  // Curled tail wagging offset
  const tailWag = stepFrame === 0 ? -1.5 : 1.5;

  return (
    <g>
      {/* Ground Shadow */}
      <ellipse
        cx="24"
        cy="45"
        rx={isJumping ? 11 : 15}
        ry={isJumping ? 3 : 4.5}
        fill="#000000"
        opacity={isJumping ? 0.15 : 0.28}
      />

      {/* --- Back Left Leg (Far) --- */}
      <g transform={`translate(0, ${bLeg1})`}>
        <rect x="13" y="36" width="4.5" height="7" rx="2" fill={shade} stroke="#18181b" strokeWidth="0.8" />
        <rect x="13" y="40" width="4.5" height="3" rx="1.5" fill="#ffffff" />
      </g>

      {/* --- Curled Cinnamon Roll Tail (Behind Body) --- */}
      <g transform={`translate(${tailWag}, 0)`}>
        {/* Tail base loop */}
        <path
          d="M 12 28 C 7 26, 4 19, 9 14 C 14 10, 18 14, 15 19 C 13 22, 10 23, 11 26"
          fill={coat}
          stroke="#18181b"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* White fluffy tip of tail */}
        <circle cx="9" cy="14" r="3.2" fill="#ffffff" stroke="#18181b" strokeWidth="0.9" />
      </g>

      {/* --- Back Right Leg (Far) --- */}
      <g transform={`translate(0, ${bLeg2})`}>
        <rect x="29" y="36" width="4.5" height="7" rx="2" fill={shade} stroke="#18181b" strokeWidth="0.8" />
        <rect x="29" y="40" width="4.5" height="3" rx="1.5" fill="#ffffff" />
      </g>

      {/* --- Chubby Body --- */}
      <path
        d="M 14 26 C 14 20, 20 18, 30 20 C 35 22, 38 27, 36 33 C 34 38, 22 39, 16 36 C 13 34, 13 29, 14 26 Z"
        fill={coat}
        stroke="#18181b"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* --- White Cream Belly & Fluff --- */}
      <path
        d="M 18 34 C 22 37, 28 36, 33 32 C 34 30, 34 26, 31 25 C 26 27, 21 29, 18 34 Z"
        fill={belly}
      />

      {/* --- Front Left Leg (Near) --- */}
      <g transform={`translate(0, ${fLeg1})`}>
        <rect x="17" y="35" width="5" height="8" rx="2.5" fill={coat} stroke="#18181b" strokeWidth="1" />
        {/* White Sock Paw */}
        <rect x="17" y="40" width="5" height="3.5" rx="1.8" fill="#ffffff" stroke="#18181b" strokeWidth="0.8" />
        {/* Little toe dividers */}
        <line x1="18.8" y1="41" x2="18.8" y2="43" stroke="#e2e8f0" strokeWidth="0.6" />
        <line x1="20.2" y1="41" x2="20.2" y2="43" stroke="#e2e8f0" strokeWidth="0.6" />
      </g>

      {/* --- Front Right Leg (Near) --- */}
      <g transform={`translate(0, ${fLeg2})`}>
        <rect x="25" y="35" width="5" height="8" rx="2.5" fill={coat} stroke="#18181b" strokeWidth="1" />
        {/* White Sock Paw */}
        <rect x="25" y="40" width="5" height="3.5" rx="1.8" fill="#ffffff" stroke="#18181b" strokeWidth="0.8" />
        {/* Little toe dividers */}
        <line x1="26.8" y1="41" x2="26.8" y2="43" stroke="#e2e8f0" strokeWidth="0.6" />
        <line x1="28.2" y1="41" x2="28.2" y2="43" stroke="#e2e8f0" strokeWidth="0.6" />
      </g>

      {/* --- White Chest Fluff with Tuft details --- */}
      <path
        d="M 23 23 Q 27 24 30 26 Q 28 29 27 32 Q 24 33 22 31 Q 23 27 23 23 Z"
        fill={belly}
      />
      {/* Little cute chest fur tufts */}
      <path d="M 24 27 L 22 29 L 25 29 Z" fill="#ffffff" opacity="0.8" />

      {/* --- Head Base --- */}
      {/* Perky Left Ear (Far) */}
      <polygon
        points="22,14 26,4 32,13"
        fill={coat}
        stroke="#18181b"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <polygon points="24,12 27,6 30,12" fill={innerEar} />

      {/* Perky Right Ear (Near) */}
      <polygon
        points="32,15 37,5 42,15"
        fill={coat}
        stroke="#18181b"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <polygon points="34,13 38,7 41,13" fill={innerEar} />

      {/* Chubby Round Head and Cheeks */}
      <path
        d="M 21 21 C 19 14, 28 11, 35 12 C 42 13, 44 18, 43 23 C 42 28, 38 31, 31 31 C 24 31, 20 27, 21 21 Z"
        fill={coat}
        stroke="#18181b"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* White Cheek & Muzzle Mask */}
      <path
        d="M 24 24 C 23 28, 27 31, 32 31 C 37 31, 41 28, 41 24 C 40 21, 37 20, 33 21 C 29 20, 25 21, 24 24 Z"
        fill={belly}
      />
      {/* Cheek side tufts */}
      <polygon points="21,24 19,26 23,27" fill={belly} />

      {/* Iconic White Shiba Eyebrow Dots! */}
      <ellipse cx="28" cy="15.5" rx="1.6" ry="1.2" fill={eyebrow} stroke="#18181b" strokeWidth="0.5" />
      <ellipse cx="37" cy="16" rx="1.6" ry="1.2" fill={eyebrow} stroke="#18181b" strokeWidth="0.5" />

      {/* Big Sparkling Anime Eyes */}
      {isJumping ? (
        /* Joyful Crescent Happy Eyes ^ ^ */
        <g>
          <path d="M 26 19 Q 28.5 16 31 19" fill="none" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 35 19.5 Q 37.5 16.5 40 19.5" fill="none" stroke="#18181b" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ) : (
        /* Round Sparkling Eyes */
        <g>
          <circle cx="28.5" cy="19.5" r="2.2" fill="#18181b" />
          <circle cx="27.8" cy="18.8" r="0.8" fill="#ffffff" />
          <circle cx="37.5" cy="20" r="2.2" fill="#18181b" />
          <circle cx="36.8" cy="19.3" r="0.8" fill="#ffffff" />
        </g>
      )}

      {/* Button Black Nose */}
      <ellipse cx="33" cy="22" rx="1.5" ry="1.1" fill="#18181b" />

      {/* Happy Open Mouth with Pink Tongue Panting (:D) */}
      <path
        d="M 31 23.5 Q 33 25 35 23.5 Q 33 28 31 23.5 Z"
        fill="#7f1d1d"
        stroke="#18181b"
        strokeWidth="0.8"
      />
      {/* Cute Tongue */}
      <path
        d="M 31.8 24.5 Q 33 27.5 34.2 24.5 Q 33 26 31.8 24.5 Z"
        fill="#f43f5e"
      />

      {/* Rosy Soft Cheeks */}
      <circle cx="24" cy="23.5" r="1.8" fill="#f43f5e" opacity="0.45" />
      <circle cx="41" cy="24" r="1.8" fill="#f43f5e" opacity="0.45" />

      {/* --- Accessories (Glasses, Collar with Bell, Bandana, Crown) --- */}
      {accessory === 'glasses' && (
        /* Chic Round Nerd Glasses (PlayB style from video frame 00:05 / 00:10) */
        <g>
          {/* Left Frame */}
          <circle cx="28.5" cy="19.5" r="3.6" fill="none" stroke="#27272a" strokeWidth="1.2" />
          {/* Right Frame */}
          <circle cx="37.5" cy="20" r="3.6" fill="none" stroke="#27272a" strokeWidth="1.2" />
          {/* Bridge */}
          <path d="M 32 19.5 Q 33 18.5 34 19.5" fill="none" stroke="#27272a" strokeWidth="1.2" />
          {/* Side Temple */}
          <line x1="25" y1="19" x2="22" y2="18" stroke="#27272a" strokeWidth="1.1" />
          <line x1="41" y1="19.5" x2="43" y2="19" stroke="#27272a" strokeWidth="1.1" />
          {/* Lens glare */}
          <line x1="27" y1="17.5" x2="29" y2="17.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
          <line x1="36" y1="18" x2="38" y2="18" stroke="#ffffff" strokeWidth="0.8" opacity="0.7" />
        </g>
      )}

      {accessory === 'bell-collar' && (
        /* Red Collar with Golden Bell */
        <g>
          <path
            d="M 21 25 Q 26 29 33 28 Q 26 31 21 27 Z"
            fill="#ef4444"
            stroke="#18181b"
            strokeWidth="0.8"
          />
          {/* Gold Bell */}
          <circle cx="26.5" cy="28.5" r="2.2" fill="#fbbf24" stroke="#18181b" strokeWidth="0.8" />
          <circle cx="26.5" cy="28.5" r="0.6" fill="#78350f" />
        </g>
      )}

      {accessory === 'bandana' && (
        /* Red / Star Bandana */
        <g>
          <polygon
            points="22,25 32,27 25,32"
            fill="#ec4899"
            stroke="#18181b"
            strokeWidth="0.8"
          />
          <circle cx="26" cy="28" r="0.9" fill="#ffffff" />
        </g>
      )}

      {accessory === 'flower' && (
        /* Plumeria / Flower on ear */
        <g transform="translate(38, 7)">
          <circle cx="0" cy="0" r="2.8" fill="#fbcfe8" />
          <circle cx="0" cy="0" r="1.1" fill="#facc15" />
        </g>
      )}

      {accessory === 'crown' && (
        /* VIP Sparkle Crown */
        <g transform="translate(26, 4)">
          <polygon
            points="0,6 2,0 4,4 6,0 8,6"
            fill="#facc15"
            stroke="#18181b"
            strokeWidth="0.8"
          />
          <circle cx="2" cy="0" r="0.6" fill="#ef4444" />
          <circle cx="4" cy="4" r="0.5" fill="#3b82f6" />
          <circle cx="6" cy="0" r="0.6" fill="#ef4444" />
        </g>
      )}
    </g>
  );
};

export const StreamAvatarSprite: React.FC<AvatarSpriteProps> = ({
  avatar,
  style,
  size,
  stepFrame,
}) => {
  const isJumping = avatar.action === 'jump' || avatar.yOffset < -5;

  // Dimensions
  const pxSize = size === 'sm' ? 44 : size === 'lg' ? 70 : 56;

  return (
    <div
      style={{ width: pxSize, height: pxSize }}
      className={`relative select-none pointer-events-none transition-transform duration-150 ease-out origin-center ${
        avatar.direction === 'left' ? 'scale-x-[-1]' : 'scale-x-100'
      }`}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 48 48"
        className="overflow-visible filter drop-shadow-md"
      >
        {style === 'shiba-squad' &&
          renderShibaSquad(avatar.spriteIndex, avatar.color, stepFrame, isJumping)}
        {style === 'chibi-pixel' &&
          renderChibiPixel(avatar.spriteIndex, avatar.color, stepFrame, isJumping)}
        {style === 'cute-animals' &&
          renderCuteAnimal(avatar.spriteIndex, avatar.color, stepFrame, isJumping)}
        {style === 'kawaii-slimes' &&
          renderKawaiiSlime(avatar.spriteIndex, avatar.color, stepFrame, isJumping)}
        {style === 'cyber-mecha' &&
          renderCyberMecha(avatar.spriteIndex, avatar.color, stepFrame, isJumping)}
      </svg>
    </div>
  );
};
