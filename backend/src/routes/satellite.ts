import { Router } from 'express';
import { satelliteController } from '../controllers/satelliteController.js';
import { validateRequest } from '../middleware/validation.js';
import { satelliteSchemas } from '../schemas/satelliteSchemas.js';

const router = Router();

// Get satellite data and analysis
router.get(
  '/data',
  validateRequest(satelliteSchemas.getSatelliteData, 'query'),
  satelliteController.getSatelliteData
);

// Get field boundaries
router.get(
  '/field-boundaries',
  validateRequest(satelliteSchemas.getFieldBoundaries, 'query'),
  satelliteController.getFieldBoundaries
);

// Health check for satellite service
router.get('/health', satelliteController.healthCheck);

export default router; 