// Client service for Gemini API Emotion Analysis and Voice Tone Modulation

export interface EmotionToneResult {
  emotion: 'joyful' | 'sweet' | 'excited' | 'teasing' | 'supportive' | 'angry' | 'sad' | 'neutral';
  emotionLabel: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  energy: number; // 1 - 10
  pitch: number; // 0.85 - 1.30
  rate: number; // 0.75 - 1.15
  volume: number; // 70 - 100
  sweetEnding: boolean;
  color: string;
  explanation: string;
  source: 'gemini' | 'rule-fallback';
}

const clientEmotionCache = new Map<string, EmotionToneResult>();

// Pre-defined quick test samples for live streamers to test all emotional voice tones
export const EMOTION_PRESET_SAMPLES = [
  {
    id: 'joyful',
    label: '😊 ดีใจ / ร่าเริง',
    sampleUser: 'น้องฟ้า',
    message: 'ยินดีด้วยนะพี่ ดีใจมากๆ เลย 55555 สุดยอดมากก!',
    desc: 'เสียงใส จังหวะเร็วขึ้นเล็กน้อย มีชีวิตชีวา',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    id: 'sweet',
    label: '💖 ออดอ้อน / หวานแหวว',
    sampleUser: 'มิลค์กี้',
    message: 'พี่น่ารักจังเลยค่ะ ฝากเนื้อฝากตัวด้วยนะคะ ใจละลายหมดแล้วค่า',
    desc: 'เสียงหวานใส ละมุน นุ่มนวล เติมคำลงท้ายน่ารัก',
    badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
  },
  {
    id: 'excited',
    label: '🔥 ตื่นเต้น / ไฮป์',
    sampleUser: 'สตรีมเมอร์ท็อป',
    message: 'โหหห จังหวะนี้เอาเรื่องจัด ช็อตปาฏิหาริย์ สุดยอดมากก!',
    desc: 'เสียงคีย์สูง ตื่นเต้น เร่งเร้า พลังเสียงเต็ม 10',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
  },
  {
    id: 'teasing',
    label: '😜 หยอกล้อ / แซว',
    sampleUser: 'เกรียนคุง',
    message: 'แน่จริงก็อย่าหนีดิค้าบ ขี้โม้เปล่าเนี่ย 555 แอบมองใครอยู่น้า',
    desc: 'เสียงกวนๆ สดใส จังหวะกระเซ้าเย้าแหย่',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  {
    id: 'supportive',
    label: '🤝 ให้กำลังใจ / ซึ้ง',
    sampleUser: 'พี่หมีใจดี',
    message: 'สู้ๆ นะครับ พักผ่อนบ้างนะ เป็นกำลังใจให้เสมอเลยครับ',
    desc: 'เสียงอบอุ่น ช้าลงเล็กน้อย ชัดถ้อยชัดคำ จริงใจ',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'angry',
    label: '😠 ดุดัน / หัวร้อน',
    sampleUser: 'นักล่าแต้ม',
    message: 'ทำไมทำแบบนี้ หัวร้อนเลยนะ แย่มาก เซ็งจัดเลย!',
    desc: 'เสียงทุ้มลง หนักแน่น ฉะฉาน กระชับ',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
  },
  {
    id: 'sad',
    label: '🥺 เศร้า / นอยด์',
    sampleUser: 'น้องใบเตย',
    message: 'วันนี้เหนื่อยจัง ไม่ผ่านสักทีแง นอยด์มากเลยค่ะ',
    desc: 'เสียงนุ่มนวล แผ่วเบา ช้าลง ให้ความรู้สึกเห็นอกเห็นใจ',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  },
];

export async function analyzeChatEmotion(
  message: string,
  username: string = 'ผู้ชม',
  intensity: 'gentle' | 'balanced' | 'dramatic' = 'balanced'
): Promise<EmotionToneResult> {
  const cleanMsg = (message || '').trim();
  if (!cleanMsg) {
    return {
      emotion: 'neutral',
      emotionLabel: '💬 ปกติ / ทั่วไป',
      sentiment: 'neutral',
      energy: 5,
      pitch: 1.05,
      rate: 0.86,
      volume: 90,
      sweetEnding: false,
      color: '#06b6d4',
      explanation: 'ข้อความว่างเปล่า',
      source: 'rule-fallback',
    };
  }

  const cacheKey = `${cleanMsg.toLowerCase()}:${intensity}`;
  if (clientEmotionCache.has(cacheKey)) {
    return clientEmotionCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('/api/analyze-chat-emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: cleanMsg,
        username,
        intensity,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: EmotionToneResult = await res.json();
      clientEmotionCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn('[Gemini Emotion Client] Fetch error, falling back locally:', err);
  }

  // Fast client-side fallback
  const fallback = getLocalFallbackEmotion(cleanMsg, intensity);
  clientEmotionCache.set(cacheKey, fallback);
  return fallback;
}

function getLocalFallbackEmotion(
  text: string,
  intensity: 'gentle' | 'balanced' | 'dramatic' = 'balanced'
): EmotionToneResult {
  const t = text.toLowerCase();
  let res: EmotionToneResult;

  if (t.includes('555') || t.includes('ฮ่า') || t.includes('ขำ') || t.includes('ตลก') || t.includes('เย้') || t.includes('ดีใจ')) {
    res = {
      emotion: 'joyful',
      emotionLabel: '😊 ดีใจ / ร่าเริง',
      sentiment: 'positive',
      energy: 8,
      pitch: 1.18,
      rate: 0.96,
      volume: 95,
      sweetEnding: true,
      color: '#f59e0b',
      explanation: 'หัวเราะ หรือมีความสุข',
      source: 'rule-fallback',
    };
  } else if (t.includes('น่ารัก') || t.includes('หวาน') || t.includes('สวย') || t.includes('อ้อน') || t.includes('รัก')) {
    res = {
      emotion: 'sweet',
      emotionLabel: '💖 ออดอ้อน / หวานแหวว',
      sentiment: 'positive',
      energy: 6,
      pitch: 1.14,
      rate: 0.82,
      volume: 90,
      sweetEnding: true,
      color: '#ec4899',
      explanation: 'ออดอ้อน ชื่นชม หรือเอ็นดู',
      source: 'rule-fallback',
    };
  } else if (t.includes('สุดยอด') || t.includes('โห') || t.includes('ว้าว') || t.includes('เชียร์') || t.includes('เอาเรื่อง')) {
    res = {
      emotion: 'excited',
      emotionLabel: '🔥 ตื่นเต้น / ไฮป์',
      sentiment: 'positive',
      energy: 9,
      pitch: 1.24,
      rate: 1.04,
      volume: 100,
      sweetEnding: false,
      color: '#ef4444',
      explanation: 'ตื่นเต้น เร้าใจ ไฮป์',
      source: 'rule-fallback',
    };
  } else if (t.includes('แน่จริง') || t.includes('ขี้โม้') || t.includes('แอบ') || t.includes('กวน') || t.includes('แซว')) {
    res = {
      emotion: 'teasing',
      emotionLabel: '😜 หยอกล้อ / แซว',
      sentiment: 'positive',
      energy: 7,
      pitch: 1.12,
      rate: 0.94,
      volume: 92,
      sweetEnding: false,
      color: '#8b5cf6',
      explanation: 'หยอกล้อ หรือเป็นกันเอง',
      source: 'rule-fallback',
    };
  } else if (t.includes('สู้ๆ') || t.includes('ขอบคุณ') || t.includes('กำลังใจ') || t.includes('พักผ่อน')) {
    res = {
      emotion: 'supportive',
      emotionLabel: '🤝 ให้กำลังใจ / ซึ้ง',
      sentiment: 'positive',
      energy: 5,
      pitch: 1.04,
      rate: 0.84,
      volume: 90,
      sweetEnding: true,
      color: '#10b981',
      explanation: 'ให้กำลังใจ หรือขอบคุณ',
      source: 'rule-fallback',
    };
  } else if (t.includes('โมโห') || t.includes('หัวร้อน') || t.includes('แย่') || t.includes('เซ็ง') || t.includes('โกรธ')) {
    res = {
      emotion: 'angry',
      emotionLabel: '😠 ดุดัน / หัวร้อน',
      sentiment: 'negative',
      energy: 8,
      pitch: 0.90,
      rate: 1.06,
      volume: 95,
      sweetEnding: false,
      color: '#f97316',
      explanation: 'หัวร้อน หรือไม่พอใจ',
      source: 'rule-fallback',
    };
  } else if (t.includes('นอยด์') || t.includes('เศร้า') || t.includes('เสียใจ') || t.includes('แง') || t.includes('เหนื่อย')) {
    res = {
      emotion: 'sad',
      emotionLabel: '🥺 เศร้า / นอยด์',
      sentiment: 'negative',
      energy: 4,
      pitch: 0.92,
      rate: 0.80,
      volume: 85,
      sweetEnding: false,
      color: '#6366f1',
      explanation: 'เหนื่อย เศร้า นอยด์',
      source: 'rule-fallback',
    };
  } else {
    res = {
      emotion: 'neutral',
      emotionLabel: '💬 ปกติ / ทั่วไป',
      sentiment: 'neutral',
      energy: 5,
      pitch: 1.05,
      rate: 0.86,
      volume: 90,
      sweetEnding: false,
      color: '#06b6d4',
      explanation: 'ข้อความทั่วไป',
      source: 'rule-fallback',
    };
  }

  const factor = intensity === 'gentle' ? 0.6 : intensity === 'dramatic' ? 1.4 : 1.0;
  const basePitch = 1.05;
  const baseRate = 0.86;
  const pitchDiff = (res.pitch - basePitch) * factor;
  const rateDiff = (res.rate - baseRate) * factor;

  return {
    ...res,
    pitch: Number(Math.max(0.75, Math.min(1.45, basePitch + pitchDiff)).toFixed(2)),
    rate: Number(Math.max(0.70, Math.min(1.25, baseRate + rateDiff)).toFixed(2)),
  };
}
