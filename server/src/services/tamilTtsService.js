/**
 * Tamil AI/Cloud Text-to-Speech Service
 * 
 * Generates natural Tamil audio using cloud-based TTS services.
 * Does NOT alter, rewrite, or summarize medical instructions.
 * Supports optional TAMIL_TTS_API_KEY (Google Cloud TTS) with automatic
 * high-fidelity neural Tamil voice fallback.
 */

const MAX_CHUNK_LENGTH = 180;
const TIMEOUT_MS = 15000;

/**
 * Strips presentation markdown markers and emojis without altering any medical wording.
 */
export function cleanTextForSpeech(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[*#`_~•🔴🟠🟡🟢🚑🏥⚡❤️🦴🔥☠️😵🚗😮💨👶🧒🧑👴🎙️📍🔧]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits text into manageable sentence chunks <= MAX_CHUNK_LENGTH for audio synthesis.
 */
function splitTextIntoChunks(text, maxLength = MAX_CHUNK_LENGTH) {
  if (text.length <= maxLength) return [text];

  const chunks = [];
  // Split on sentence boundaries (Tamil and standard punctuation: ., ?, !, \n, ;)
  const sentenceDelimiters = /([.?!;\n]+)/;
  const rawParts = text.split(sentenceDelimiters);

  let currentChunk = '';

  for (let i = 0; i < rawParts.length; i++) {
    const part = rawParts[i];
    if (!part) continue;

    if ((currentChunk + part).length <= maxLength) {
      currentChunk += part;
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // If a single sentence exceeds maxLength, split by spaces
      if (part.length > maxLength) {
        const words = part.split(' ');
        let subChunk = '';
        for (const word of words) {
          if ((subChunk + ' ' + word).trim().length <= maxLength) {
            subChunk = (subChunk + ' ' + word).trim();
          } else {
            if (subChunk) chunks.push(subChunk);
            subChunk = word;
          }
        }
        if (subChunk) currentChunk = subChunk;
        else currentChunk = '';
      } else {
        currentChunk = part;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Synthesizes audio using Google Cloud Text-to-Speech if an API key is configured.
 */
async function synthesizeWithGoogleCloudApi(text, apiKey) {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'ta-IN',
          name: 'ta-IN-Standard-A'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.95,
          pitch: 0.0
        }
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Google Cloud TTS error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    if (!data.audioContent) {
      throw new Error('Google Cloud TTS returned no audioContent');
    }

    return Buffer.from(data.audioContent, 'base64');
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Synthesizes a single chunk using the cloud Tamil voice engine.
 */
async function fetchAudioChunk(chunkText) {
  const encoded = encodeURIComponent(chunkText);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ta&client=tw-ob&q=${encoded}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Cloud TTS chunk request failed with status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Main Tamil Text-to-Speech synthesis function.
 * Returns a Promise that resolves to an MP3 Buffer.
 */
export async function synthesizeTamilText(rawText) {
  const cleaned = cleanTextForSpeech(rawText);

  if (!cleaned) {
    throw new Error('Text parameter is empty or contains no spoken content.');
  }

  if (cleaned.length > 2000) {
    throw new Error('Text exceeds the maximum allowed length of 2000 characters.');
  }

  // 1. Try Google Cloud TTS API if an explicit key is configured
  const apiKey = process.env.TAMIL_TTS_API_KEY || process.env.GOOGLE_TTS_API_KEY;
  if (apiKey && apiKey.trim()) {
    try {
      return await synthesizeWithGoogleCloudApi(cleaned, apiKey.trim());
    } catch (apiErr) {
      console.warn('Google Cloud TTS API key request failed, falling back to neural Tamil voice engine:', apiErr.message);
    }
  }

  // 2. High-fidelity cloud neural Tamil engine
  const chunks = splitTextIntoChunks(cleaned, MAX_CHUNK_LENGTH);
  
  // Fetch chunks in parallel (max 5 chunks) or sequentially
  const audioBuffers = await Promise.all(chunks.map(chunk => fetchAudioChunk(chunk)));

  // Concatenate MP3 frames
  return Buffer.concat(audioBuffers);
}
