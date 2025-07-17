#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Set up path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Change to project root
process.chdir(join(__dirname, '..'));

// Import our models
import getDatabase from '../src/lib/database.js';
import { User } from '../src/models/User.js';
import { createAuditLog } from '../src/lib/auditLog.js';

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing SQLite database...');
    
    // Initialize database connection (this will create tables if they don't exist)
    const db = getDatabase();
    
    console.log('✅ Database connected and tables created');
    
    // Check if demo user already exists
    const existingUser = User.findByEmail('demo@passport.gov.sd');
    
    if (existingUser) {
      console.log('👤 Demo user already exists');
      console.log(`   Email: demo@passport.gov.sd`);
      console.log(`   Password: Demo123456!`);
      console.log(`   Name: ${existingUser.firstName} ${existingUser.lastName}`);
      return;
    }
    
    // Create demo user
    console.log('👤 Creating demo user...');
    
    const demoUser = await User.create({
      email: 'demo@passport.gov.sd',
      password: 'Demo123456!',
      firstName: 'Ahmed',
      middleName: 'Mohammed',
      lastName: 'Al-Sudani',
      fatherName: 'Mohammed',
      grandfatherName: 'Abdullah',
      motherName: 'Fatima Ibrahim',
      dateOfBirth: '1985-03-15',
      placeOfBirth: 'Khartoum',
      nationality: 'Sudanese',
      gender: 'male',
      maritalStatus: 'married',
      nationalId: '1234567890',
      phone: '+249123456789',
      address: 'Street 40, Block 12, Al-Riyadh',
      city: 'Khartoum',
      state: 'Khartoum',
      postalCode: '11111',
      country: 'Sudan',
      emergencyContactName: 'Sarah Al-Sudani',
      emergencyContactRelationship: 'spouse',
      emergencyContactPhone: '+249987654321'
    });
    
    // Log the user creation
    await createAuditLog({
      userId: demoUser.id,
      action: 'USER_CREATED',
      resourceType: 'user',
      resourceId: demoUser.id,
      details: { 
        email: demoUser.email,
        created_by: 'system',
        user_type: 'demo'
      }
    });
    
    console.log('✅ Demo user created successfully!');
    console.log('');
    console.log('🔐 Demo Login Credentials:');
    console.log(`   Email: demo@passport.gov.sd`);
    console.log(`   Password: Demo123456!`);
    console.log('');
    console.log('👤 User Details:');
    console.log(`   Name: ${demoUser.firstName} ${demoUser.lastName}`);
    console.log(`   National ID: ${demoUser.nationalId}`);
    console.log(`   Phone: ${demoUser.phone}`);
    console.log(`   Address: ${demoUser.address}, ${demoUser.city}, ${demoUser.state}`);
    console.log('');
    console.log('🌐 You can now:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Visit http://localhost:3000');
    console.log('   3. Click "Login" and use the demo credentials');
    console.log('   4. Access the dashboard and passport application form');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase(); 