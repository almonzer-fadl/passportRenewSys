'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    underReview: 0,
    approved: 0
  });

  // Check for successful submission
  const submittedApp = searchParams.get('submitted');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login?callbackUrl=/dashboard');
      return;
    }
    fetchApplications();
  }, [session, status, router]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        
        // Calculate stats
        const newStats = {
          total: data.applications?.length || 0,
          draft: data.applications?.filter(app => app.status === 'draft').length || 0,
          submitted: data.applications?.filter(app => app.status === 'submitted').length || 0,
          underReview: data.applications?.filter(app => app.status === 'under_review').length || 0,
          approved: data.applications?.filter(app => app.status === 'approved').length || 0
        };
        setStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { class: 'badge-neutral', text: 'Draft' },
      submitted: { class: 'badge-info', text: 'Submitted' },
      under_review: { class: 'badge-warning', text: 'Under Review' },
      approved: { class: 'badge-success', text: 'Approved' },
      rejected: { class: 'badge-error', text: 'Rejected' },
      completed: { class: 'badge-success', text: 'Completed' }
    };
    const config = statusConfig[status] || { class: 'badge-neutral', text: status };
    return `badge ${config.class}`;
  };

  const getStatusText = (status) => {
    const statusConfig = {
      draft: 'Draft',
      submitted: 'Submitted',
      under_review: 'Under Review',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed'
    };
    return statusConfig[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="navbar bg-primary text-primary-content">
        <div className="navbar-start">
          <Link href="/" className="btn btn-ghost text-xl">
            🇸🇩 Sudan Passport
          </Link>
        </div>
        <div className="navbar-center">
          <span className="text-lg font-semibold">Dashboard</span>
        </div>
        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-secondary text-secondary-content flex items-center justify-center">
                {session.user?.firstName?.[0] || session.user?.name?.[0] || 'U'}
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
              <li><Link href="/profile">Profile</Link></li>
              <li><button onClick={() => router.push('/api/auth/signout')}>Logout</button></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {submittedApp && (
          <div className="alert alert-success mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Application {submittedApp} submitted successfully!</span>
          </div>
        )}

        {/* Welcome Section */}
        <div className="hero bg-gradient-to-r from-primary to-secondary text-primary-content rounded-lg mb-8">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold">
                Welcome, {session.user?.firstName || session.user?.name}!
              </h1>
              <p className="py-6">
                Manage your passport applications and track their progress from your dashboard.
              </p>
              <Link href="/apply" className="btn btn-accent">
                New Application
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Total Applications</div>
            <div className="stat-value text-primary">{stats.total}</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
              </svg>
            </div>
            <div className="stat-title">Draft</div>
            <div className="stat-value text-warning">{stats.draft}</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
              </svg>
            </div>
            <div className="stat-title">Under Review</div>
            <div className="stat-value text-info">{stats.underReview}</div>
          </div>

          <div className="stat bg-base-100 rounded-lg shadow">
            <div className="stat-figure text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div className="stat-title">Approved</div>
            <div className="stat-value text-success">{stats.approved}</div>
          </div>
        </div>

        {/* Applications List */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-2xl">Your Applications</h2>
              <Link href="/apply" className="btn btn-primary">
                New Application
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">No applications yet</h3>
                <p className="text-base-content/70 mb-4">
                  Start your first passport application to get started.
                </p>
                <Link href="/apply" className="btn btn-primary">
                  Start Application
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Application #</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app._id}>
                        <td>
                          <div className="font-mono font-semibold">
                            {app.applicationNumber || 'DRAFT'}
                          </div>
                        </td>
                        <td>
                          <div className="capitalize">
                            {app.applicationType || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div className={`badge ${getStatusBadge(app.status)}`}>
                            {getStatusText(app.status)}
                          </div>
                        </td>
                        <td>{formatDate(app.createdAt)}</td>
                        <td>
                          <div className="flex gap-2">
                            <Link 
                              href={`/applications/${app._id}`}
                              className="btn btn-sm btn-outline"
                            >
                              View
                            </Link>
                            {app.status === 'draft' && (
                              <Link 
                                href={`/apply?id=${app._id}`}
                                className="btn btn-sm btn-primary"
                              >
                                Continue
                              </Link>
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
      </div>
    </div>
  );
}