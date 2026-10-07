import express from 'express';
import { createSession, getSessions, deleteSession, clearAllSessions } from '../controllers/sessionController.js';
import { verifyToken, optionalToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', optionalToken, createSession); // Allowed for guests (anonymous logs) and authenticated users
router.get('/', verifyToken, getSessions);       // Authenticated history
router.delete('/:id', verifyToken, deleteSession);
router.post('/clear', verifyToken, clearAllSessions);

export default router;
