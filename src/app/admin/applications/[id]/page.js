'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';

export default function AdminApplicationReview() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState(null);
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login?callbackUrl=/admin');
      return;
    }
    
    if (session.user.email !== 'demo@passport.gov.sd') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  // Fetch application details
  const fetchApplicationDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch application details
      const appResponse = await fetch(`/api/admin/applications/${params.id}`);
      if (appResponse.ok) {
        const appData = await appResponse.json();
        setApplication(appData.application);
        setUser(appData.user);
        setNotes(appData.application.notes || '');
      }

      // Fetch documents
      const docsResponse = await fetch(`/api/admin/applications/${params.id}/documents`);
      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setDocuments(docsData.documents || []);
      }

    } catch (error) {
      console.error('Error fetching application details:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (session?.user?.email === 'demo@passport.gov.sd' && params.id) {
      fetchApplicationDetails();
    }
    }, [session, params.id, fetchApplicationDetails]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      
      const response = await fetch(`/api/admin/applications/${params.id}/status`, {
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
      const response = await fetch(`/api/admin/documents/${documentId}/status`, {
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
      'draft': { color: 'gray', label: 'Draft' },
      'submitted': { color: 'blue', label: 'Submitted' },
      'under_review': { color: 'yellow', label: 'Under Review' },
      'approved': { color: 'green', label: 'Approved' },
      'rejected': { color: 'red', label: 'Rejected' },
      'completed': { color: 'purple', label: 'Completed' }
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
      <dd className="text-sm text-gray-900 col-span-2">{value || 'Not provided'}</dd>
    </div>
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user.email !== 'demo@passport.gov.sd') {
    return null;
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl mb-4 block">❌</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Application not found</h3>
          <p className="text-gray-500">The requested application could not be found.</p>
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
                Application Review: {application.application_number}
              </h1>
              <div className="mt-2 flex items-center space-x-4">
                {getStatusBadge(application.status)}
                <span className="text-sm text-gray-500">
                  Submitted: {new Date(application.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Application Information */}
            <InfoSection title="Application Details" icon="📋">
              <dl className="divide-y divide-gray-200">
                <InfoField label="Application Number" value={application.application_number} />
                <InfoField label="Application Type" value={
                  application.application_type === 'new' ? 'New Passport' :
                  application.application_type === 'renewal' ? 'Passport Renewal' :
                  application.application_type === 'replacement' ? 'Passport Replacement' :
                  'Passport Correction'
                } />
                <InfoField label="Processing Speed" value={
                  application.processing_speed === 'express' ? 'Express (5-7 days)' : 'Regular (10-15 days)'
                } />
                <InfoField label="Total Fee" value={`$${application.total_fee}`} />
                <InfoField label="Status" value={getStatusBadge(application.status)} />
              </dl>
            </InfoSection>

            {/* Applicant Information */}
            {user && (
              <InfoSection title="Applicant Information" icon="👤">
                <dl className="divide-y divide-gray-200">
                  <InfoField label="Full Name" value={`${user.first_name} ${user.middle_name || ''} ${user.last_name}`} />
                  <InfoField label="Email" value={user.email} />
                  <InfoField label="Phone" value={user.phone} />
                  <InfoField label="Date of Birth" value={new Date(user.date_of_birth).toLocaleDateString()} />
                  <InfoField label="Place of Birth" value={user.place_of_birth} />
                  <InfoField label="Gender" value={user.gender} />
                  <InfoField label="Nationality" value={user.nationality} />
                  <InfoField label="National ID" value={user.national_id} />
                  <InfoField label="Address" value={`${user.address}, ${user.city}, ${user.state}, ${user.country}`} />
                </dl>
              </InfoSection>
            )}

            {/* Current Passport (if applicable) */}
            {['renewal', 'replacement'].includes(application.application_type) && (
              <InfoSection title="Current Passport Information" icon="📖">
                <dl className="divide-y divide-gray-200">
                  <InfoField label="Passport Number" value={application.current_passport_number} />
                  <InfoField label="Issue Date" value={application.current_passport_issue_date ? new Date(application.current_passport_issue_date).toLocaleDateString() : null} />
                  <InfoField label="Expiry Date" value={application.current_passport_expiry_date ? new Date(application.current_passport_expiry_date).toLocaleDateString() : null} />
                  <InfoField label="Issuing Office" value={application.current_passport_issuing_office} />
                  <InfoField label="Status" value={application.current_passport_status} />
                  {application.replacement_reason && (
                    <InfoField label="Replacement Reason" value={application.replacement_reason} />
                  )}
                </dl>
              </InfoSection>
            )}

            {/* Travel Information */}
            <InfoSection title="Travel Information" icon="✈️">
              <dl className="divide-y divide-gray-200">
                <InfoField label="Purpose of Travel" value={application.travel_purpose} />
                <InfoField label="Intended Countries" value={
                  application.travel_countries ? JSON.parse(application.travel_countries).join(', ') : null
                } />
                <InfoField label="Departure Date" value={application.travel_departure_date ? new Date(application.travel_departure_date).toLocaleDateString() : null} />
                <InfoField label="Return Date" value={application.travel_return_date ? new Date(application.travel_return_date).toLocaleDateString() : null} />
              </dl>
            </InfoSection>

            {/* Documents */}
            <InfoSection title="Document Verification" icon="📄">
              {documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className={`border rounded-lg p-4 ${
                      doc.validation_status === 'approved' ? 'border-green-200 bg-green-50' :
                      doc.validation_status === 'rejected' ? 'border-red-200 bg-red-50' :
                      'border-yellow-200 bg-yellow-50'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900 capitalize">
                              {doc.document_type.replace('_', ' ')}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${doc.validation_status === 'approved' ? 'bg-green-100 text-green-800' :
                                doc.validation_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}
                            `}>
                              {doc.validation_status === 'pending' ? '⏳ Pending' :
                               doc.validation_status === 'approved' ? '✅ Approved' :
                               '❌ Rejected'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-500">File: </span>
                              <span className="text-gray-900">{doc.original_name}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Size: </span>
                              <span className="text-gray-900">{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Type: </span>
                              <span className="text-gray-900">{doc.mimetype}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Uploaded: </span>
                              <span className="text-gray-900">{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {doc.ai_validation_notes && (
                            <div className="bg-gray-100 rounded p-2 mb-3">
                              <p className="text-xs font-medium text-gray-700">Validation Notes:</p>
                              <p className="text-sm text-gray-600">{doc.ai_validation_notes}</p>
                            </div>
                          )}

                          {doc.validation_status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateDocumentStatus(doc.id, 'approved')}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => {
                                  const reason = prompt('Reason for rejection:');
                                  if (reason) {
                                    updateDocumentStatus(doc.id, 'rejected', reason);
                                  }
                                }}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}

                          {doc.validation_status !== 'pending' && (
                            <div className="flex items-center text-xs text-gray-500">
                              <span>Status last updated: {new Date(doc.uploaded_at).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          <button
                            onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            📁 View File
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Document Summary */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Document Verification Summary</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {documents.filter(d => d.validation_status === 'approved').length}
                        </div>
                        <div className="text-gray-600">Approved</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">
                          {documents.filter(d => d.validation_status === 'pending').length}
                        </div>
                        <div className="text-gray-600">Pending</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {documents.filter(d => d.validation_status === 'rejected').length}
                        </div>
                        <div className="text-gray-600">Rejected</div>
                      </div>
                    </div>
                  </div>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status Actions</h3>
              
              <div className="space-y-3">
                {application.status === 'submitted' && (
                  <button
                    onClick={() => updateStatus('under_review')}
                    disabled={updating}
                    className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Start Review
                  </button>
                )}
                
                {application.status === 'under_review' && (
                  <>
                    <button
                      onClick={() => updateStatus('approved')}
                      disabled={updating}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve Application
                    </button>
                    <button
                      onClick={() => updateStatus('rejected')}
                      disabled={updating}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject Application
                    </button>
                  </>
                )}
                
                {application.status === 'approved' && (
                  <button
                    onClick={() => updateStatus('completed')}
                    disabled={updating}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>

            {/* Review Notes */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Review Notes</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add review notes..."
                  />
                </div>
                
                {application.reviewed_at && (
                  <div className="text-sm text-gray-500">
                    <p>Last reviewed: {new Date(application.reviewed_at).toLocaleString()}</p>
                    {application.reviewed_by && (
                      <p>Reviewed by: {application.reviewed_by}</p>
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