import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';

export const smsController = {
  async sendSMSAlert(req: Request, res: Response): Promise<void> {
    try {
      const { message, type, phoneNumber } = req.body;
      const startTime = Date.now();

      // Simulate SMS sending (replace with actual SMS service)
      const smsData = {
        to: phoneNumber,
        message: message,
        type: type,
        timestamp: new Date().toISOString()
      };

      logger.sms(phoneNumber, message, 'sent');

      const responseTime = Date.now() - startTime;
      logger.externalApi('SMS', 'send', 'success', responseTime);

      res.json({
        success: true,
        data: {
          messageId: `sms_${Date.now()}`,
          status: 'sent',
          phoneNumber,
          message: message.substring(0, 50) + '...',
        },
        responseTime,
      });
    } catch (error) {
      logger.error('SMS send error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send SMS',
      });
    }
  },

  async subscribeToAlerts(req: Request, res: Response): Promise<void> {
    try {
      const { phoneNumber, alertTypes, language, location } = req.body;
      const startTime = Date.now();

      // Simulate subscription storage
      const subscription = {
        phoneNumber,
        alertTypes,
        language,
        location,
        active: true,
        createdAt: new Date().toISOString(),
      };

      const responseTime = Date.now() - startTime;
      logger.externalApi('SMS', 'subscribe', 'success', responseTime);

      res.json({
        success: true,
        data: {
          subscriptionId: `sub_${Date.now()}`,
          message: 'Successfully subscribed to alerts',
          subscription,
        },
        responseTime,
      });
    } catch (error) {
      logger.error('SMS subscription error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to subscribe to alerts',
      });
    }
  },

  async getSMSHistory(req: Request, res: Response): Promise<void> {
    try {
      // Simulate SMS history
      const history = [
        {
          id: 'sms_1',
          type: 'weather',
          message: 'Heavy rainfall expected in the next 24 hours',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'sent',
          phoneNumber: '6290277345',
        },
        {
          id: 'sms_2',
          type: 'crop',
          message: 'Time to harvest your wheat crop',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'sent',
          phoneNumber: '6290277345',
        },
      ];

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      logger.error('SMS history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get SMS history',
      });
    }
  },

  async getSubscriptions(req: Request, res: Response): Promise<void> {
    try {
      // Simulate subscriptions
      const subscriptions = [
        {
          phoneNumber: '6290277345',
          alertTypes: ['weather', 'crop'],
          language: 'english',
          location: 'Maharashtra',
          active: true,
        },
      ];

      res.json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      logger.error('SMS subscriptions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get subscriptions',
      });
    }
  },

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'SMS service operational',
      });
    } catch (error) {
      logger.error('SMS health check failed:', error);
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: 'SMS service unavailable',
      });
    }
  },
}; 