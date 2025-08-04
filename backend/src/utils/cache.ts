import NodeCache from 'node-cache';
import { config } from '../config/index.js';
import { logger } from './logger.js';

class CacheService {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({
      stdTTL: config.cache.ttl,
      checkperiod: config.cache.checkPeriod,
      useClones: false,
    });

    // Log cache events
    this.cache.on('expired', (key: string) => {
      logger.debug(`Cache expired: ${key}`);
    });

    this.cache.on('flush', () => {
      logger.debug('Cache flushed');
    });
  }

  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      logger.cache(key, 'hit');
    } else {
      logger.cache(key, 'miss');
    }
    return value;
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    const success = this.cache.set(key, value, ttl);
    if (success) {
      logger.cache(key, 'set');
    }
    return success;
  }

  del(key: string): number {
    const deleted = this.cache.del(key);
    if (deleted > 0) {
      logger.debug(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  flush(): void {
    this.cache.flushAll();
    logger.debug('Cache flushed');
  }

  getStats() {
    return this.cache.getStats();
  }

  // Specialized cache methods for different data types
  getWeatherData(key: string) {
    return this.get(key);
  }

  setWeatherData(key: string, data: any, ttl: number = 1800) { // 30 minutes for weather
    return this.set(key, data, ttl);
  }

  getSatelliteData(key: string) {
    return this.get(key);
  }

  setSatelliteData(key: string, data: any, ttl: number = 3600) { // 1 hour for satellite data
    return this.set(key, data, ttl);
  }

  getAIData(key: string) {
    return this.get(key);
  }

  setAIData(key: string, data: any, ttl: number = 7200) { // 2 hours for AI responses
    return this.set(key, data, ttl);
  }

  // Cache key generators
  generateWeatherKey(lat: number, lon: number): string {
    return `weather:${lat.toFixed(4)}:${lon.toFixed(4)}`;
  }

  generateSatelliteKey(lat: number, lon: number): string {
    return `satellite:${lat.toFixed(4)}:${lon.toFixed(4)}`;
  }

  generateAIKey(type: string, params: Record<string, any>): string {
    const paramString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(':');
    return `ai:${type}:${paramString}`;
  }
}

export const cache = new CacheService(); 