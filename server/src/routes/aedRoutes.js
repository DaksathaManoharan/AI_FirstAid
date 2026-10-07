import express from 'express';
import { getNearbyAEDs } from '../controllers/resourceController.js';

const router = express.Router();

router.get('/nearby', getNearbyAEDs);

export default router;
