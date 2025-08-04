import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { cache } from '../utils/cache.js';
import { aiService } from '../services/aiService.js';
import { weatherService } from '../services/weatherService.js';

export const healthController = {
  async getSystemHealth(req: Request, res: Response): Promise<void> {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        services: {
          api: 'healthy',
          cache: 'healthy',
          ai: 'unknown',
          weather: 'unknown',
        }
      };

      // Check AI service
      try {
        await aiService.sendChatMessage('health check', 'english');
        healthStatus.services.ai = 'healthy';
      } catch (error) {
        healthStatus.services.ai = 'unhealthy';
        logger.error('AI service health check failed:', error);
      }

      // Check weather service
      try {
        await weatherService.getCurrentWeather();
        healthStatus.services.weather = 'healthy';
      } catch (error) {
        healthStatus.services.weather = 'unhealthy';
        logger.error('Weather service health check failed:', error);
      }

      // Check cache
      try {
        cache.set('health_check', 'ok', 60);
        const cacheTest = cache.get('health_check');
        if (cacheTest !== 'ok') {
          healthStatus.services.cache = 'unhealthy';
        }
      } catch (error) {
        healthStatus.services.cache = 'unhealthy';
        logger.error('Cache health check failed:', error);
      }

      // Overall status
      const allHealthy = Object.values(healthStatus.services).every(status => status === 'healthy');
      healthStatus.status = allHealthy ? 'healthy' : 'degraded';

      const statusCode = allHealthy ? 200 : 503;
      res.status(statusCode).json({
        success: true,
        data: healthStatus,
      });
    } catch (error) {
      logger.error('System health check failed:', error);
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      });
    }
  },

  async getDetailedHealth(req: Request, res: Response): Promise<void> {
    try {
      const detailedHealth = {
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
        },
        cache: cache.getStats(),
        services: {
          ai: await this.checkAIService(),
          weather: await this.checkWeatherService(),
          satellite: await this.checkSatelliteService(),
          sms: await this.checkSMSService(),
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          port: process.env.PORT,
          corsOrigin: process.env.CORS_ORIGIN,
        }
      };

      res.json({
        success: true,
        data: detailedHealth,
      });
    } catch (error) {
      logger.error('Detailed health check failed:', error);
      res.status(500).json({
        success: false,
        error: 'Detailed health check failed',
      });
    }
  },

  async getAIHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.checkAIService();
      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      logger.error('AI health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'AI service unavailable',
      });
    }
  },

  async getWeatherHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.checkWeatherService();
      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      logger.error('Weather health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'Weather service unavailable',
      });
    }
  },

  async getSatelliteHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.checkSatelliteService();
      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      logger.error('Satellite health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'Satellite service unavailable',
      });
    }
  },

  async getSMSHealth(req: Request, res: Response): Promise<void> {
    try {
      const health = await this.checkSMSService();
      res.json({
        success: true,
        data: health,
      });
    } catch (error) {
      logger.error('SMS health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'SMS service unavailable',
      });
    }
  },

  async getDatabaseHealth(req: Request, res: Response): Promise<void> {
    // Placeholder for database health check
    res.json({
      success: true,
      data: {
        status: 'healthy',
        message: 'Database connection not configured',
      },
    });
  },

  async getCacheHealth(req: Request, res: Response): Promise<void> {
    try {
      const stats = cache.getStats();
      res.json({
        success: true,
        data: {
          status: 'healthy',
          stats,
        },
      });
    } catch (error) {
      logger.error('Cache health check failed:', error);
      res.status(503).json({
        success: false,
        error: 'Cache service unavailable',
      });
    }
  },

  async checkAIService(): Promise<any> {
    try {
      const startTime = Date.now();
      await aiService.sendChatMessage('health check', 'english');
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  },

  async checkWeatherService(): Promise<any> {
    try {
      const startTime = Date.now();
      await weatherService.getCurrentWeather();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  },

  async checkSatelliteService(): Promise<any> {
    // Placeholder for satellite service health check
    return {
      status: 'healthy',
      message: 'Satellite service not implemented',
      timestamp: new Date().toISOString(),
    };
  },

  async checkSMSService(): Promise<any> {
    // Placeholder for SMS service health check
    return {
      status: 'healthy',
      message: 'SMS service not implemented',
      timestamp: new Date().toISOString(),
    };
  },
}; 