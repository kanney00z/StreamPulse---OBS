// Text-To-Speech (TTS) Engine for Reading Live TikTok/Stream Chat Aloud

export interface TTSOptions {
  enabled: boolean;
  format: 'nameAndMessage' | 'messageOnly';
  rate: number; // 0.8 - 1.5 (default 1.05)
  pitch: number; // 0.8 - 1.2 (default 1.0)
  volume: number; // 0 - 100 (default 90)
  voiceURI: string; // 'default' or specific voice.voiceURI
  skipCommands: boolean; // skip messages starting with ! or /
  cleanSpam: boolean; // shorten 55555555 to 555
}

export interface TTSVoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
  isThai: boolean;
  isDefault: boolean;
}

class TTSEngine {
  private queue: string[] = [];
  private isSpeaking: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded: boolean = false;
  private watchdogTimer: NodeJS.Timeout | null = null;

  public options: TTSOptions = {
    enabled: true,
    format: 'nameAndMessage',
    rate: 1.05,
    pitch: 1.0,
    volume: 90,
    voiceURI: 'default',
    skipCommands: true,
    cleanSpam: true,
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

  public getAvailableVoices(): TTSVoiceOption[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    if (!this.voicesLoaded || this.voices.length === 0) {
      this.loadVoices();
    }

    return this.voices.map((v) => ({
      name: v.name,
      lang: v.lang,
      voiceURI: v.voiceURI,
      isThai: v.lang.toLowerCase().startsWith('th'),
      isDefault: v.default,
    })).sort((a, b) => {
      // Thai voices first
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

    // 3. Shorten repeated numbers and Thai characters (e.g. 5555555555 -> 555, ฮ่าๆๆๆๆๆ -> ฮ่าๆๆ)
    if (this.options.cleanSpam) {
      cleaned = cleaned.replace(/5{3,}/g, '555');
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

    const cleanedMsg = this.cleanText(message);
    if (!cleanedMsg) return;

    let sentenceToSpeak = '';
    const cleanSender = senderName.replace(/[@#_]/g, '').trim() || 'ผู้ชม';

    if (this.options.format === 'nameAndMessage') {
      sentenceToSpeak = `คุณ ${cleanSender} พูดว่า: ${cleanedMsg}`;
    } else {
      sentenceToSpeak = cleanedMsg;
    }

    this.queue.push(sentenceToSpeak);
    this.processQueue();
  }

  // Test TTS function with custom or sample text
  public testSpeak(sampleText?: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.stop(); // Stop any pending speech

    const text = sampleText || (this.options.format === 'nameAndMessage'
      ? 'คุณ สมชาย พูดว่า: สวัสดีครับ ยินดีต้อนรับสู่ไลฟ์สตรีมครับ'
      : 'สวัสดีครับ ระบบอ่านแชทอัตโนมัติพร้อมทำงานแล้วครับ');

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
      utterance.rate = Math.min(Math.max(this.options.rate, 0.5), 2.0);
      utterance.pitch = Math.min(Math.max(this.options.pitch, 0.5), 1.5);
      utterance.volume = Math.min(Math.max(this.options.volume / 100, 0), 1);

      // Select voice:
      if (this.voices.length === 0) {
        this.loadVoices();
      }

      let selectedVoice: SpeechSynthesisVoice | undefined;

      // If specific voice is chosen
      if (this.options.voiceURI && this.options.voiceURI !== 'default') {
        selectedVoice = this.voices.find((v) => v.voiceURI === this.options.voiceURI);
      }

      // If no voice or default, try finding Thai voice
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
      }, 5000);

      utterance.onend = () => {
        this.isSpeaking = false;
        if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
        // Delay slightly for natural breathing space between comments
        setTimeout(() => {
          this.processQueue();
        }, 150);
      };

      utterance.onerror = (e) => {
        // 'interrupted' or 'canceled' are standard when stopping
        this.isSpeaking = false;
        if (this.watchdogTimer) clearTimeout(this.watchdogTimer);
        setTimeout(() => {
          this.processQueue();
        }, 100);
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
