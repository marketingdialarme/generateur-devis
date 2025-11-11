/**
 * LoadingSpinner Component
 * 
 * A lightweight, centered loading spinner with semi-transparent backdrop.
 * Compatible with Safari/iOS.
 * Uses pure CSS animations - no external dependencies.
 */

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  show: boolean;
}

export function LoadingSpinner({ message, show }: LoadingSpinnerProps) {
  if (!show) return null;

  return (
    <div 
      className="loading-spinner-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)', // Safari support
      }}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px 48px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          maxWidth: '90%',
        }}
      >
        {/* Spinner */}
        <div 
          className="spinner"
          style={{
            width: '48px',
            height: '48px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #f4e600',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        
        {/* Message */}
        {message && (
          <div 
            style={{
              fontSize: '16px',
              fontWeight: 500,
              color: '#333',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        )}
      </div>

      {/* Keyframe animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

