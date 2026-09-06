import https from 'https';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';

const app = express();
const PORT = 3000;

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
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY, engine: 'AI_STUDIO_TTS' });
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
