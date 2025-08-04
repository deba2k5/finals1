import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { validateRequest } from '../middleware/validation.js';
import { userSchemas } from '../schemas/userSchemas.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// User registration
router.post(
  '/register',
  validateRequest(userSchemas.register),
  userController.register
);

// User login
router.post(
  '/login',
  validateRequest(userSchemas.login),
  userController.login
);

// Get user profile (protected)
router.get(
  '/profile',
  authenticateToken,
  userController.getProfile
);

// Update user profile (protected)
router.put(
  '/profile',
  authenticateToken,
  validateRequest(userSchemas.updateProfile),
  userController.updateProfile
);

// Refresh token
router.post(
  '/refresh-token',
  validateRequest(userSchemas.refreshToken),
  userController.refreshToken
);

// Logout
router.post(
  '/logout',
  authenticateToken,
  userController.logout
);

// Health check for user service
router.get('/health', userController.healthCheck);

export default router; 