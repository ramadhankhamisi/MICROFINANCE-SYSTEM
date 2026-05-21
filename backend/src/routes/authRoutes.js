import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { handleValidationErrors } from '../middleware/validationMiddleware.js';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateChangePassword,
} from '../validators/authValidator.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegister, handleValidationErrors, AuthController.register);
router.post('/login', validateLogin, handleValidationErrors, AuthController.login);
router.post('/refresh', validateRefreshToken, handleValidationErrors, AuthController.refreshToken);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.getProfile);
router.post(
  '/change-password',
  authenticate,
  validateChangePassword,
  handleValidationErrors,
  AuthController.changePassword
);

export default router;
