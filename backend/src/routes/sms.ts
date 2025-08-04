import { Router } from 'express';
import { smsController } from '../controllers/smsController.js';
import { validateRequest } from '../middleware/validation.js';
import { smsSchemas } from '../schemas/smsSchemas.js';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// Rate limiting for SMS endpoints
const smsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 SMS requests per windowMs
  message: {
    error: 'Too many SMS requests, please try again later.',
  },
});

// Send SMS alert
router.post(
  '/send',
  smsLimiter,
  validateRequest(smsSchemas.sendSMS),
  smsController.sendSMSAlert
);

// Subscribe to SMS alerts
router.post(
  '/subscribe',
  smsLimiter,
  validateRequest(smsSchemas.subscribe),
  smsController.subscribeToAlerts
);

// Get SMS history
router.get('/history', smsController.getSMSHistory);

// Get subscriptions
router.get('/subscriptions', smsController.getSubscriptions);

// Health check for SMS service
router.get('/health', smsController.healthCheck);

export default router; 