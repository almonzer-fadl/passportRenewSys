'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdminApplicationReview() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { t } = useLanguage();
  const [application, setApplication] = useState(null);
  const [userData, setUserData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch application details
  const fetchApplicationDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch application details
      const appResponse = await fetch(`/api/applications/${params.id}`);
      if (appResponse.ok) {
        const appData = await appResponse.json();
        setApplication(appData.application);
        setUserData(appData.user);
        setNotes(appData.application?.notes || '');
      } else {
        console.error('Failed to fetch application details');
        router.push('/admin');
      }

      // Fetch documents
      const docsResponse = await fetch(`/api/applications/${params.id}/documents`);
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setDocuments(docsData.documents || []);
      }

    } catch (error) {
      console.error('Error fetching application details:', error);
      router.push('/admin');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    if (params.id) {
      fetchApplicationDetails();
    }
  }, [params.id, fetchApplicationDetails]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      
      const response = await fetch(`/api/applications/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes: notes 
        }),
      });

      if (response.ok) {
        // Refresh application data
        await fetchApplicationDetails();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const updateDocumentStatus = async (documentId, status, validationNotes = '') => {
    try {
      const response = await fetch(`/api/documents/${documentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status,
          validationNotes
        }),
      });

      if (response.ok) {
        // Refresh application data to update document statuses
        await fetchApplicationDetails();
      }
    } catch (error) {
      console.error('Error updating document status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { color: 'gray', label: t('status.draft') },
      'submitted': { color: 'blue', label: t('status.submitted') },
      'under_review': { color: 'yellow', label: t('status.underReview') },
      'approved': { color: 'green', label: t('status.approved') },
      'rejected': { color: 'red', label: t('status.rejected') },
      'completed': { color: 'purple', label: t('status.completed') }
    };

    const config = statusConfig[status] || statusConfig['draft'];
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        ${config.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
        ${config.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
        ${config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
        ${config.color === 'green' ? 'bg-green-100 text-green-800' : ''}
        ${config.color === 'red' ? 'bg-red-100 text-red-800' : ''}
        ${config.color === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
      `}>
        {config.label}
      </span>
    );
  };

  const InfoSection = ({ title, children, icon }) => (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">{icon}</span>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  const InfoField = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-2">
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 col-span-2">{value || t('common.notProvided')}</dd>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl mb-4 block">❌</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.applicationNotFound')}</h3>
          <p className="text-gray-500">{t('admin.applicationNotFoundDesc')}</p>
          <button
            onClick={() => router.push('/admin')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {t('navigation.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('admin.applicationReview')}: {application.applicationNumber}
              </h1>
              <div className="mt-2 flex items-center space-x-4">
                {getStatusBadge(application.status)}
                <span className="text-sm text-gray-500">
                  {t('admin.submittedDate')}: {new Date(application.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              {t('navigation.backToDashboard')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Application Information */}
            <InfoSection title={t('admin.applicationDetails')} icon="📋">
              <dl className="divide-y divide-gray-200">
                <InfoField label={t('admin.applicationNumber')} value={application.applicationNumber} />
                <InfoField label={t('admin.applicationType')} value={
                  application.applicationType === 'new' ? t('application.newPassport') :
                  application.applicationType === 'renewal' ? t('application.renewal') :
                  application.applicationType === 'replacement' ? t('application.replacement') :
                  t('application.correction')
                } />
                <InfoField label={t('admin.processingType')} value={
                  application.processingType === 'express' ? 'Express (5-7 days)' : 'Regular (10-15 days)'
                } />
                <InfoField label={t('admin.currentStatus')} value={getStatusBadge(application.status)} />
              </dl>
            </InfoSection>

            {/* Applicant Information */}
            {userData && (
              <InfoSection title={t('admin.applicantInformation')} icon="👤">
                <dl className="divide-y divide-gray-200">
                  <InfoField label={t('auth.firstName')} value={userData.firstName} />
                  <InfoField label={t('auth.lastName')} value={userData.lastName} />
                  <InfoField label={t('auth.email')} value={userData.email} />
                  <InfoField label={t('auth.phoneNumber')} value={userData.phoneNumber} />
                  <InfoField label={t('application.nationalId')} value={userData.nationalId} />
                </dl>
              </InfoSection>
            )}

            {/* Personal Information */}
            {application.personalInfo && (
              <InfoSection title={t('application.personalInfoTitle')} icon="👤">
                <dl className="divide-y divide-gray-200">
                  <InfoField label={t('auth.firstName')} value={application.personalInfo.firstName} />
                  <InfoField label={t('auth.lastName')} value={application.personalInfo.lastName} />
                  <InfoField label={t('application.fatherName')} value={application.personalInfo.fatherName} />
                  <InfoField label={t('application.motherName')} value={application.personalInfo.motherName} />
                  <InfoField label={t('application.dateOfBirth')} value={application.personalInfo.dateOfBirth ? new Date(application.personalInfo.dateOfBirth).toLocaleDateString() : null} />
                  <InfoField label={t('application.placeOfBirth')} value={application.personalInfo.placeOfBirth} />
                  <InfoField label={t('application.gender')} value={application.personalInfo.gender} />
                  <InfoField label={t('application.nationality')} value={application.personalInfo.nationality} />
                </dl>
              </InfoSection>
            )}

            {/* Contact Information */}
            {application.contactInfo && (
              <InfoSection title={t('application.contactInfoTitle')} icon="📞">
                <dl className="divide-y divide-gray-200">
                  <InfoField label={t('auth.phoneNumber')} value={application.contactInfo.phoneNumber} />
                  <InfoField label={t('auth.email')} value={application.contactInfo.email} />
                  <InfoField label={t('application.street')} value={application.contactInfo.address?.street} />
                  <InfoField label={t('application.city')} value={application.contactInfo.address?.city} />
                  <InfoField label={t('application.state')} value={application.contactInfo.address?.state} />
                  <InfoField label={t('application.country')} value={application.contactInfo.address?.country} />
                </dl>
              </InfoSection>
            )}

            {/* Current Passport (if applicable) */}
            {['renewal', 'replacement'].includes(application.applicationType) && application.currentPassport && (
              <InfoSection title={t('application.currentPassportTitle')} icon="📖">
                <dl className="divide-y divide-gray-200">
                  <InfoField label={t('application.passportNumber')} value={application.currentPassport.passportNumber} />
                  <InfoField label={t('application.issueDate')} value={application.currentPassport.issueDate ? new Date(application.currentPassport.issueDate).toLocaleDateString() : null} />
                  <InfoField label={t('application.expiryDate')} value={application.currentPassport.expiryDate ? new Date(application.currentPassport.expiryDate).toLocaleDateString() : null} />
                  <InfoField label={t('application.issuingOffice')} value={application.currentPassport.issuingOffice} />
                </dl>
              </InfoSection>
            )}

            {/* Travel Information */}
            {application.travelInfo && (
              <InfoSection title={t('application.travelInfoTitle')} icon="✈️">
                <dl className="divide-y divide-gray-200">
                  <InfoField label={t('application.purposeOfTravel')} value={application.travelInfo.purposeOfTravel} />
                  <InfoField label={t('application.intendedCountries')} value={
                    application.travelInfo.intendedCountries ? application.travelInfo.intendedCountries.join(', ') : null
                  } />
                  <InfoField label={t('application.departureDate')} value={application.travelInfo.departureDate ? new Date(application.travelInfo.departureDate).toLocaleDateString() : null} />
                  <InfoField label={t('application.returnDate')} value={application.travelInfo.returnDate ? new Date(application.travelInfo.returnDate).toLocaleDateString() : null} />
                </dl>
              </InfoSection>
            )}

            {/* Documents */}
            <InfoSection title={t('application.documentsTitle')} icon="📄">
              {documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc._id} className={`border rounded-lg p-4 ${
                      doc.validationStatus === 'approved' ? 'border-green-200 bg-green-50' :
                      doc.validationStatus === 'rejected' ? 'border-red-200 bg-red-50' :
                      'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 capitalize">
                              {doc.documentType?.replace('_', ' ') || 'Document'}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${doc.validationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                doc.validationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}
                            `}>
                              {doc.validationStatus === 'pending' ? '⏳ Pending' :
                               doc.validationStatus === 'approved' ? '✅ Approved' :
                               '❌ Rejected'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">File: </span>
                              <span className="text-gray-900">{doc.originalName || 'Unknown'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Uploaded: </span>
                              <span className="text-gray-900">{new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {doc.validationNotes && (
                            <div className="bg-gray-100 rounded p-2 mb-3">
                              <p className="text-xs font-medium text-gray-700">Validation Notes:</p>
                              <p className="text-sm text-gray-600">{doc.validationNotes}</p>
                            </div>
                          )}

                          {doc.validationStatus === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateDocumentStatus(doc._id, 'approved')}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Reason for rejection:');
                                  if (reason) {
                                    updateDocumentStatus(doc._id, 'rejected', reason);
                                  }
                                }}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-2 block">📄</span>
                  <p className="text-gray-500">No documents uploaded</p>
                </div>
              )}
            </InfoSection>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Status Actions */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.statusActions')}</h3>
              
              <div className="space-y-3">
                {application.status === 'submitted' && (
                  <button
                    onClick={() => updateStatus('under_review')}
                    disabled={updating}
                    className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {t('admin.markUnderReview')}
                  </button>
                )}
                
                {application.status === 'under_review' && (
                  <>
                    <button
                      onClick={() => updateStatus('approved')}
                      disabled={updating}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {t('admin.approve')}
                    </button>
                    <button
                      onClick={() => updateStatus('rejected')}
                      disabled={updating}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {t('admin.reject')}
                    </button>
                  </>
                )}
                
                {application.status === 'approved' && (
                  <button
                    onClick={() => updateStatus('completed')}
                    disabled={updating}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    {t('status.completed')}
                  </button>
                )}
              </div>
            </div>

            {/* Review Notes */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('admin.reviewNotes')}</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('admin.notes')}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('admin.addNotes')}
                  />
                </div>
                
                {application.reviewedAt && (
                  <div className="text-sm text-gray-500">
                    <p>Last reviewed: {new Date(application.reviewedAt).toLocaleString()}</p>
                    {application.reviewedBy && (
                      <p>Reviewed by: {application.reviewedBy}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 