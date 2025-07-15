const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection string - you may need to set this manually
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/passportrenew';

// User Schema (simplified version for the script)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  nationalId: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String },
    country: { type: String, default: 'Sudan' }
  },
  role: { type: String, enum: ['citizen', 'admin', 'staff', 'super_admin'], default: 'citizen' },
  status: { type: String, enum: ['pending', 'active', 'suspended', 'blocked'], default: 'pending' },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
}, {
  timestamps: true,
  collection: 'users'
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', UserSchema);

async function createDemoUser() {
  try {
    console.log('🚀 Starting demo user creation...');
    console.log('🔗 Connecting to MongoDB:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Connect to database
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to database');

    // Check if demo user already exists
    const existingUser = await User.findOne({ 
      email: 'demo@passport.gov.sd' 
    });

    if (existingUser) {
      console.log('⚠️  Demo user already exists with email: demo@passport.gov.sd');
      console.log('ℹ️  User details:');
      console.log(`   - Name: ${existingUser.firstName} ${existingUser.lastName}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - Status: ${existingUser.status}`);
      console.log(`   - Role: ${existingUser.role}`);
      console.log(`   - National ID: ${existingUser.nationalId}`);
      return;
    }

    // Create demo user with all required fields
    const demoUser = new User({
      email: 'demo@passport.gov.sd',
      password: 'Demo123456!', // Will be hashed by pre-save middleware
      firstName: 'Ahmed',
      lastName: 'Al-Sudani',
      nationalId: '1234567890', // Sudan format: 10 digits
      phoneNumber: '+249123456789', // Sudan format
      dateOfBirth: new Date('1990-01-15'), // Over 18 years old
      address: {
        street: '123 Nile Avenue',
        city: 'Khartoum',
        state: 'Khartoum State',
        postalCode: '11111',
        country: 'Sudan'
      },
      role: 'citizen',
      status: 'active', // Set to active so user can login immediately
      emailVerified: true, // Skip email verification for demo
      phoneVerified: true // Skip phone verification for demo
    });

    // Save the user (password will be automatically hashed)
    await demoUser.save();
    console.log('✅ Demo user created successfully!');

    console.log('📋 Demo User Credentials:');
    console.log('   Email: demo@passport.gov.sd');
    console.log('   Password: Demo123456!');
    console.log('');
    console.log('📋 User Details:');
    console.log(`   Name: ${demoUser.firstName} ${demoUser.lastName}`);
    console.log(`   National ID: ${demoUser.nationalId}`);
    console.log(`   Phone: ${demoUser.phoneNumber}`);
    console.log(`   Role: ${demoUser.role}`);
    console.log(`   Status: ${demoUser.status}`);
    console.log('');
    console.log('🎉 You can now login to the application with these credentials!');

  } catch (error) {
    console.error('❌ Error creating demo user:', error.message);
    
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      console.error(`   Duplicate ${field}: ${value} already exists in database`);
    } else if (error.errors) {
      // Validation errors
      console.error('   Validation errors:');
      Object.keys(error.errors).forEach(field => {
        console.error(`   - ${field}: ${error.errors[field].message}`);
      });
    }
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
createDemoUser(); 