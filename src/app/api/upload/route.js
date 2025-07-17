import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import Document from '@/models/Document.js';

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const documentType = formData.get('documentType');
    const applicationId = formData.get('applicationId');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's ok
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.name);
    const filename = `${documentType}_${timestamp}_${randomId}${extension}`;
    const filePath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create document record in database
    const documentData = {
      applicationId: applicationId || null,
      filename: filename,
      originalName: file.name,
      mimetype: file.type,
      size: file.size,
      documentType: mapDocumentType(documentType),
      filePath: filePath,
      userId: session.user.id
    };

    const document = Document.create(documentData);

    return NextResponse.json({
      id: document.id,
      filename: filename,
      originalName: file.name,
      size: file.size,
      documentType: documentType,
      uploadedAt: document.uploadedAt,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    );
  }
}

// Map frontend document types to database document types
function mapDocumentType(frontendType) {
  const typeMap = {
    'passportPhoto': 'photo',
    'identityDocument': 'national_id',
    'citizenshipDocument': 'birth_certificate',
    'supportingDocument': 'other',
    'currentPassportCopy': 'current_passport'
  };
  
  return typeMap[frontendType] || 'other';
} 