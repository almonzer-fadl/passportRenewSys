# Deployment Guide - Sudan Passport Renewal System

## 🚀 Overview
This guide provides step-by-step instructions for deploying the Sudan Passport Renewal System across different environments: development, staging, and production.

## 📋 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher
- **Redis**: v7.0 or higher (for caching and sessions)
- **Memory**: Minimum 4GB RAM (8GB recommended)
- **Storage**: Minimum 50GB SSD
- **SSL Certificate**: Required for production

### Required Accounts & Services
- **MongoDB Atlas** (or self-hosted MongoDB)
- **Stripe Account** (for payments)
- **Email Service** (Gmail, SendGrid, etc.)
- **Domain Name** (for production)
- **Cloud Provider** (Vercel, AWS, DigitalOcean, etc.)

---

## 🏠 Development Environment Setup

### 1. Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd passportrenew

# Install dependencies
npm install

# Install global tools
npm install -g vercel
npm install -g pm2

# Create environment file
cp .env.example .env.local
```

### 2. Environment Configuration

**Create `.env.local`**:
```env
# ================================
# DEVELOPMENT ENVIRONMENT
# ================================

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/passport-renewal-dev
MONGODB_DB=passport-renewal-dev

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production

# File Upload
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=10485760

# Government Settings
GOV_PROCESSING_FEE=100
GOV_URGENT_FEE=200
GOV_ADMIN_EMAIL=admin@passport.dev

# Email (Development)
EMAIL_FROM=noreply@passport.dev
EMAIL_SERVER_USER=your-gmail@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

# Stripe (Test Keys)
STRIPE_PUBLIC_KEY=pk_test_your_test_key
STRIPE_SECRET_KEY=sk_test_your_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook

# AI/ML Settings
FACE_API_MODEL_URL=/face-api-models
VALIDATION_CONFIDENCE_THRESHOLD=0.6
ENABLE_STRICT_VALIDATION=false

# Monitoring
LOG_LEVEL=debug
ENABLE_ANALYTICS=false
```

### 3. Local Database Setup

**MongoDB Setup**:
```bash
# Install MongoDB locally (macOS)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Create development database
mongosh
> use passport-renewal-dev
> db.createUser({
    user: "passport_user",
    pwd: "dev_password",
    roles: ["readWrite"]
  })
```

**Or use MongoDB Atlas**:
```bash
# Update .env.local with Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/passport-renewal-dev
```

### 4. Development Scripts

**package.json scripts**:
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:seed": "node scripts/seed-database.js",
    "db:migrate": "node scripts/migrate-database.js",
    "security:audit": "npm audit && snyk test",
    "deploy:staging": "vercel --prod --target staging",
    "deploy:production": "vercel --prod --target production"
  }
}
```

### 5. Start Development

```bash
# Seed the database with test data
npm run db:seed

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

---

## 🧪 Staging Environment

### 1. Staging Infrastructure

**Recommended Setup**:
- **Hosting**: Vercel (staging environment)
- **Database**: MongoDB Atlas (staging cluster)
- **Domain**: staging.passport.gov.sd
- **Storage**: Cloud storage for files
- **Monitoring**: Basic monitoring enabled

### 2. Staging Environment Variables

**Vercel Environment Variables**:
```env
# ================================
# STAGING ENVIRONMENT
# ================================

NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.passport.gov.sd

# Database (Staging Cluster)
MONGODB_URI=mongodb+srv://staging_user:password@staging-cluster.mongodb.net/passport-renewal-staging

# Authentication
NEXTAUTH_URL=https://staging.passport.gov.sd
NEXTAUTH_SECRET=staging-secret-key-very-secure

# File Upload (Cloud Storage)
UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE=10485760
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name

# Email (Production Service)
EMAIL_FROM=noreply@passport.gov.sd
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_USER=staging@passport.gov.sd
EMAIL_SERVER_PASSWORD=secure-app-password

# Stripe (Test Environment)
STRIPE_PUBLIC_KEY=pk_test_staging_key
STRIPE_SECRET_KEY=sk_test_staging_key
STRIPE_WEBHOOK_SECRET=whsec_staging_webhook

# Security
ENCRYPTION_KEY=staging-encryption-key-32-chars
RATE_LIMIT_ENABLED=true

# Monitoring
LOG_LEVEL=info
ENABLE_ANALYTICS=true
SENTRY_DSN=your-sentry-dsn
```

### 3. Staging Deployment

**Using Vercel**:
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to staging
vercel --target staging

# Set environment variables
vercel env add MONGODB_URI staging
vercel env add NEXTAUTH_SECRET staging
# ... add all staging environment variables
```

**Using Docker (Alternative)**:
```dockerfile
# Dockerfile.staging
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

```bash
# Build and deploy staging
docker build -f Dockerfile.staging -t passport-staging .
docker run -p 3000:3000 --env-file .env.staging passport-staging
```

### 4. Staging Testing

**Automated Testing Pipeline**:
```yaml
# .github/workflows/staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run security:audit
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          scope: staging
```

---

## 🏗️ Production Environment

### 1. Production Infrastructure

**Recommended Architecture**:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │     CDN         │    │   Monitoring    │
│   (Cloudflare)  │    │  (Cloudinary)   │    │   (DataDog)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Web Servers   │
                    │   (Vercel Pro)  │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   File Storage  │    │   Cache Layer   │
│ (MongoDB Atlas) │    │  (AWS S3/CDN)   │    │   (Redis)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. Production Environment Variables

**Secure Environment Configuration**:
```env
# ================================
# PRODUCTION ENVIRONMENT
# ================================

NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://passport.gov.sd

# Database (Production Cluster with Replica Set)
MONGODB_URI=mongodb+srv://prod_user:secure_password@prod-cluster.mongodb.net/passport-renewal?replicaSet=atlas-replica-set&ssl=true

# Authentication (Strong Secrets)
NEXTAUTH_URL=https://passport.gov.sd
NEXTAUTH_SECRET=production-secret-key-extremely-secure-64-chars-minimum

# File Upload (AWS S3)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=me-south-1
AWS_S3_BUCKET=passport-documents-prod
UPLOAD_DIR=/tmp/uploads

# Email (Government Email Service)
EMAIL_FROM=noreply@passport.gov.sd
EMAIL_SERVER_HOST=mail.gov.sd
EMAIL_SERVER_USER=passport@gov.sd
EMAIL_SERVER_PASSWORD=government-email-password

# Stripe (Live Keys)
STRIPE_PUBLIC_KEY=pk_live_production_key
STRIPE_SECRET_KEY=sk_live_production_key
STRIPE_WEBHOOK_SECRET=whsec_production_webhook

# Security (Strongest Settings)
ENCRYPTION_KEY=production-encryption-key-must-be-32-characters
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STRICT=true
MFA_ENFORCED=true
SESSION_TIMEOUT=14400

# Monitoring & Logging
LOG_LEVEL=warn
ENABLE_ANALYTICS=true
SENTRY_DSN=production-sentry-dsn
DATADOG_API_KEY=production-datadog-key

# Government Compliance
AUDIT_LOGS_ENABLED=true
DATA_RETENTION_ENABLED=true
COMPLIANCE_MODE=government
```

### 3. Production Deployment

**Pre-deployment Checklist**:
- [ ] Security audit completed
- [ ] Performance testing passed
- [ ] Database backup created
- [ ] SSL certificates valid
- [ ] Monitoring configured
- [ ] Disaster recovery plan ready
- [ ] Staff training completed

**Deployment Steps**:

```bash
# 1. Final security check
npm run security:audit

# 2. Run full test suite
npm run test:production

# 3. Build production bundle
npm run build

# 4. Deploy to production
vercel --prod --target production

# 5. Run post-deployment tests
npm run test:e2e:production

# 6. Enable monitoring
npm run monitoring:enable
```

**Zero-downtime Deployment**:
```bash
# Using PM2 for Node.js applications
pm2 start ecosystem.config.js --env production
pm2 reload all --update-env
```

### 4. Production Monitoring

**Health Check Endpoint**:
```javascript
// pages/api/health.js
export default async function handler(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    checks: {}
  };

  try {
    // Database check
    health.checks.database = await checkDatabase();
    
    // Redis check
    health.checks.cache = await checkRedis();
    
    // File storage check
    health.checks.storage = await checkStorage();
    
    // External services check
    health.checks.stripe = await checkStripe();
    
    const allHealthy = Object.values(health.checks).every(check => check.status === 'healthy');
    health.status = allHealthy ? 'healthy' : 'degraded';
    
    res.status(allHealthy ? 200 : 503).json(health);
  } catch (error) {
    health.status = 'unhealthy';
    health.error = error.message;
    res.status(503).json(health);
  }
}
```

**Monitoring Dashboard**:
```javascript
// Datadog monitoring setup
import { StatsD } from 'node-statsd';

const dogstatsd = new StatsD({
  host: 'localhost',
  port: 8125,
  prefix: 'passport.app.'
});

// Custom metrics
export function trackMetrics() {
  dogstatsd.increment('requests.total');
  dogstatsd.timing('response.time', responseTime);
  dogstatsd.gauge('applications.pending', pendingApplications);
}
```

---

## 🔧 Database Management

### 1. Database Migration

**Migration Script**:
```javascript
// scripts/migrate-database.js
const mongoose = require('mongoose');

const migrations = [
  {
    version: '1.0.0',
    description: 'Initial schema setup',
    up: async () => {
      // Create indexes
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('applications').createIndex({ applicationNumber: 1 }, { unique: true });
      await db.collection('applications').createIndex({ userId: 1, status: 1 });
    },
    down: async () => {
      await db.collection('users').dropIndex({ email: 1 });
      await db.collection('applications').dropIndex({ applicationNumber: 1 });
    }
  },
  {
    version: '1.1.0',
    description: 'Add audit logging',
    up: async () => {
      await db.createCollection('auditLogs');
      await db.collection('auditLogs').createIndex({ timestamp: -1 });
      await db.collection('auditLogs').createIndex({ userId: 1, action: 1 });
    }
  }
];

async function runMigrations() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  for (const migration of migrations) {
    const exists = await db.collection('migrations').findOne({ version: migration.version });
    
    if (!exists) {
      console.log(`Running migration ${migration.version}: ${migration.description}`);
      await migration.up();
      await db.collection('migrations').insertOne({
        version: migration.version,
        description: migration.description,
        appliedAt: new Date()
      });
    }
  }
}
```

### 2. Database Backup

**Automated Backup Script**:
```bash
#!/bin/bash
# scripts/backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
DATABASE_NAME="passport-renewal"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create MongoDB dump
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"

# Compress backup
tar -czf "$BACKUP_DIR/passport-renewal-$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"

# Remove uncompressed files
rm -rf "$BACKUP_DIR/$DATE"

# Upload to cloud storage (AWS S3)
aws s3 cp "$BACKUP_DIR/passport-renewal-$DATE.tar.gz" "s3://passport-backups/"

# Keep only last 30 days of backups locally
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: passport-renewal-$DATE.tar.gz"
```

**Cron Job Setup**:
```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * /path/to/scripts/backup-database.sh
```

---

## 📊 Performance Optimization

### 1. Application Performance

**Next.js Optimization**:
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
  },
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard/admin',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. Database Performance

**MongoDB Optimization**:
```javascript
// Optimized connection settings
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0,
};

// Connection with retry logic
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return mongoose.connections[0];
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
```

### 3. Caching Strategy

**Redis Caching**:
```javascript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  db: 0,
});

export class CacheService {
  static async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set(key, value, ttl = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async del(key) {
    try {
      await redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
}

// Usage in API routes
export default async function handler(req, res) {
  const cacheKey = `applications:${req.query.userId}`;
  
  // Try cache first
  let applications = await CacheService.get(cacheKey);
  
  if (!applications) {
    // Fetch from database
    applications = await Application.find({ userId: req.query.userId });
    
    // Cache for 10 minutes
    await CacheService.set(cacheKey, applications, 600);
  }
  
  res.json({ applications });
}
```

---

## 🔍 Monitoring & Logging

### 1. Application Monitoring

**Error Tracking with Sentry**:
```javascript
// lib/sentry.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.request?.data) {
      delete event.request.data.password;
      delete event.request.data.nationalId;
    }
    return event;
  },
});

export { Sentry };
```

**Custom Logging**:
```javascript
// lib/logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'passport-renewal' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export { logger };
```

### 2. Performance Monitoring

**Custom Metrics Collection**:
```javascript
// lib/metrics.js
class MetricsCollector {
  static async recordResponseTime(route, duration) {
    await fetch('/api/internal/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: 'response_time',
        value: duration,
        tags: { route }
      })
    });
  }

  static async recordApplicationSubmission() {
    await fetch('/api/internal/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: 'application_submitted',
        value: 1,
        timestamp: Date.now()
      })
    });
  }
}
```

---

## 🚨 Disaster Recovery

### 1. Backup Strategy

**Comprehensive Backup Plan**:
- **Database**: Daily automated backups to AWS S3
- **Files**: Real-time sync to cloud storage
- **Configuration**: Version controlled in Git
- **Secrets**: Stored in secure key management
- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 1 hour

### 2. Failover Procedures

**Database Failover**:
```bash
#!/bin/bash
# scripts/failover-database.sh

echo "Initiating database failover..."

# Switch to backup MongoDB cluster
NEW_MONGODB_URI="mongodb+srv://backup-cluster.mongodb.net/passport-renewal"

# Update environment variable
vercel env rm MONGODB_URI production
vercel env add MONGODB_URI "$NEW_MONGODB_URI" production

# Redeploy application
vercel --prod

echo "Failover completed. Application now using backup database."
```

---

## 📋 Maintenance

### 1. Regular Maintenance Tasks

**Weekly Tasks**:
```bash
# System update check
npm audit
npm outdated

# Database optimization
node scripts/optimize-database.js

# Log rotation
logrotate /etc/logrotate.d/passport-app

# Certificate renewal check
certbot renew --dry-run
```

**Monthly Tasks**:
```bash
# Security audit
npm run security:full-audit

# Performance review
node scripts/performance-report.js

# Backup verification
node scripts/verify-backups.js

# Update dependencies
npm update
```

### 2. Scaling Procedures

**Horizontal Scaling**:
```yaml
# docker-compose.yml for scaling
version: '3.8'
services:
  app:
    image: passport-renewal:latest
    ports:
      - "3000-3005:3000"
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Database Connection Issues**:
```bash
# Check MongoDB connection
mongosh "$MONGODB_URI" --eval "db.runCommand('ping')"

# Check network connectivity
ping cluster0-shard-00-00.mongodb.net

# Verify SSL certificates
openssl s_client -connect cluster0-shard-00-00.mongodb.net:27017
```

**File Upload Issues**:
```bash
# Check upload directory permissions
ls -la /var/uploads/

# Verify disk space
df -h

# Test file upload
curl -X POST -F "file=@test.jpg" http://localhost:3000/api/uploads
```

### Support Contacts
- **Technical Support**: tech@passport.gov.sd
- **Emergency Hotline**: +249-XXX-XXXX
- **System Administrator**: admin@passport.gov.sd

---

*This deployment guide should be updated with each major release.*

**Last Updated**: January 2024  
**Version**: 1.0.0 