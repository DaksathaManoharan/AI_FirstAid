import express from 'express';
import { triage, analyzeIncidentImage } from '../controllers/aiController.js';

const router = express.Router();

router.post('/triage', triage);
router.post('/image-analysis', analyzeIncidentImage);

export default router;
