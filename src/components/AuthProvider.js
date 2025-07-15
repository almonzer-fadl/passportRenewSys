'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }) {
  return (
    <SessionProvider
      // Optional: force session refresh every 5 minutes
      refetchInterval={5 * 60}
      // Optional: force session refresh when window is focused
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  );
} 