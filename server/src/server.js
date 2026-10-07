import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Routes imports
import authRoutes from './routes/authRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import aedRoutes from './routes/aedRoutes.js';
import poisonRoutes from './routes/poisonRoutes.js';
import disasterRoutes from './routes/disasterRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import ttsRoutes from './routes/ttsRoutes.js';

// Middlewares
import { globalErrorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security configuration
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows displaying local Leaflet map tiles
}));

// Ensure Permissions-Policy allows geolocation across production HTTPS deployments
app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(self)');
  next();
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Set body parsers with limits for base64 canvas image triage uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limit AI APIs to prevent key exhaustion
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 requests per minute
  message: { error: "Triage rate limit exceeded. If this is a life-threatening emergency, call 112/108 immediately." }
});

app.use('/api/ai', aiLimiter);

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/aed', aedRoutes);
app.use('/api/poison', poisonRoutes);
app.use('/api/disasters', disasterRoutes);
app.use('/api/emergency-sessions', sessionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tts', ttsRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Centralized Global Error Handler
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`AI First Aid server running on port ${PORT}`);
});
