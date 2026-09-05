import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Audio cache to prevent repeated AI calls for common phrases
const ttsCache = new Map<string, Buffer>();

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

// Gemini TTS endpoint for studio-quality Thai female/male voice
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice, gender } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return res.status(400).json({ error: 'Empty text' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
    }

    // Determine voice name:
    // Female voices: Kore (sweet, clear), Zephyr (calm, warm), Aoede (energetic)
    // Male voices: Puck (friendly, youthful), Fenrir (deep, confident)
    let selectedVoice = voice;
    if (!selectedVoice || selectedVoice === 'auto') {
      selectedVoice = gender === 'male' ? 'Puck' : 'Kore';
    } else if (selectedVoice === 'female' || selectedVoice === 'sweet') {
      selectedVoice = 'Kore';
    } else if (selectedVoice === 'male') {
      selectedVoice = 'Puck';
    }

    const cacheKey = `${selectedVoice}:${trimmedText}`;
    if (ttsCache.has(cacheKey)) {
      const cachedWav = ttsCache.get(cacheKey)!;
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(cachedWav);
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt =
      gender === 'male'
        ? `Say clearly and naturally in a polite Thai male voice: ${trimmedText}`
        : `Say clearly, pleasantly and naturally in a sweet, friendly Thai female voice: ${trimmedText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: prompt }] }],
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
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from Gemini TTS' });
    }

    const rawPcm = Buffer.from(base64Audio, 'base64');
    const wavBuffer = pcmToWav(rawPcm, 24000, 1, 16);

    // Keep cache at reasonable size (< 200 items)
    if (ttsCache.size > 200) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, wavBuffer);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(wavBuffer);
  } catch (error: any) {
    console.error('[API /api/tts] Error generating audio:', error?.message || error);
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
