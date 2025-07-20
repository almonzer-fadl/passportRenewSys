'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function DocumentUploadStep({ formData, updateFormData, errors }) {
  const [dragOver, setDragOver] = useState({
    passportPhoto: false,
    identityDocument: false,
    citizenshipDocument: false,
    supportingDocument: false,
    currentPassportCopy: false
  });
  const [validationResults, setValidationResults] = useState({});

  // Handle passport photo upload with AI validation
  const handlePassportPhotoUpload = async (file) => {
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      updateFormData({
        documents: {
          ...formData.documents,
          passportPhotoError: 'Please upload a JPEG or PNG image'
        }
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      updateFormData({
        documents: {
          ...formData.documents,
          passportPhotoError: 'File size must be less than 5MB'
        }
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      updateFormData({
        documents: {
          ...formData.documents,
          passportPhoto: file,
          passportPhotoPreview: e.target.result,
          passportPhotoName: file.name,
          passportPhotoError: null,
          passportPhotoUploading: true
        }
      });

      // Simulate AI validation
      validatePassportPhoto(file);
    };
    reader.readAsDataURL(file);
  };

  // Simulate AI validation for passport photo
  const validatePassportPhoto = async (file) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate validation results
      const validationResult = {
        passed: Math.random() > 0.3, // 70% pass rate
        confidence: 0.85 + Math.random() * 0.1,
        details: {
          faceDetected: Math.random() > 0.1,
          eyesOpen: Math.random() > 0.1,
          properLighting: Math.random() > 0.1,
          whiteBackground: Math.random() > 0.1
        }
      };

      setValidationResults(prev => ({
        ...prev,
        passportPhoto: validationResult
      }));

      updateFormData({
        documents: {
          ...formData.documents,
          passportPhotoUploading: false,
          passportPhotoError: validationResult.passed ? null : 'Photo does not meet requirements'
        }
      });
    } catch (error) {
      updateFormData({
        documents: {
          ...formData.documents,
          passportPhotoUploading: false,
          passportPhotoError: 'Validation failed. Please try again.'
        }
      });
    }
  };

  // Handle regular file uploads
  const handleFileUpload = (field, file) => {
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      updateFormData({
        documents: {
          ...formData.documents,
          [`${field}Error`]: 'Please upload a JPEG, PNG, or PDF file'
        }
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      updateFormData({
        documents: {
          ...formData.documents,
          [`${field}Error`]: 'File size must be less than 10MB'
        }
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      updateFormData({
        documents: {
          ...formData.documents,
          [field]: file,
          [`${field}Preview`]: e.target.result,
          [`${field}Name`]: file.name,
          [`${field}Error`]: null,
          [`${field}Uploaded`]: true
        }
      });
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (field) => {
    updateFormData({
      documents: {
        ...formData.documents,
        [field]: null,
        [`${field}Preview`]: null,
        [`${field}Name`]: null,
        [`${field}Error`]: null,
        [`${field}Uploading`]: false,
        [`${field}Uploaded`]: false
      }
    });
  };

  // Passport Photo Upload Area with AI Validation
  const PassportPhotoUploadArea = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Passport Photo <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mt-1">
          Upload a high-quality passport photo. AI will verify it meets government requirements.
        </p>
      </div>

      {formData.passportPhotoPreview ? (
        <div className={`border rounded-lg p-4 ${
          formData.passportPhotoUploading 
            ? 'border-blue-300 bg-blue-50' 
            : validationResults.passportPhoto?.passed
              ? 'border-green-300 bg-green-50'
              : formData.passportPhotoError
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src={formData.passportPhotoPreview}
                alt="Passport Photo Preview"
                width={120}
                height={160}
                className="object-cover rounded border"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{formData.passportPhotoName}</p>
                <div className="text-sm text-gray-500 mt-1">
                  {formData.passportPhotoUploading && (
                    <span className="text-blue-600">Validating with AI...</span>
                  )}
                  {validationResults.passportPhoto?.passed && (
                    <span className="text-green-600">✓ AI Validation Passed</span>
                  )}
                  {formData.passportPhotoError && (
                    <span className="text-red-600">✗ {formData.passportPhotoError}</span>
                  )}
                </div>
                
                {/* AI Validation Details */}
                {validationResults.passportPhoto && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-gray-700">AI Validation Results:</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          validationResults.passportPhoto.details.faceDetected ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        Face Detected
                      </div>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          validationResults.passportPhoto.details.eyesOpen ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        Eyes Open
                      </div>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          validationResults.passportPhoto.details.properLighting ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        Proper Lighting
                      </div>
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          validationResults.passportPhoto.details.whiteBackground ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        White Background
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Confidence: {(validationResults.passportPhoto.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile('passportPhoto')}
              className="text-red-600 hover:text-red-800 p-1"
              disabled={formData.passportPhotoUploading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
            ${dragOver.passportPhoto
              ? 'border-blue-400 bg-blue-50'
              : errors.passportPhoto
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver({ ...dragOver, passportPhoto: true });
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver({ ...dragOver, passportPhoto: false });
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver({ ...dragOver, passportPhoto: false });
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              handlePassportPhotoUpload(files[0]);
            }
          }}
          onClick={() => document.getElementById('passport-photo-input').click()}
        >
          <div className="space-y-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="text-lg font-medium text-gray-900">Upload Passport Photo</p>
              <p className="text-sm text-gray-500 mt-1">
                Click to upload or drag and drop your passport photo
              </p>
              <p className="text-xs text-gray-400 mt-2">
                AI will automatically verify it meets government requirements
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800 font-medium">Requirements:</p>
              <ul className="text-xs text-blue-700 mt-1 space-y-1">
                <li>• High quality, clear image</li>
                <li>• White background</li>
                <li>• Face clearly visible</li>
                <li>• Eyes open and looking forward</li>
                <li>• Neutral expression</li>
              </ul>
            </div>
          </div>
          <input
            id="passport-photo-input"
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => handlePassportPhotoUpload(e.target.files[0])}
          />
        </div>
      )}
      
      {errors.passportPhoto && (
        <p className="text-sm text-red-600">{errors.passportPhoto}</p>
      )}
    </div>
  );

  // Simple File Upload Area
  const FileUploadArea = ({ field, title, description, required = false }) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {title} {required && <span className="text-red-500">*</span>}
        </label>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      {formData[`${field}Preview`] ? (
        <div className={`border rounded-lg p-4 ${
          formData[`${field}Uploaded`]
            ? 'border-green-300 bg-green-50'
            : formData[`${field}Error`]
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {formData[`${field}Preview`].startsWith('data:image') ? (
                <Image
                  src={formData[`${field}Preview`]}
                  alt="Document Preview"
                  width={80}
                  height={100}
                  className="object-cover rounded border"
                />
              ) : (
                <div className="w-20 h-24 bg-gray-100 rounded border flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{formData[`${field}Name`]}</p>
                <div className="text-sm text-gray-500">
                  {formData[`${field}Uploaded`] && (
                    <span className="text-green-600">✓ Uploaded successfully</span>
                  )}
                  {formData[`${field}Error`] && (
                    <span className="text-red-600">✗ {formData[`${field}Error`]}</span>
                  )}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(field)}
              className="text-red-600 hover:text-red-800 p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors duration-200
            ${dragOver[field]
              ? 'border-blue-400 bg-blue-50'
              : errors[field]
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }
          `}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver({ ...dragOver, [field]: true });
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragOver({ ...dragOver, [field]: false });
          }}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver({ ...dragOver, [field]: false });
            const files = e.dataTransfer.files;
            if (files.length > 0) {
              handleFileUpload(field, files[0]);
            }
          }}
          onClick={() => document.getElementById(`${field}-input`).click()}
        >
          <div className="space-y-3">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">Upload {title}</p>
              <p className="text-xs text-gray-500">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports JPEG, PNG, and PDF files (max 10MB)
              </p>
            </div>
          </div>
          <input
            id={`${field}-input`}
            type="file"
            className="hidden"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={(e) => handleFileUpload(field, e.target.files[0])}
          />
        </div>
      )}
      
      {errors[field] && (
        <p className="text-sm text-red-600">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Required Documents</h3>
        <p className="text-sm text-gray-600">
          Please upload all required documents. The passport photo will be validated using AI to ensure it meets government requirements.
        </p>
      </div>

      {/* Passport Photo */}
      <PassportPhotoUploadArea />

      {/* National ID Card */}
      <FileUploadArea
        field="identityDocument"
        title="National ID Card"
        description="Upload a clear copy of your national ID card"
        required={true}
      />

      {/* Proof of Citizenship */}
      <FileUploadArea
        field="citizenshipDocument"
        title="Proof of Citizenship"
        description="Upload proof of Sudanese citizenship (birth certificate, citizenship certificate, etc.)"
        required={true}
      />

      {/* Current Passport Copy (for renewal/replacement) */}
      {['renewal', 'replacement'].includes(formData.applicationType) && (
        <FileUploadArea
          field="currentPassportCopy"
          title="Current Passport Copy"
          description="Upload a copy of your current passport"
          required={true}
        />
      )}

      {/* Supporting Documents */}
      <FileUploadArea
        field="supportingDocument"
        title="Supporting Documents (Optional)"
        description="Upload any additional supporting documents if required"
        required={false}
      />
    </div>
  );
} 