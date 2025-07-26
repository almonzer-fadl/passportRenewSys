'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    underReview: 0,
    approved: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

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

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { class: 'badge-neutral', text: t('status.draft') },
      submitted: { class: 'badge-info', text: t('status.submitted') },
      under_review: { class: 'badge-warning', text: t('status.underReview') },
      approved: { class: 'badge-success', text: t('status.approved') },
      rejected: { class: 'badge-error', text: t('status.rejected') },
      completed: { class: 'badge-success', text: t('status.completed') }
    };
    const config = statusConfig[status] || { class: 'badge-neutral', text: status };
    return `badge ${config.class}`;
  };

  const getStatusText = (status) => {
    const statusConfig = {
      draft: t('status.draft'),
      submitted: t('status.submitted'),
      under_review: t('status.underReview'),
      approved: t('status.approved'),
      rejected: t('status.rejected'),
      completed: t('status.completed')
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
              <span>{t('navigation.home')}</span>
            </Link>
          </div>
          <div className="navbar-center">
            <span className="text-lg font-semibold">
              {t('dashboard.welcome')}, {user?.firstName || t('common.user')}!
            </span>
          </div>
          <div className="navbar-end">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full bg-secondary text-secondary-content flex items-center justify-center">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
              </div>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 text-base-content">
                <li><Link href="/profile">{t('navigation.profile')}</Link></li>
                {user?.role === 'admin' && (
                  <li><Link href="/admin">{t('admin.dashboard')}</Link></li>
                )}
                <li><button onClick={handleLogout}>{t('navigation.logout')}</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="hero bg-gradient-to-r from-primary to-secondary text-primary-content rounded-lg mb-8">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-4xl font-bold">
                  {t('dashboard.title')}
                </h1>
                <p className="py-6">
                  {t('dashboard.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/apply" className="btn btn-accent">
                    {t('dashboard.newApplication')}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin" className="btn btn-secondary">
                      {t('admin.dashboard')}
                    </Link>
                  )}
                </div>
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
              <div className="stat-title">{t('dashboard.totalApplications')}</div>
              <div className="stat-value text-primary">{stats.total}</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-warning">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
              </div>
              <div className="stat-title">{t('status.draft')}</div>
              <div className="stat-value text-warning">{stats.draft}</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path>
                </svg>
              </div>
              <div className="stat-title">{t('status.underReview')}</div>
              <div className="stat-value text-info">{stats.underReview}</div>
            </div>

            <div className="stat bg-base-100 rounded-lg shadow">
              <div className="stat-figure text-success">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div className="stat-title">{t('status.approved')}</div>
              <div className="stat-value text-success">{stats.approved}</div>
            </div>
          </div>

          {/* Applications List */}
          <div className="bg-base-100 rounded-lg shadow">
            <div className="p-6 border-b border-base-300">
              <h2 className="text-2xl font-bold">{t('dashboard.myApplications')}</h2>
            </div>
            
            {applications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>{t('admin.applicationNumber')}</th>
                      <th>{t('admin.applicationType')}</th>
                      <th>{t('admin.currentStatus')}</th>
                      <th>{t('admin.submissionDate')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((application) => (
                      <tr key={application._id}>
                        <td>
                          <div className="font-medium">{application.applicationNumber || 'N/A'}</div>
                          <div className="text-sm opacity-50">ID: {application._id}</div>
                        </td>
                        <td>
                          <div className="font-medium">
                            {application.applicationType === 'new' ? t('application.newPassport') :
                             application.applicationType === 'renewal' ? t('application.renewal') :
                             application.applicationType === 'replacement' ? t('application.replacement') :
                             t('application.correction')}
                          </div>
                          <div className="text-sm opacity-50">
                            {application.processingType === 'express' ? t('application.express') : t('application.regular')}
                          </div>
                        </td>
                        <td>
                          <div className={getStatusBadge(application.status)}>
                            {getStatusText(application.status)}
                          </div>
                        </td>
                        <td>{formatDate(application.createdAt)}</td>
                        <td>
                          <Link 
                            href={`/apply?id=${application._id}`}
                            className="btn btn-sm btn-primary"
                          >
                            {t('common.view')}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">{t('dashboard.noApplications')}</h3>
                <p className="text-base-content/70 mb-6">{t('dashboard.noApplicationsDesc')}</p>
                <Link href="/apply" className="btn btn-primary">
                  {t('dashboard.startApplication')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}