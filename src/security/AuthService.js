import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'sudan-oid-dev-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
    this.REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';
    this.tokenBlacklist = new Set();
  }

  // Hash password with bcrypt
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      permissions: user.permissions || []
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'sudan-oid-portal',
      audience: 'sudan-citizens'
    });
  }

  // Generate refresh token
  generateRefreshToken(user) {
    const payload = {
      id: user.id,
      type: 'refresh'
    };

    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_EXPIRES_IN,
      issuer: 'sudan-oid-portal'
    });
  }

  // Verify token
  verifyToken(token) {
    try {
      // Check if token is blacklisted
      if (this.tokenBlacklist.has(token)) {
        throw new Error('Token has been revoked');
      }

      const decoded = jwt.verify(token, this.JWT_SECRET);
      return { valid: true, user: decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Blacklist token (for logout)
  blacklistToken(token) {
    this.tokenBlacklist.add(token);
    // Clean up old tokens periodically
    setTimeout(() => {
      this.tokenBlacklist.delete(token);
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  // Role-based access control
  checkPermission(userRole, requiredPermission) {
    const rolePermissions = {
      'super_admin': ['*'], // All permissions
      'ministry_admin': ['read', 'write', 'manage_department'],
      'government_official': ['read', 'write', 'approve'],
      'citizen': ['read', 'submit'],
      'guest': ['read']
    };

    const permissions = rolePermissions[userRole] || [];
    return permissions.includes('*') || permissions.includes(requiredPermission);
  }

  // Validate government ID (Sudan National ID format)
  validateSudanNationalId(nationalId) {
    // Sudan National ID format: 9 digits
    const idRegex = /^\d{9}$/;
    return idRegex.test(nationalId);
  }

  // Generate OTP for 2FA
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Validate OTP
  validateOTP(providedOTP, storedOTP, timestamp) {
    const OTP_VALIDITY = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    if (now - timestamp > OTP_VALIDITY) {
      return { valid: false, reason: 'OTP expired' };
    }

    if (providedOTP !== storedOTP) {
      return { valid: false, reason: 'Invalid OTP' };
    }

    return { valid: true };
  }

  // Secure user session data
  sanitizeUserData(user) {
    const { password, otp, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

export default new AuthService();