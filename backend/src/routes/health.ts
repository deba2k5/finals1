import { Router } from 'express';
import { healthController } from '../controllers/healthController.js';

const router = Router();

// Overall system health
router.get('/', healthController.getSystemHealth);

// Detailed health status
router.get('/detailed', healthController.getDetailedHealth);

// Service-specific health checks
router.get('/ai', healthController.getAIHealth);
router.get('/weather', healthController.getWeatherHealth);
router.get('/satellite', healthController.getSatelliteHealth);
router.get('/sms', healthController.getSMSHealth);
router.get('/database', healthController.getDatabaseHealth);
router.get('/cache', healthController.getCacheHealth);

export default router; 