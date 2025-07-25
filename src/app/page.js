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
                {t('homepage.startAppButton')}
              </Link>
              <Link href="/auth/login" className="btn btn-outline btn-lg">
                {t('homepage.trackExisting')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{t('homepage.ourServices')}</h2>
            <p className="text-xl text-base-content/70">{t('homepage.servicesSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="card-title justify-center">{t('application.newApplication')}</h3>
                <p>{t('homepage.newPassportService')}</p>
                <div className="card-actions justify-center">
                  <Link href="/apply?type=new" className="btn btn-primary">{t('navigation.apply')}</Link>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="card-title justify-center">{t('application.renewal')}</h3>
                <p>{t('homepage.renewalService')}</p>
                <div className="card-actions justify-center">
                  <Link href="/apply?type=renewal" className="btn btn-primary">{t('application.renewal')}</Link>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">🔧</div>
                <h3 className="card-title justify-center">{t('application.replacement')}</h3>
                <p>{t('homepage.replacementService')}</p>
                <div className="card-actions justify-center">
                  <Link href="/apply?type=replacement" className="btn btn-primary">{t('application.replacement')}</Link>
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
            <h2 className="text-4xl font-bold mb-4">{t('homepage.whyChooseTitle')}</h2>
            <p className="text-xl opacity-80">{t('homepage.whyChooseSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-2">{t('homepage.fastProcessing')}</h3>
              <p className="opacity-80">{t('homepage.fastProcessingDesc')}</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">{t('homepage.secure')}</h3>
              <p className="opacity-80">{t('homepage.secureDesc')}</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold mb-2">{t('homepage.mobileFriendly')}</h3>
              <p className="opacity-80">{t('homepage.mobileFriendlyDesc')}</p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">{t('homepage.realTimeTracking')}</h3>
              <p className="opacity-80">{t('homepage.realTimeTrackingDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-base-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">{t('homepage.readyToStart')}</h2>
          <p className="text-xl mb-8 text-base-content/70">
            {t('homepage.readyToStartDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply" className="btn btn-primary btn-lg">
              {t('homepage.startApplication')}
            </Link>
            <Link href="/auth/register" className="btn btn-outline btn-lg">
              {t('homepage.createAccount')}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-neutral text-neutral-content">
        <div>
          <div className="text-2xl font-bold">🇸🇩</div>
          <p className="font-bold">
            {t('footer.title')}
          </p>
          <p>{t('footer.ministry')}</p>
        </div>
        <div>
          <div className="grid grid-flow-col gap-4">
            <Link href="/about" className="link link-hover">{t('footer.about')}</Link>
            <Link href="/contact" className="link link-hover">{t('footer.contact')}</Link>
            <Link href="/privacy" className="link link-hover">{t('footer.privacy')}</Link>
            <Link href="/terms" className="link link-hover">{t('footer.terms')}</Link>
          </div>
        </div>
        <div>
          <p>{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
