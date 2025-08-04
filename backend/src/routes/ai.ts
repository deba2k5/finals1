import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import { validateRequest } from '../middleware/validation.js';
import { aiSchemas } from '../schemas/aiSchemas.js';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting for AI endpoints (more restrictive due to API costs)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many AI requests, please try again later.',
  },
});

// Chat endpoint
router.post(
  '/chat',
  aiLimiter,
  validateRequest(aiSchemas.chatMessage),
  aiController.sendChatMessage
);

// Crop recommendations endpoint
router.post(
  '/crop-recommendations',
  aiLimiter,
  validateRequest(aiSchemas.cropRecommendations),
  aiController.getCropRecommendations
);

// Disease diagnosis endpoint
router.post(
  '/diagnose-disease',
  aiLimiter,
  validateRequest(aiSchemas.diseaseDiagnosis),
  aiController.diagnoseCropDisease
);

// Health check for AI service
router.get('/health', aiController.healthCheck);

export default router; 