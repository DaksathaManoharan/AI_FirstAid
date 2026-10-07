import express from 'express';
import { 
  register, 
  login, 
  logout, 
  forgotPassword, 
  verifyResetCode, 
  resetPassword, 
  getPreferences, 
  updatePreferences, 
  deleteAccount 
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Password Reset endpoints
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);
router.post('/reset-password', resetPassword);

// User preferences
router.get('/preferences', verifyToken, getPreferences);
router.put('/preferences', verifyToken, updatePreferences);
router.delete('/delete-account', verifyToken, deleteAccount);

export default router;
