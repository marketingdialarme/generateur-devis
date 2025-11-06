'use client';

/**
 * ============================================================================
 * HOME PAGE - Dialarme Quote Generator
 * ============================================================================
 */

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  const handleStartQuote = () => {
    router.push('/create-devis');
  };

  const handleViewDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="logo">
          <div className="logo-img">D</div>
          <div className="company-info">
            <h1>DIALARME</h1>
            <p>Générateur de Devis Professionnel</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '60px 30px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px', color: '#333' }}>
          Bienvenue sur le générateur de devis Dialarme
        </h2>
        
        <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px' }}>
          Créez des devis professionnels pour vos systèmes d'alarme et de vidéosurveillance 
          en quelques clics. Génération PDF automatique avec envoi par email et sauvegarde 
          dans Google Drive.
        </p>

        <div className="action-buttons" style={{ justifyContent: 'center', marginBottom: '60px' }}>
          <button 
            className="btn btn-primary"
            onClick={handleStartQuote}
            style={{ fontSize: '18px', padding: '20px 40px' }}
          >
            📄 Créer un nouveau devis
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleViewDashboard}
            style={{ fontSize: '18px', padding: '20px 40px' }}
          >
            📊 Tableau de bord
          </button>
        </div>

        {/* Features */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '30px',
          marginTop: '60px',
          maxWidth: '1200px',
          margin: '60px auto 0'
        }}>
          <div className="form-section" style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>🚨 Systèmes d'Alarme</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              Configurez des devis pour centrales Titane ou Jablotron avec tous les accessoires 
              (détecteurs, claviers, sirènes, etc.)
            </p>
          </div>

          <div className="form-section" style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>📹 Vidéosurveillance</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              Créez des offres complètes de vidéosurveillance avec caméras, NVR, 
              et options de vision à distance
            </p>
          </div>

          <div className="form-section" style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>📄 PDF Professionnel</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              Génération automatique de PDFs professionnels avec assemblage de documents 
              techniques et overlay commercial
            </p>
          </div>

          <div className="form-section" style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>📧 Envoi Automatique</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              Envoi automatique par email et sauvegarde dans Google Drive 
              avec archivage par commercial
            </p>
          </div>

          <div className="form-section" style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>💳 Options Flexibles</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              Vente ou location, paiement comptant ou mensualités (24, 36, 48 mois), 
              avec calcul automatique des mensualités
            </p>
          </div>

          <div className="form-section" style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>📊 Suivi et Analytics</h3>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              Tableau de bord avec statistiques des devis, produits les plus vendus, 
              et performance des commerciaux
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        background: '#333', 
        color: 'white', 
        padding: '30px', 
        textAlign: 'center',
        borderTop: '6px solid #f4e600'
      }}>
        <p style={{ margin: 0, fontSize: '14px' }}>
          © {new Date().getFullYear()} Dialarme - Générateur de Devis Professionnel
        </p>
        <p style={{ margin: '10px 0 0', fontSize: '12px', opacity: 0.7 }}>
          Système de sécurité et vidéosurveillance
        </p>
      </div>
    </div>
  );
}
