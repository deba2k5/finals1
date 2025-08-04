import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Authentication failed: No token provided', {
      path: req.path,
      ip: req.ip,
    });
    res.status(401).json({
      success: false,
      error: 'Access token required',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      email: string;
      role: string;
    };
    
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Authentication failed: Invalid token', {
      path: req.path,
      ip: req.ip,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

export const generateToken = (payload: { id: string; email: string; role: string }): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });
};

export const generateRefreshToken = (payload: { id: string; email: string }): string => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}; 