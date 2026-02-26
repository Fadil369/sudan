// Browser-compatible JWT library alternative
import CryptoJS from 'crypto-js';

// Simple base64 URL encoding for browser
function base64UrlEscape(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlEncode(str) {
  return base64UrlEscape(btoa(str));
}

function base64UrlDecode(str) {
  str += new Array(5 - str.length % 4).join('=');
  return atob(str.replace(/-/g, '+').replace(/_/g, '/'));
}

// Simple JWT implementation for browser
class BrowserJWT {
  static sign(payload, secret, options = {}) {
    const header = {
      typ: 'JWT',
      alg: 'HS256'
    };

    const now = Math.floor(Date.now() / 1000);
    const jwtPayload = {
      ...payload,
      iat: now,
      exp: now + (options.expiresIn ? this.parseExpiry(options.expiresIn) : 86400),
      iss: options.issuer || 'sudan-oid-portal',
      aud: options.audience || 'sudan-citizens'
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(jwtPayload));
    
    const signature = CryptoJS.HmacSHA256(encodedHeader + '.' + encodedPayload, secret);
    const encodedSignature = base64UrlEscape(signature.toString(CryptoJS.enc.Base64));

    return encodedHeader + '.' + encodedPayload + '.' + encodedSignature;
  }

  static verify(token, secret) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const [encodedHeader, encodedPayload, encodedSignature] = parts;
      
      // Verify signature
      const signature = CryptoJS.HmacSHA256(encodedHeader + '.' + encodedPayload, secret);
      const expectedSignature = base64UrlEscape(signature.toString(CryptoJS.enc.Base64));
      
      if (encodedSignature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      // Decode payload
      const payload = JSON.parse(base64UrlDecode(encodedPayload));
      
      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      throw new Error('Token verification failed: ' + error.message);
    }
  }

  static parseExpiry(expiresIn) {
    if (typeof expiresIn === 'number') return expiresIn;
    if (typeof expiresIn === 'string') {
      const match = expiresIn.match(/^(\d+)([smhd])$/);
      if (match) {
        const [, num, unit] = match;
        const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
        return parseInt(num) * multipliers[unit];
      }
    }
    return 86400; // Default 24 hours
  }
}

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.REACT_APP_JWT_SECRET || 'sudan-oid-dev-secret-key';
    this.JWT_EXPIRES_IN = process.env.REACT_APP_JWT_EXPIRES_IN || '24h';
    this.REFRESH_EXPIRES_IN = process.env.REACT_APP_REFRESH_EXPIRES_IN || '7d';
    this.tokenBlacklist = new Set();
  }

  // Hash password with browser-compatible method
  async hashPassword(password) {
    const salt = CryptoJS.lib.WordArray.random(128/8);
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    return salt.toString() + ':' + hash.toString();
  }

  // Verify password
  async verifyPassword(password, hashedPassword) {
    try {
      const [salt, hash] = hashedPassword.split(':');
      const computedHash = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
        keySize: 256/32,
        iterations: 10000
      });
      return computedHash.toString() === hash;
    } catch (error) {
      return false;
    }
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

    return BrowserJWT.sign(payload, this.JWT_SECRET, {
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

    return BrowserJWT.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_EXPIRES_IN,
      issuer: 'sudan-oid-portal'
    });
  }

  // Verify JWT token
  verifyToken(token) {
    if (this.tokenBlacklist.has(token)) {
      throw new Error('Token has been revoked');
    }

    try {
      const decoded = BrowserJWT.verify(token, this.JWT_SECRET);
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

const authService = new AuthService();
export default authService;