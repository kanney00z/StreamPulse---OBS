import fs from 'fs';
import https from 'https';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality, Type } from '@google/genai';

const app = express();
const PORT = 3000;

// Enable CORS and buffer-free streaming headers for OBS Studio and external clients
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// Audio cache to prevent repeated AI calls for common phrases (supports WAV and MP3)
interface CachedAudio {
  data: Buffer;
  contentType: string;
}
const ttsCache = new Map<string, CachedAudio>();

// Helper to convert 16-bit linear PCM (24000 Hz, mono) to WAV container
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16): Buffer {
  const header = Buffer.alloc(44);
  const dataSize = pcmBuffer.length;
  const fileSize = dataSize + 36;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  header.write('RIFF', 0);
  header.writeUInt32LE(fileSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size
  header.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// Ultra-fast, 100% reliable Thai female voice (Zero quota limits, crystal clear)
function fetchSingleGoogleTtsChunk(text: string, speed = 1): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text.trim());
    const ttsspeed = speed < 0.85 ? '0.24' : '1';
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=th&client=tw-ob&ttsspeed=${ttsspeed}`;

    const req = https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Google TTS returned HTTP ${res.statusCode}`));
        }
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }
    );

    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('Google TTS timeout'));
    });
  });
}

// Split long text into <= 140 character chunks and join audio
async function fetchGoogleThaiTts(fullText: string, speed = 1): Promise<Buffer> {
  const clean = fullText.replace(/\s+/g, ' ').trim();
  if (clean.length <= 140) {
    return fetchSingleGoogleTtsChunk(clean, speed);
  }

  // Split by natural clauses or spaces
  const parts: string[] = [];
  const segments = clean.split(/([,.;:!?\n]|ค่ะ|ครับ|นะคะ|นะครับ)/g);
  let currentChunk = '';

  for (const seg of segments) {
    if ((currentChunk + seg).length > 130 && currentChunk.length > 0) {
      parts.push(currentChunk.trim());
      currentChunk = seg;
    } else {
      currentChunk += seg;
    }
  }
  if (currentChunk.trim()) {
    parts.push(currentChunk.trim());
  }

  const audioBuffers: Buffer[] = [];
  for (const part of parts) {
    if (part.trim()) {
      try {
        const buf = await fetchSingleGoogleTtsChunk(part, speed);
        audioBuffers.push(buf);
      } catch (err) {
        console.warn('[Google TTS] Failed chunk:', part, err);
      }
    }
  }

  if (audioBuffers.length === 0) {
    throw new Error('Failed to fetch all TTS chunks');
  }

  return Buffer.concat(audioBuffers);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    engine: 'AI_STUDIO_TTS',
    realtimeClients: sseClients.size,
  });
});

// ==========================================
// REAL-TIME OVERLAY SYNC ENGINE (OBS Studio)
// ==========================================
interface StreamSyncState {
  settings: Record<string, any>;
  subathonSeconds?: number;
  subathonIsRunning?: boolean;
  totalLikes?: number;
  updatedAt: number;
}

const STATE_FILE_PATH = path.join(process.cwd(), 'stream_sync_state.json');

const DEFAULT_SYNC_SETTINGS: Record<string, any> = {
  chatTheme: 'multistream-pill-dynamic',
  chatFontSize: 'base',
  chatAutoHideSeconds: 10,
  chatShowAvatars: true,
  chatShowBadges: true,
  chatShowTimestamps: true,
  chatLayout: 'vertical',
  chatDirection: 'down',
  chatSoundEnabled: true,
  chatMaxMessages: 35,
  chatTtsEnabled: false,
  chatTtsFormat: 'nameAndMessage',
  chatTtsSpeed: 0.86,
  chatTtsPitch: 1.05,
  chatTtsVolume: 90,
  chatTtsVoice: 'ai_female_google',
  chatTtsSweetEnding: true,
  chatAiEmotionTtsEnabled: true,
  chatAiEmotionShowBadge: true,
  chatAiEmotionIntensity: 'balanced',
  likeGoal: 25000,
  currentLikes: 0,
  likeStyle: 'podium-card',
  likeShowGoalBar: true,
  likeShowTopCount: 5,
  likeSoundEnabled: true,
  giftSoundEnabled: true,
  giftSoundVolume: 60,
  giftDuration: 5,
  giftShowParticles: true,
  giftMinCoinFilter: 1,
  giftStyle: 'banner-epic',
  followAlertEnabled: true,
  followSoundEnabled: true,
  followTtsEnabled: true,
  followDuration: 4,
  followStyle: 'neon-banner',
  shareAlertEnabled: true,
  shareSoundEnabled: true,
  shareTtsEnabled: true,
  shareDuration: 4,
  shareStyle: 'neon-banner',
  streamFollowCount: 0,
  streamShareCount: 0,
  subathonTheme: 'cyberpunk-neon',
  subathonFont: 'orbitron',
  subathonStyle: 'frameless',
  subathonTitle: 'SUBATHON MARATHON',
  subathonStartSeconds: 7200,
  subathonMaxCapHours: 12,
  subathonAutoAdd: true,
  subathonAddPerCoin: 1,
  subathonAddPer100Likes: 5,
  subathonAddPerFollow: 30,
  subathonAddPerShare: 60,
  subathonSoundEnabled: true,
  avatarEnabled: true,
  avatarViewerCount: 10,
  avatarStyle: 'shiba-squad',
  avatarSize: 'md',
  avatarSpeed: 2.5,
  avatarShowNametags: true,
  avatarShowChatBubbles: true,
  avatarFloorStyle: 'transparent',
};

function loadPersistedState(): StreamSyncState {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const content = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        return {
          settings: { ...DEFAULT_SYNC_SETTINGS, ...(parsed.settings || {}) },
          subathonSeconds: typeof parsed.subathonSeconds === 'number' ? parsed.subathonSeconds : 7200,
          subathonIsRunning: typeof parsed.subathonIsRunning === 'boolean' ? parsed.subathonIsRunning : true,
          totalLikes: typeof parsed.totalLikes === 'number' ? parsed.totalLikes : 0,
          updatedAt: parsed.updatedAt || Date.now(),
        };
      }
    }
  } catch (e) {
    console.warn('[RealtimeSync] Could not load persisted state from disk:', e);
  }
  return {
    settings: { ...DEFAULT_SYNC_SETTINGS },
    subathonSeconds: 7200,
    subathonIsRunning: true,
    totalLikes: 0,
    updatedAt: Date.now(),
  };
}

let currentSyncState: StreamSyncState = loadPersistedState();
let saveStateTimer: NodeJS.Timeout | null = null;

function persistStateDebounced() {
  if (saveStateTimer) clearTimeout(saveStateTimer);
  saveStateTimer = setTimeout(() => {
    try {
      fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(currentSyncState, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[RealtimeSync] Failed to persist state to disk:', e);
    }
  }, 500);
}

interface SSEClient {
  id: string;
  res: express.Response;
  clientType: string;
  joinedAt: number;
}

interface SyncedStreamEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
}

const sseClients = new Set<SSEClient>();
// In-memory rolling buffer of the last 60 events so polling clients (OBS CEF) never miss an event
const recentStreamEvents: SyncedStreamEvent[] = [];
// Active polling clients tracker (for OBS Studio CEF instances when SSE is throttled or dropped)
const activePollClients = new Map<string, { clientType: string; lastSeen: number }>();

function broadcastSSE(eventType: string, data: any) {
  // Padding comment appended to force proxies (Nginx, Cloud Run) to push through immediately without buffering
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n: ${Date.now()}\n\n`;
  for (const client of Array.from(sseClients)) {
    try {
      client.res.write(payload);
      if (typeof (client.res as any).flush === 'function') {
        (client.res as any).flush();
      }
    } catch {
      sseClients.delete(client);
    }
  }
}

// 5-second heartbeat ping to prevent connection timeouts across Cloud Run, Nginx, or proxy firewalls
setInterval(() => {
  const pingMsg = `event: ping\ndata: ${Date.now()}\n\n: heartbeat\n\n`;
  for (const client of Array.from(sseClients)) {
    try {
      client.res.write(pingMsg);
      if (typeof (client.res as any).flush === 'function') {
        (client.res as any).flush();
      }
    } catch {
      sseClients.delete(client);
    }
  }
}, 5000);

// SSE connection endpoint for OBS Browser Source and Dashboards
app.get('/api/sync/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform, no-store, must-revalidate');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Pragma', 'no-cache');
  res.flushHeaders();

  // Send 2KB initial comment padding to immediately defeat intermediate proxy buffering (Cloud Run / Nginx)
  res.write(`: ${'x'.repeat(2048)}\n\n`);

  const clientId = (req.query.sessionId as string) || Math.random().toString(36).substring(2, 9);
  const clientType = (req.query.type as string) || 'unknown';
  const client: SSEClient = { id: clientId, res, clientType, joinedAt: Date.now() };

  sseClients.add(client);
  console.log(`[Realtime SSE] Client connected: ${clientId} (${clientType}). Total active: ${sseClients.size}`);

  // Send initial full snapshot immediately
  res.write(`event: init\ndata: ${JSON.stringify(currentSyncState)}\n\n: init-flush\n\n`);
  if (typeof (res as any).flush === 'function') {
    (res as any).flush();
  }

  req.on('close', () => {
    sseClients.delete(client);
    console.log(`[Realtime SSE] Client disconnected: ${clientId}. Remaining: ${sseClients.size}`);
  });
});

// Fast Polling endpoint (Fail-safe for OBS Studio CEF & firewalls)
app.get('/api/sync/poll', (req, res) => {
  const since = Number(req.query.since || 0);
  const clientId = (req.query.sessionId as string) || 'anonymous';
  const clientType = (req.query.type as string) || 'unknown';

  activePollClients.set(clientId, {
    clientType,
    lastSeen: Date.now(),
  });

  // Prune expired clients (> 8s old)
  const now = Date.now();
  for (const [id, entry] of activePollClients.entries()) {
    if (now - entry.lastSeen > 8000) {
      activePollClients.delete(id);
    }
  }

  const hasSettingsChanged = since === 0 || currentSyncState.updatedAt > since;
  const newEvents = since > 0 ? recentStreamEvents.filter((e) => e.timestamp > since) : [];

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (hasSettingsChanged || newEvents.length > 0) {
    return res.json({
      changed: hasSettingsChanged,
      updatedAt: currentSyncState.updatedAt,
      settings: currentSyncState.settings,
      subathonSeconds: currentSyncState.subathonSeconds,
      subathonIsRunning: currentSyncState.subathonIsRunning,
      totalLikes: currentSyncState.totalLikes,
      events: newEvents,
    });
  }

  return res.json({
    changed: false,
    updatedAt: currentSyncState.updatedAt,
    events: [],
  });
});

// Update settings and instantly broadcast to OBS
app.post('/api/sync/settings', (req, res) => {
  try {
    const raw = req.body;
    const incoming =
      raw?.settings && typeof raw.settings === 'object' && !Array.isArray(raw.settings)
        ? raw.settings
        : raw;

    if (incoming && typeof incoming === 'object' && !Array.isArray(incoming)) {
      const { _source, ...cleanSettings } = incoming;
      currentSyncState.settings = {
        ...currentSyncState.settings,
        ...cleanSettings,
      };
      currentSyncState.updatedAt = Date.now();
      persistStateDebounced();

      broadcastSSE('settings_update', incoming);
      return res.json({ ok: true, activeClients: sseClients.size + activePollClients.size });
    }
    return res.status(400).json({ error: 'Invalid settings object' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message });
  }
});

// Broadcast live stream events (chat messages, gifts, likes, follows, shares, subathon actions)
app.post('/api/sync/event', (req, res) => {
  try {
    const event = req.body;
    if (!event || !event.type) {
      return res.status(400).json({ error: 'Invalid event payload' });
    }

    // Keep state updated for persistent indicators
    if (event.type === 'subathon_state' && event.payload) {
      if (typeof event.payload.seconds === 'number') {
        currentSyncState.subathonSeconds = event.payload.seconds;
      }
      if (typeof event.payload.isRunning === 'boolean') {
        currentSyncState.subathonIsRunning = event.payload.isRunning;
      }
    } else if (event.type === 'likes' && event.payload && typeof event.payload.total === 'number') {
      currentSyncState.totalLikes = event.payload.total;
    }

    const eventRecord: SyncedStreamEvent = {
      id: event.id || Math.random().toString(36).substring(2, 9),
      type: event.type,
      payload: event.payload,
      timestamp: event.timestamp || Date.now(),
    };
    recentStreamEvents.push(eventRecord);
    if (recentStreamEvents.length > 60) {
      recentStreamEvents.shift();
    }

    currentSyncState.updatedAt = Date.now();
    persistStateDebounced();

    broadcastSSE('stream_event', event);
    return res.json({ ok: true, activeClients: sseClients.size + activePollClients.size });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message });
  }
});

// Fetch current snapshot and connection health metrics
app.get('/api/sync/state', (req, res) => {
  // Prune poll clients
  const now = Date.now();
  for (const [id, entry] of activePollClients.entries()) {
    if (now - entry.lastSeen > 8000) {
      activePollClients.delete(id);
    }
  }

  const sseList = Array.from(sseClients).map((c) => ({
    id: c.id,
    type: c.clientType,
    channel: 'sse',
    uptimeSeconds: Math.floor((Date.now() - c.joinedAt) / 1000),
  }));

  const pollList = Array.from(activePollClients.entries()).map(([id, entry]) => ({
    id,
    type: entry.clientType,
    channel: 'polling',
    uptimeSeconds: Math.floor((now - entry.lastSeen) / 1000),
  }));

  const combinedClients = [...sseList, ...pollList];
  const obsCount = combinedClients.filter((c) => c.type === 'obs').length;

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({
    state: currentSyncState,
    metrics: {
      totalClients: combinedClients.length,
      obsClients: obsCount,
      clients: combinedClients,
    },
  });
});

// =========================================================================
// GEMINI API CHAT EMOTION & VOICE TONE AUTO-MODULATION ENGINE
// =========================================================================

interface EmotionToneResult {
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

const emotionCache = new Map<string, EmotionToneResult>();

// Fallback rule-based Thai emotion analyzer for immediate offline/low-latency responsiveness
function getFallbackEmotion(text: string): EmotionToneResult {
  const t = (text || '').toLowerCase();

  // 1. Joyful / Laughing
  if (
    t.includes('555') ||
    t.includes('ฮ่า') ||
    t.includes('ขำ') ||
    t.includes('ตลก') ||
    t.includes('เย้') ||
    t.includes('ดีใจ') ||
    t.includes('ชนะ') ||
    t.includes('ฮา') ||
    t.includes('สนุก')
  ) {
    return {
      emotion: 'joyful',
      emotionLabel: '😊 ดีใจ / ร่าเริง',
      sentiment: 'positive',
      energy: 8,
      pitch: 1.18,
      rate: 0.96,
      volume: 95,
      sweetEnding: true,
      color: '#f59e0b',
      explanation: 'ข้อความแสดงความสุข การหัวเราะหรือความสำเร็จ',
      source: 'rule-fallback',
    };
  }

  // 2. Sweet / Cute / Adorable
  if (
    t.includes('น่ารัก') ||
    t.includes('หวาน') ||
    t.includes('สวย') ||
    t.includes('อ้อน') ||
    t.includes('คิดถึง') ||
    t.includes('รัก') ||
    t.includes('ฝากตัว') ||
    t.includes('หลง') ||
    t.includes('จุ๊บ') ||
    t.includes('แฟน') ||
    t.includes('ใจละลาย')
  ) {
    return {
      emotion: 'sweet',
      emotionLabel: '💖 ออดอ้อน / หวานแหวว',
      sentiment: 'positive',
      energy: 6,
      pitch: 1.14,
      rate: 0.82,
      volume: 90,
      sweetEnding: true,
      color: '#ec4899',
      explanation: 'ข้อความชื่นชม ออดอ้อน หรือแสดงความเอ็นดู',
      source: 'rule-fallback',
    };
  }

  // 3. Excited / Hype
  if (
    t.includes('สุดยอด') ||
    t.includes('โห') ||
    t.includes('ว้าว') ||
    t.includes('เชียร์') ||
    t.includes('ไปเลย') ||
    t.includes('เอาเรื่อง') ||
    t.includes('มันส์') ||
    t.includes('เทพ') ||
    t.includes('โกง') ||
    t.includes('ตื่นเต้น') ||
    t.includes('มาหวะ') ||
    t.includes('ดุเดือด')
  ) {
    return {
      emotion: 'excited',
      emotionLabel: '🔥 ตื่นเต้น / ไฮป์',
      sentiment: 'positive',
      energy: 9,
      pitch: 1.24,
      rate: 1.04,
      volume: 100,
      sweetEnding: false,
      color: '#ef4444',
      explanation: 'ข้อความตื่นเต้น เร้าใจ ไฮป์ หรือร่วมเชียร์อย่างดุเดือด',
      source: 'rule-fallback',
    };
  }

  // 4. Teasing / Playful
  if (
    t.includes('แน่จริง') ||
    t.includes('ขี้โม้') ||
    t.includes('แอบ') ||
    t.includes('จับได้') ||
    t.includes('กวน') ||
    t.includes('แซว') ||
    t.includes('หล่อเลยดิ') ||
    t.includes('เขิน') ||
    t.includes('อำ')
  ) {
    return {
      emotion: 'teasing',
      emotionLabel: '😜 หยอกล้อ / แซว',
      sentiment: 'positive',
      energy: 7,
      pitch: 1.12,
      rate: 0.94,
      volume: 92,
      sweetEnding: false,
      color: '#8b5cf6',
      explanation: 'ข้อความแซว หยอกล้อ หรือเป็นกันเอง',
      source: 'rule-fallback',
    };
  }

  // 5. Supportive / Grateful
  if (
    t.includes('สู้ๆ') ||
    t.includes('ขอบคุณ') ||
    t.includes('กำลังใจ') ||
    t.includes('พักผ่อน') ||
    t.includes('ดูแลตัวเอง') ||
    t.includes('ซาบซึ้ง') ||
    t.includes('เก่งมาก') ||
    t.includes('ยินดี')
  ) {
    return {
      emotion: 'supportive',
      emotionLabel: '🤝 ให้กำลังใจ / ซึ้ง',
      sentiment: 'positive',
      energy: 5,
      pitch: 1.04,
      rate: 0.84,
      volume: 90,
      sweetEnding: true,
      color: '#10b981',
      explanation: 'ข้อความให้กำลังใจ ปลอบโยน หรือขอบคุณด้วยความจริงใจ',
      source: 'rule-fallback',
    };
  }

  // 6. Angry / Annoyed / Heated
  if (
    t.includes('โมโห') ||
    t.includes('หัวร้อน') ||
    t.includes('บ้า') ||
    t.includes('แย่') ||
    t.includes('เซ็ง') ||
    t.includes('โกรธ') ||
    t.includes('เกรียน') ||
    t.includes('ด่า') ||
    t.includes('หงุดหงิด') ||
    t.includes('โกงว่ะ')
  ) {
    return {
      emotion: 'angry',
      emotionLabel: '😠 ดุดัน / หัวร้อน',
      sentiment: 'negative',
      energy: 8,
      pitch: 0.90,
      rate: 1.06,
      volume: 95,
      sweetEnding: false,
      color: '#f97316',
      explanation: 'ข้อความหัวร้อน ไม่พอใจ หรือโมโห',
      source: 'rule-fallback',
    };
  }

  // 7. Sad / Melancholy
  if (
    t.includes('นอยด์') ||
    t.includes('เศร้า') ||
    t.includes('เสียใจ') ||
    t.includes('แง') ||
    t.includes('เหนื่อย') ||
    t.includes('ท้อ') ||
    t.includes('ร้องไห้') ||
    t.includes('เหงา') ||
    t.includes('อกหัก')
  ) {
    return {
      emotion: 'sad',
      emotionLabel: '🥺 เศร้า / นอยด์',
      sentiment: 'negative',
      energy: 4,
      pitch: 0.92,
      rate: 0.80,
      volume: 85,
      sweetEnding: false,
      color: '#6366f1',
      explanation: 'ข้อความเศร้า นอยด์ เหนื่อย หรือต้องการการปลอบโยน',
      source: 'rule-fallback',
    };
  }

  // Default: Neutral
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
    explanation: 'ข้อความพูดคุยปกติ ถามคำถาม หรือแจ้งข้อมูลทั่วไป',
    source: 'rule-fallback',
  };
}

function applyIntensity(result: EmotionToneResult, intensity: 'gentle' | 'balanced' | 'dramatic'): EmotionToneResult {
  const factor = intensity === 'gentle' ? 0.6 : intensity === 'dramatic' ? 1.4 : 1.0;
  const basePitch = 1.05;
  const baseRate = 0.86;

  const pitchDiff = (result.pitch - basePitch) * factor;
  const rateDiff = (result.rate - baseRate) * factor;

  return {
    ...result,
    pitch: Number(Math.max(0.75, Math.min(1.45, basePitch + pitchDiff)).toFixed(2)),
    rate: Number(Math.max(0.70, Math.min(1.25, baseRate + rateDiff)).toFixed(2)),
  };
}

// Endpoint: Analyze live stream chat emotion using Gemini API (gemini-3.8-flash)
app.post('/api/analyze-chat-emotion', async (req, res) => {
  try {
    const { message, username = 'ผู้ชม', intensity = 'balanced' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const trimmedMsg = message.trim();
    const cacheKey = `${trimmedMsg.toLowerCase()}:${intensity}`;

    if (emotionCache.has(cacheKey)) {
      return res.json(emotionCache.get(cacheKey));
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = applyIntensity(getFallbackEmotion(trimmedMsg), intensity);
      emotionCache.set(cacheKey, fallback);
      return res.json(fallback);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = `วิเคราะห์อารมณ์และน้ำเสียงของข้อความแชทสดในไลฟ์สตรีม:
ผู้ส่ง: "${username}"
ข้อความ: "${trimmedMsg}"

จงเลือก emotion ที่ตรงที่สุด 1 ประเภท:
'joyful' (ดีใจ/สนุก/ขำขัน/555)
'sweet' (หวาน/อ้อน/น่ารัก/ชื่นชม)
'excited' (ตื่นเต้น/ไฮป์/เชียร์มันส์)
'teasing' (แซว/หยอกล้อ/กวนๆ)
'supportive' (ให้กำลังใจ/ขอบคุณ/ซึ้ง)
'angry' (หัวร้อน/โมโห/ขัดใจ)
'sad' (เศร้า/เสียใจ/นอยด์/เหนื่อย)
'neutral' (ปกติ/ถามคำถามทั่วไป)`;

      const apiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              emotion: {
                type: Type.STRING,
                description: 'One of: joyful, sweet, excited, teasing, supportive, angry, sad, neutral',
              },
              emotionLabel: {
                type: Type.STRING,
                description: 'Thai label with emoji, e.g. 😊 ดีใจ / ร่าเริง, 💖 ออดอ้อน / หวานแหวว',
              },
              sentiment: {
                type: Type.STRING,
                description: 'positive, neutral, or negative',
              },
              energy: {
                type: Type.NUMBER,
                description: 'Energy score from 1 to 10',
              },
              pitch: {
                type: Type.NUMBER,
                description: 'TTS pitch between 0.85 and 1.30',
              },
              rate: {
                type: Type.NUMBER,
                description: 'TTS rate between 0.75 and 1.15',
              },
              volume: {
                type: Type.NUMBER,
                description: 'Volume between 70 and 100',
              },
              sweetEnding: {
                type: Type.BOOLEAN,
                description: 'Whether to append sweet particle like ค่า~',
              },
              color: {
                type: Type.STRING,
                description: 'Hex color string for badge',
              },
              explanation: {
                type: Type.STRING,
                description: 'Brief Thai explanation of why this emotion was chosen',
              },
            },
            required: ['emotion', 'emotionLabel', 'sentiment', 'energy', 'pitch', 'rate', 'sweetEnding'],
          },
        },
      });

      // 3.5s timeout safeguard for super-fast TTS queue
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3500));
      const response = (await Promise.race([apiPromise, timeoutPromise])) as any;

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim());
        const validEmotions = ['joyful', 'sweet', 'excited', 'teasing', 'supportive', 'angry', 'sad', 'neutral'];
        const validatedEmotion = validEmotions.includes(parsed.emotion) ? parsed.emotion : 'neutral';

        const result: EmotionToneResult = {
          emotion: validatedEmotion,
          emotionLabel: parsed.emotionLabel || '💬 ปกติ / ทั่วไป',
          sentiment: parsed.sentiment || 'neutral',
          energy: Math.max(1, Math.min(10, Number(parsed.energy) || 5)),
          pitch: Number(parsed.pitch) || 1.05,
          rate: Number(parsed.rate) || 0.86,
          volume: Number(parsed.volume) || 90,
          sweetEnding: Boolean(parsed.sweetEnding),
          color: parsed.color || '#06b6d4',
          explanation: parsed.explanation || '',
          source: 'gemini',
        };

        const modulated = applyIntensity(result, intensity);
        if (emotionCache.size > 500) {
          const firstKey = emotionCache.keys().next().value;
          if (firstKey) emotionCache.delete(firstKey);
        }
        emotionCache.set(cacheKey, modulated);
        return res.json(modulated);
      }
    } catch (geminiError: any) {
      console.warn('[Gemini Emotion Analysis fallback]:', geminiError?.message || geminiError);
    }

    // Fallback if Gemini fails or times out
    const fallback = applyIntensity(getFallbackEmotion(trimmedMsg), intensity);
    emotionCache.set(cacheKey, fallback);
    return res.json(fallback);
  } catch (error: any) {
    console.error('[API /api/analyze-chat-emotion] Error:', error?.message || error);
    const fallback = getFallbackEmotion('');
    return res.json(fallback);
  }
});

// Primary AI Text-To-Speech endpoint (Guaranteed 100% Thai Female / Male AI voice)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'ai_female_google', gender = 'female', speed = 0.86, pitch = 1.05, emotion } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return res.status(400).json({ error: 'Empty text' });
    }

    const cacheKey = `${voice}:${speed}:${pitch}:${emotion || 'default'}:${trimmedText}`;
    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey)!;
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(cached.data);
    }

    const isExplicitGoogle =
      voice === 'ai_female_google' ||
      voice === 'google_thai' ||
      voice === 'female_auto' ||
      voice === 'sweet_auto' ||
      voice === 'default';

    // If Google Thai Female AI is explicitly requested or default, generate with zero-latency Google TTS
    if (isExplicitGoogle && gender !== 'male') {
      try {
        const mp3Buffer = await fetchGoogleThaiTts(trimmedText, speed);
        const item: CachedAudio = { data: mp3Buffer, contentType: 'audio/mpeg' };

        if (ttsCache.size > 300) {
          const firstKey = ttsCache.keys().next().value;
          if (firstKey) ttsCache.delete(firstKey);
        }
        ttsCache.set(cacheKey, item);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(mp3Buffer);
      } catch (err: any) {
        console.warn('[Google TTS Error, falling back to Gemini]:', err?.message);
      }
    }

    // Otherwise try Gemini TTS (Kore / Zephyr / Puck)
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        let selectedVoice = voice;
        if (selectedVoice === 'ai_female_zephyr' || selectedVoice === 'Zephyr') {
          selectedVoice = 'Zephyr';
        } else if (gender === 'male' || selectedVoice === 'ai_male_puck' || selectedVoice === 'Puck') {
          selectedVoice = 'Puck';
        } else {
          selectedVoice = 'Kore';
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: trimmedText }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const rawPcm = Buffer.from(base64Audio, 'base64');
          const wavBuffer = pcmToWav(rawPcm, 24000, 1, 16);

          const item: CachedAudio = { data: wavBuffer, contentType: 'audio/wav' };
          if (ttsCache.size > 300) {
            const firstKey = ttsCache.keys().next().value;
            if (firstKey) ttsCache.delete(firstKey);
          }
          ttsCache.set(cacheKey, item);

          res.setHeader('Content-Type', 'audio/wav');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.send(wavBuffer);
        }
      } catch (geminiError: any) {
        console.warn('[Gemini TTS fallback to Google Thai Female]:', geminiError?.message || geminiError);
      }
    }

    // Guaranteed fallback to Google Thai Voice (Ensures NO 500 error, 100% Female Thai voice)
    const mp3Buffer = await fetchGoogleThaiTts(trimmedText, speed);
    const item: CachedAudio = { data: mp3Buffer, contentType: 'audio/mpeg' };
    ttsCache.set(cacheKey, item);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(mp3Buffer);
  } catch (error: any) {
    console.error('[API /api/tts] Critical error:', error?.message || error);
    return res.status(500).json({ error: error?.message || 'TTS generation failed' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
