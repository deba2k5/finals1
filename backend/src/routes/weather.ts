import { Router } from 'express';
import { weatherController } from '../controllers/weatherController.js';
import { validateRequest } from '../middleware/validation.js';
import { weatherSchemas } from '../schemas/weatherSchemas.js';

const router = Router();

// Get current weather
router.get(
  '/current',
  validateRequest(weatherSchemas.getCurrentWeather, 'query'),
  weatherController.getCurrentWeather
);

// Get weather forecast
router.get(
  '/forecast',
  validateRequest(weatherSchemas.getForecast, 'query'),
  weatherController.getWeatherForecast
);

// Get weather alerts
router.get(
  '/alerts',
  validateRequest(weatherSchemas.getAlerts, 'query'),
  weatherController.getWeatherAlerts
);

// Health check for weather service
router.get('/health', weatherController.healthCheck);

export default router; 