import { Router } from 'express';
import { synthesizeTamil } from '../controllers/ttsController.js';

const router = Router();

// POST /api/tts/tamil - Synthesizes Tamil text into natural playable audio
router.post('/tamil', synthesizeTamil);

export default router;
