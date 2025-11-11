'use client';

/**
 * ============================================================================
 * HOME PAGE - Dialarme Quote Generator
 * ============================================================================
 * Root page that redirects to the quote creation interface
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/create-devis');
  }, [router]);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          animation: 'spin 1s linear infinite'
        }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#666' }}>Redirection...</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
