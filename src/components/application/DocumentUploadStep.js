'use client';

import { useState } from 'react';

export default function DocumentUploadStep({ formData, updateFormData, errors }) {
  const [dragOver, setDragOver] = useState({});

  const handleFileChange = async (field, files) => {
    const file = files[0];
    if (file) {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please upload only JPEG, PNG, or PDF files.');
        return;
      }

      if (file.size > maxSize) {
        alert('File size must be less than 5MB.');
        return;
      }

      // Create file preview first
      const reader = new FileReader();
      reader.onload = async (e) => {
        // Set loading state
        updateFormData({
          [`${field}Uploading`]: true,
          [`${field}Preview`]: e.target.result,
          [`${field}Name`]: file.name
        });

        try {
          // Upload file to server
          const formData = new FormData();
          formData.append('file', file);
          formData.append('documentType', field);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
          }

          const result = await response.json();

          // Update form data with successful upload
          updateFormData({
            [field]: file,
            [`${field}Preview`]: e.target.result,
            [`${field}Name`]: file.name,
            [`${field}Id`]: result.id,
            [`${field}Uploaded`]: true,
            [`${field}Uploading`]: false
          });

        } catch (error) {
          console.error('Upload error:', error);
          alert(`Failed to upload ${field}: ${error.message}`);
          
          // Clear the upload on error
          updateFormData({
            [field]: null,
            [`${field}Preview`]: null,
            [`${field}Name`]: null,
            [`${field}Uploading`]: false,
            [`${field}Error`]: error.message
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e, field) => {
    e.preventDefault();
    setDragOver({ ...dragOver, [field]: true });
  };

  const handleDragLeave = (e, field) => {
    e.preventDefault();
    setDragOver({ ...dragOver, [field]: false });
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    setDragOver({ ...dragOver, [field]: false });
    const files = e.dataTransfer.files;
    handleFileChange(field, files);
  };

  const removeFile = (field) => {
    updateFormData({
      [field]: null,
      [`${field}Preview`]: null,
      [`${field}Name`]: null,
      [`${field}Id`]: null,
      [`${field}Uploaded`]: false,
      [`${field}Uploading`]: false,
      [`${field}Error`]: null
    });
  };

  const FileUploadArea = ({ field, title, description, required = false }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {title} {required && <span className="text-red-500">*</span>}
      </label>
      <p className="text-sm text-gray-500 mb-3">{description}</p>
      
      {formData[`${field}Preview`] ? (
        <div className={`border rounded-lg p-4 ${
          formData[`${field}Uploading`] 
            ? 'border-blue-300 bg-blue-50' 
            : formData[`${field}Uploaded`]
              ? 'border-green-300 bg-green-50'
              : formData[`${field}Error`]
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {formData[`${field}Preview`] && formData[field]?.type?.startsWith('image/') ? (
                <img
                  src={formData[`${field}Preview`]}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded border"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{formData[`${field}Name`]}</p>
                <div className="text-sm text-gray-500">
                  {formData[field] && (
                    <span>{(formData[field].size / 1024 / 1024).toFixed(2)} MB</span>
                  )}
                  {formData[`${field}Uploading`] && (
                    <span className="text-blue-600 ml-2">Uploading...</span>
                  )}
                  {formData[`${field}Uploaded`] && (
                    <span className="text-green-600 ml-2">✓ Uploaded successfully</span>
                  )}
                  {formData[`${field}Error`] && (
                    <span className="text-red-600 ml-2">✗ Upload failed</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {formData[`${field}Uploading`] && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
              {formData[`${field}Uploaded`] && (
                <div className="rounded-full h-5 w-5 bg-green-100 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(field)}
                className="text-red-600 hover:text-red-800 p-1"
                disabled={formData[`${field}Uploading`]}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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
          onDragOver={(e) => handleDragOver(e, field)}
          onDragLeave={(e) => handleDragLeave(e, field)}
          onDrop={(e) => handleDrop(e, field)}
          onClick={() => document.getElementById(`file-${field}`).click()}
        >
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 5MB</p>
          </div>
          <input
            id={`file-${field}`}
            type="file"
            className="hidden"
            accept="image/*,application/pdf"
            onChange={(e) => handleFileChange(field, e.target.files)}
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Document Upload</h2>
        <p className="text-gray-600">
          Upload the required documents for your passport application. All documents must be clear and legible.
        </p>
      </div>

      {/* Passport Photo */}
      <FileUploadArea
        field="passportPhoto"
        title="Passport Photo"
        description="Upload a recent passport-sized photo (2x2 inches, white background, facing forward)"
        required={true}
      />

      {/* Identity Document */}
      <FileUploadArea
        field="identityDocument"
        title="Identity Document"
        description="Upload a clear copy of your national ID card or birth certificate"
        required={true}
      />

      {/* Proof of Citizenship */}
      <FileUploadArea
        field="citizenshipDocument"
        title="Proof of Citizenship"
        description="Upload proof of Sudanese citizenship (birth certificate, naturalization certificate, etc.)"
        required={true}
      />

      {/* Supporting Documents */}
      <FileUploadArea
        field="supportingDocument"
        title="Supporting Documents"
        description="Upload any additional supporting documents (marriage certificate, court order, etc.)"
        required={false}
      />

      {/* Current Passport (for renewal/replacement) */}
      {['renewal', 'replacement', 'correction'].includes(formData.applicationType) && (
        <FileUploadArea
          field="currentPassportCopy"
          title="Current Passport Copy"
          description="Upload a clear copy of your current passport (all pages with stamps/visas)"
          required={true}
        />
      )}

      {/* Document Requirements Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">Document Requirements</h3>
            <div className="mt-2 text-sm text-amber-700">
              <ul className="list-disc list-inside space-y-1">
                <li>All documents must be in clear, high-quality format</li>
                <li>Photos must have white background and show full face</li>
                <li>File size limit: 5MB per document</li>
                <li>Accepted formats: JPEG, PNG, PDF</li>
                <li>Documents in languages other than Arabic or English must include certified translations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 