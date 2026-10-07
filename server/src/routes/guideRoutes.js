import express from 'express';
import { getGuides, getGuideByType } from '../controllers/guideController.js';

const router = express.Router();

router.get('/', getGuides);
router.get('/:type', getGuideByType);

export default router;
