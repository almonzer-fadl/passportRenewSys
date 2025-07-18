'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useState, useEffect } from 'react';

export default function Home() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock session for demo - no session means show landing page
  const session = null;

  // Show loading until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="navbar bg-primary text-primary-content">
        <div className="navbar-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-xl">🇸🇩</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{t('homepage.title')}</h1>
              <p className="text-xs opacity-70">{t('homepage.subtitle')}</p>
            </div>
          </div>
        </div>
        <div className="navbar-end">
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link href="/auth/login" className="btn btn-outline btn-sm">
              {t('navigation.login')}
            </Link>
            <Link href="/apply" className="btn btn-secondary btn-sm">
              {t('navigation.apply')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              {t('homepage.heroTitle')} <span className="text-primary">{t('homepage.heroSubtitle')}</span>
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {t('homepage.heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/apply" className="btn btn-primary btn-lg">
                Start Application
              </Link>
              <Link href="/auth/login" className="btn btn-outline btn-lg">
                Track Existing Application
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-base-content/70">Choose the service that fits your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="card-title justify-center">New Passport</h3>
                <p>Apply for your first Sudanese passport with our streamlined process.</p>
                <div className="card-actions justify-center">
                  <Link href="/apply?type=new" className="btn btn-primary">Apply</Link>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="card-title justify-center">Passport Renewal</h3>
                <p>Renew your existing passport quickly and securely online.</p>
                <div className="card-actions justify-center">
                  <Link href="/apply?type=renewal" className="btn btn-primary">Renew</Link>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="card-title justify-center">Replacement</h3>
                <p>Replace lost, stolen, or damaged passports with ease.</p>
                <div className="card-actions justify-center">
                  <Link href="/apply?type=replacement" className="btn btn-primary">Replace</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-primary text-primary-content">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Service?</h2>
            <p className="text-xl opacity-80">Modern, secure, and user-friendly</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">Fast Processing</h3>
              <p className="opacity-80">Quick turnaround times for all applications</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Secure</h3>
              <p className="opacity-80">Bank-level security for your personal data</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">Mobile Friendly</h3>
              <p className="opacity-80">Apply from any device, anywhere</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
              <p className="opacity-80">Monitor your application status live</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-base-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-base-content/70">
            Join thousands of Sudanese citizens who have already renewed their passports online
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply" className="btn btn-primary btn-lg">
              Start Your Application
            </Link>
            <Link href="/auth/register" className="btn btn-outline btn-lg">
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-neutral text-neutral-content">
        <div>
          <div className="text-2xl font-bold">🇸🇩</div>
          <p className="font-bold">
            Sudan Passport Renewal System
          </p>
          <p>Ministry of Interior - Republic of Sudan</p>
        </div>
        <div>
          <div className="grid grid-flow-col gap-4">
            <Link href="/about" className="link link-hover">About</Link>
            <Link href="/contact" className="link link-hover">Contact</Link>
            <Link href="/privacy" className="link link-hover">Privacy</Link>
            <Link href="/terms" className="link link-hover">Terms</Link>
          </div>
        </div>
        <div>
          <p>Copyright © 2024 - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
