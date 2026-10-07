import { synthesizeTamilText } from '../services/tamilTtsService.js';

/**
 * Controller for Tamil Text-To-Speech endpoint: POST /api/tts/tamil
 */
export async function synthesizeTamil(req, res, next) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        error: "Text parameter is required and must be a non-empty string."
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        error: "Text exceeds the maximum allowed limit of 2000 characters."
      });
    }

    const audioBuffer = await synthesizeTamilText(text);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Accept-Ranges', 'bytes');

    return res.status(200).send(audioBuffer);
  } catch (error) {
    console.error('Tamil TTS Controller error:', error.message);
    return res.status(500).json({
      error: "Tamil voice generation failed. " + (error.message || "Please try again.")
    });
  }
}
