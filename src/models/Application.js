import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  // Reference to user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  
  // Application Details
  applicationNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  applicationType: {
    type: String,
    enum: ['renewal', 'new', 'replacement', 'correction'],
    default: 'renewal',
    required: true
  },
  processingType: {
    type: String,
    enum: ['regular', 'express'],
    default: 'regular',
    required: true
  },
  
  // Current Passport Information
  currentPassport: {
    passportNumber: {
      type: String,
      required: [true, 'Current passport number is required'],
      trim: true,
      match: [/^[A-Z]{2}[0-9]{7}$/, 'Passport number must be in format AB1234567']
    },
    issueDate: {
      type: Date,
      required: [true, 'Passport issue date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Passport expiry date is required']
    },
    issuingOffice: {
      type: String,
      required: [true, 'Issuing office is required'],
      trim: true
    }
  },
  
  // Personal Information (at time of application)
  personalInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    grandfatherName: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    nationalId: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, required: true, trim: true },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed'],
      required: true
    },
    profession: { type: String, required: true, trim: true },
    nationality: { type: String, default: 'Sudanese', trim: true }
  },
  
  // Contact Information
  contactInfo: {
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, default: 'Sudan', trim: true }
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true }
  },
  
  // Travel Information
  travelInfo: {
    purposeOfTravel: {
      type: String,
      enum: ['tourism', 'business', 'education', 'medical', 'family', 'pilgrimage', 'other'],
      required: true
    },
    intendedCountries: [{ type: String, trim: true }],
    departureDate: Date,
    returnDate: Date
  },
  
  // Application Status
  status: {
    type: String,
    enum: [
      'draft',           // User is filling the form
      'submitted',       // Application submitted, awaiting documents
      'documents_uploaded', // All documents uploaded, awaiting review
      'under_review',    // Being reviewed by staff
      'pending_payment', // Approved, waiting for payment
      'payment_confirmed', // Payment received, processing
      'in_processing',   // Being processed
      'ready_for_collection', // Passport ready
      'completed',       // Passport collected
      'rejected',        // Application rejected
      'cancelled'        // Application cancelled
    ],
    default: 'draft',
    index: true
  },
  
  // Review Information
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String,
    requiresAdditionalDocuments: {
      type: Boolean,
      default: false
    },
    additionalDocumentsRequired: [String],
    approvalLevel: {
      type: String,
      enum: ['staff', 'supervisor', 'manager'],
      default: 'staff'
    }
  },
  
  // Payment Information
  payment: {
    amount: {
      type: Number,
      required: function() {
        return ['pending_payment', 'payment_confirmed', 'in_processing', 'ready_for_collection', 'completed'].includes(this.status);
      }
    },
    currency: {
      type: String,
      default: 'USD'
    },
    method: {
      type: String,
      enum: ['card', 'bank_transfer', 'cash', 'mobile_money']
    },
    transactionId: String,
    paidAt: Date,
    stripePaymentIntentId: String
  },
  
  // Processing Information
  processing: {
    expectedCompletionDate: Date,
    actualCompletionDate: Date,
    processingOffice: String,
    collectionOffice: String,
    trackingNumber: String,
    priority: {
      type: String,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal'
    }
  },
  
  // AI Validation Results
  aiValidation: {
    faceRecognition: {
      confidence: Number,
      verified: Boolean,
      timestamp: Date,
      model: String
    },
    documentValidation: {
      passportScan: {
        confidence: Number,
        extractedData: mongoose.Schema.Types.Mixed,
        verified: Boolean,
        timestamp: Date
      },
      nationalIdScan: {
        confidence: Number,
        extractedData: mongoose.Schema.Types.Mixed,
        verified: Boolean,
        timestamp: Date
      }
    },
    photoValidation: {
      qualityScore: Number,
      backgroundCheck: Boolean,
      faceDetected: Boolean,
      meetsCriteria: Boolean,
      timestamp: Date
    }
  },
  
  // Submission and Completion Dates
  submittedAt: Date,
  completedAt: Date,
  
  // Notes and Comments
  notes: [{
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['general', 'review', 'processing', 'collection'],
      default: 'general'
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // System Fields
  applicationVersion: {
    type: Number,
    default: 1
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'applications'
});

// Indexes
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ applicationNumber: 1 });
ApplicationSchema.index({ status: 1, createdAt: -1 });
ApplicationSchema.index({ 'currentPassport.passportNumber': 1 });
ApplicationSchema.index({ 'personalInfo.nationalId': 1 });
ApplicationSchema.index({ submittedAt: -1 });

// Virtual for days since submission
ApplicationSchema.virtual('daysSinceSubmission').get(function() {
  if (!this.submittedAt) return null;
  return Math.floor((new Date() - this.submittedAt) / (1000 * 60 * 60 * 24));
});

// Virtual for processing time
ApplicationSchema.virtual('processingDays').get(function() {
  const startDate = this.submittedAt;
  const endDate = this.completedAt || new Date();
  if (!startDate) return null;
  return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
});

// Virtual for full name
ApplicationSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Pre-save middleware to generate application number
ApplicationSchema.pre('save', async function(next) {
  if (this.isNew && !this.applicationNumber) {
    const year = new Date().getFullYear();
    const prefix = `PRS${year}`;
    
    // Find the latest application number for this year
    const latestApp = await this.constructor.findOne({
      applicationNumber: new RegExp(`^${prefix}`)
    }).sort({ applicationNumber: -1 });
    
    let sequence = 1;
    if (latestApp) {
      const lastSequence = parseInt(latestApp.applicationNumber.replace(prefix, ''));
      sequence = lastSequence + 1;
    }
    
    this.applicationNumber = `${prefix}${sequence.toString().padStart(6, '0')}`;
  }
  
  // Set submission date when status changes to submitted
  if (this.isModified('status') && this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = new Date();
  }
  
  // Set completion date when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
    this.processing.actualCompletionDate = new Date();
  }
  
  // Calculate expected completion date based on processing type
  if (this.isModified('processingType') || this.isModified('submittedAt')) {
    if (this.submittedAt) {
      const processingDays = this.processingType === 'express' ? 
        parseInt(process.env.GOV_PROCESSING_DAYS_EXPRESS) || 7 :
        parseInt(process.env.GOV_PROCESSING_DAYS_REGULAR) || 14;
      
      this.processing.expectedCompletionDate = new Date(
        this.submittedAt.getTime() + (processingDays * 24 * 60 * 60 * 1000)
      );
    }
  }
  
  next();
});

// Method to add a note
ApplicationSchema.methods.addNote = function(content, addedBy, type = 'general', isInternal = false) {
  this.notes.push({
    content,
    addedBy,
    type,
    isInternal,
    addedAt: new Date()
  });
  return this.save();
};

// Method to update status with validation
ApplicationSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
  const validTransitions = {
    'draft': ['submitted', 'cancelled'],
    'submitted': ['documents_uploaded', 'rejected', 'cancelled'],
    'documents_uploaded': ['under_review', 'rejected'],
    'under_review': ['pending_payment', 'documents_uploaded', 'rejected'],
    'pending_payment': ['payment_confirmed', 'rejected', 'cancelled'],
    'payment_confirmed': ['in_processing'],
    'in_processing': ['ready_for_collection', 'rejected'],
    'ready_for_collection': ['completed'],
    'completed': [],
    'rejected': ['under_review'], // Allow re-review
    'cancelled': []
  };
  
  if (!validTransitions[this.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${this.status} to ${newStatus}`);
  }
  
  this.status = newStatus;
  this.lastModifiedBy = updatedBy;
  
  if (notes) {
    this.addNote(notes, updatedBy, 'general', false);
  }
  
  return this.save();
};

// Ensure virtual fields are serialized
ApplicationSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    return ret;
  }
});

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema); 