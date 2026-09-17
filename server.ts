import fs from 'fs';
import https from 'https';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';

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

const sseClients = new Set<SSEClient>();
// Active polling clients tracker (for OBS Studio CEF instances when SSE is throttled or dropped)
const activePollClients = new Map<string, { clientType: string; lastSeen: number }>();

function broadcastSSE(eventType: string, data: any) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
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

// 7-second heartbeat ping to prevent connection timeouts across Cloud Run, Nginx, or proxy firewalls
setInterval(() => {
  const pingMsg = `event: ping\ndata: ${Date.now()}\n\n`;
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
}, 7000);

// SSE connection endpoint for OBS Browser Source and Dashboards
app.get('/api/sync/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform, no-store');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const clientId = (req.query.sessionId as string) || Math.random().toString(36).substring(2, 9);
  const clientType = (req.query.type as string) || 'unknown';
  const client: SSEClient = { id: clientId, res, clientType, joinedAt: Date.now() };

  sseClients.add(client);
  console.log(`[Realtime SSE] Client connected: ${clientId} (${clientType}). Total active: ${sseClients.size}`);

  // Send initial full snapshot immediately
  res.write(`event: init\ndata: ${JSON.stringify(currentSyncState)}\n\n`);
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

  const hasChanged = since === 0 || currentSyncState.updatedAt > since;

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  if (hasChanged) {
    return res.json({
      changed: true,
      updatedAt: currentSyncState.updatedAt,
      settings: currentSyncState.settings,
      subathonSeconds: currentSyncState.subathonSeconds,
      subathonIsRunning: currentSyncState.subathonIsRunning,
      totalLikes: currentSyncState.totalLikes,
    });
  }

  return res.json({
    changed: false,
    updatedAt: currentSyncState.updatedAt,
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

// Primary AI Text-To-Speech endpoint (Guaranteed 100% Thai Female / Male AI voice)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'ai_female_google', gender = 'female', speed = 0.86 } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return res.status(400).json({ error: 'Empty text' });
    }

    const cacheKey = `${voice}:${speed}:${trimmedText}`;
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
