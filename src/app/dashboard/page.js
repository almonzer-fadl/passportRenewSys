'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submittedAppNumber, setSubmittedAppNumber] = useState(null);

  useEffect(() => {
    if (session) {
      fetchApplications();
    }
  }, [session]);

  // Check for success message from application submission
  useEffect(() => {
    const submitted = searchParams.get('submitted');
    if (submitted) {
      setSubmittedAppNumber(submitted);
      setShowSuccessMessage(true);
      
      // Remove the query parameter from URL without page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Hide success message after 10 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 10000);
    }
  }, [searchParams]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'draft': { color: 'gray', label: 'Draft', icon: '📝' },
      'submitted': { color: 'blue', label: 'Submitted', icon: '📤' },
      'under_review': { color: 'yellow', label: 'Under Review', icon: '👀' },
      'approved': { color: 'green', label: 'Approved', icon: '✅' },
      'rejected': { color: 'red', label: 'Rejected', icon: '❌' },
      'completed': { color: 'purple', label: 'Completed', icon: '🎉' }
    };

    const config = statusConfig[status] || statusConfig['draft'];
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${config.color === 'gray' ? 'bg-gray-100 text-gray-800' : ''}
          ${config.color === 'blue' ? 'bg-blue-100 text-blue-800' : ''}
          ${config.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${config.color === 'green' ? 'bg-green-100 text-green-800' : ''}
          ${config.color === 'red' ? 'bg-red-100 text-red-800' : ''}
          ${config.color === 'purple' ? 'bg-purple-100 text-purple-800' : ''}
        `}>
          <span className="mr-1">{config.icon}</span>
          {config.label}
        </span>
      </div>
    );
  };

  const getStatusProgress = (status) => {
    const statusOrder = ['submitted', 'under_review', 'approved', 'completed'];
    const currentIndex = statusOrder.indexOf(status);
    
    if (currentIndex === -1) return 0;
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const getExpectedTimeline = (processingSpeed, status) => {
    const isExpress = processingSpeed === 'express';
    const baseDays = isExpress ? 7 : 14;
    
    const timelines = {
      'submitted': 'Application received and queued for review',
      'under_review': `Expected completion in ${baseDays - 3} days`,
      'approved': `Processing passport - ${Math.ceil(baseDays / 2)} days remaining`,
      'completed': 'Ready for collection'
    };
    
    return timelines[status] || 'Processing...';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sudan-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-sudan-red w-10 h-10 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-lg font-bold">🇸🇩</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Sudan Passport Services
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session?.user?.firstName || session?.user?.name}
              </span>
              {session?.user?.email === 'demo@passport.gov.sd' && (
                <Link
                  href="/admin"
                  className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm hover:bg-purple-700"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="btn-sudan-outline text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccessMessage && submittedAppNumber && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Application Submitted Successfully! 🎉
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Your passport application <strong>{submittedAppNumber}</strong> has been submitted successfully.
                    You will receive email notifications as your application progresses.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="text-green-800 hover:text-green-900 text-sm font-medium"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Passport Services Dashboard
          </h2>
          <p className="text-gray-600">
            Manage your passport renewal applications and track their status
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/apply" className="card-sudan p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="bg-sudan-red/10 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <span className="text-sudan-red text-xl">📄</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">New Application</h3>
                <p className="text-gray-600 text-sm">Start passport application</p>
              </div>
            </div>
          </Link>

          <div className="card-sudan p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Track Status</h3>
                <p className="text-gray-600 text-sm">Check application progress</p>
              </div>
            </div>
          </div>

          <div className="card-sudan p-6">
            <div className="flex items-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <span className="text-green-600 text-xl">💳</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Make Payment</h3>
                <p className="text-gray-600 text-sm">Pay processing fees</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div className="card-sudan">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Applications</h3>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sudan-red mx-auto mb-4"></div>
                <p className="text-gray-600">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-400 text-2xl">📄</span>
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h4>
                <p className="text-gray-600 mb-4">
                  You haven&apos;t submitted any passport renewal applications yet.
                </p>
                <Link href="/apply" className="btn-sudan">
                  Start New Application
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {applications.map((app) => (
                  <div key={app.id || app._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    {/* Application Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Application #{app.application_number || app.applicationNumber}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              {app.application_type === 'new' ? 'New Passport' :
                               app.application_type === 'renewal' ? 'Passport Renewal' :
                               app.application_type === 'replacement' ? 'Passport Replacement' :
                               app.applicationType || 'Passport Application'}
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">
                              {app.processing_speed === 'express' || app.processingType === 'express' 
                                ? 'Express Processing' 
                                : 'Regular Processing'}
                            </span>
                          </div>
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>

                    {/* Application Body */}
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Application Details */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Submitted:</span>
                            <span className="text-gray-900">
                              {new Date(app.created_at || app.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total Fee:</span>
                            <span className="text-gray-900 font-medium">
                              ${app.total_fee || 'Calculating...'}
                            </span>
                          </div>

                          {app.travel_purpose && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Travel Purpose:</span>
                              <span className="text-gray-900">{app.travel_purpose}</span>
                            </div>
                          )}

                          {app.reviewed_at && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Last Updated:</span>
                              <span className="text-gray-900">
                                {new Date(app.reviewed_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Progress & Timeline */}
                        <div className="space-y-3">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">Progress</span>
                              <span className="text-gray-900">{Math.round(getStatusProgress(app.status))}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${getStatusProgress(app.status)}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Expected Timeline */}
                          <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-800 mb-1">Expected Timeline</p>
                            <p className="text-sm text-blue-700">
                              {getExpectedTimeline(app.processing_speed || app.processingType, app.status)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-3">
                            <Link 
                              href={`/applications/${app.id || app._id}`}
                              className="flex-1 text-center bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              View Details
                            </Link>
                            
                            {app.status === 'completed' && (
                              <button className="flex-1 text-center bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                                Collection Info
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Notes */}
                      {app.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-700 mb-1">Review Notes:</p>
                          <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">{app.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-sudan-red">{applications.length}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {applications.filter(app => ['submitted', 'under_review', 'in_processing'].includes(app.status)).length}
            </div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(app => app.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(app => app.status === 'pending_payment').length}
            </div>
            <div className="text-sm text-gray-600">Pending Payment</div>
          </div>
        </div>
      </main>
    </div>
  );
} 