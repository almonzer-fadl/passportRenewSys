'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  // Fetch mock user profile and applications
  useEffect(() => {
    fetchUserProfile();
    fetchApplicationHistory();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Use authenticated user data
      const userData = {
        id: authUser?.id || '1',
        name: `${authUser?.firstName || 'Demo'} ${authUser?.lastName || 'User'}`,
        firstName: authUser?.firstName || 'Demo',
        lastName: authUser?.lastName || 'User',
        email: authUser?.email || 'demo@passport.gov.sd',
        nationalId: '123456789',
        phone: '+249123456789',
        address: '123 Demo Street, Khartoum, Sudan',
        dateOfBirth: '1990-01-01',
        nationality: 'Sudanese',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setUser(userData);
      setFormData(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationHistory = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData(user); // Reset form data
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock save - just update local state
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setUser(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'badge-info';
      case 'under_review':
        return 'badge-warning';
      case 'approved':
        return 'badge-success';
      case 'rejected':
        return 'badge-error';
      case 'completed':
        return 'badge-success';
      default:
        return 'badge-neutral';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getApplicationTypeText = (type) => {
    switch (type) {
      case 'new':
        return 'New Passport';
      case 'renewal':
        return 'Passport Renewal';
      case 'replacement':
        return 'Passport Replacement';
      case 'correction':
        return 'Data Correction';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-primary text-primary-content">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost text-xl flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center overflow-hidden">
              <Image 
                src="/sudan.png" 
                alt="Sudan Flag" 
                width={24} 
                height={24}
                className="object-contain"
              />
            </div>
            <span>Sudan Passport System</span>
          </Link>
        </div>
        <div className="navbar-center">
          <h1 className="text-lg font-semibold">Profile</h1>
        </div>
        <div className="navbar-end">
          <Link href="/dashboard" className="btn btn-ghost">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="card bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex justify-between items-center mb-6">
              <h2 className="card-title text-2xl">Personal Information</h2>
              {!editing ? (
                <button onClick={handleEdit} className="btn btn-primary">
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave} 
                    className={`btn btn-success ${saving ? 'loading' : ''}`}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={handleCancel} className="btn btn-outline">
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">First Name</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ''}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                ) : (
                  <div className="p-3 bg-base-200 rounded">{user?.firstName}</div>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Last Name</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ''}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                ) : (
                  <div className="p-3 bg-base-200 rounded">{user?.lastName}</div>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                ) : (
                  <div className="p-3 bg-base-200 rounded">{user?.email}</div>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">National ID</span>
                </label>
                <div className="p-3 bg-base-200 rounded">{user?.nationalId}</div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                {editing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    className="input input-bordered"
                  />
                ) : (
                  <div className="p-3 bg-base-200 rounded">{user?.phone}</div>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date of Birth</span>
                </label>
                <div className="p-3 bg-base-200 rounded">
                  {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not specified'}
                </div>
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text">Address</span>
                </label>
                {editing ? (
                  <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                    className="textarea textarea-bordered"
                    rows="3"
                  />
                ) : (
                  <div className="p-3 bg-base-200 rounded">{user?.address}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Application History */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">Application History</h2>

            {applications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                <p className="text-base-content/70 mb-4">
                  You haven&apos;t submitted any passport applications yet.
                </p>
                <Link href="/apply" className="btn btn-primary">
                  Submit Your First Application
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>Application #</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Last Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <tr key={application.id}>
                        <td className="font-mono">#{application.id}</td>
                        <td>{getApplicationTypeText(application.applicationType)}</td>
                        <td>
                          <span className={`badge ${getStatusColor(application.status)}`}>
                            {getStatusText(application.status)}
                          </span>
                        </td>
                        <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                        <td>{new Date(application.updatedAt).toLocaleDateString()}</td>
                        <td>
                          <Link 
                            href={`/dashboard/applications/${application.id}`} 
                            className="btn btn-sm btn-outline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
} 