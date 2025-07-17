'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  });

  // Check if user is admin (in a real app, this would be a proper role check)
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login?callbackUrl=/admin');
      return;
    }
    
    // Simple admin check - in production, use proper role management
    if (session.user.email !== 'demo@passport.gov.sd') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.type !== 'all') queryParams.append('type', filters.type);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await fetch(`/api/admin/applications?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, stats]);

  useEffect(() => {
    if (session?.user?.email === 'demo@passport.gov.sd') {
      fetchApplications();
    }
    }, [session, fetchApplications]);

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Refresh applications list
        fetchApplications();
      }
    } catch (error) {
      console.error('Error updating status:', error);
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
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

  const getTypeBadge = (type) => {
    const typeConfig = {
      'new': { label: 'New Passport', icon: '📄' },
      'renewal': { label: 'Renewal', icon: '🔄' },
      'replacement': { label: 'Replacement', icon: '🔄' },
      'correction': { label: 'Correction', icon: '✏️' }
    };

    const config = typeConfig[type] || typeConfig['new'];
    
    return (
      <span className="inline-flex items-center">
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user.email !== 'demo@passport.gov.sd') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage passport applications</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Back to User Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⏳</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">👀</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Under Review</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.underReview}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.approved}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">❌</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.rejected}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="new">New Passport</option>
                  <option value="renewal">Renewal</option>
                  <option value="replacement">Replacement</option>
                  <option value="correction">Correction</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search by application number, name, or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Applications</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.application_number}
                        </div>
                        <div className="text-sm text-gray-500">
                          ${application.total_fee}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {application.user_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.user_email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTypeBadge(application.application_type)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {application.processing_speed === 'express' ? 'Express' : 'Regular'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/admin/applications/${application.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Review
                        </button>
                        
                        {application.status === 'submitted' && (
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'under_review')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Start Review
                          </button>
                        )}
                        
                        {application.status === 'under_review' && (
                          <>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'approved')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateApplicationStatus(application.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {applications.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl mb-4 block">📄</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500">No applications match your current filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 