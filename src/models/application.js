import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationNumber: { type: String, unique: true }, // Auto-generated
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, required: true },
    nationality: { type: String, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: Object, required: true }
  },
  currentPassport: {
    passportNumber: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    issuingOffice: { type: String, required: true }
  },
  documents: {
    passportPhoto: { type: String, required: true }, // File path
    signature: { type: String, required: true },
    facePhoto: { type: String, required: true },
    currentPassportScan: { type: String, required: true }
  },
  validation: {
    faceValidation: {
      passed: { type: Boolean, default: false },
      confidence: { type: Number, default: 0 },
      timestamp: { type: Date }
    },
    documentValidation: {
      passed: { type: Boolean, default: false },
      ocrText: { type: String },
      timestamp: { type: Date }
    }
  },
  status: { type: String, enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'], default: 'draft' },
  payment: {
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    stripePaymentId: { type: String },
    paidAt: { type: Date }
  },
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
