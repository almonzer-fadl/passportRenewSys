import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata = {
  title: 'Sudan Passport Renewal System',
  description: 'Official online passport renewal service for Sudanese citizens',
  keywords: 'Sudan, passport, renewal, government, services, visa, travel, documents',
  authors: [{ name: 'Republic of Sudan - Ministry of Interior' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Sudan Passport Renewal System',
    description: 'Secure online passport renewal for Sudanese citizens',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/sudan.png',
        width: 1200,
        height: 630,
        alt: 'Sudan Passport Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sudan Passport Renewal System',
    description: 'Secure online passport renewal for Sudanese citizens',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  themeColor: '#D21F3C',
  colorScheme: 'light',
  viewport: 'width=device-width, initial-scale=1.0',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" data-theme="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#D21F3C" />
        <meta name="msapplication-TileColor" content="#D21F3C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sudan Passport" />
        <meta name="format-detection" content="telephone=no" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="color-scheme" content="light" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Security headers */}
        <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className={`${inter.className} antialiased bg-white text-gray-900 selection:bg-sudan-red selection:text-white`}>
        <LanguageProvider>
          <AuthProvider>
            <div id="root" className="min-h-screen">
              {children}
            </div>
          </AuthProvider>
        </LanguageProvider>
        
        {/* Global notifications container */}
        <div id="notifications" className="fixed top-4 right-4 z-50 space-y-2"></div>
      </body>
    </html>
  );
}
