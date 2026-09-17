'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(callbackError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Where Supabase redirects after the link is clicked — exchanges
        // the code for a session, then sends the conseiller to their history.
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/mes-devis`,
      },
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }

    setStatus('sent');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
      }}>
        <h1 style={{ fontSize: '22px', marginBottom: '8px', color: '#1a1a1a' }}>
          Espace conseiller
        </h1>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '28px' }}>
          Connectez-vous pour retrouver l&apos;historique de vos devis.
        </p>

        {status === 'sent' ? (
          <div style={{
            background: '#f3fbe7',
            border: '1px solid #d4e8b8',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px',
            color: '#3a5311'
          }}>
            ✅ Un lien de connexion vient de vous être envoyé à <strong>{email}</strong>.
            Ouvrez-le depuis cette adresse pour vous connecter — il expire après un court délai.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '13px', color: '#444', marginBottom: '6px' }}>
              Adresse email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@dialarme.ch"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
            />

            {status === 'error' && (
              <div style={{
                background: '#f8d7da',
                color: '#721c24',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                ❌ {errorMessage || 'Une erreur est survenue, réessayez.'}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                width: '100%',
                padding: '12px',
                background: '#F3E600',
                color: '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: status === 'sending' ? 'default' : 'pointer',
                opacity: status === 'sending' ? 0.7 : 1
              }}
            >
              {status === 'sending' ? 'Envoi en cours...' : 'Recevoir le lien de connexion'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
