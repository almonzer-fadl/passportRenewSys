// Database Models Export
import User from './User.js';
import Application from './Application.js';
import Document from './Document.js';
import Payment from './Payment.js';
import AuditLog from './AuditLog.js';

// Export all models
export {
  User,
  Application,
  Document,
  Payment,
  AuditLog
};

// Default export for convenience
const models = {
  User,
  Application,
  Document,
  Payment,
  AuditLog
};

export default models; 