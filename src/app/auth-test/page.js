'use client';

import { useAuth } from '@/components/AuthProvider';
import { useState } from 'react';

export default function AuthTest() {
  const { user, login, logout, loading } = useAuth();
  const [testResult, setTestResult] = useState('');

  const testLogin = async () => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'demo@passport.gov.sd', 
          password: 'demo123' 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        login(data.user);
        setTestResult('✅ Login successful! User data: ' + JSON.stringify(data.user, null, 2));
      } else {
        setTestResult('❌ Login failed: ' + data.error);
      }
    } catch (error) {
      setTestResult('❌ Login error: ' + error.message);
    }
  };

  const testLogout = async () => {
    try {
      await logout();
      setTestResult('✅ Logout successful!');
    } catch (error) {
      setTestResult('❌ Logout error: ' + error.message);
    }
  };

  const testSignoutAPI = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setTestResult('✅ Signout API response: ' + JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult('❌ Signout API error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication System Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current State */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Current State</h2>
              <div className="space-y-2">
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'Not logged in'}</p>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Test Controls</h2>
              <div className="space-y-4">
                <button onClick={testLogin} className="btn btn-primary w-full">
                  Test Login (demo@passport.gov.sd)
                </button>
                <button onClick={testLogout} className="btn btn-secondary w-full">
                  Test Logout
                </button>
                <button onClick={testSignoutAPI} className="btn btn-accent w-full">
                  Test Signout API
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="card bg-base-100 shadow-xl mt-8">
            <div className="card-body">
              <h2 className="card-title">Test Results</h2>
              <pre className="bg-base-200 p-4 rounded-lg overflow-x-auto">
                {testResult}
              </pre>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <a href="/auth/login" className="btn btn-outline">Go to Login Page</a>
          <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
          <a href="/" className="btn btn-secondary">Go to Home</a>
        </div>
      </div>
    </div>
  );
} 