import { AuthService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/responseUtils.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const { email, password, firstName, lastName, branchId, role } = req.body;
      const result = await AuthService.register(email, password, firstName, lastName, branchId, role);
      sendSuccess(res, result, 'User registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      sendSuccess(res, user, 'Profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }
}
