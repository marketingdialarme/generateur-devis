import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getQuotes, linkConseillerProfile } from '@/lib/services/database.service';
import { AppSidebar } from '@/components/AppSidebar';

export const dynamic = 'force-dynamic';

export default async function MesDevisPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // RLS ("Users can read their own profile") means this query only ever
  // returns the logged-in conseiller's own row, even without the .eq below —
  // it's kept explicit for clarity.
  let { data: profile } = await supabase
    .from('profiles')
    .select('commercial_name')
    .eq('user_id', user.id)
    .single();

  // Fallback: normally /auth/callback already tried this right after login.
  // Retried here in case this session predates that, or the first attempt
  // failed for some reason (e.g. the Sheet was briefly unreachable).
  if (!profile?.commercial_name && user.email) {
    const linkedName = await linkConseillerProfile(user.id, user.email);
    if (linkedName) {
      profile = { commercial_name: linkedName };
    }
  }

  if (!profile?.commercial_name) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
        <AppSidebar />
        <div style={pageWrapStyle}>
          <div className="quote-section" style={{ maxWidth: 900, margin: '0 auto' }}>
            <h1 style={titleStyle}>Mes devis</h1>
            <div style={warningBoxStyle}>
              ⚠️ Aucun conseiller dans la feuille Conseillers n&apos;a l&apos;adresse {user.email}.
              Vérifiez qu&apos;elle y est bien renseignée, ou contactez le support.
            </div>
            <SignOutForm />
          </div>
        </div>
      </div>
    );
  }

  const quotes = await getQuotes({ commercial: profile.commercial_name, limit: 100 });

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
      <AppSidebar />
      <div style={pageWrapStyle}>
        <div className="quote-section" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div>
              <h1 style={titleStyle}>Mes devis</h1>
              <p style={{ fontSize: '13px', color: '#595959', margin: 0 }}>{profile.commercial_name}</p>
            </div>
            <SignOutForm />
          </div>

          {quotes.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#595959', marginTop: '24px' }}>
              Aucun devis enregistré pour l&apos;instant.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '24px', fontSize: '13px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #a6a6a6', color: '#595959' }}>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={tdStyle}>
                      {q.created_at ? new Date(q.created_at).toLocaleDateString('fr-CH') : '—'}
                    </td>
                    <td style={tdStyle}>{q.client_name}</td>
                    <td style={tdStyle}>
                      {q.quote_type === 'alarme'
                        ? `Alarme${q.central_type ? ` (${q.central_type})` : ''}`
                        : 'Caméras'}
                    </td>
                    <td style={tdStyle}>
                      {q.drive_url && (
                        <a href={q.drive_url} target="_blank" rel="noopener noreferrer" style={{ color: '#000', fontWeight: 600 }}>
                          Voir le PDF
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function SignOutForm() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" style={{
        background: 'transparent',
        border: '1px solid #a6a6a6',
        borderRadius: '6px',
        padding: '6px 12px',
        fontSize: '12px',
        color: '#595959',
        cursor: 'pointer'
      }}>
        Se déconnecter
      </button>
    </form>
  );
}

const pageWrapStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '40px 20px'
};

const warningBoxStyle: React.CSSProperties = {
  background: 'rgba(255, 193, 7, 0.1)',
  border: '1px solid rgba(255, 193, 7, 0.4)',
  borderRadius: '8px',
  padding: '16px',
  fontSize: '14px',
  color: '#ffc107'
};

const titleStyle: React.CSSProperties = {
  fontSize: '22px',
  marginBottom: '4px',
  color: '#000'
};

const thStyle: React.CSSProperties = { padding: '8px 6px', fontWeight: 500 };
const tdStyle: React.CSSProperties = { padding: '10px 6px', color: '#000' };
