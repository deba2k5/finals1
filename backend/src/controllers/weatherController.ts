import { Request, Response } from 'express';
import { weatherService } from '../services/weatherService.js';
import { logger } from '../utils/logger.js';
import { cache } from '../utils/cache.js';

export const weatherController = {
  async getCurrentWeather(req: Request, res: Response): Promise<void> {
    try {
      const { lat = 18.5204, lon = 73.8567 } = req.query;
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const startTime = Date.now();

      // Check cache first
      const cacheKey = cache.generateWeatherKey(latitude, longitude);
      const cachedData = cache.getWeatherData(cacheKey);
      
      if (cachedData) {
        res.json({
          success: true,
          data: cachedData,
          cached: true,
        });
        return;
      }

      // Get weather data
      const weatherData = await weatherService.getCurrentWeather(latitude, longitude);
      
      // Cache the response
      cache.setWeatherData(cacheKey, weatherData);

      const responseTime = Date.now() - startTime;
      logger.externalApi('Tomorrow.io', 'current-weather', 'success', responseTime);

      res.json({
        success: true,
        data: weatherData,
        cached: false,
        responseTime,
      });
    } catch (error) {
      logger.error('Current weather error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get current weather',
      });
    }
  },

  async getWeatherForecast(req: Request, res: Response): Promise<void> {
    try {
      const { lat = 18.5204, lon = 73.8567 } = req.query;
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const startTime = Date.now();

      // Check cache first
      const cacheKey = `forecast:${cache.generateWeatherKey(latitude, longitude)}`;
      const cachedData = cache.getWeatherData(cacheKey);
      
      if (cachedData) {
        res.json({
          success: true,
          data: cachedData,
          cached: true,
        });
        return;
      }

      // Get forecast data
      const forecastData = await weatherService.getWeatherForecast(latitude, longitude);
      
      // Cache the response
      cache.setWeatherData(cacheKey, forecastData);

      const responseTime = Date.now() - startTime;
      logger.externalApi('Tomorrow.io', 'forecast', 'success', responseTime);

      res.json({
        success: true,
        data: forecastData,
        cached: false,
        responseTime,
      });
    } catch (error) {
      logger.error('Weather forecast error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get weather forecast',
      });
    }
  },

  async getWeatherAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { lat = 18.5204, lon = 73.8567 } = req.query;
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lon as string);
      const startTime = Date.now();

      // Check cache first
      const cacheKey = `alerts:${cache.generateWeatherKey(latitude, longitude)}`;
      const cachedData = cache.getWeatherData(cacheKey);
      
      if (cachedData) {
        res.json({
          success: true,
          data: cachedData,
          cached: true,
        });
        return;
      }

      // Get alerts data
      const alertsData = await weatherService.getWeatherAlerts(latitude, longitude);
      
      // Cache the response (shorter TTL for alerts)
      cache.setWeatherData(cacheKey, alertsData, 900); // 15 minutes

      const responseTime = Date.now() - startTime;
      logger.externalApi('Tomorrow.io', 'alerts', 'success', responseTime);

      res.json({
        success: true,
        data: alertsData,
        cached: false,
        responseTime,
      });
    } catch (error) {
      logger.error('Weather alerts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get weather alerts',
      });
    }
  },

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Test weather service connectivity
      const testData = await weatherService.getCurrentWeather(18.5204, 73.8567);

      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        weatherService: testData ? 'connected' : 'disconnected',
      });
    } catch (error) {
      logger.error('Weather health check failed:', error);
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Weather service unavailable',
      });
    }
  },
}; 