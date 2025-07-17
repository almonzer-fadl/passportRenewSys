'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login?callbackUrl=/profile');
    }
  }, [session, status, router]);

  // Fetch user profile and applications
  useEffect(() => {
    if (session) {
      fetchUserProfile();
      fetchApplicationHistory();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData(data.user);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchApplicationHistory = async () => {
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

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setEditing(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    );
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-600">Manage your account and view application history</p>
            </div>
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditing(false);
                          setFormData(user);
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                {user && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.first_name || ''}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{user.first_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.last_name || ''}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{user.last_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p className="text-gray-900">{user.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{user.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <p className="text-gray-900">
                        {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        National ID
                      </label>
                      <p className="text-gray-900">{user.national_id || 'Not provided'}</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {editing ? (
                        <textarea
                          value={formData.address || ''}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">
                          {user.address && user.city && user.state && user.country 
                            ? `${user.address}, ${user.city}, ${user.state}, ${user.country}`
                            : 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Application History */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Application History</h2>
              </div>
              
              <div className="p-6">
                {applications.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">📄</span>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-gray-600 mb-4">You haven&apos;t submitted any applications yet.</p>
                    <Link
                      href="/apply"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Start New Application
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((app) => (
                      <div key={app.id || app._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              #{app.application_number || app.applicationNumber}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {app.application_type === 'new' ? 'New Passport' :
                               app.application_type === 'renewal' ? 'Passport Renewal' :
                               app.application_type === 'replacement' ? 'Passport Replacement' :
                               app.applicationType || 'Passport Application'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted: {new Date(app.created_at || app.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(app.status)}
                            <div className="mt-2">
                              <Link
                                href={`/applications/${app.id || app._id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View Details →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {applications.length > 5 && (
                      <div className="text-center pt-4">
                        <Link
                          href="/dashboard"
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View All Applications →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Account Summary */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Applications</span>
                  <span className="text-sm font-medium text-gray-900">{applications.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-medium text-green-600">
                    {applications.filter(app => app.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-sm font-medium text-blue-600">
                    {applications.filter(app => ['submitted', 'under_review', 'approved'].includes(app.status)).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/apply"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 text-center block"
                >
                  New Application
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 text-center block"
                >
                  View Dashboard
                </Link>
                <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-700">
                  Download Certificate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 