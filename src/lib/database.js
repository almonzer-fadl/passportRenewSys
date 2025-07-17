import Database from 'better-sqlite3';
import path from 'path';
import { readFileSync, existsSync } from 'fs';

// Database file path
const dbPath = path.join(process.cwd(), 'passport_system.db');

// Create database connection
let db;

function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize database schema if it doesn't exist
    initializeDatabase();
    
    console.log('✅ Connected to SQLite database');
  }
  
  return db;
}

function initializeDatabase() {
  // Check if tables exist by trying to query users table
  try {
    db.prepare('SELECT COUNT(*) FROM users').get();
    console.log('📊 Database tables already exist');
    return;
  } catch (error) {
    // Tables don't exist, create them
    console.log('🏗️ Creating database tables...');
    createTables();
    console.log('✅ Database tables created successfully');
  }
}

function createTables() {
  // Users table
  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      middle_name TEXT,
      last_name TEXT NOT NULL,
      father_name TEXT,
      grandfather_name TEXT,
      mother_name TEXT,
      date_of_birth DATE NOT NULL,
      place_of_birth TEXT NOT NULL,
      nationality TEXT NOT NULL DEFAULT 'Sudanese',
      gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
      marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
      national_id TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      postal_code TEXT,
      country TEXT NOT NULL DEFAULT 'Sudan',
      emergency_contact_name TEXT,
      emergency_contact_relationship TEXT,
      emergency_contact_phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Applications table
  db.exec(`
    CREATE TABLE applications (
      id TEXT PRIMARY KEY,
      application_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      application_type TEXT NOT NULL CHECK (application_type IN ('new', 'renewal', 'replacement', 'correction')),
      processing_speed TEXT NOT NULL DEFAULT 'regular' CHECK (processing_speed IN ('regular', 'express')),
      
      -- Current passport info (for renewals/replacements)
      current_passport_number TEXT,
      current_passport_issue_date DATE,
      current_passport_expiry_date DATE,
      current_passport_issuing_office TEXT,
      current_passport_status TEXT CHECK (current_passport_status IN ('valid', 'expired', 'lost', 'stolen', 'damaged')),
      replacement_reason TEXT,
      
      -- Travel information
      travel_purpose TEXT,
      travel_countries TEXT, -- JSON array
      travel_departure_date DATE,
      travel_return_date DATE,
      
      -- Application status
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed')),
      submitted_at DATETIME,
      reviewed_at DATETIME,
      reviewed_by TEXT,
      notes TEXT,
      
      -- Fees
      base_fee DECIMAL(10,2) DEFAULT 150.00,
      express_fee DECIMAL(10,2) DEFAULT 0.00,
      service_fee DECIMAL(10,2) DEFAULT 25.00,
      total_fee DECIMAL(10,2) NOT NULL,
      
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Documents table
  db.exec(`
    CREATE TABLE documents (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      size INTEGER NOT NULL,
      document_type TEXT NOT NULL CHECK (document_type IN ('photo', 'current_passport', 'birth_certificate', 'national_id', 'proof_of_address', 'other')),
      file_path TEXT NOT NULL,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      -- AI validation results
      ai_validated BOOLEAN DEFAULT FALSE,
      ai_validation_score DECIMAL(3,2),
      ai_validation_notes TEXT,
      validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'approved', 'rejected')),
      
      FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
    )
  `);

  // Payments table
  db.exec(`
    CREATE TABLE payments (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      payment_id TEXT UNIQUE NOT NULL,
      stripe_payment_intent_id TEXT,
      amount DECIMAL(10,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      payment_method TEXT,
      transaction_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE
    )
  `);

  // Audit logs table
  db.exec(`
    CREATE TABLE audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      ip_address TEXT,
      user_agent TEXT,
      details TEXT, -- JSON
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX idx_users_email ON users (email);
    CREATE INDEX idx_users_national_id ON users (national_id);
    CREATE INDEX idx_applications_user_id ON applications (user_id);
    CREATE INDEX idx_applications_number ON applications (application_number);
    CREATE INDEX idx_applications_status ON applications (status);
    CREATE INDEX idx_documents_application_id ON documents (application_id);
    CREATE INDEX idx_payments_application_id ON payments (application_id);
    CREATE INDEX idx_audit_logs_user_id ON audit_logs (user_id);
    CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp);
  `);
}

// Helper function to generate unique IDs
export function generateId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Helper function to get current timestamp
export function getCurrentTimestamp() {
  return new Date().toISOString();
}

export default getDatabase; 