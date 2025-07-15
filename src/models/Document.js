import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  // References
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: [true, 'Application ID is required'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Document Details
  documentType: {
    type: String,
    enum: [
      'passport_photo',
      'passport_scan',
      'national_id_front',
      'national_id_back',
      'birth_certificate',
      'marriage_certificate',
      'divorce_certificate',
      'educational_certificate',
      'employment_letter',
      'bank_statement',
      'travel_itinerary',
      'medical_certificate',
      'criminal_record',
      'other'
    ],
    required: [true, 'Document type is required']
  },
  category: {
    type: String,
    enum: ['required', 'optional', 'additional'],
    default: 'required'
  },
  
  // File Information
  originalName: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },
  filename: {
    type: String,
    required: [true, 'Stored filename is required'],
    unique: true,
    trim: true
  },
  path: {
    type: String,
    required: [true, 'File path is required'],
    trim: true
  },
  mimetype: {
    type: String,
    required: [true, 'MIME type is required'],
    validate: {
      validator: function(value) {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf'
        ];
        return allowedTypes.includes(value);
      },
      message: 'Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.'
    }
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    max: [10485760, 'File size cannot exceed 10MB'] // 10MB
  },
  
  // Security and Validation
  checksum: {
    type: String,
    required: [true, 'File checksum is required']
  },
  encryptionStatus: {
    type: String,
    enum: ['unencrypted', 'encrypted', 'failed'],
    default: 'unencrypted'
  },
  encryptionKey: {
    type: String,
    select: false // Never include in queries
  },
  virusScanStatus: {
    type: String,
    enum: ['pending', 'clean', 'infected', 'failed'],
    default: 'pending'
  },
  virusScanDate: Date,
  
  // Processing Status
  processingStatus: {
    type: String,
    enum: ['uploaded', 'processing', 'processed', 'validated', 'rejected'],
    default: 'uploaded'
  },
  
  // AI/OCR Results
  ocrResults: {
    extractedText: String,
    confidence: Number,
    language: String,
    processedAt: Date,
    extractedData: mongoose.Schema.Types.Mixed // Structured data from document
  },
  
  // Image Analysis (for photos)
  imageAnalysis: {
    dimensions: {
      width: Number,
      height: Number
    },
    colorSpace: String,
    quality: Number,
    faceDetection: {
      facesDetected: Number,
      confidence: Number,
      boundingBoxes: [mongoose.Schema.Types.Mixed],
      analysisDate: Date
    },
    backgroundAnalysis: {
      backgroundColor: String,
      isPlainBackground: Boolean,
      backgroundType: String
    }
  },
  
  // Validation Results
  validation: {
    isValid: {
      type: Boolean,
      default: false
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validatedAt: Date,
    validationNotes: String,
    validationCriteria: [{
      criterion: String,
      passed: Boolean,
      details: String
    }],
    requiresReupload: {
      type: Boolean,
      default: false
    },
    reuploadReason: String
  },
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  isLatestVersion: {
    type: Boolean,
    default: true
  },
  previousVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  
  // Access Control
  accessLevel: {
    type: String,
    enum: ['public', 'restricted', 'confidential', 'secret'],
    default: 'confidential'
  },
  viewableBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['view', 'download', 'edit'],
      default: 'view'
    },
    grantedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Metadata
  exifData: mongoose.Schema.Types.Mixed,
  tags: [String],
  description: String,
  
  // Archival Information
  isArchived: {
    type: Boolean,
    default: false
  },
  archiveDate: Date,
  retentionPeriod: {
    type: Number,
    default: 2555 // 7 years in days
  },
  destructionDate: Date
}, {
  timestamps: true,
  collection: 'documents'
});

// Indexes
DocumentSchema.index({ applicationId: 1, documentType: 1 });
DocumentSchema.index({ userId: 1, createdAt: -1 });
DocumentSchema.index({ filename: 1 }, { unique: true });
DocumentSchema.index({ checksum: 1 });
DocumentSchema.index({ processingStatus: 1 });
DocumentSchema.index({ 'validation.isValid': 1 });
DocumentSchema.index({ isArchived: 1, destructionDate: 1 });

// Virtual for file URL
DocumentSchema.virtual('url').get(function() {
  return `/api/documents/${this._id}/download`;
});

// Virtual for file extension
DocumentSchema.virtual('extension').get(function() {
  return this.originalName.split('.').pop().toLowerCase();
});

// Virtual for human readable size
DocumentSchema.virtual('humanSize').get(function() {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (this.size === 0) return '0 Bytes';
  const i = Math.floor(Math.log(this.size) / Math.log(1024));
  return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Pre-save middleware
DocumentSchema.pre('save', function(next) {
  // Calculate destruction date
  if (this.isNew && !this.destructionDate) {
    this.destructionDate = new Date(Date.now() + (this.retentionPeriod * 24 * 60 * 60 * 1000));
  }
  
  // When archiving, set archive date
  if (this.isModified('isArchived') && this.isArchived && !this.archiveDate) {
    this.archiveDate = new Date();
  }
  
  next();
});

// Method to validate document
DocumentSchema.methods.validateDocument = async function(validatedBy, isValid, notes = '', criteria = []) {
  this.validation.isValid = isValid;
  this.validation.validatedBy = validatedBy;
  this.validation.validatedAt = new Date();
  this.validation.validationNotes = notes;
  this.validation.validationCriteria = criteria;
  
  if (isValid) {
    this.processingStatus = 'validated';
  } else {
    this.processingStatus = 'rejected';
    this.validation.requiresReupload = true;
  }
  
  return this.save();
};

// Method to create new version
DocumentSchema.methods.createNewVersion = async function(newDocumentData) {
  // Mark current version as not latest
  this.isLatestVersion = false;
  await this.save();
  
  // Create new version
  const newVersion = new this.constructor({
    ...newDocumentData,
    version: this.version + 1,
    previousVersionId: this._id,
    applicationId: this.applicationId,
    userId: this.userId,
    documentType: this.documentType
  });
  
  return newVersion.save();
};

// Method to check if document needs reprocessing
DocumentSchema.methods.needsReprocessing = function() {
  return (
    this.processingStatus === 'uploaded' ||
    this.virusScanStatus === 'pending' ||
    (this.documentType === 'passport_photo' && !this.imageAnalysis?.faceDetection) ||
    (!this.ocrResults && ['passport_scan', 'national_id_front', 'national_id_back'].includes(this.documentType))
  );
};

// Static method to find documents by application
DocumentSchema.statics.findByApplication = function(applicationId, documentType = null) {
  const query = { applicationId, isLatestVersion: true };
  if (documentType) {
    query.documentType = documentType;
  }
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to find expired documents
DocumentSchema.statics.findExpired = function() {
  return this.find({
    destructionDate: { $lte: new Date() },
    isArchived: false
  });
};

// Ensure virtual fields are serialized
DocumentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.encryptionKey;
    return ret;
  }
});

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema); 