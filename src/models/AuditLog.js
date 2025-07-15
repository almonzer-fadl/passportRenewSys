import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  // Event Information
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: [
      // Authentication Events
      'user_login',
      'user_logout',
      'user_login_failed',
      'user_locked',
      'user_unlocked',
      'password_changed',
      'password_reset_requested',
      'password_reset_completed',
      'email_verified',
      'two_factor_enabled',
      'two_factor_disabled',
      
      // User Management
      'user_created',
      'user_updated',
      'user_deleted',
      'user_role_changed',
      'user_status_changed',
      
      // Application Events
      'application_created',
      'application_updated',
      'application_submitted',
      'application_status_changed',
      'application_approved',
      'application_rejected',
      'application_cancelled',
      
      // Document Events
      'document_uploaded',
      'document_validated',
      'document_rejected',
      'document_deleted',
      'document_downloaded',
      
      // Payment Events
      'payment_initiated',
      'payment_completed',
      'payment_failed',
      'payment_refunded',
      'payment_verified',
      
      // Administrative Events
      'admin_access',
      'settings_changed',
      'system_backup',
      'system_maintenance',
      'data_export',
      'data_import',
      
      // Security Events
      'security_alert',
      'unauthorized_access',
      'data_breach_detected',
      'malware_detected',
      'suspicious_activity',
      
      // API Events
      'api_call',
      'api_error',
      'rate_limit_exceeded',
      
      // AI/Validation Events
      'ai_validation_completed',
      'face_recognition_performed',
      'document_ocr_processed',
      
      // Other
      'other'
    ],
    index: true
  },
  
  // Actor Information
  actor: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    userEmail: String,
    userRole: String,
    actorType: {
      type: String,
      enum: ['user', 'admin', 'system', 'api', 'anonymous'],
      default: 'user'
    },
    impersonating: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      userEmail: String
    }
  },
  
  // Target Information
  target: {
    resourceType: {
      type: String,
      enum: ['user', 'application', 'document', 'payment', 'system', 'api', 'setting'],
      index: true
    },
    resourceId: {
      type: String,
      index: true
    },
    resourceName: String,
    applicationNumber: String,
    documentType: String
  },
  
  // Event Details
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Result Information
  result: {
    type: String,
    enum: ['success', 'failure', 'warning', 'info'],
    default: 'success',
    index: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
    index: true
  },
  
  // Change Information
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    fieldsChanged: [String]
  },
  
  // Request Information
  request: {
    method: String,
    url: String,
    endpoint: String,
    headers: mongoose.Schema.Types.Mixed,
    body: mongoose.Schema.Types.Mixed,
    queryParams: mongoose.Schema.Types.Mixed,
    userAgent: String,
    ipAddress: {
      type: String,
      index: true
    },
    sessionId: String,
    requestId: String
  },
  
  // Response Information
  response: {
    statusCode: Number,
    responseTime: Number, // in milliseconds
    responseSize: Number, // in bytes
    errorMessage: String,
    errorCode: String,
    errorStack: String
  },
  
  // Geographic Information
  location: {
    country: String,
    region: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    timezone: String
  },
  
  // Device Information
  device: {
    type: String,
    browser: String,
    browserVersion: String,
    os: String,
    osVersion: String,
    mobile: Boolean,
    fingerprint: String
  },
  
  // Security Context
  security: {
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    threats: [String],
    anomalyScore: Number,
    flagged: {
      type: Boolean,
      default: false
    },
    investigationStatus: {
      type: String,
      enum: ['none', 'pending', 'investigating', 'resolved', 'dismissed'],
      default: 'none'
    }
  },
  
  // Compliance and Legal
  compliance: {
    gdprRelevant: {
      type: Boolean,
      default: false
    },
    personalDataAccessed: {
      type: Boolean,
      default: false
    },
    legalBasis: String,
    retentionPeriod: Number, // in days
    anonymized: {
      type: Boolean,
      default: false
    }
  },
  
  // Additional Metadata
  metadata: {
    correlationId: String,
    traceId: String,
    spanId: String,
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed
  },
  
  // System Information
  system: {
    hostname: String,
    applicationVersion: String,
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'production'
    },
    serviceId: String
  },
  
  // Processing Information
  processed: {
    type: Boolean,
    default: false
  },
  processedAt: Date,
  alertsSent: [{
    alertType: String,
    recipient: String,
    sentAt: Date,
    success: Boolean
  }]
}, {
  timestamps: true,
  collection: 'audit_logs'
});

// Indexes for performance and querying
AuditLogSchema.index({ eventType: 1, createdAt: -1 });
AuditLogSchema.index({ 'actor.userId': 1, createdAt: -1 });
AuditLogSchema.index({ 'target.resourceType': 1, 'target.resourceId': 1 });
AuditLogSchema.index({ 'request.ipAddress': 1, createdAt: -1 });
AuditLogSchema.index({ result: 1, severity: 1 });
AuditLogSchema.index({ 'security.flagged': 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 }); // For pagination
AuditLogSchema.index({ 'metadata.correlationId': 1 });
AuditLogSchema.index({ 'target.applicationNumber': 1 }, { sparse: true });

// TTL index for automatic cleanup (optional - based on retention policy)
AuditLogSchema.index({ createdAt: 1 }, { 
  expireAfterSeconds: 60 * 60 * 24 * 2555 // 7 years
});

// Virtual for human-readable timestamp
AuditLogSchema.virtual('humanTimestamp').get(function() {
  return this.createdAt.toLocaleString();
});

// Virtual for anonymized description
AuditLogSchema.virtual('safeDescription').get(function() {
  if (this.compliance.anonymized) {
    return '[ANONYMIZED]';
  }
  return this.description;
});

// Pre-save middleware
AuditLogSchema.pre('save', function(next) {
  // Set processing timestamp
  if (this.isModified('processed') && this.processed && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  // Auto-flag high-risk events
  if (this.severity === 'critical' || this.security.riskScore >= 80) {
    this.security.flagged = true;
  }
  
  // Set retention period based on event type
  if (this.isNew && !this.compliance.retentionPeriod) {
    const highRetentionEvents = [
      'user_login_failed', 'unauthorized_access', 'data_breach_detected',
      'malware_detected', 'suspicious_activity', 'security_alert'
    ];
    
    this.compliance.retentionPeriod = highRetentionEvents.includes(this.eventType) 
      ? 2555  // 7 years for security events
      : 1095; // 3 years for other events
  }
  
  next();
});

// Static method to create audit log entry
AuditLogSchema.statics.createAuditLog = async function(logData) {
  try {
    const auditLog = new this(logData);
    return await auditLog.save();
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to prevent breaking the main operation
    return null;
  }
};

// Static method to log user action
AuditLogSchema.statics.logUserAction = async function(
  eventType, 
  userId, 
  description, 
  target = {}, 
  request = {},
  additionalData = {}
) {
  return this.createAuditLog({
    eventType,
    actor: {
      userId,
      actorType: 'user'
    },
    target,
    description,
    request,
    ...additionalData
  });
};

// Static method to log system event
AuditLogSchema.statics.logSystemEvent = async function(
  eventType, 
  description, 
  target = {}, 
  severity = 'low',
  additionalData = {}
) {
  return this.createAuditLog({
    eventType,
    actor: {
      actorType: 'system'
    },
    target,
    description,
    severity,
    ...additionalData
  });
};

// Static method to log security event
AuditLogSchema.statics.logSecurityEvent = async function(
  eventType, 
  description, 
  request = {},
  severity = 'high',
  riskScore = 50
) {
  return this.createAuditLog({
    eventType,
    actor: {
      actorType: 'system'
    },
    description,
    severity,
    request,
    security: {
      riskScore,
      flagged: riskScore >= 70
    }
  });
};

// Static method to find suspicious activities
AuditLogSchema.statics.findSuspiciousActivities = function(timeRange = 24) {
  const since = new Date(Date.now() - (timeRange * 60 * 60 * 1000));
  
  return this.find({
    createdAt: { $gte: since },
    $or: [
      { 'security.flagged': true },
      { severity: { $in: ['high', 'critical'] } },
      { result: 'failure', eventType: { $regex: 'login|access' } }
    ]
  }).sort({ createdAt: -1 });
};

// Static method to get user activity summary
AuditLogSchema.statics.getUserActivitySummary = async function(userId, days = 30) {
  const since = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  
  return this.aggregate([
    {
      $match: {
        'actor.userId': new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: since }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        lastActivity: { $max: '$createdAt' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Static method to anonymize old logs (GDPR compliance)
AuditLogSchema.statics.anonymizeOldLogs = async function(userId, olderThanDays = 2555) {
  const cutoffDate = new Date(Date.now() - (olderThanDays * 24 * 60 * 60 * 1000));
  
  return this.updateMany(
    {
      'actor.userId': userId,
      createdAt: { $lt: cutoffDate },
      'compliance.anonymized': false
    },
    {
      $set: {
        'compliance.anonymized': true,
        'actor.userEmail': '[ANONYMIZED]',
        'request.headers': {},
        'request.body': {},
        description: '[ANONYMIZED]'
      }
    }
  );
};

// Ensure virtual fields are serialized
AuditLogSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive data from JSON output
    if (ret.request?.headers?.authorization) {
      ret.request.headers.authorization = '[REDACTED]';
    }
    if (ret.response?.errorStack) {
      delete ret.response.errorStack;
    }
    return ret;
  }
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema); 