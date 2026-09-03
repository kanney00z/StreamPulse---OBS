// Text-To-Speech (TTS) Engine for Reading Live TikTok/Stream Chat Aloud
// Specially tuned for Sweet, Clear, and Bright Thai speech (เสียงไทยหวานใส)

export interface TTSOptions {
  enabled: boolean;
  format: 'sweet' | 'nameAndMessage' | 'messageOnly';
  rate: number; // 0.8 - 1.5 (default 1.05)
  pitch: number; // 0.8 - 1.6 (default 1.22 for bright, sweet feminine voice)
  volume: number; // 0 - 100 (default 90)
  voiceURI: string; // 'default' or specific voice.voiceURI
  skipCommands: boolean; // skip messages starting with ! or /
  cleanSpam: boolean; // shorten 55555555 to 555
  sweetEnding: boolean; // add cute sweet particle เช่น "ค่า~"
}

export interface TTSVoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  isThai: boolean;
  isSweetRecommended: boolean;
  isDefault: boolean;
  badgeLabel?: string;
}

// Known high-quality sweet/feminine Thai voices in modern browsers & OS
const SWEET_THAI_VOICE_KEYWORDS = [
  'premwadee', // Microsoft Premwadee Natural (Windows/Edge) - top tier sweet Thai voice
  'achara',    // Microsoft Achara
  'google ภาษาไทย', // Google Chrome Thai female voice
  'narisa',    // Apple macOS/iOS Thai female voice
  'kanya',     // Apple alternative
  'female',
];

class TTSEngine {
  private queue: string[] = [];
  private isSpeaking: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private watchdogTimer: NodeJS.Timeout | null = null;

  public options: TTSOptions = {
    enabled: true,
    format: 'sweet',
    rate: 1.05,
    pitch: 1.22, // 1.20 - 1.25 gives the bright, sweet, cheerful tone
    volume: 90,
    voiceURI: 'default',
    skipCommands: true,
    cleanSpam: true,
    sweetEnding: true,
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

  // Detect whether a voice is a sweet female voice
  public isSweetVoice(voice: SpeechSynthesisVoice): boolean {
    const nameLower = voice.name.toLowerCase();
    const langLower = voice.lang.toLowerCase();
    const isThai = langLower.startsWith('th');

    if (!isThai) return false;
    return SWEET_THAI_VOICE_KEYWORDS.some((kw) => nameLower.includes(kw));
  }

  public getAvailableVoices(): TTSVoiceOption[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    if (!this.voicesLoaded || this.voices.length === 0) {
      this.loadVoices();
    }

    return this.voices.map((v) => {
      const isThai = v.lang.toLowerCase().startsWith('th');
      const isSweet = this.isSweetVoice(v);

      let badgeLabel = undefined;
      if (v.name.toLowerCase().includes('premwadee')) {
        badgeLabel = '🌸 พรีเมียมหวานใส (Premwadee Natural)';
      } else if (v.name.toLowerCase().includes('google')) {
        badgeLabel = '🌸 Google หวานใส ชัดเจน';
      } else if (v.name.toLowerCase().includes('narisa') || v.name.toLowerCase().includes('kanya')) {
        badgeLabel = '🌸 Apple นุ่มหวาน';
      } else if (isSweet) {
        badgeLabel = '🌸 โทนเสียงหวานใส';
      } else if (isThai) {
        badgeLabel = '🇹🇭 ภาษาไทย';
      }

      return {
        name: v.name,
        lang: v.lang,
        voiceURI: v.voiceURI,
        isThai,
        isSweetRecommended: isSweet,
        isDefault: v.default,
        badgeLabel,
      };
    }).sort((a, b) => {
      // 1. Sweet Thai voices first
      if (a.isSweetRecommended && !b.isSweetRecommended) return -1;
      if (!a.isSweetRecommended && b.isSweetRecommended) return 1;

      // 2. Any other Thai voices
      if (a.isThai && !b.isThai) return -1;
      if (!a.isThai && b.isThai) return 1;

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
    cleaned = cleaned.replace(/https?:\/\/\S+/gi, 'ลิงก์');

    // 3. Shorten repeated numbers and Thai characters (e.g. 5555555555 -> ห้าห้าห้า, ฮ่าๆๆๆๆๆ -> ฮ่าๆๆ)
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
      if (this.options.format === 'sweet') {
        text = 'คุณ สมชาย บอกว่า: สวัสดีค่ะ ยินดีต้อนรับสู่ไลฟ์สตรีมนะคะ ขอให้สนุกกับไลฟ์ค่า';
      } else if (this.options.format === 'nameAndMessage') {
        text = 'คุณ สมชาย พูดว่า: สวัสดีครับ ยินดีต้อนรับสู่ไลฟ์สตรีมครับ';
      } else {
        text = 'ยินดีต้อนรับสู่ไลฟ์สตรีมค่า ระบบอ่านแชทเสียงหวานใสพร้อมทำงานแล้วนะคะ';
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
      // Resume if browser suspended speech synthesis
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(nextText);
      // Bound rate and pitch
      utterance.rate = Math.min(Math.max(this.options.rate, 0.5), 1.8);
      utterance.pitch = Math.min(Math.max(this.options.pitch, 0.6), 1.8);
      utterance.volume = Math.min(Math.max(this.options.volume / 100, 0), 1);

      // Select voice:
      if (this.voices.length === 0) {
        this.loadVoices();
      }

      let selectedVoice: SpeechSynthesisVoice | undefined;

      // 1. If user explicitly specified a voice URI
      if (this.options.voiceURI && this.options.voiceURI !== 'default') {
        selectedVoice = this.voices.find((v) => v.voiceURI === this.options.voiceURI);
      }

      // 2. If 'default' or not found, try finding best sweet recommended Thai voice first
      if (!selectedVoice) {
        selectedVoice = this.voices.find((v) => this.isSweetVoice(v));
      }

      // 3. Fallback to any Thai voice
      if (!selectedVoice) {
        selectedVoice = this.voices.find((v) => v.lang.toLowerCase().startsWith('th'));
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = 'th-TH';
      }

      this.isSpeaking = true;

      // Chrome speech synthesis watchdog: reset if utterance hangs for too long
      if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
      this.watchdogTimer = setTimeout(() => {
        if (this.isSpeaking && window.speechSynthesis.speaking) {
          window.speechSynthesis.resume();
        }
      }, 6000);

      utterance.onend = () => {
        this.isSpeaking = false;
        if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
        // Delay slightly for natural breathing space between comments
        setTimeout(() => {
          this.processQueue();
        }, 120);
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
        setTimeout(() => {
          this.processQueue();
        }, 80);
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
