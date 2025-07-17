import getDatabase, { generateId, getCurrentTimestamp } from '../lib/database.js';

const db = getDatabase();

// Application operations
export const Application = {
  // Create a new application
  create: (applicationData) => {
    const id = generateId();
    const applicationNumber = ensureUniqueApplicationNumber();
    
    const stmt = db.prepare(`
      INSERT INTO applications (
        id, application_number, user_id, application_type, processing_speed,
        current_passport_number, current_passport_issue_date, current_passport_expiry_date,
        current_passport_issuing_office, current_passport_status, replacement_reason,
        travel_purpose, travel_countries, travel_departure_date, travel_return_date,
        status, base_fee, express_fee, service_fee, total_fee,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      const expressFeeCost = applicationData.processingSpeed === 'express' ? 75.00 : 0.00;
      const totalFee = 150.00 + expressFeeCost + 25.00; // base + express + service

      stmt.run(
        id,
        applicationNumber,
        applicationData.userId,
        applicationData.applicationType,
        applicationData.processingSpeed || 'regular',
        applicationData.currentPassportNumber || null,
        applicationData.currentPassportIssueDate || null,
        applicationData.currentPassportExpiryDate || null,
        applicationData.currentPassportIssuingOffice || null,
        applicationData.currentPassportStatus || null,
        applicationData.replacementReason || null,
        applicationData.travelPurpose || null,
        applicationData.travelCountries ? JSON.stringify(applicationData.travelCountries) : null,
        applicationData.travelDepartureDate || null,
        applicationData.travelReturnDate || null,
        'draft',
        150.00,
        expressFeeCost,
        25.00,
        totalFee,
        getCurrentTimestamp(),
        getCurrentTimestamp()
      );

      return Application.findById(id);
    } catch (error) {
      throw error;
    }
  },

  // Find application by ID
  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM applications WHERE id = ?');
    const application = stmt.get(id);
    return application ? formatApplication(application) : null;
  },

  // Find application by application number
  findByNumber: (applicationNumber) => {
    const stmt = db.prepare('SELECT * FROM applications WHERE application_number = ?');
    const application = stmt.get(applicationNumber);
    return application ? formatApplication(application) : null;
  },

  // Find applications by user ID
  findByUserId: (userId, options = {}) => {
    const { page = 1, limit = 10, status = null } = options;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM applications WHERE user_id = ?';
    const params = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const applications = stmt.all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM applications WHERE user_id = ?';
    const countParams = [userId];
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const countStmt = db.prepare(countQuery);
    const { total } = countStmt.get(...countParams);

    return {
      applications: applications.map(formatApplication),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Update application
  update: (id, updateData) => {
    const allowedFields = [
      'application_type', 'processing_speed', 'current_passport_number',
      'current_passport_issue_date', 'current_passport_expiry_date',
      'current_passport_issuing_office', 'current_passport_status',
      'replacement_reason', 'travel_purpose', 'travel_countries',
      'travel_departure_date', 'travel_return_date', 'status',
      'submitted_at', 'reviewed_at', 'reviewed_by', 'notes'
    ];

    const updates = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      const dbField = camelToSnake(key);
      if (allowedFields.includes(dbField)) {
        updates.push(`${dbField} = ?`);
        let value = updateData[key];
        
        // Handle JSON fields
        if (key === 'travelCountries' && Array.isArray(value)) {
          value = JSON.stringify(value);
        }
        
        values.push(value);
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Update fees if processing speed changed
    if (updateData.processingSpeed) {
      const expressFeeCost = updateData.processingSpeed === 'express' ? 75.00 : 0.00;
      const totalFee = 150.00 + expressFeeCost + 25.00;
      
      updates.push('express_fee = ?', 'total_fee = ?');
      values.push(expressFeeCost, totalFee);
    }

    updates.push('updated_at = ?');
    values.push(getCurrentTimestamp());
    values.push(id);

    const stmt = db.prepare(`
      UPDATE applications 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `);

    const result = stmt.run(...values);
    if (result.changes === 0) {
      throw new Error('Application not found');
    }

    return Application.findById(id);
  },

  // Submit application
  submit: (id) => {
    const stmt = db.prepare(`
      UPDATE applications 
      SET status = 'submitted', submitted_at = ?, updated_at = ? 
      WHERE id = ? AND status = 'draft'
    `);
    
    const timestamp = getCurrentTimestamp();
    const result = stmt.run(timestamp, timestamp, id);
    
    if (result.changes === 0) {
      throw new Error('Application not found or already submitted');
    }
    
    return Application.findById(id);
  },

  // Delete application
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM applications WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  // List all applications (admin)
  list: (options = {}) => {
    const { page = 1, limit = 10, status = null, search = '' } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, u.first_name, u.last_name, u.email, u.national_id
      FROM applications a
      JOIN users u ON a.user_id = u.id
    `;
    const params = [];

    const conditions = [];
    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }

    if (search) {
      conditions.push(`(
        a.application_number LIKE ? OR 
        u.first_name LIKE ? OR 
        u.last_name LIKE ? OR 
        u.email LIKE ? OR 
        u.national_id LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = db.prepare(query);
    const applications = stmt.all(...params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM applications a JOIN users u ON a.user_id = u.id';
    const countParams = [];
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
      // Add the same search parameters for count query
      if (status) countParams.push(status);
      if (search) {
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
    }

    const countStmt = db.prepare(countQuery);
    const { total } = countStmt.get(...countParams);

    return {
      applications: applications.map(formatApplication),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Get application statistics
  getStats: () => {
    const stmt = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM applications 
      GROUP BY status
    `);
    
    const stats = stmt.all();
    
    const totalStmt = db.prepare('SELECT COUNT(*) as total FROM applications');
    const { total } = totalStmt.get();
    
    return {
      total,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat.count;
        return acc;
      }, {})
    };
  }
};

// Helper function to generate unique application number
function generateApplicationNumber() {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PSP${year}${timestamp}${random}`;
}

// Helper function to ensure unique application number
function ensureUniqueApplicationNumber() {
  let applicationNumber;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    applicationNumber = generateApplicationNumber();
    attempts++;
    
    // Check if this number already exists
    const existing = Application.findByNumber(applicationNumber);
    if (!existing) {
      return applicationNumber;
    }
  } while (attempts < maxAttempts);
  
  // If we've tried too many times, add a timestamp to ensure uniqueness
  return `${generateApplicationNumber()}_${Date.now()}`;
}

// Helper function to format application data
function formatApplication(application) {
  if (!application) return null;

  return {
    id: application.id,
    applicationNumber: application.application_number,
    userId: application.user_id,
    applicationType: application.application_type,
    processingSpeed: application.processing_speed,
    currentPassportNumber: application.current_passport_number,
    currentPassportIssueDate: application.current_passport_issue_date,
    currentPassportExpiryDate: application.current_passport_expiry_date,
    currentPassportIssuingOffice: application.current_passport_issuing_office,
    currentPassportStatus: application.current_passport_status,
    replacementReason: application.replacement_reason,
    travelPurpose: application.travel_purpose,
    travelCountries: application.travel_countries ? JSON.parse(application.travel_countries) : null,
    travelDepartureDate: application.travel_departure_date,
    travelReturnDate: application.travel_return_date,
    status: application.status,
    submittedAt: application.submitted_at,
    reviewedAt: application.reviewed_at,
    reviewedBy: application.reviewed_by,
    notes: application.notes,
    baseFee: application.base_fee,
    expressFee: application.express_fee,
    serviceFee: application.service_fee,
    totalFee: application.total_fee,
    createdAt: application.created_at,
    updatedAt: application.updated_at,
    // Include user data if joined
    user: application.first_name ? {
      firstName: application.first_name,
      lastName: application.last_name,
      email: application.email,
      nationalId: application.national_id
    } : null
  };
}

// Helper function to convert camelCase to snake_case
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export default Application; 