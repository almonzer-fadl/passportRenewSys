import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  applicationNumber: { type: String, unique: true },
  userId: { type: String, default: 'demo-user' },
  applicationType: { type: String, enum: ['new', 'renewal', 'replacement', 'correction'], required: true },
  processingType: { type: String, enum: ['regular', 'express', 'urgent'], default: 'regular' },
  
  // Personal Information
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fatherName: { type: String },
    grandfatherName: { type: String },
    motherName: { type: String },
    nationalId: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
    profession: { type: String },
    nationality: { type: String, default: 'Sudanese' }
  },

  // Current Passport (for renewal/replacement)
  currentPassport: {
    passportNumber: { type: String },
    issueDate: { type: Date },
    expiryDate: { type: Date },
    issuingOffice: { type: String },
    replacementReason: { type: String, enum: ['lost', 'stolen', 'damaged', 'pages_full'] }
  },

  // Contact Information
  contactInfo: {
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String },
      country: { type: String, required: true }
    },
    alternativePhone: { type: String },
    alternativeEmail: { type: String },
    preferredCommunication: { type: String, enum: ['email', 'sms', 'both'], default: 'email' }
  },

  // Emergency Contact
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String },
    secondaryName: { type: String },
    secondaryRelationship: { type: String },
    secondaryPhone: { type: String },
    secondaryAddress: { type: String }
  },

  // Travel Information
  travelInfo: {
    purposeOfTravel: { type: String, enum: ['tourism', 'business', 'education', 'medical', 'family', 'pilgrimage', 'other'], required: true },
    intendedCountries: [{ type: String }],
    departureDate: { type: Date },
    returnDate: { type: Date },
    additionalNotes: { type: String }
  },

  // Documents
  documents: {
    passportPhoto: { type: String }, // File URL
    passportPhotoValidated: { type: Boolean, default: false },
    identityDocument: { type: String }, // File URL
    citizenshipDocument: { type: String }, // File URL
    supportingDocument: { type: String }, // File URL
    currentPassportCopy: { type: String } // File URL
  },

  // Terms and Conditions
  termsAccepted: {
    accuracy: { type: Boolean, default: false },
    terms: { type: Boolean, default: false },
    biometrics: { type: Boolean, default: false }
  },

  // Application Status
  status: { type: String, enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'], default: 'submitted' },
  submittedAt: { type: Date, default: Date.now },
  
  // Payment (will be handled after pre-approval)
  payment: {
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    required: { type: Boolean, default: true }
  },

  // Review
  review: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    notes: { type: String },
    decision: { type: String }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to generate application number
applicationSchema.pre('save', function(next) {
  if (this.isNew && !this.applicationNumber) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    this.applicationNumber = `SD${year}${month}-${random}`;
  }
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Application || mongoose.model('Application', applicationSchema);
