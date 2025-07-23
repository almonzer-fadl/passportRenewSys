# Sudan Passport Renewal System - Setup Guide

## 🚀 Quick Start (Development)

### Prerequisites
- **Node.js** 18+ installed
- **MongoDB** 6+ (local installation or MongoDB Atlas account)
- **Git** for version control

### 1. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/passport-renewal-dev
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/passport-renewal-dev

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-secret-key-here

# File Upload Settings
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,application/pdf

# Email Configuration (Optional for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="Sudan Passport System <noreply@passport.gov.sd>"

# Payment Integration (Stripe)
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# AI/ML Settings
FACE_API_MODEL_URL=/models
VALIDATION_CONFIDENCE_THRESHOLD=0.6
ENABLE_STRICT_VALIDATION=false
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB locally (Windows)
# Download from https://www.mongodb.com/try/download/community

# Start MongoDB service
net start MongoDB

# Create database and user (optional)
mongosh
use passport-renewal-dev
db.createUser({
  user: "passport_user",
  pwd: "dev_password",
  roles: ["readWrite"]
})
```

#### Option B: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user
4. Get connection string and update `MONGODB_URI` in `.env.local`

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access the Application

- **Main Application**: http://localhost:3000
- **Login Page**: http://localhost:3000/auth/login
- **Register Page**: http://localhost:3000/auth/register
- **Dashboard**: http://localhost:3000/dashboard

### 6. Test Accounts

For development/demo purposes, you can create test accounts or use these demo credentials:

```
Citizen Account:
Email: demo@passport.gov.sd
Password: demo123

Admin Account:
Email: admin@passport.gov.sd
Password: admin123
```

## 🏗️ System Architecture

### Current Implementation Status

✅ **Completed:**
- User authentication (NextAuth.js)
- User registration and login
- MongoDB integration with Mongoose
- Application model and API routes
- Dashboard for citizens
- Beautiful UI with DaisyUI + Tailwind
- Multi-step application form
- File upload structure
- Admin dashboard framework

🔄 **In Progress/Next Steps:**
- File upload API implementation
- AI-powered photo validation
- Payment integration (Stripe)
- Email notifications
- Admin review workflow
- Application status tracking

### Database Models

#### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: 'citizen' | 'admin' | 'super_admin',
  profile: {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    nationalId: String (unique)
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Application Model
```javascript
{
  userId: ObjectId (ref: User),
  applicationNumber: String (auto-generated),
  personalInfo: { ... },
  currentPassport: { ... },
  documents: { ... },
  validation: { ... },
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed',
  payment: { ... },
  review: { ... },
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth login/logout

### Applications
- `GET /api/applications` - List user applications
- `POST /api/applications` - Create new application
- `GET /api/applications/[id]` - Get specific application
- `PUT /api/applications/[id]` - Update application
- `DELETE /api/applications/[id]` - Delete draft application

### File Uploads (To be implemented)
- `POST /api/upload` - Upload files
- `GET /api/uploads/[filename]` - Retrieve uploaded files

### Admin (To be implemented)
- `GET /api/admin/applications` - List all applications for review
- `PUT /api/admin/applications/[id]/review` - Review application

## 🎯 Next Steps (Priority Order)

### 1. File Upload System (HIGH PRIORITY)
```bash
# Create upload API route
touch src/app/api/upload/route.js

# Create uploads directory
mkdir public/uploads
mkdir public/uploads/photos
mkdir public/uploads/documents
```

### 2. AI Photo Validation (HIGH PRIORITY)
- Implement face-api.js integration
- Create photo quality validation
- Background color detection
- Face centering validation

### 3. Payment Integration (HIGH PRIORITY)
- Stripe payment processing
- Payment confirmation
- Receipt generation

### 4. Admin Dashboard (MEDIUM PRIORITY)
- Application review interface
- Bulk operations
- Status management
- Reporting dashboard

### 5. Email Notifications (MEDIUM PRIORITY)
- Application submission confirmation
- Status update notifications
- Admin review alerts

### 6. Advanced Features (LOW PRIORITY)
- Document OCR scanning
- Appointment scheduling
- Multi-language support enhancement
- Mobile app preparation

## 🔒 Security Considerations

### Environment Variables
Never commit `.env.local` to version control. Current security measures:

- Password hashing with bcrypt
- JWT session management
- Role-based access control
- Input validation and sanitization
- File type validation
- Database query protection

### Production Security
For production deployment:
- Use strong, unique secrets
- Enable HTTPS
- Configure CORS properly
- Set up rate limiting
- Enable audit logging
- Use MongoDB Atlas with authentication

## 🚀 Deployment Options

### Vercel (Recommended for MVP)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Docker (For self-hosting)
```dockerfile
# Dockerfile (to be created)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Traditional VPS
- Node.js application server
- Nginx reverse proxy
- MongoDB database
- SSL certificate (Let's Encrypt)

## 📊 Performance Optimization

### Current Optimizations
- Next.js App Router for performance
- Server-side rendering where appropriate
- Optimized database queries with indexes
- Image optimization ready

### Future Optimizations
- Redis caching for sessions
- CDN for file storage
- Database query optimization
- API rate limiting
- Image compression

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MongoDB service
net start MongoDB

# Verify connection string in .env.local
# Check network connectivity for Atlas
```

#### NextAuth Configuration Error
```bash
# Ensure NEXTAUTH_SECRET is set
# Verify NEXTAUTH_URL matches your domain
```

#### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors
```bash
# Check for syntax errors
npm run lint

# Clear Next.js cache
rm -rf .next
npm run build
```

## 📞 Support & Documentation

- **Main Documentation**: `/docs/` directory
- **API Documentation**: `/docs/API-DOCUMENTATION.md`
- **Security Guidelines**: `/docs/SECURITY-GUIDELINES.md`
- **Frontend Components**: `/docs/FRONTEND-COMPONENTS.md`
- **Deployment Guide**: `/docs/DEPLOYMENT-GUIDE.md`

## 🎯 Development Workflow

### Feature Development
1. Create feature branch from main
2. Implement feature with tests
3. Update documentation
4. Create pull request
5. Code review and merge

### Testing Strategy
```bash
# Unit tests (to be implemented)
npm run test

# Integration tests (to be implemented)
npm run test:integration

# E2E tests (to be implemented)
npm run test:e2e
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking (if TypeScript added)
npm run type-check

# Security audit
npm audit
```

---

## 🚀 **Ready to Start Development!**

The system now has:
- ✅ Complete authentication system
- ✅ Database models and API routes
- ✅ Beautiful UI components
- ✅ Multi-step application form
- ✅ Admin dashboard foundation
- ✅ Proper error handling
- ✅ Security measures

**Next immediate steps:**
1. Set up your `.env.local` file
2. Start development server: `npm run dev`
3. Test registration and login
4. Begin implementing file upload system
5. Add AI photo validation
6. Integrate payment processing

You're ready to complete the remaining features within your 24-hour timeline! 