import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { cache } from '../utils/cache.js';

export const satelliteController = {
  async getSatelliteData(req: Request, res: Response): Promise<void> {
    try {
      const { lat = 18.5204, lon = 73.8567 } = req.query;
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const startTime = Date.now();

      // Check cache first
      const cacheKey = cache.generateSatelliteKey(latitude, longitude);
      const cachedData = cache.getSatelliteData(cacheKey);
      
      if (cachedData) {
        res.json({
          success: true,
          data: cachedData,
          cached: true,
        });
        return;
      }

      // Simulate satellite data (replace with actual satellite service)
      const satelliteData = {
        soilMoisture: 78 + Math.random() * 20 - 10,
        cropHealth: 85 + Math.random() * 10 - 5,
        vegetationIndex: 0.65 + Math.random() * 0.2 - 0.1,
        lastUpdated: '2 hours ago',
        geospatialAnalysis: {
          fieldBoundaries: [
            {
              coordinates: [
                [longitude - 0.01, latitude - 0.01],
                [longitude + 0.01, latitude - 0.01],
                [longitude + 0.01, latitude + 0.01],
                [longitude - 0.01, latitude + 0.01],
                [longitude - 0.01, latitude - 0.01]
              ],
              area: 2.5,
              cropType: 'wheat'
            }
          ],
          cropClassification: [
            {
              cropType: 'wheat',
              confidence: 0.92,
              area: 2.5,
              coordinates: [longitude, latitude]
            }
          ],
          healthAnalysis: {
            overallHealth: 85,
            stressAreas: [],
            recommendations: [
              'Monitor soil moisture levels',
              'Consider irrigation if needed'
            ]
          }
        }
      };
      
      // Cache the response
      cache.setSatelliteData(cacheKey, satelliteData);

      const responseTime = Date.now() - startTime;
      logger.externalApi('Satellite', 'data', 'success', responseTime);

      res.json({
        success: true,
        data: satelliteData,
        cached: false,
        responseTime,
      });
    } catch (error) {
      logger.error('Satellite data error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get satellite data',
      });
    }
  },

  async getFieldBoundaries(req: Request, res: Response): Promise<void> {
    try {
      const { lat, lon } = req.query;
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const startTime = Date.now();

      // Simulate field boundary detection
      const fieldBoundaries = [
        {
          coordinates: [
            [longitude - 0.01, latitude - 0.01],
            [longitude + 0.01, latitude - 0.01],
            [longitude + 0.01, latitude + 0.01],
            [longitude - 0.01, latitude + 0.01],
            [longitude - 0.01, latitude - 0.01]
          ],
          area: 2.5,
          cropType: 'wheat'
        },
        {
          coordinates: [
            [longitude - 0.015, latitude + 0.005],
            [longitude - 0.005, latitude + 0.005],
            [longitude - 0.005, latitude + 0.015],
            [longitude - 0.015, latitude + 0.015],
            [longitude - 0.015, latitude + 0.005]
          ],
          area: 1.8,
          cropType: 'cotton'
        }
      ];

      const responseTime = Date.now() - startTime;
      logger.externalApi('Satellite', 'field-boundaries', 'success', responseTime);

      res.json({
        success: true,
        data: fieldBoundaries,
        responseTime,
      });
    } catch (error) {
      logger.error('Field boundaries error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get field boundaries',
      });
    }
  },

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'Satellite service operational',
      });
    } catch (error) {
      logger.error('Satellite health check failed:', error);
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: 'Satellite service unavailable',
      });
    }
  },
}; 