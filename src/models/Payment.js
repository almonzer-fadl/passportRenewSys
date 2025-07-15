import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
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
  
  // Payment Details
  paymentId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: [
      'pending',           // Payment initiated but not completed
      'processing',        // Payment being processed
      'completed',         // Payment successful
      'failed',           // Payment failed
      'cancelled',        // Payment cancelled by user
      'refunded',         // Payment refunded
      'partially_refunded' // Partial refund issued
    ],
    default: 'pending',
    index: true
  },
  
  // Amount Details
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    uppercase: true
  },
  
  // Fee Breakdown
  fees: {
    baseFee: {
      type: Number,
      required: true,
      min: 0
    },
    processingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    expressFee: {
      type: Number,
      default: 0,
      min: 0
    },
    serviceFee: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'mobile_money', 'cash', 'wallet'],
    required: [true, 'Payment method is required']
  },
  
  // Card Details (if applicable)
  cardDetails: {
    last4: String,
    brand: String,
    country: String,
    fingerprint: String
  },
  
  // Payment Gateway Information
  gateway: {
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'local_bank', 'mobile_operator', 'cash'],
      required: true
    },
    transactionId: String,
    gatewayResponse: mongoose.Schema.Types.Mixed,
    gatewayFee: {
      type: Number,
      default: 0
    }
  },
  
  // Stripe Specific Fields
  stripe: {
    paymentIntentId: String,
    clientSecret: String,
    chargeId: String,
    customerId: String,
    setupIntentId: String
  },
  
  // Receipt Information
  receipt: {
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    issuedAt: Date,
    receiptUrl: String,
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: Date
  },
  
  // Refund Information
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: Date,
    gatewayRefundId: String,
    notes: String
  }],
  
  // Verification
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationMethod: {
      type: String,
      enum: ['automatic', 'manual', 'callback']
    },
    verificationNotes: String
  },
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }
  },
  
  // Metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionId: String,
    referrer: String,
    deviceInfo: mongoose.Schema.Types.Mixed
  },
  
  // Reconciliation
  reconciliation: {
    isReconciled: {
      type: Boolean,
      default: false
    },
    reconciledAt: Date,
    reconciledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bankStatement: {
      date: Date,
      amount: Number,
      reference: String
    },
    discrepancy: {
      exists: {
        type: Boolean,
        default: false
      },
      amount: Number,
      notes: String
    }
  },
  
  // Compliance
  compliance: {
    amlChecked: {
      type: Boolean,
      default: false
    },
    amlStatus: {
      type: String,
      enum: ['clear', 'flagged', 'pending'],
      default: 'pending'
    },
    fraudScore: Number,
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low'
    }
  }
}, {
  timestamps: true,
  collection: 'payments'
});

// Indexes
PaymentSchema.index({ applicationId: 1 });
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ paymentId: 1 }, { unique: true });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ 'gateway.provider': 1, 'gateway.transactionId': 1 });
PaymentSchema.index({ 'stripe.paymentIntentId': 1 }, { sparse: true });
PaymentSchema.index({ expiresAt: 1 });
PaymentSchema.index({ 'reconciliation.isReconciled': 1 });

// Virtual for total refunded amount
PaymentSchema.virtual('totalRefunded').get(function() {
  return this.refunds
    .filter(refund => refund.status === 'completed')
    .reduce((total, refund) => total + refund.amount, 0);
});

// Virtual for net amount (after refunds)
PaymentSchema.virtual('netAmount').get(function() {
  return this.amount - this.totalRefunded;
});

// Virtual for is expired
PaymentSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date() && this.status === 'pending';
});

// Virtual for receipt URL
PaymentSchema.virtual('receiptUrl').get(function() {
  if (this.receipt.receiptNumber) {
    return `/api/payments/${this._id}/receipt`;
  }
  return null;
});

// Pre-save middleware
PaymentSchema.pre('save', async function(next) {
  // Generate payment ID if not exists
  if (this.isNew && !this.paymentId) {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const prefix = `PAY${year}${month}`;
    
    // Find the latest payment ID for this month
    const latestPayment = await this.constructor.findOne({
      paymentId: new RegExp(`^${prefix}`)
    }).sort({ paymentId: -1 });
    
    let sequence = 1;
    if (latestPayment) {
      const lastSequence = parseInt(latestPayment.paymentId.replace(prefix, ''));
      sequence = lastSequence + 1;
    }
    
    this.paymentId = `${prefix}${sequence.toString().padStart(6, '0')}`;
  }
  
  // Generate receipt number when payment is completed
  if (this.isModified('status') && this.status === 'completed' && !this.receipt.receiptNumber) {
    const year = new Date().getFullYear();
    const prefix = `RCP${year}`;
    
    const latestReceipt = await this.constructor.findOne({
      'receipt.receiptNumber': new RegExp(`^${prefix}`)
    }).sort({ 'receipt.receiptNumber': -1 });
    
    let sequence = 1;
    if (latestReceipt && latestReceipt.receipt.receiptNumber) {
      const lastSequence = parseInt(latestReceipt.receipt.receiptNumber.replace(prefix, ''));
      sequence = lastSequence + 1;
    }
    
    this.receipt.receiptNumber = `${prefix}${sequence.toString().padStart(8, '0')}`;
    this.receipt.issuedAt = new Date();
  }
  
  // Set completion date when status changes to completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  next();
});

// Method to add refund
PaymentSchema.methods.addRefund = async function(amount, reason, processedBy, notes = '') {
  if (amount > this.netAmount) {
    throw new Error('Refund amount cannot exceed net payment amount');
  }
  
  const refundId = `REF${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
  
  this.refunds.push({
    refundId,
    amount,
    reason,
    processedBy,
    processedAt: new Date(),
    notes,
    status: 'pending'
  });
  
  return this.save();
};

// Method to update refund status
PaymentSchema.methods.updateRefundStatus = async function(refundId, status, gatewayRefundId = null) {
  const refund = this.refunds.find(r => r.refundId === refundId);
  if (!refund) {
    throw new Error('Refund not found');
  }
  
  refund.status = status;
  if (gatewayRefundId) {
    refund.gatewayRefundId = gatewayRefundId;
  }
  
  // Update payment status if fully refunded
  if (status === 'completed' && this.totalRefunded >= this.amount) {
    this.status = 'refunded';
  } else if (status === 'completed' && this.totalRefunded > 0) {
    this.status = 'partially_refunded';
  }
  
  return this.save();
};

// Method to verify payment
PaymentSchema.methods.verifyPayment = async function(verifiedBy, method = 'manual', notes = '') {
  this.verification.isVerified = true;
  this.verification.verifiedBy = verifiedBy;
  this.verification.verifiedAt = new Date();
  this.verification.verificationMethod = method;
  this.verification.verificationNotes = notes;
  
  return this.save();
};

// Method to reconcile payment
PaymentSchema.methods.reconcilePayment = async function(reconciledBy, bankStatement = null, discrepancy = null) {
  this.reconciliation.isReconciled = true;
  this.reconciliation.reconciledAt = new Date();
  this.reconciliation.reconciledBy = reconciledBy;
  
  if (bankStatement) {
    this.reconciliation.bankStatement = bankStatement;
  }
  
  if (discrepancy) {
    this.reconciliation.discrepancy = {
      exists: true,
      ...discrepancy
    };
  }
  
  return this.save();
};

// Static method to find expired payments
PaymentSchema.statics.findExpired = function() {
  return this.find({
    status: 'pending',
    expiresAt: { $lte: new Date() }
  });
};

// Static method to calculate revenue for period
PaymentSchema.statics.getRevenueForPeriod = async function(startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount' },
        totalRefunds: { $sum: { $sum: '$refunds.amount' } },
        paymentCount: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || { totalRevenue: 0, totalRefunds: 0, paymentCount: 0 };
};

// Ensure virtual fields are serialized
PaymentSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive information
    delete ret.gateway.gatewayResponse;
    delete ret.stripe.clientSecret;
    return ret;
  }
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema); 