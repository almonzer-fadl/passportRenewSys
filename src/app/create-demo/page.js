'use client';

import { useState } from 'react';

export default function CreateDemoPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const createDemoUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-demo-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        success: false, 
        error: 'Failed to create demo user', 
        details: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  const checkDemoUser = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-demo-user', {
        method: 'GET',
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ 
        error: 'Failed to check demo user', 
        details: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Demo User Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create or check demo user for testing
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={checkDemoUser}
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check if Demo User Exists'}
          </button>

          <button
            onClick={createDemoUser}
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Demo User'}
          </button>
        </div>

        {result && (
          <div className={`mt-6 p-4 rounded-md ${
            result.success || result.exists ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <div className="flex">
              <div className="ml-3">
                <h3 className={`text-sm font-medium ${
                  result.success || result.exists ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.success || result.exists ? 'Success' : 'Error'}
                </h3>
                <div className={`mt-2 text-sm ${
                  result.success || result.exists ? 'text-green-700' : 'text-red-700'
                }`}>
                  <p>{result.message || result.error}</p>
                  
                  {result.credentials && (
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                      <h4 className="font-medium text-gray-900">Login Credentials:</h4>
                      <p className="font-mono text-sm">
                        Email: {result.credentials.email}
                      </p>
                      <p className="font-mono text-sm">
                        Password: {result.credentials.password}
                      </p>
                    </div>
                  )}

                  {result.user && (
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                      <h4 className="font-medium text-gray-900">User Details:</h4>
                      <p>Name: {result.user.name || `${result.user.firstName} ${result.user.lastName}`}</p>
                      <p>Email: {result.user.email}</p>
                      <p>Status: {result.user.status}</p>
                      <p>Role: {result.user.role}</p>
                      {result.user.createdAt && (
                        <p>Created: {new Date(result.user.createdAt).toLocaleString()}</p>
                      )}
                    </div>
                  )}

                  {result.details && typeof result.details === 'object' && (
                    <div className="mt-2">
                      <pre className="text-xs bg-gray-800 text-white p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <a
            href="/auth/login"
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  );
} 