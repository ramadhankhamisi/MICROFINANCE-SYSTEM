import bcrypt from 'bcryptjs';

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  if (password.length < minLength) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!hasUppercase) {
    return { valid: false, message: 'Password must contain uppercase letters' };
  }
  if (!hasLowercase) {
    return { valid: false, message: 'Password must contain lowercase letters' };
  }
  if (!hasNumbers) {
    return { valid: false, message: 'Password must contain numbers' };
  }
  if (!hasSpecialChar) {
    return { valid: false, message: 'Password must contain special characters' };
  }

  return { valid: true };
};
