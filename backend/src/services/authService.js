import { query } from '../config/database.js';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/passwordUtils.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwtUtils.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../middleware/errorHandler.js';

export class AuthService {
  static async register(email, password, firstName, lastName, branchId, role = 'staff') {
    // Validate password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      throw new ValidationError(passwordCheck.message);
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (existingUser.rows.length > 0) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password, first_name, last_name, branch_id, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, role, branch_id, created_at`,
      [email, hashedPassword, firstName, lastName, branchId, role, 'active']
    );

    const user = result.rows[0];
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token (optional: for token blacklisting/management)
    await query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)',
      [user.id, refreshToken]
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        branchId: user.branch_id,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(email, password) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = result.rows[0];

    if (user.status !== 'active') {
      throw new UnauthorizedError('Account is inactive');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await query(
      'INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)',
      [user.id, refreshToken]
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        branchId: user.branch_id,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const user = result.rows[0];
    const newAccessToken = generateToken(user);

    return { accessToken: newAccessToken };
  }

  static async logout(refreshToken) {
    await query(
      'DELETE FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );
  }

  static async getProfile(userId) {
    const result = await query(
      'SELECT id, email, first_name, last_name, role, branch_id, status, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    return result.rows[0];
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await query(
      'SELECT password FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.rows[0].password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const passwordCheck = validatePasswordStrength(newPassword);
    if (!passwordCheck.valid) {
      throw new ValidationError(passwordCheck.message);
    }

    const hashedPassword = await hashPassword(newPassword);
    await query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, userId]
    );
  }
}
