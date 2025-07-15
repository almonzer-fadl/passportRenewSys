'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (session && status !== 'loading') {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sudan-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b-2 border-sudan-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-sudan-red rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🇸🇩</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sudan Passport Services</h1>
                <p className="text-xs text-gray-600">Ministry of Interior</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                العربية
              </button>
              <Link href="/auth/login" className="btn-sudan-outline">
                Login
              </Link>
              <Link href="/auth/register" className="btn-sudan">
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-sudan-red/10 via-white to-sudan-blue/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Renew Your <span className="text-sudan-gradient">Sudanese Passport</span> Online
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Fast, secure, and convenient passport renewal service. 
                Complete your application from anywhere, with AI-powered document validation 
                and real-time status tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="btn-sudan text-lg px-8 py-4">
                  Start Application
                </Link>
                <Link href="/auth/login" className="btn-sudan-outline text-lg px-8 py-4">
                  Track Status
                </Link>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-sudan-red">7-14</div>
                  <div className="text-sm text-gray-600">Days Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-sudan-blue">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">24/7</div>
                  <div className="text-sm text-gray-600">Online Access</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="card-sudan p-8">
                <h3 className="text-2xl font-semibold mb-6 text-center">Quick Application</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-sudan-red rounded-full flex items-center justify-center text-white text-sm">1</div>
                    <span>Fill Personal Information</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-sudan-red rounded-full flex items-center justify-center text-white text-sm">2</div>
                    <span>Upload Required Documents</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-sudan-red rounded-full flex items-center justify-center text-white text-sm">3</div>
                    <span>AI Document Validation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-sudan-red rounded-full flex items-center justify-center text-white text-sm">4</div>
                    <span>Pay Processing Fee</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-sudan-red rounded-full flex items-center justify-center text-white text-sm">5</div>
                    <span>Track & Collect</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Advanced Features for Modern Citizens
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of government services with our cutting-edge passport renewal system
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Document Validation */}
            <div className="card-sudan p-8 text-center">
              <div className="w-16 h-16 bg-sudan-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI Document Validation</h3>
              <p className="text-gray-600">
                Advanced AI technology automatically validates your documents, 
                reducing processing time and ensuring accuracy.
              </p>
            </div>

            {/* Face Recognition */}
            <div className="card-sudan p-8 text-center">
              <div className="w-16 h-16 bg-sudan-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📸</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Photo Capture</h3>
              <p className="text-gray-600">
                Real-time face detection and validation ensures your passport photo 
                meets all government requirements.
              </p>
            </div>

            {/* Real-time Tracking */}
            <div className="card-sudan p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Tracking</h3>
              <p className="text-gray-600">
                Track your application status in real-time with notifications 
                and updates throughout the process.
              </p>
            </div>

            {/* Secure Processing */}
            <div className="card-sudan p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔒</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Bank-level Security</h3>
              <p className="text-gray-600">
                Your personal information is protected with enterprise-grade 
                encryption and security protocols.
              </p>
            </div>

            {/* Mobile Optimized */}
            <div className="card-sudan p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Mobile Optimized</h3>
              <p className="text-gray-600">
                Complete your application on any device with our responsive 
                design and mobile-first approach.
              </p>
            </div>

            {/* 24/7 Support */}
            <div className="card-sudan p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🆘</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">24/7 Support</h3>
              <p className="text-gray-600">
                Get help whenever you need it with our round-the-clock 
                customer support and comprehensive FAQ system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Try the Demo
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Experience our passport renewal system with a live demo account.
          </p>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Demo Account Credentials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="bg-gray-100 p-3 rounded border font-mono">demo@passport.gov.sd</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="bg-gray-100 p-3 rounded border font-mono">Demo123456!</div>
              </div>
            </div>
            <Link href="/auth/login" className="btn-sudan mt-6">
              Try Demo Login
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sudan-red to-sudan-blue">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Renew Your Passport?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of satisfied citizens who have used our secure, 
            efficient passport renewal service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-sudan-red hover:bg-gray-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Start Your Application
            </Link>
            <Link href="/auth/login" className="border-2 border-white text-white hover:bg-white hover:text-sudan-red px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-sudan-red rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">🇸🇩</span>
                </div>
                <span className="text-lg font-semibold">Sudan Passport Services</span>
              </div>
              <p className="text-gray-400">
                Official government portal for passport renewal services.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Passport Renewal</li>
                <li>New Passport Application</li>
                <li>Passport Replacement</li>
                <li>Status Tracking</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQ</li>
                <li>Technical Support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security Policy</li>
                <li>Accessibility</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Republic of Sudan - Ministry of Interior. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
