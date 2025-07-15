'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchApplications();
    }
  }, [session]);

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
    const statusClasses = {
      draft: 'status-pending',
      submitted: 'status-processing',
      documents_uploaded: 'status-processing',
      under_review: 'status-processing',
      pending_payment: 'status-pending',
      payment_confirmed: 'status-processing',
      in_processing: 'status-processing',
      ready_for_collection: 'status-approved',
      completed: 'status-approved',
      rejected: 'status-rejected',
      cancelled: 'status-rejected'
    };

    const statusLabels = {
      draft: 'Draft',
      submitted: 'Submitted',
      documents_uploaded: 'Documents Uploaded',
      under_review: 'Under Review',
      pending_payment: 'Pending Payment',
      payment_confirmed: 'Payment Confirmed',
      in_processing: 'Processing',
      ready_for_collection: 'Ready for Collection',
      completed: 'Completed',
      rejected: 'Rejected',
      cancelled: 'Cancelled'
    };

    return (
      <span className={`status-badge ${statusClasses[status] || 'status-pending'}`}>
        {statusLabels[status] || status}
      </span>
    );
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
          <Link href="/applications/new" className="card-sudan p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="bg-sudan-red/10 w-12 h-12 rounded-lg flex items-center justify-center mr-4">
                <span className="text-sudan-red text-xl">📄</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">New Application</h3>
                <p className="text-gray-600 text-sm">Start passport renewal</p>
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
                  You haven't submitted any passport renewal applications yet.
                </p>
                <Link href="/applications/new" className="btn-sudan">
                  Start New Application
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          Application #{app.applicationNumber}
                        </h4>
                        <p className="text-gray-600 text-sm mt-1">
                          {app.applicationType} • {app.processingType} processing
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Submitted: {new Date(app.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(app.status)}
                        <div className="mt-2">
                          <Link 
                            href={`/applications/${app._id}`}
                            className="text-sudan-red hover:text-sudan-red/80 text-sm font-medium"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
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