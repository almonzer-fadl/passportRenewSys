'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [submittedAppNumber, setSubmittedAppNumber] = useState(null);

  // Mock session data for demo
  const session = {
    user: {
      id: '1',
      name: 'Demo User',
      email: 'demo@passport.gov.sd',
      firstName: 'Demo',
      lastName: 'User',
      nationalId: '123456789'
    }
  };

  useEffect(() => {
    // Mock fetching applications with demo data
    fetchApplications();
  }, []);

  // Check for success message from application submission
  useEffect(() => {
    const submitted = searchParams.get('submitted');
    if (submitted) {
      setSubmittedAppNumber(submitted);
      setShowSuccessMessage(true);
      
      // Remove the query parameter from URL without page reload
      const url = new URL(window.location);
      url.searchParams.delete('submitted');
      window.history.replaceState({}, '', url);
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  }, [searchParams]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Mock applications data for demo
      const mockApplications = [
        {
          id: '1',
          applicationType: 'new',
          status: 'submitted',
          personalInfo: {
            firstName: 'Demo',
            lastName: 'User',
            dateOfBirth: '1990-01-01'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          applicationType: 'renewal',
          status: 'under_review',
          personalInfo: {
            firstName: 'Demo',
            lastName: 'User',
            dateOfBirth: '1990-01-01'
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setApplications(mockApplications);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    // Mock sign out - redirect to home
    router.push('/');
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

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-primary text-primary-content">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost text-xl">
            🇸🇩 Sudan Passport System
          </Link>
        </div>
        <div className="navbar-center">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              <div className="flex items-center gap-2">
                <div className="avatar placeholder">
                  <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                    <span className="text-xs">{session?.user?.firstName?.[0]}{session?.user?.lastName?.[0]}</span>
                  </div>
                </div>
                <span className="hidden md:inline">{session?.user?.name}</span>
              </div>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
              <li><Link href="/profile">Profile</Link></li>
              <li><button onClick={handleSignOut}>Sign Out</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccessMessage && (
          <div className="alert alert-success mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              Application #{submittedAppNumber} submitted successfully! You will receive email updates as your application progresses.
            </span>
          </div>
        )}

        {/* Welcome Section */}
        <div className="hero bg-base-100 rounded-lg shadow-lg mb-8">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-3xl font-bold">Welcome, {session?.user?.firstName}!</h1>
              <p className="py-6">
                Manage your passport applications and track their progress from your dashboard.
              </p>
              <Link href="/apply" className="btn btn-primary">
                New Application
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats stats-vertical lg:stats-horizontal shadow mb-8 w-full">
          <div className="stat">
            <div className="stat-title">Total Applications</div>
            <div className="stat-value">{applications.length}</div>
            <div className="stat-desc">All time</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Pending Review</div>
            <div className="stat-value text-warning">
              {applications.filter(app => ['submitted', 'under_review'].includes(app.status)).length}
            </div>
            <div className="stat-desc">Awaiting processing</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Completed</div>
            <div className="stat-value text-success">
              {applications.filter(app => ['approved', 'completed'].includes(app.status)).length}
            </div>
            <div className="stat-desc">Ready for pickup</div>
          </div>
        </div>

        {/* Applications List */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">Your Applications</h2>
              <Link href="/apply" className="btn btn-primary btn-sm">
                + New Application
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
                <p className="text-base-content/70 mb-4">
                  You haven't submitted any passport applications yet.
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
                          <div className="flex gap-2">
                            <Link 
                              href={`/dashboard/applications/${application.id}`} 
                              className="btn btn-sm btn-outline"
                            >
                              View
                            </Link>
                            {application.status === 'approved' && (
                              <button className="btn btn-sm btn-success">
                                Download
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="card-title justify-center">New Application</h3>
              <p>Start a new passport application</p>
              <div className="card-actions justify-center">
                <Link href="/apply" className="btn btn-primary">Apply Now</Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="card-title justify-center">Profile</h3>
              <p>Update your personal information</p>
              <div className="card-actions justify-center">
                <Link href="/profile" className="btn btn-outline">View Profile</Link>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body text-center">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="card-title justify-center">Support</h3>
              <p>Need help with your application?</p>
              <div className="card-actions justify-center">
                <button className="btn btn-outline">Contact Us</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
} 