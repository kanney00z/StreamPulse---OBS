// Text-To-Speech (TTS) Engine for Reading Live TikTok/Stream Chat Aloud
// Supports diverse voices: Female (เสียงผู้หญิงธรรมชาติ / สาวหวาน), Male (เสียงหนุ่มสุภาพ), Normal (ไม่เร็วเกิน ฟังสบาย)

export interface TTSOptions {
  enabled: boolean;
  format: 'sweet' | 'nameAndMessage' | 'messageOnly';
  rate: number; // 0.70 - 1.30 (0.84 - 0.88 = พูดปกติ ไม่เร็วเกิน ฟังสบาย เป็นธรรมชาติ)
  pitch: number; // 0.70 - 1.50 (1.00 = ปกติ, 1.05 = หญิงธรรมชาติ, 1.18 = หวานใส, 0.94 = ทุ้มหนุ่ม)
  volume: number; // 0 - 100 (default 90)
  voiceURI: string; // 'female_auto' | 'male_auto' | 'sweet_auto' | 'default' | specific voiceURI
  genderPreference?: 'female' | 'male' | 'all';
  skipCommands: boolean; // skip messages starting with ! or /
  cleanSpam: boolean; // shorten 55555555 to 555
  sweetEnding: boolean; // add cute sweet particle เช่น "ค่า~"
}

export interface TTSVoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  isThai: boolean;
  isMale: boolean;
  isSweetRecommended: boolean;
  isDefault: boolean;
  gender: 'female' | 'male' | 'neutral';
  badgeLabel?: string;
}

// Known Thai voice keywords across Windows (Edge), Chrome, macOS/iOS, and Android
const MALE_THAI_KEYWORDS = ['niwat', 'pattara', 'male', 'man', 'boy', 'ชาย', 'หนุ่ม'];
const FEMALE_THAI_KEYWORDS = [
  'premwadee',
  'achara',
  'google ภาษาไทย',
  'google thai',
  'narisa',
  'kanya',
  'siri',
  'female',
  'woman',
  'girl',
  'หญิง',
  'สาว',
];

class TTSEngine {
  private queue: string[] = [];
  private isSpeaking: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private watchdogTimer: NodeJS.Timeout | null = null;

  public options: TTSOptions = {
    enabled: true,
    format: 'nameAndMessage',
    rate: 0.86, // จังหวะพูดปกติ ไม่เร็วเกิน ฟังสบาย ชัดถ้อยชัดคำ (แนะนำที่สุดสำหรับภาษาไทย)
    pitch: 1.05, // โทนเสียงพูดผู้หญิงปกติธรรมชาติ
    volume: 90,
    voiceURI: 'female_auto', // แนะนำเริ่มต้นเป็นเสียงผู้หญิงตามที่สตรีมเมอร์ต้องการ
    genderPreference: 'female',
    skipCommands: true,
    cleanSpam: true,
    sweetEnding: false,
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
    this.voicesLoaded = this.voices.length > 0;
  }

  // Detect whether a voice is Male
  public isMaleVoice(voice: SpeechSynthesisVoice): boolean {
    const nameLower = voice.name.toLowerCase();
    return MALE_THAI_KEYWORDS.some((kw) => nameLower.includes(kw));
  }

  // Detect whether a voice is Female
  public isFemaleVoice(voice: SpeechSynthesisVoice): boolean {
    const nameLower = voice.name.toLowerCase();
    const langLower = voice.lang.toLowerCase();
    const isThai = langLower.startsWith('th');

    if (this.isMaleVoice(voice)) return false;
    if (FEMALE_THAI_KEYWORDS.some((kw) => nameLower.includes(kw))) return true;

    // Google ภาษาไทย in Chrome is standard Female voice
    if (nameLower.includes('google') && isThai) return true;

    // Default Thai voices that are not labeled male are usually female
    return isThai;
  }

  // Detect whether a voice is sweet female voice
  public isSweetVoice(voice: SpeechSynthesisVoice): boolean {
    if (this.isMaleVoice(voice)) return false;
    const nameLower = voice.name.toLowerCase();
    return (
      nameLower.includes('premwadee') ||
      nameLower.includes('google') ||
      nameLower.includes('narisa') ||
      nameLower.includes('achara')
    );
  }

  public getAvailableVoices(): TTSVoiceOption[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    if (!this.voicesLoaded || this.voices.length === 0) {
      this.loadVoices();
    }

    return this.voices.map((v) => {
      const isThai = v.lang.toLowerCase().startsWith('th');
      const isMale = this.isMaleVoice(v);
      const isFemale = this.isFemaleVoice(v);
      const isSweet = this.isSweetVoice(v);
      const gender: 'female' | 'male' | 'neutral' = isFemale ? 'female' : isMale ? 'male' : 'neutral';

      let badgeLabel = undefined;
      const n = v.name.toLowerCase();
      if (n.includes('premwadee')) {
        badgeLabel = '👩 หญิงธรรมชาติ ฟังสบาย (Microsoft Premwadee Natural)';
      } else if (n.includes('google') && isThai) {
        badgeLabel = '👩 หญิงไทย Google ชัดเจน นุ่มนวล (Google ภาษาไทย)';
      } else if (n.includes('achara')) {
        badgeLabel = '👩 หญิงไทย ชัดถ้อยชัดคำ (Microsoft Achara)';
      } else if (n.includes('narisa') || n.includes('kanya')) {
        badgeLabel = '👩 หญิงไทย Apple นุ่มนวล (Narisa/Kanya)';
      } else if (n.includes('niwat')) {
        badgeLabel = '👨 หนุ่มสุภาพ ฟังสบาย (Microsoft Niwat Natural)';
      } else if (n.includes('pattara')) {
        badgeLabel = '👨 ชายไทย ชัดเจน (Microsoft Pattara)';
      } else if (isFemale && isThai) {
        badgeLabel = '👩 เสียงผู้หญิง ภาษาไทย';
      } else if (isMale && isThai) {
        badgeLabel = '👨 เสียงผู้ชาย ภาษาไทย';
      } else if (isThai) {
        badgeLabel = '🇹🇭 ภาษาไทย มาตรฐาน';
      }

      return {
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        isThai,
        isMale,
        isSweetRecommended: isSweet,
        isDefault: v.default,
        gender,
        badgeLabel,
      };
    }).sort((a, b) => {
      // 1. Thai voices first
      if (a.isThai && !b.isThai) return -1;
      if (!a.isThai && b.isThai) return 1;

      // 2. Female Thai voices first (Premwadee, Google Thai Female)
      if (a.gender === 'female' && b.gender !== 'female') return -1;
      if (a.gender !== 'female' && b.gender === 'female') return 1;

      return a.name.localeCompare(b.name);
    });
  }

  public updateOptions(newOptions: Partial<TTSOptions>) {
    this.options = { ...this.options, ...newOptions };
  }

  // Clean and prepare message for realistic live stream reading
  public cleanText(text: string): string {
    if (!text) return '';

    let cleaned = text.trim();

    // 1. Skip bot command strings like "!song", "/help"
    if (this.options.skipCommands && (cleaned.startsWith('!') || cleaned.startsWith('/'))) {
      return '';
    }

    // 2. Remove URLs
    cleaned = cleaned.replace(/https?:\/\/\S+/gi, ' ลิงก์ ');

    // 3. Shorten repeated numbers and Thai characters (e.g. 5555555555 -> 555, ฮ่าๆๆๆๆๆ -> ฮ่าๆๆ)
    if (this.options.cleanSpam) {
      cleaned = cleaned.replace(/5{3,}/g, ' 555 ');
      cleaned = cleaned.replace(/(.)\1{3,}/gu, '$1$1');
    }

    // 4. Clean excessive punctuation
    cleaned = cleaned.replace(/[!?.,;~]{2,}/g, ' ');

    return cleaned.trim();
  }

  // Queue and speak a live incoming chat message
  public speakChat(senderName: string, message: string) {
    if (!this.options.enabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    let cleanedMsg = this.cleanText(message);
    if (!cleanedMsg) return;

    // Optional sweet ending particle (ค่า~ / ค่ะ) for friendly streamer vibe
    if (this.options.sweetEnding) {
      const endsWithParticle = /(ค่ะ|ครับ|ค่า|นะ|จ้า|จ้ะ|คะ|ค้าบ|[?!])$/.test(cleanedMsg.trim());
      if (!endsWithParticle && cleanedMsg.length < 50) {
        cleanedMsg = `${cleanedMsg} ค่า`;
      }
    }

    let sentenceToSpeak = '';
    const cleanSender = senderName.replace(/[@#_]/g, '').trim() || 'ผู้ชม';

    if (this.options.format === 'sweet') {
      sentenceToSpeak = `คุณ ${cleanSender} บอกว่า: ${cleanedMsg}`;
    } else if (this.options.format === 'nameAndMessage') {
      sentenceToSpeak = `คุณ ${cleanSender} พูดว่า: ${cleanedMsg}`;
    } else {
      sentenceToSpeak = cleanedMsg;
    }

    this.queue.push(sentenceToSpeak);
    this.processQueue();
  }

  // Announce new follower in sweet Thai voice
  public speakFollow(username: string) {
    if (!this.options.enabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const cleanSender = username.replace(/[@#_]/g, '').trim() || 'เพื่อนใหม่';
    const text = `ยินดีต้อนรับคุณ ${cleanSender} ขอบคุณที่กดติดตามช่องนะคะ`;
    this.queue.push(text);
    this.processQueue();
  }

  // Announce live stream share in sweet Thai voice
  public speakShare(username: string) {
    if (!this.options.enabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const cleanSender = username.replace(/[@#_]/g, '').trim() || 'ผู้ชมใจดี';
    const text = `ขอบคุณคุณ ${cleanSender} ที่ช่วยแชร์ไลฟ์ให้นะคะ น่ารักมากๆ เลยค่า`;
    this.queue.push(text);
    this.processQueue();
  }

  // Test TTS function with custom or sample text
  public testSpeak(sampleText?: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.stop(); // Stop any pending speech

    let text = sampleText;
    if (!text) {
      const isFemale = this.options.voiceURI === 'female_auto' || this.options.voiceURI === 'sweet_auto' || this.options.genderPreference === 'female';
      if (this.options.format === 'sweet' || this.options.sweetEnding) {
        text = 'คุณ แซนดี้ บอกว่า: สวัสดีค่ะ ยินดีต้อนรับสู่ไลฟ์สตรีมนะคะ ขอให้สนุกกับไลฟ์ค่า';
      } else if (isFemale) {
        text = 'คุณ ชาลิดา พูดว่า: สวัสดีค่ะ ยินดีต้อนรับสู่ไลฟ์สตรีมนะคะ พูดจังหวะปกติ ฟังสบาย ไม่เร็วเกินไปค่ะ';
      } else {
        text = 'คุณ สมชาย พูดว่า: สวัสดีครับ ยินดีต้อนรับสู่ไลฟ์สตรีมครับ พูดจังหวะปกติ ฟังสบาย ไม่เร็วเกินไปครับ';
      }
    }

    this.queue.push(text);
    this.processQueue();
  }

  private processQueue() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.isSpeaking || this.queue.length === 0) return;

    const nextText = this.queue.shift();
    if (!nextText) return;

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(nextText);

      // Safe Rate Bounds:
      // User request: "พูดแบบปกติอย่าเร็วเกิน" -> default 0.84 - 0.88, clamped between 0.65 and 1.30
      const targetRate = this.options.rate || 0.86;
      utterance.rate = Math.min(Math.max(targetRate, 0.65), 1.30);
      utterance.volume = Math.min(Math.max(this.options.volume / 100, 0), 1);

      if (this.voices.length === 0) {
        this.loadVoices();
      }

      let selectedVoice: SpeechSynthesisVoice | undefined;
      const targetUri = this.options.voiceURI || 'female_auto';
      let requiresFemalePitchLift = false;

      // 1. Explicit voice picked by user
      if (targetUri !== 'default' && !targetUri.endsWith('_auto')) {
        selectedVoice = this.voices.find((v) => v.voiceURI === targetUri);
      }

      // 2. Automatic Female Thai Voice ('female_auto' or 'sweet_auto')
      if (!selectedVoice && (targetUri === 'female_auto' || targetUri === 'sweet_auto' || targetUri === 'default')) {
        // Prioritize Premwadee, Google ภาษาไทย, Achara, Narisa, Kanya
        selectedVoice = this.voices.find((v) => {
          const l = v.lang.toLowerCase();
          const n = v.name.toLowerCase();
          return l.startsWith('th') && (n.includes('premwadee') || n.includes('google') || n.includes('achara') || n.includes('narisa') || n.includes('kanya'));
        });

        // Any non-male Thai voice
        if (!selectedVoice) {
          selectedVoice = this.voices.find((v) => v.lang.toLowerCase().startsWith('th') && !this.isMaleVoice(v));
        }

        // If OS only has male voices installed (e.g. Windows only bundled Niwat offline)
        if (!selectedVoice) {
          selectedVoice = this.voices.find((v) => v.lang.toLowerCase().startsWith('th'));
          if (selectedVoice && this.isMaleVoice(selectedVoice)) {
            // Male voice fallback -> apply pitch modulation so it sounds female
            requiresFemalePitchLift = true;
          }
        }
      }

      // 3. Automatic Male Thai Voice ('male_auto')
      if (!selectedVoice && targetUri === 'male_auto') {
        selectedVoice = this.voices.find((v) => {
          const l = v.lang.toLowerCase();
          const n = v.name.toLowerCase();
          return l.startsWith('th') && (n.includes('niwat') || n.includes('pattara') || this.isMaleVoice(v));
        });

        // Fallback to any Thai voice
        if (!selectedVoice) {
          selectedVoice = this.voices.find((v) => v.lang.toLowerCase().startsWith('th'));
        }
      }

      // 4. Final Fallback to any Thai voice in system
      if (!selectedVoice) {
        selectedVoice = this.voices.find((v) => v.lang.toLowerCase().startsWith('th'));
      }

      // Compute Pitch:
      let effectivePitch = this.options.pitch || 1.05;
      if (requiresFemalePitchLift) {
        // Elevate pitch into clear feminine tone when only male engine is installed
        effectivePitch = Math.max(effectivePitch, 1.25);
      }
      utterance.pitch = Math.min(Math.max(effectivePitch, 0.70), 1.50);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'th-TH';
      }

      this.isSpeaking = true;

      if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
      this.watchdogTimer = setTimeout(() => {
        if (this.isSpeaking && window.speechSynthesis.speaking) {
          window.speechSynthesis.resume();
        }
      }, 6000);

      utterance.onend = () => {
        this.isSpeaking = false;
        if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
        setTimeout(() => {
          this.processQueue();
        }, 140);
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
        setTimeout(() => {
          this.processQueue();
        }, 90);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[TTS] Speech synthesis exception:', err);
      this.isSpeaking = false;
      this.processQueue();
    }
  }

  // Clear queue and cancel ongoing speech
  public stop() {
    this.queue = [];
    this.isSpeaking = false;
    if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore
      }
    }
  }
}

// Global Singleton Instance
export const ttsService = new TTSEngine();

