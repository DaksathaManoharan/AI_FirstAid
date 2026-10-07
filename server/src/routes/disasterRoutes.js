import express from 'express';
import { getDisasters, getDisasterByType, getChecklist, updateChecklist } from '../controllers/disasterController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDisasters);
router.get('/checklist', verifyToken, getChecklist);
router.post('/checklist', verifyToken, updateChecklist);
router.get('/:type', getDisasterByType);

export default router;
