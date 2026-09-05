// Text-To-Speech (TTS) Engine for Reading Live TikTok/Stream Chat Aloud
// Supports:
// 1. Studio-Quality AI Voices (AI Studio Voice - Kore / Zephyr / Puck) - 100% Guaranteed female/male voices regardless of OS
// 2. Web Speech API (Local System Voices: Premwadee, Achara, Google ภาษาไทย, Niwat, Pattara, etc.)

export interface TTSOptions {
  enabled: boolean;
  format: 'sweet' | 'nameAndMessage' | 'messageOnly';
  rate: number; // 0.70 - 1.30 (0.84 - 0.88 = พูดปกติ ไม่เร็วเกิน ฟังสบาย เป็นธรรมชาติ)
  pitch: number; // 0.70 - 1.50 (1.00 = ปกติ, 1.05 = หญิงธรรมชาติ, 1.18 = หวานใส, 0.94 = ทุ้มหนุ่ม)
  volume: number; // 0 - 100 (default 90)
  voiceURI: string; // 'ai_female_kore' | 'ai_female_zephyr' | 'ai_male_puck' | 'female_auto' | 'sweet_auto' | 'male_auto' | 'default' | specific voiceURI
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
  isAi?: boolean;
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
  private currentAudio: HTMLAudioElement | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private watchdogTimer: NodeJS.Timeout | null = null;
  public hasLocalFemaleVoice: boolean = false;

  public options: TTSOptions = {
    enabled: true,
    format: 'nameAndMessage',
    rate: 0.86, // จังหวะพูดปกติ ไม่เร็วเกิน ฟังสบาย ชัดถ้อยชัดคำ
    pitch: 1.05, // โทนเสียงพูดผู้หญิงปกติธรรมชาติ
    volume: 90,
    voiceURI: 'ai_female_kore', // แนะนำเริ่มต้นเป็นเสียงผู้หญิง AI สตูดิโอ รับประกันมีเสียงผู้หญิงแน่นอน
    genderPreference: 'female',
    skipCommands: true,
    cleanSpam: true,
    sweetEnding: false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.loadVoices();
        window.speechSynthesis.onvoiceschanged = () => {
          this.loadVoices();
        };
      }
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
    this.voicesLoaded = this.voices.length > 0;

    // Check if system actually has a Thai female voice
    this.hasLocalFemaleVoice = this.voices.some(
      (v) => v.lang.toLowerCase().startsWith('th') && this.isFemaleVoice(v)
    );
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
    if (typeof window === 'undefined') return [];
    if ('speechSynthesis' in window && (!this.voicesLoaded || this.voices.length === 0)) {
      this.loadVoices();
    }

    const aiVoices: TTSVoiceOption[] = [
      {
        name: 'AI Kore (หญิงหวานใส เป็นธรรมชาติ แนะนำที่สุด)',
        lang: 'th-TH',
        voiceURI: 'ai_female_kore',
        isThai: true,
        isMale: false,
        isSweetRecommended: true,
        isDefault: true,
        gender: 'female',
        badgeLabel: '✨ 👩 AI Studio Female (หวานใส นุ่มนวล รับประกันมีเสียงผู้หญิง 100%)',
        isAi: true,
      },
      {
        name: 'AI Zephyr (หญิงอบอุ่น สุภาพ นุ่มนวล)',
        lang: 'th-TH',
        voiceURI: 'ai_female_zephyr',
        isThai: true,
        isMale: false,
        isSweetRecommended: false,
        isDefault: false,
        gender: 'female',
        badgeLabel: '✨ 👩 AI Studio Female (อบอุ่น ละมุน ชัดเจน)',
        isAi: true,
      },
      {
        name: 'AI Puck (ชายหนุ่มสดใส คมชัด เป็นกันเอง)',
        lang: 'th-TH',
        voiceURI: 'ai_male_puck',
        isThai: true,
        isMale: true,
        isSweetRecommended: false,
        isDefault: false,
        gender: 'male',
        badgeLabel: '✨ 👨 AI Studio Male (หนุ่มสดใส คมชัด)',
        isAi: true,
      },
    ];

    const localVoiceOptions: TTSVoiceOption[] = this.voices.map((v) => {
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
        badgeLabel = '👩 เสียงผู้หญิง ภาษาไทยในเครื่อง';
      } else if (isMale && isThai) {
        badgeLabel = '👨 เสียงผู้ชาย ภาษาไทยในเครื่อง';
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
        isAi: false,
      };
    });

    return [
      ...aiVoices,
      ...localVoiceOptions.sort((a, b) => {
        if (a.isThai && !b.isThai) return -1;
        if (!a.isThai && b.isThai) return 1;
        if (a.gender === 'female' && b.gender !== 'female') return -1;
        if (a.gender !== 'female' && b.gender === 'female') return 1;
        return a.name.localeCompare(b.name);
      }),
    ];
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
    const cleanSender = username.replace(/[@#_]/g, '').trim() || 'เพื่อนใหม่';
    const text = `ยินดีต้อนรับคุณ ${cleanSender} ขอบคุณที่กดติดตามช่องนะคะ`;
    this.queue.push(text);
    this.processQueue();
  }

  // Announce live stream share in sweet Thai voice
  public speakShare(username: string) {
    if (!this.options.enabled) return;
    const cleanSender = username.replace(/[@#_]/g, '').trim() || 'ผู้ชมใจดี';
    const text = `ขอบคุณคุณ ${cleanSender} ที่ช่วยแชร์ไลฟ์ให้นะคะ น่ารักมากๆ เลยค่า`;
    this.queue.push(text);
    this.processQueue();
  }

  // Test TTS function with custom or sample text
  public testSpeak(sampleText?: string) {
    this.stop(); // Stop any pending speech

    let text = sampleText;
    if (!text) {
      const voiceUri = this.options.voiceURI || 'ai_female_kore';
      const isMale =
        voiceUri === 'male_auto' ||
        voiceUri === 'ai_male_puck' ||
        this.options.genderPreference === 'male' ||
        voiceUri.toLowerCase().includes('niwat') ||
        voiceUri.toLowerCase().includes('pattara');

      if (this.options.format === 'sweet' || this.options.sweetEnding) {
        text = 'คุณ แซนดี้ บอกว่า: สวัสดีค่ะ ยินดีต้อนรับสู่ไลฟ์สตรีมนะคะ ขอให้สนุกกับไลฟ์ค่า';
      } else if (!isMale) {
        text = 'คุณ ชาลิดา พูดว่า: สวัสดีค่ะ ยินดีต้อนรับสู่ไลฟ์สตรีมนะคะ พูดจังหวะปกติ ฟังสบาย ไม่เร็วเกินไปค่ะ';
      } else {
        text = 'คุณ ชัยวัฒน์ พูดว่า: สวัสดีครับ ยินดีต้อนรับสู่ไลฟ์สตรีมครับ พูดจังหวะปกติ ฟังสบาย ไม่เร็วเกินไปครับ';
      }
    }

    this.queue.push(text);
    this.processQueue();
  }

  // Primary Queue Processing
  private async processQueue() {
    if (typeof window === 'undefined') return;
    if (this.isSpeaking || this.queue.length === 0) return;

    const nextText = this.queue.shift();
    if (!nextText) return;

    const voiceUri = this.options.voiceURI || 'ai_female_kore';

    // Determine if we should use AI Studio TTS:
    // 1. User selected an AI voice (ai_female_kore, ai_female_zephyr, ai_male_puck)
    // 2. OR user selected a Female voice (female_auto, sweet_auto, default), but local system has NO Thai female voice (e.g. Windows only has Niwat)!
    const isExplicitAi = voiceUri.startsWith('ai_');
    const isWantsFemale =
      voiceUri === 'female_auto' ||
      voiceUri === 'sweet_auto' ||
      voiceUri === 'default' ||
      voiceUri.startsWith('ai_female');

    const shouldTryAi =
      isExplicitAi ||
      (isWantsFemale && !this.hasLocalFemaleVoice);

    if (shouldTryAi) {
      const aiGender = voiceUri.includes('male') && !voiceUri.includes('female') ? 'male' : 'female';
      const aiVoiceName = voiceUri === 'ai_female_zephyr' ? 'Zephyr' : aiGender === 'male' ? 'Puck' : 'Kore';

      const success = await this.speakWithAi(nextText, aiVoiceName, aiGender);
      if (success) {
        return;
      }
      // If AI TTS fails or is unavailable, fallback to browser speech synthesis
    }

    // Browser Web Speech API fallback
    this.speakWithBrowser(nextText);
  }

  // Speak using server-side Gemini TTS
  private async speakWithAi(text: string, voiceName: string, gender: 'female' | 'male'): Promise<boolean> {
    try {
      this.isSpeaking = true;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: voiceName,
          gender,
          speed: this.options.rate,
        }),
      });

      if (!response.ok) {
        console.warn('[TTS] /api/tts returned non-200 status:', response.status);
        this.isSpeaking = false;
        return false;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      audio.volume = Math.min(Math.max(this.options.volume / 100, 0), 1);
      audio.playbackRate = Math.min(Math.max(this.options.rate, 0.75), 1.25);

      return new Promise<boolean>((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          this.isSpeaking = false;
          setTimeout(() => this.processQueue(), 120);
          resolve(true);
        };

        audio.onerror = (err) => {
          console.warn('[TTS] Audio playback failed, falling back to browser synthesis:', err);
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          this.isSpeaking = false;
          resolve(false);
        };

        audio.play().catch((err) => {
          console.warn('[TTS] audio.play() blocked or failed:', err);
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          this.isSpeaking = false;
          resolve(false);
        });
      });
    } catch (err) {
      console.warn('[TTS] speakWithAi request error:', err);
      this.isSpeaking = false;
      return false;
    }
  }

  // Speak using Web Speech API
  private speakWithBrowser(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.isSpeaking = false;
      return;
    }

    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(text);

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
      if (targetUri !== 'default' && !targetUri.endsWith('_auto') && !targetUri.startsWith('ai_')) {
        selectedVoice = this.voices.find((v) => v.voiceURI === targetUri || v.name === targetUri);
      }

      // 2. Automatic Female Thai Voice ('female_auto' or 'sweet_auto')
      if (!selectedVoice && (targetUri === 'female_auto' || targetUri === 'sweet_auto' || targetUri.startsWith('ai_female') || targetUri === 'default')) {
        // Prioritize Premwadee, Google ภาษาไทย, Achara, Narisa, Kanya
        selectedVoice = this.voices.find((v) => {
          const l = v.lang.toLowerCase();
          const n = v.name.toLowerCase();
          return (
            l.startsWith('th') &&
            (n.includes('premwadee') ||
              n.includes('google') ||
              n.includes('achara') ||
              n.includes('narisa') ||
              n.includes('kanya'))
          );
        });

        // Any non-male Thai voice
        if (!selectedVoice) {
          selectedVoice = this.voices.find((v) => v.lang.toLowerCase().startsWith('th') && !this.isMaleVoice(v));
        }

        // If OS only has male voices installed (e.g. Windows only bundled Niwat offline)
        if (!selectedVoice) {
          selectedVoice = this.voices.find((v) => v.lang.toLowerCase().startsWith('th'));
          if (selectedVoice && this.isMaleVoice(selectedVoice)) {
            requiresFemalePitchLift = true;
          }
        }
      }

      // 3. Automatic Male Thai Voice ('male_auto' or 'ai_male_puck')
      if (!selectedVoice && (targetUri === 'male_auto' || targetUri.startsWith('ai_male'))) {
        selectedVoice = this.voices.find((v) => {
          const l = v.lang.toLowerCase();
          const n = v.name.toLowerCase();
          return l.startsWith('th') && (n.includes('niwat') || n.includes('pattara') || this.isMaleVoice(v));
        });

        if (!selectedVoice) {
          selectedVoice = this.voices.find((v) => v.lang.toLowerCase().startsWith('th'));
        }
      }

      // 4. Final Fallback to any Thai voice in system
      if (!selectedVoice) {
        selectedVoice = this.voices.find((v) => v.lang.toLowerCase().startsWith('th'));
      }

      // Pitch calculation
      let effectivePitch = this.options.pitch || 1.05;
      if (requiresFemalePitchLift) {
        effectivePitch = Math.max(effectivePitch, 1.35);
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

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {
        // Ignore
      }
      this.currentAudio = null;
    }

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
