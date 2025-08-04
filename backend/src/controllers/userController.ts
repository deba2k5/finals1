import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { generateToken, generateRefreshToken, AuthenticatedRequest } from '../middleware/auth.js';

export const userController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phoneNumber, location } = req.body;

      // Simulate user storage (replace with actual database)
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = {
        id: `user_${Date.now()}`,
        email,
        password: hashedPassword,
        name,
        phoneNumber,
        location,
        createdAt: new Date().toISOString(),
      };

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: 'user',
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
      });

      logger.info('User registered successfully', { email });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            phoneNumber: user.phoneNumber,
            location: user.location,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('User registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register user',
      });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Simulate user lookup (replace with actual database)
      const user = {
        id: 'user_123',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
        role: 'user',
      };

      // In real app, find user by email
      if (email !== user.email) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
        return;
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        email: user.email,
      });

      logger.info('User logged in successfully', { email });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('User login error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to login',
      });
    }
  },

  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      // Simulate user profile (replace with actual database lookup)
      const profile = {
        id: req.user.id,
        email: req.user.email,
        name: 'Test User',
        phoneNumber: '6290277345',
        location: 'Maharashtra',
        preferences: {
          language: 'english',
          notifications: true,
        },
      };

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile',
      });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      const { name, phoneNumber, location, preferences } = req.body;

      // Simulate profile update (replace with actual database update)
      const updatedProfile = {
        id: req.user.id,
        email: req.user.email,
        name: name || 'Test User',
        phoneNumber: phoneNumber || '6290277345',
        location: location || 'Maharashtra',
        preferences: preferences || {
          language: 'english',
          notifications: true,
        },
        updatedAt: new Date().toISOString(),
      };

      logger.info('Profile updated successfully', { userId: req.user.id });

      res.json({
        success: true,
        data: updatedProfile,
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
      });
    }
  },

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token required',
        });
        return;
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwtSecret) as {
        id: string;
        email: string;
      };

      // Generate new tokens
      const newToken = generateToken({
        id: decoded.id,
        email: decoded.email,
        role: 'user',
      });

      const newRefreshToken = generateRefreshToken({
        id: decoded.id,
        email: decoded.email,
      });

      res.json({
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }
  },

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated',
        });
        return;
      }

      // In real app, invalidate token in database
      logger.info('User logged out successfully', { userId: req.user.id });

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to logout',
      });
    }
  },

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        message: 'User service operational',
      });
    } catch (error) {
      logger.error('User health check failed:', error);
      res.status(503).json({
        success: false,
        status: 'unhealthy',
        error: 'User service unavailable',
      });
    }
  },
}; 