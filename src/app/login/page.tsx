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
  // Where to send the conseiller once they've clicked their magic link --
  // set by middleware.ts when it redirects an unauthenticated visit to
  // /create-devis here. Falls back to /mes-devis (visiting /login directly).
  const next = searchParams.get('next') || '/mes-devis';

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(callbackError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage(null);

    try {
      const checkResponse = await fetch(`/api/auth/authorized?email=${encodeURIComponent(email)}`);
      const { authorized } = await checkResponse.json();
      if (!authorized) {
        setStatus('error');
        setErrorMessage("Cette adresse n'est pas autorisée à accéder à l'application. Contactez votre responsable.");
        return;
      }
    } catch {
      setStatus('error');
      setErrorMessage('Impossible de vérifier votre accès pour le moment, réessayez.');
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
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
      background: '#0a0a0a',
      padding: '20px'
    }}>
      <div className="quote-section" style={{
        maxWidth: '400px',
        width: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '20px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fffd01', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://dialarme.ch/wp-content/uploads/2026/09/Logotype_noir.png"
              alt="Dialarme"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h1 style={{ fontSize: '20px', color: '#000', margin: 0 }}>
            Espace conseiller
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: '#595959', marginBottom: '28px' }}>
          Connectez-vous pour accéder au générateur de devis et à l&apos;historique de vos devis.
        </p>

        {status === 'sent' ? (
          <div style={{
            background: 'rgba(255,253,1,0.08)',
            border: '1px solid rgba(255,253,1,0.3)',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '14px',
            color: '#fffd01'
          }}>
            ✅ Un lien de connexion vient de vous être envoyé à <strong>{email}</strong>.
            Ouvrez-le depuis cette adresse pour vous connecter — il expire après un court délai.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: '13px', color: '#595959', marginBottom: '6px' }}>
              Adresse email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom.nom@dialarme.ch"
              className="product-select"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
            />

            {status === 'error' && (
              <div style={{
                background: 'rgba(220,53,69,0.12)',
                color: '#ff6b7a',
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
                background: '#fffd01',
                color: '#0a0a0a',
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
