import express from 'express';
import { searchPoison, analyzeProductLabel } from '../controllers/poisonController.js';

const router = express.Router();

// Search and analyze substance exposure (supports both GET and POST)
router.get('/search', searchPoison);
router.post('/search', searchPoison);

// Extract label text from medicine/product label photo via Vision AI
router.post('/analyze-label', analyzeProductLabel);

export default router;
