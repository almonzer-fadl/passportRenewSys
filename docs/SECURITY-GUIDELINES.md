# Security Guidelines - Sudan Passport Renewal System

## 🔒 Security Overview
This document outlines comprehensive security measures, best practices, and compliance requirements for the Sudan Passport Renewal System. Given the sensitive nature of passport data, security is our highest priority.

## 🛡️ Security Architecture

### Defense in Depth Strategy
```
┌─────────────────────────────────────────────────────────────┐
│                        User Layer                           │
│  • Multi-factor Authentication                             │
│  • Session Management                                      │
│  • Role-based Access Control                              │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                      │
│  • Input Validation & Sanitization                        │
│  • CSRF Protection                                        │
│  • XSS Prevention                                         │
│  • Rate Limiting                                          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                           │
│  • JWT Token Validation                                   │
│  • API Rate Limiting                                      │
│  • Request/Response Encryption                            │
│  • Audit Logging                                          │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                        │
│  • Encryption at Rest                                     │
│  • Field-level Encryption                                 │
│  • Access Controls                                        │
│  • Backup Encryption                                      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                     │
│  • HTTPS/TLS 1.3                                         │
│  • Firewall Rules                                        │
│  • VPN Access                                            │
│  • Server Hardening                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication & Authorization

### 1. Multi-Factor Authentication (MFA)

**Implementation**:
```javascript
// MFA verification during login
async function verifyMFA(userId, token, mfaCode) {
  const user = await User.findById(userId);
  
  // Verify TOTP code
  const isValidMFA = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'base32',
    token: mfaCode,
    window: 2 // Allow 2 time steps tolerance
  });

  if (!isValidMFA) {
    await logSecurityEvent('MFA_FAILED', userId);
    throw new Error('Invalid MFA code');
  }

  return true;
}
```

**Requirements**:
- **Citizens**: SMS or Email OTP for password reset
- **Admins**: TOTP (Google Authenticator) mandatory
- **Super Admins**: Hardware security keys required

### 2. Password Security

**Password Policy**:
```javascript
const passwordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  prohibitCommonPasswords: true,
  preventPasswordReuse: 5, // Last 5 passwords
  maxAge: 90, // Days before forced change
  lockoutThreshold: 5, // Failed attempts
  lockoutDuration: 30 // Minutes
};

function validatePassword(password, userHistory) {
  // Check length
  if (password.length < passwordPolicy.minLength) {
    throw new Error(`Password must be at least ${passwordPolicy.minLength} characters`);
  }

  // Check complexity
  const checks = [
    { pattern: /[A-Z]/, message: 'Must contain uppercase letter' },
    { pattern: /[a-z]/, message: 'Must contain lowercase letter' },
    { pattern: /\d/, message: 'Must contain number' },
    { pattern: /[!@#$%^&*(),.?":{}|<>]/, message: 'Must contain special character' }
  ];

  for (const check of checks) {
    if (!check.pattern.test(password)) {
      throw new Error(check.message);
    }
  }

  // Check against previous passwords
  for (const oldPassword of userHistory) {
    if (await bcrypt.compare(password, oldPassword)) {
      throw new Error('Cannot reuse recent password');
    }
  }

  return true;
}
```

### 3. Session Management

**Secure Session Configuration**:
```javascript
// NextAuth configuration
export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60,  // 1 hour
  },
  jwt: {
    maxAge: 8 * 60 * 60,
    encryption: true,
    secret: process.env.NEXTAUTH_SECRET,
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Add user role and permissions to token
      if (user) {
        token.role = user.role;
        token.permissions = await getUserPermissions(user.id);
        token.lastActivity = Date.now();
      }

      // Check for session timeout
      if (Date.now() - token.lastActivity > 8 * 60 * 60 * 1000) {
        throw new Error('Session expired');
      }

      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.permissions = token.permissions;
      return session;
    }
  }
};
```

### 4. Role-Based Access Control (RBAC)

**Permission Matrix**:
```javascript
const PERMISSIONS = {
  // Citizen permissions
  'application.create': ['citizen'],
  'application.read.own': ['citizen', 'admin', 'super_admin'],
  'application.update.own': ['citizen'],
  'application.submit.own': ['citizen'],
  
  // Admin permissions
  'application.read.all': ['admin', 'super_admin'],
  'application.review': ['admin', 'super_admin'],
  'application.approve': ['admin', 'super_admin'],
  'application.reject': ['admin', 'super_admin'],
  
  // Super admin permissions
  'user.create': ['super_admin'],
  'user.delete': ['super_admin'],
  'system.configure': ['super_admin'],
  'audit.view': ['super_admin']
};

function hasPermission(userRole, permission) {
  return PERMISSIONS[permission]?.includes(userRole) || false;
}

// Middleware for API protection
export function requirePermission(permission) {
  return async (req, res, next) => {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!hasPermission(session.user.role, permission)) {
      await logSecurityEvent('UNAUTHORIZED_ACCESS', session.user.id, {
        permission,
        route: req.url
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}
```

---

## 🔍 Data Protection

### 1. Data Encryption

**Encryption at Rest**:
```javascript
import crypto from 'crypto';

class DataEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
    this.masterKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  encrypt(plaintext) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, this.masterKey, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    const { encrypted, iv, tag } = encryptedData;
    const decipher = crypto.createDecipher(this.algorithm, this.masterKey, Buffer.from(iv, 'hex'));
    
    decipher.setAuthTag(Buffer.from(tag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Encrypt sensitive fields before storing
const encryption = new DataEncryption();

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  nationalId: {
    type: String,
    set: function(value) {
      return encryption.encrypt(value);
    },
    get: function(value) {
      return encryption.decrypt(value);
    }
  },
  // Other fields...
});
```

**Encryption in Transit**:
```javascript
// HTTPS enforcement middleware
export function enforceHTTPS(req, res, next) {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
}

// Security headers
export function securityHeaders(req, res, next) {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.stripe.com",
    "frame-src https://js.stripe.com"
  ].join('; '));
  
  next();
}
```

### 2. Personal Data Protection

**Data Minimization**:
```javascript
// Only collect necessary data
const personalInfoSchema = {
  firstName: { required: true, maxLength: 50 },
  lastName: { required: true, maxLength: 50 },
  dateOfBirth: { required: true, type: Date },
  nationalId: { required: true, encrypted: true },
  email: { required: true, type: String },
  phoneNumber: { required: true, encrypted: true },
  // Avoid collecting unnecessary sensitive data
};

// Data retention policy
const DATA_RETENTION = {
  'completed_applications': 7 * 365, // 7 years
  'rejected_applications': 2 * 365,  // 2 years
  'draft_applications': 30,          // 30 days
  'user_sessions': 1,                // 1 day
  'audit_logs': 5 * 365             // 5 years
};

async function cleanupExpiredData() {
  const cutoffDates = Object.entries(DATA_RETENTION).map(([type, days]) => ({
    type,
    cutoff: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  }));

  for (const { type, cutoff } of cutoffDates) {
    await cleanupDataByType(type, cutoff);
  }
}
```

### 3. Data Access Logging

**Audit Trail**:
```javascript
class AuditLogger {
  static async log(action, userId, resource, details = {}) {
    const auditEntry = {
      timestamp: new Date(),
      action,
      userId,
      resource,
      details,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      sessionId: details.sessionId
    };

    await AuditLog.create(auditEntry);

    // Alert on sensitive actions
    if (this.isSensitiveAction(action)) {
      await this.sendSecurityAlert(auditEntry);
    }
  }

  static isSensitiveAction(action) {
    const sensitiveActions = [
      'USER_DELETED',
      'APPLICATION_APPROVED',
      'APPLICATION_REJECTED',
      'DATA_EXPORTED',
      'SYSTEM_CONFIG_CHANGED',
      'MASS_DATA_ACCESS'
    ];
    return sensitiveActions.includes(action);
  }

  static async sendSecurityAlert(auditEntry) {
    // Send to security team
    await sendEmail({
      to: process.env.SECURITY_TEAM_EMAIL,
      subject: `Security Alert: ${auditEntry.action}`,
      body: `
        Sensitive action performed:
        User: ${auditEntry.userId}
        Action: ${auditEntry.action}
        Resource: ${auditEntry.resource}
        Time: ${auditEntry.timestamp}
        IP: ${auditEntry.ipAddress}
      `
    });
  }
}

// Usage in API routes
export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  try {
    const application = await Application.findById(req.query.id);
    
    // Log data access
    await AuditLogger.log('APPLICATION_VIEWED', session.user.id, req.query.id, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      sessionId: session.sessionId
    });

    res.json({ application });
  } catch (error) {
    await AuditLogger.log('APPLICATION_ACCESS_FAILED', session.user.id, req.query.id, {
      error: error.message
    });
    res.status(500).json({ error: 'Access failed' });
  }
}
```

---

## 📁 File Security

### 1. File Upload Security

**File Validation**:
```javascript
import fileType from 'file-type';
import crypto from 'crypto';

class SecureFileUpload {
  static allowedTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf']
  };

  static maxFileSize = 10 * 1024 * 1024; // 10MB

  static async validateFile(file) {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new Error('File size too large');
    }

    // Verify MIME type matches file content
    const detectedType = await fileType.fromBuffer(file.buffer);
    if (!detectedType || !this.allowedTypes[detectedType.mime]) {
      throw new Error('Invalid file type');
    }

    // Check file extension
    const allowedExtensions = this.allowedTypes[detectedType.mime];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('File extension mismatch');
    }

    // Scan for malware (in production)
    if (process.env.NODE_ENV === 'production') {
      await this.scanForMalware(file.buffer);
    }

    return true;
  }

  static async scanForMalware(buffer) {
    // Integrate with antivirus service
    // This is a placeholder for actual implementation
    const scanResult = await antivirusService.scan(buffer);
    if (scanResult.isInfected) {
      throw new Error('File contains malware');
    }
  }

  static generateSecureFilename(originalName, userId) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const hash = crypto.createHash('sha256')
      .update(`${userId}-${timestamp}-${random}`)
      .digest('hex')
      .substring(0, 16);
    
    return `${hash}-${timestamp}${extension}`;
  }

  static async storeFile(file, userId, applicationType) {
    await this.validateFile(file);
    
    const secureFilename = this.generateSecureFilename(file.originalname, userId);
    const storagePath = path.join(
      process.env.UPLOAD_DIR,
      applicationType,
      userId,
      secureFilename
    );

    // Ensure directory exists
    await fs.ensureDir(path.dirname(storagePath));

    // Write file with restricted permissions
    await fs.writeFile(storagePath, file.buffer, { mode: 0o600 });

    // Log file upload
    await AuditLogger.log('FILE_UPLOADED', userId, secureFilename, {
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    });

    return {
      filename: secureFilename,
      path: storagePath,
      size: file.size,
      uploadedAt: new Date()
    };
  }
}
```

### 2. File Access Control

**Secure File Serving**:
```javascript
export default async function handler(req, res) {
  const { filename } = req.query;
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Get file metadata
    const fileRecord = await File.findOne({ filename });
    if (!fileRecord) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check access permissions
    const hasAccess = await checkFileAccess(session.user, fileRecord);
    if (!hasAccess) {
      await AuditLogger.log('UNAUTHORIZED_FILE_ACCESS', session.user.id, filename);
      return res.status(403).json({ error: 'Access denied' });
    }

    // Log file access
    await AuditLogger.log('FILE_ACCESSED', session.user.id, filename);

    // Serve file securely
    const filePath = path.join(process.env.UPLOAD_DIR, fileRecord.path);
    const fileBuffer = await fs.readFile(filePath);

    res.setHeader('Content-Type', fileRecord.mimeType);
    res.setHeader('Content-Length', fileRecord.size);
    res.setHeader('Cache-Control', 'private, no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ error: 'File access failed' });
  }
}

async function checkFileAccess(user, fileRecord) {
  // Users can only access their own files
  if (user.role === 'citizen') {
    return fileRecord.userId.toString() === user.id;
  }

  // Admins can access files for applications they're reviewing
  if (user.role === 'admin') {
    const application = await Application.findOne({
      userId: fileRecord.userId,
      assignedTo: user.id
    });
    return !!application;
  }

  // Super admins have access to all files
  return user.role === 'super_admin';
}
```

---

## 🌐 API Security

### 1. Rate Limiting

**Comprehensive Rate Limiting**:
```javascript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Different limits for different endpoints
const rateLimiters = {
  auth: rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rl:auth:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts',
    standardHeaders: true,
    legacyHeaders: false,
    onLimitReached: async (req) => {
      await AuditLogger.log('RATE_LIMIT_EXCEEDED', null, 'auth', {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }
  }),

  upload: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 uploads per minute
    message: 'Too many file uploads'
  }),

  general: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests'
  })
};

export function getRateLimiter(type) {
  return rateLimiters[type] || rateLimiters.general;
}
```

### 2. Input Validation & Sanitization

**Comprehensive Validation**:
```javascript
import joi from 'joi';
import DOMPurify from 'dompurify';

const validationSchemas = {
  personalInfo: joi.object({
    firstName: joi.string()
      .trim()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required(),
    
    lastName: joi.string()
      .trim()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required(),
    
    email: joi.string()
      .email()
      .lowercase()
      .required(),
    
    phoneNumber: joi.string()
      .pattern(/^\+?[1-9]\d{1,14}$/)
      .required(),
    
    nationalId: joi.string()
      .pattern(/^\d{12}$/)
      .required()
  }),

  passportDetails: joi.object({
    passportNumber: joi.string()
      .pattern(/^[A-Z]\d{7}$/)
      .required(),
    
    issueDate: joi.date()
      .max('now')
      .required(),
    
    expiryDate: joi.date()
      .min(joi.ref('issueDate'))
      .required()
  })
};

export function validateAndSanitize(data, schema) {
  // Validate structure
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    throw new ValidationError(error.details);
  }

  // Sanitize string fields
  const sanitized = {};
  for (const [key, val] of Object.entries(value)) {
    if (typeof val === 'string') {
      sanitized[key] = DOMPurify.sanitize(val.trim());
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized;
}

// API route with validation
export default async function handler(req, res) {
  try {
    const validatedData = validateAndSanitize(
      req.body.personalInfo,
      validationSchemas.personalInfo
    );

    // Process validated data...
    res.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details
      });
    }
    throw error;
  }
}
```

### 3. CSRF Protection

**CSRF Token Implementation**:
```javascript
import { randomBytes } from 'crypto';

class CSRFProtection {
  static generateToken() {
    return randomBytes(32).toString('hex');
  }

  static validateToken(sessionToken, requestToken) {
    return sessionToken && requestToken && sessionToken === requestToken;
  }

  static middleware() {
    return async (req, res, next) => {
      if (req.method === 'GET') {
        // Generate CSRF token for GET requests
        req.session.csrfToken = this.generateToken();
        return next();
      }

      // Validate CSRF token for state-changing requests
      const sessionToken = req.session.csrfToken;
      const requestToken = req.headers['x-csrf-token'] || req.body._csrf;

      if (!this.validateToken(sessionToken, requestToken)) {
        await AuditLogger.log('CSRF_ATTACK_DETECTED', req.session.userId, null, {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
        return res.status(403).json({ error: 'CSRF token validation failed' });
      }

      next();
    };
  }
}
```

---

## 🚨 Security Monitoring & Incident Response

### 1. Security Event Detection

**Automated Threat Detection**:
```javascript
class SecurityMonitor {
  static suspiciousPatterns = [
    {
      name: 'Multiple Failed Logins',
      pattern: (events) => events.filter(e => 
        e.action === 'LOGIN_FAILED' && 
        Date.now() - e.timestamp < 5 * 60 * 1000
      ).length >= 5
    },
    {
      name: 'Unusual Data Access',
      pattern: (events) => events.filter(e => 
        e.action === 'APPLICATION_VIEWED' &&
        Date.now() - e.timestamp < 60 * 60 * 1000
      ).length >= 50
    },
    {
      name: 'Off-Hours Admin Activity',
      pattern: (events) => events.some(e => {
        const hour = new Date(e.timestamp).getHours();
        return e.userRole === 'admin' && (hour < 6 || hour > 22);
      })
    }
  ];

  static async analyzeEvents() {
    const recentEvents = await AuditLog.find({
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.pattern(recentEvents)) {
        await this.triggerAlert(pattern.name, recentEvents);
      }
    }
  }

  static async triggerAlert(patternName, events) {
    const alert = {
      id: randomBytes(16).toString('hex'),
      pattern: patternName,
      timestamp: new Date(),
      events: events.slice(0, 10), // First 10 events
      severity: this.calculateSeverity(patternName),
      status: 'open'
    };

    await SecurityAlert.create(alert);
    await this.sendAlertNotification(alert);
  }

  static calculateSeverity(patternName) {
    const severityMap = {
      'Multiple Failed Logins': 'medium',
      'Unusual Data Access': 'high',
      'Off-Hours Admin Activity': 'low'
    };
    return severityMap[patternName] || 'medium';
  }
}

// Run monitoring every 5 minutes
setInterval(() => {
  SecurityMonitor.analyzeEvents().catch(console.error);
}, 5 * 60 * 1000);
```

### 2. Incident Response Plan

**Automated Response Actions**:
```javascript
class IncidentResponse {
  static async handleSecurityIncident(incident) {
    const { type, severity, userId, details } = incident;

    switch (type) {
      case 'MULTIPLE_FAILED_LOGINS':
        await this.lockUserAccount(userId, '30 minutes');
        break;

      case 'SUSPICIOUS_DATA_ACCESS':
        await this.flagUserForReview(userId);
        await this.notifySecurityTeam(incident);
        break;

      case 'MALWARE_DETECTED':
        await this.quarantineFile(details.filename);
        await this.emergencyAlert(incident);
        break;

      case 'DATA_BREACH_SUSPECTED':
        await this.activateBreachProtocol();
        break;
    }

    // Log incident response
    await AuditLogger.log('INCIDENT_RESPONSE', 'system', type, {
      severity,
      responseActions: this.getResponseActions(type)
    });
  }

  static async activateBreachProtocol() {
    // 1. Immediate containment
    await this.enableMaintenanceMode();
    
    // 2. Notify authorities
    await this.notifyDataProtectionAuthority();
    
    // 3. Alert all users
    await this.sendBreachNotification();
    
    // 4. Begin investigation
    await this.initiateForesicAnalysis();
  }
}
```

---

## 📋 Compliance & Standards

### 1. Data Protection Compliance

**GDPR-like Data Protection**:
```javascript
class DataProtectionCompliance {
  // Right to access
  static async exportUserData(userId) {
    const userData = await User.findById(userId);
    const applications = await Application.find({ userId });
    const auditLogs = await AuditLog.find({ userId });

    return {
      personalData: userData,
      applications: applications,
      activityLog: auditLogs,
      exportedAt: new Date(),
      retention: DATA_RETENTION
    };
  }

  // Right to rectification
  static async updateUserData(userId, updates) {
    const validUpdates = validateAndSanitize(updates, personalDataSchema);
    
    await User.findByIdAndUpdate(userId, validUpdates);
    
    await AuditLogger.log('PERSONAL_DATA_UPDATED', userId, 'user_profile', {
      updatedFields: Object.keys(validUpdates)
    });
  }

  // Right to erasure
  static async deleteUserData(userId, reason) {
    // Check if data can be deleted
    const pendingApplications = await Application.countDocuments({
      userId,
      status: { $in: ['submitted', 'under_review', 'approved'] }
    });

    if (pendingApplications > 0) {
      throw new Error('Cannot delete data with pending applications');
    }

    // Anonymize instead of delete for audit trail
    await this.anonymizeUserData(userId);
    
    await AuditLogger.log('USER_DATA_DELETED', userId, 'user_profile', {
      reason,
      method: 'anonymization'
    });
  }

  static async anonymizeUserData(userId) {
    const anonymizedData = {
      firstName: 'REDACTED',
      lastName: 'REDACTED',
      email: `deleted-${Date.now()}@example.com`,
      phoneNumber: 'REDACTED',
      nationalId: 'REDACTED',
      deletedAt: new Date()
    };

    await User.findByIdAndUpdate(userId, anonymizedData);
  }
}
```

### 2. Government Security Standards

**Sudan Government Compliance**:
```javascript
const GOVERNMENT_STANDARDS = {
  // Password requirements for government systems
  passwordPolicy: {
    minLength: 14,
    complexity: 'high',
    rotationDays: 60,
    historyCount: 10
  },

  // Encryption standards
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotationDays: 90,
    keyManagement: 'HSM' // Hardware Security Module
  },

  // Access controls
  accessControl: {
    maxSessionDuration: 8 * 60 * 60, // 8 hours
    inactivityTimeout: 30 * 60,     // 30 minutes
    concurrentSessions: 1,          // One session per user
    mfaRequired: true
  },

  // Audit requirements
  auditing: {
    logAllAccess: true,
    realTimeMonitoring: true,
    retentionPeriod: 7 * 365,      // 7 years
    integrityValidation: true
  }
};
```

---

## 🔧 Security Testing

### 1. Automated Security Testing

**Security Test Suite**:
```javascript
// Security tests
describe('Security Tests', () => {
  describe('Authentication', () => {
    test('should reject weak passwords', async () => {
      const weakPasswords = ['123456', 'password', 'qwerty'];
      
      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@example.com',
            password: password
          });
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('password');
      }
    });

    test('should implement rate limiting', async () => {
      const requests = Array(10).fill().map(() => 
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Input Validation', () => {
    test('should sanitize XSS attempts', async () => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/applications')
        .send({
          personalInfo: {
            firstName: xssPayload
          }
        });

      expect(response.body.data.personalInfo.firstName)
        .not.toContain('<script>');
    });

    test('should validate file uploads', async () => {
      const maliciousFile = Buffer.from('<?php echo "hack"; ?>');
      
      const response = await request(app)
        .post('/api/uploads')
        .attach('file', maliciousFile, 'malicious.php');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid file type');
    });
  });
});
```

### 2. Penetration Testing Checklist

**Security Assessment Areas**:
- [ ] Authentication bypass attempts
- [ ] Authorization escalation tests
- [ ] Input validation testing (SQL injection, XSS, etc.)
- [ ] File upload security testing
- [ ] Session management testing
- [ ] Rate limiting effectiveness
- [ ] CSRF protection validation
- [ ] Data encryption verification
- [ ] API security testing
- [ ] Infrastructure security assessment

---

## 📞 Security Contacts & Procedures

### Emergency Contacts
- **Security Team**: security@passport.gov.sd
- **IT Administrator**: admin@passport.gov.sd
- **Legal Department**: legal@passport.gov.sd

### Incident Reporting
1. **Immediate**: Call security hotline
2. **Document**: Create incident report
3. **Contain**: Follow containment procedures
4. **Investigate**: Begin forensic analysis
5. **Report**: Notify relevant authorities
6. **Recover**: Implement recovery procedures

### Security Awareness Training
- Monthly security briefings for all staff
- Phishing simulation exercises
- Password security training
- Incident response drills

---

*Security is an ongoing process. This document should be reviewed and updated regularly.*

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Classification**: INTERNAL USE ONLY 