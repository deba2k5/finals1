import { config } from '../config/index.js';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

class Logger {
  private logLevel: LogLevel;

  constructor() {
    this.logLevel = (config.logLevel as LogLevel) || 'info';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
    };
    return levels[level] <= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  // Specialized logging methods for different contexts
  api(method: string, path: string, statusCode: number, responseTime: number): void {
    this.info(`API ${method} ${path} - ${statusCode} (${responseTime}ms)`);
  }

  externalApi(service: string, endpoint: string, status: 'success' | 'error', responseTime: number): void {
    this.info(`External API ${service} ${endpoint} - ${status} (${responseTime}ms)`);
  }

  cache(key: string, action: 'hit' | 'miss' | 'set'): void {
    this.debug(`Cache ${action}: ${key}`);
  }

  sms(phoneNumber: string, message: string, status: 'sent' | 'failed'): void {
    this.info(`SMS to ${phoneNumber} - ${status}: ${message.substring(0, 50)}...`);
  }
}

export const logger = new Logger(); 