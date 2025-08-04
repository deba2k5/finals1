import { Request, Response } from 'express';
import { aiService } from '../services/aiService.js';
import { logger } from '../utils/logger.js';
import { cache } from '../utils/cache.js';

export const aiController = {
  async sendChatMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message, language = 'english', context } = req.body;
      const startTime = Date.now();

      // Check cache first
      const cacheKey = `chat:${language}:${message}`;
      const cachedResponse = cache.get(cacheKey);
      
      if (cachedResponse) {
        logger.cache(cacheKey, 'hit');
        res.json({
          success: true,
          data: cachedResponse,
          cached: true,
        });
        return;
      }

      // Call AI service
      const response = await aiService.sendChatMessage(message, language, context);
      
      // Cache the response
      cache.set(cacheKey, response);
      logger.cache(cacheKey, 'set');

      const responseTime = Date.now() - startTime;
      logger.externalApi('Gemini', 'chat', 'success', responseTime);

      res.json({
        success: true,
        data: response,
        cached: false,
        responseTime,
      });
    } catch (error) {
      logger.error('Chat message error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message',
      });
    }
  },

  async getCropRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { soilType, climate, season, farmSize, location } = req.body;
      const startTime = Date.now();

      // Check cache first
      const cacheKey = `crops:${soilType}:${climate}:${season}:${farmSize}:${location}`;
      const cachedResponse = cache.get(cacheKey);
      
      if (cachedResponse) {
        logger.cache(cacheKey, 'hit');
        res.json({
          success: true,
          data: cachedResponse,
          cached: true,
        });
        return;
      }

      // Call AI service
      const recommendations = await aiService.getCropRecommendations(
        soilType,
        climate,
        season,
        farmSize,
        location
      );

      // Cache the response
      cache.set(cacheKey, recommendations);
      logger.cache(cacheKey, 'set');

      const responseTime = Date.now() - startTime;
      logger.externalApi('Gemini', 'crop-recommendations', 'success', responseTime);

      res.json({
        success: true,
        data: recommendations,
        cached: false,
        responseTime,
      });
    } catch (error) {
      logger.error('Crop recommendations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get crop recommendations',
      });
    }
  },

  async diagnoseCropDisease(req: Request, res: Response): Promise<void> {
    try {
      const { imageBase64, cropType } = req.body;
      const startTime = Date.now();

      // Validate image size
      const imageSize = Buffer.from(imageBase64, 'base64').length;
      if (imageSize > 10 * 1024 * 1024) { // 10MB limit
        res.status(400).json({
          success: false,
          error: 'Image size too large. Maximum size is 10MB.',
        });
        return;
      }

      // Call AI service
      const diagnosis = await aiService.diagnoseCropDisease(imageBase64, cropType);

      const responseTime = Date.now() - startTime;
      logger.externalApi('Gemini Vision', 'disease-diagnosis', 'success', responseTime);

      res.json({
        success: true,
        data: diagnosis,
        responseTime,
      });
    } catch (error) {
      logger.error('Disease diagnosis error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to diagnose crop disease',
      });
    }
  },

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Test AI service connectivity
      const testResponse = await aiService.sendChatMessage(
        'Hello, this is a health check.',
        'english'
      );

      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        aiService: testResponse ? 'connected' : 'disconnected',
      });
    } catch (error) {
      logger.error('AI health check failed:', error);
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'AI service unavailable',
      });
    }
  },
}; 