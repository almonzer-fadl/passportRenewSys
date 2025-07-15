# API Documentation - Sudan Passport Renewal System

## 📋 Overview
This document provides comprehensive API documentation for the Sudan Passport Renewal System. All APIs follow RESTful conventions and return JSON responses.

## 🔐 Authentication
Most endpoints require authentication using NextAuth.js session tokens or JWT tokens.

### Authentication Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## 📍 Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://passport.gov.sd/api`

---

## 🔑 Authentication Endpoints

### POST /api/auth/register
Register a new citizen user.

**Request Body:**
```json
{
  "email": "citizen@example.com",
  "password": "SecurePassword123!",
  "firstName": "Ahmed",
  "lastName": "Hassan",
  "phoneNumber": "+249123456789",
  "nationalId": "123456789012"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "email": "citizen@example.com",
    "role": "citizen",
    "profile": {
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "phoneNumber": "+249123456789"
    }
  }
}
```

### POST /api/auth/forgot-password
Initiate password recovery process.

**Request Body:**
```json
{
  "email": "citizen@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

## 📄 Application Endpoints

### GET /api/applications
Get applications list (paginated).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status
- `userId` (string): Filter by user (admin only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "applicationNumber": "SUD-2024-001234",
        "status": "under_review",
        "personalInfo": {
          "firstName": "Ahmed",
          "lastName": "Hassan",
          "email": "citizen@example.com"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-16T14:20:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

### POST /api/applications
Create a new passport renewal application.

**Request Body:**
```json
{
  "personalInfo": {
    "firstName": "Ahmed",
    "lastName": "Hassan",
    "dateOfBirth": "1985-03-15",
    "placeOfBirth": "Khartoum",
    "nationality": "Sudanese",
    "gender": "male",
    "email": "citizen@example.com",
    "phoneNumber": "+249123456789",
    "address": {
      "street": "Street 15, Block 2",
      "city": "Khartoum",
      "state": "Khartoum State",
      "postalCode": "11111"
    }
  },
  "currentPassport": {
    "passportNumber": "A1234567",
    "issueDate": "2019-01-15",
    "expiryDate": "2029-01-15",
    "issuingOffice": "Khartoum Passport Office"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Application created successfully",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "applicationNumber": "SUD-2024-001234",
    "status": "draft",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/applications/:id
Get specific application details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "applicationNumber": "SUD-2024-001234",
    "status": "under_review",
    "personalInfo": {
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "dateOfBirth": "1985-03-15",
      "placeOfBirth": "Khartoum",
      "nationality": "Sudanese",
      "gender": "male",
      "email": "citizen@example.com",
      "phoneNumber": "+249123456789",
      "address": {
        "street": "Street 15, Block 2",
        "city": "Khartoum",
        "state": "Khartoum State",
        "postalCode": "11111"
      }
    },
    "currentPassport": {
      "passportNumber": "A1234567",
      "issueDate": "2019-01-15",
      "expiryDate": "2029-01-15",
      "issuingOffice": "Khartoum Passport Office"
    },
    "documents": {
      "passportPhoto": "/uploads/passport-photo-123.jpg",
      "signature": "/uploads/signature-123.png",
      "facePhoto": "/uploads/face-photo-123.jpg",
      "currentPassportScan": "/uploads/passport-scan-123.jpg"
    },
    "validation": {
      "faceValidation": {
        "passed": true,
        "confidence": 0.95,
        "timestamp": "2024-01-15T11:00:00Z"
      },
      "documentValidation": {
        "passed": true,
        "ocrText": "REPUBLIC OF SUDAN PASSPORT...",
        "timestamp": "2024-01-15T11:05:00Z"
      }
    },
    "payment": {
      "amount": 100,
      "status": "paid",
      "stripePaymentId": "pi_1234567890",
      "paidAt": "2024-01-15T12:00:00Z"
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-16T14:20:00Z"
  }
}
```

### PUT /api/applications/:id
Update application details.

**Request Body:**
```json
{
  "personalInfo": {
    "phoneNumber": "+249987654321"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application updated successfully",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "updatedAt": "2024-01-16T15:30:00Z"
  }
}
```

### POST /api/applications/:id/submit
Submit application for review.

**Response (200):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "status": "submitted",
    "submittedAt": "2024-01-16T16:00:00Z"
  }
}
```

### POST /api/applications/:id/review
Admin review action (admin only).

**Request Body:**
```json
{
  "decision": "approved",
  "notes": "All documents verified successfully"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application reviewed successfully",
  "data": {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "status": "approved",
    "review": {
      "reviewedBy": "64f1a2b3c4d5e6f7g8h9i0j2",
      "reviewedAt": "2024-01-17T09:00:00Z",
      "decision": "approved",
      "notes": "All documents verified successfully"
    }
  }
}
```

---

## 📁 File Upload Endpoints

### POST /api/uploads
Upload file with validation.

**Request (multipart/form-data):**
```
file: <binary_file_data>
type: "passport_photo" | "signature" | "face_photo" | "passport_scan"
applicationId: "64f1a2b3c4d5e6f7g8h9i0j1"
```

**Response (200):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "passport-photo-123.jpg",
    "path": "/uploads/passport-photo-123.jpg",
    "size": 2048576,
    "mimeType": "image/jpeg",
    "uploadedAt": "2024-01-15T11:00:00Z"
  }
}
```

### GET /api/uploads/:filename
Retrieve uploaded file.

**Response:** Binary file data with appropriate headers.

---

## 🔍 Validation Endpoints

### POST /api/applications/validate
Validate uploaded images using AI.

**Request Body:**
```json
{
  "type": "face_photo",
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "validation": {
      "passed": true,
      "confidence": 0.95,
      "details": {
        "faceDetected": true,
        "eyesOpen": true,
        "properLighting": true,
        "whiteBackground": true,
        "facePosition": "centered"
      },
      "timestamp": "2024-01-15T11:00:00Z"
    }
  }
}
```

---

## 💳 Payment Endpoints

### POST /api/payments/create-intent
Create Stripe payment intent.

**Request Body:**
```json
{
  "applicationId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "amount": 100,
  "currency": "usd"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_xyz",
    "paymentIntentId": "pi_1234567890"
  }
}
```

### POST /api/payments/webhook
Handle Stripe webhooks.

**Request Headers:**
```
stripe-signature: t=1234567890,v1=abc123...
```

**Request Body:** Stripe webhook payload

**Response (200):**
```json
{
  "received": true
}
```

### POST /api/payments/verify
Verify payment status.

**Request Body:**
```json
{
  "paymentIntentId": "pi_1234567890",
  "applicationId": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "paymentStatus": "succeeded",
    "amount": 100,
    "currency": "usd",
    "paidAt": "2024-01-15T12:00:00Z"
  }
}
```

---

## 👨‍💼 Admin Endpoints

### GET /api/admin/users
Get users list (admin only).

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "email": "citizen@example.com",
        "role": "citizen",
        "profile": {
          "firstName": "Ahmed",
          "lastName": "Hassan"
        },
        "createdAt": "2024-01-10T08:00:00Z",
        "lastLoginAt": "2024-01-16T14:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100
    }
  }
}
```

### GET /api/admin/applications
Get applications for admin review.

**Query Parameters:**
- `status` (string): Filter by status
- `assignedTo` (string): Filter by assigned reviewer
- `priority` (string): Filter by priority

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "applicationNumber": "SUD-2024-001234",
        "status": "under_review",
        "priority": "normal",
        "applicant": {
          "name": "Ahmed Hassan",
          "email": "citizen@example.com"
        },
        "submittedAt": "2024-01-16T16:00:00Z",
        "assignedTo": null
      }
    ]
  }
}
```

### GET /api/admin/reports
Get system analytics and reports.

**Query Parameters:**
- `period` (string): "daily", "weekly", "monthly"
- `startDate` (string): ISO date
- `endDate` (string): ISO date

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalApplications": 1250,
      "pendingApplications": 45,
      "approvedApplications": 1100,
      "rejectedApplications": 105,
      "totalRevenue": 125000
    },
    "trends": {
      "applicationsByDay": [
        { "date": "2024-01-15", "count": 12 },
        { "date": "2024-01-16", "count": 8 }
      ],
      "averageProcessingTime": "2.5 days"
    }
  }
}
```

---

## ❌ Error Responses

### Standard Error Format
All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **429**: Rate Limit Exceeded
- **500**: Internal Server Error

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_REQUIRED`: User not authenticated
- `AUTHORIZATION_FAILED`: Insufficient permissions
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `DUPLICATE_RESOURCE`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `PAYMENT_FAILED`: Payment processing error
- `FILE_UPLOAD_ERROR`: File upload failed
- `AI_VALIDATION_ERROR`: AI validation failed

---

## 🔧 Rate Limiting

### Limits
- **Authentication endpoints**: 5 requests per minute
- **File upload**: 10 requests per minute
- **General API**: 100 requests per minute
- **Admin endpoints**: 1000 requests per minute

### Headers
Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1642345678
```

---

## 📝 Request/Response Examples

### Complete Application Submission Flow

1. **Create Application**
```bash
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "personalInfo": {
      "firstName": "Ahmed",
      "lastName": "Hassan",
      "email": "ahmed@example.com"
    }
  }'
```

2. **Upload Documents**
```bash
curl -X POST http://localhost:3000/api/uploads \
  -H "Authorization: Bearer <token>" \
  -F "file=@passport-photo.jpg" \
  -F "type=passport_photo" \
  -F "applicationId=64f1a2b3c4d5e6f7g8h9i0j1"
```

3. **Validate Images**
```bash
curl -X POST http://localhost:3000/api/applications/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "type": "face_photo",
    "imageData": "data:image/jpeg;base64,..."
  }'
```

4. **Submit Application**
```bash
curl -X POST http://localhost:3000/api/applications/64f1a2b3c4d5e6f7g8h9i0j1/submit \
  -H "Authorization: Bearer <token>"
```

5. **Process Payment**
```bash
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "applicationId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "amount": 100
  }'
```

---

## 🧪 Testing

### Test Data
Use these test credentials for development:

**Citizen User:**
- Email: `test.citizen@example.com`
- Password: `TestPassword123!`

**Admin User:**
- Email: `test.admin@example.com`
- Password: `AdminPassword123!`

### Test Stripe Cards
- **Success**: `4242424242424242`
- **Decline**: `4000000000000002`
- **Insufficient Funds**: `4000000000009995`

---

## 📚 SDK & Client Libraries

### JavaScript/Node.js Example
```javascript
class PassportAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async createApplication(data) {
    const response = await fetch(`${this.baseURL}/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async uploadFile(file, type, applicationId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('applicationId', applicationId);

    const response = await fetch(`${this.baseURL}/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });
    return response.json();
  }
}

// Usage
const api = new PassportAPI('http://localhost:3000/api', 'your-token');
const application = await api.createApplication(applicationData);
```

---

*This API documentation is automatically updated with each release.*

**Last Updated**: January 2024  
**API Version**: 1.0.0 