'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Navigation en tiroir (overlay), fermee par defaut, sur tablette et
 * ordinateur comme sur mobile (client feedback : gagner de la place,
 * la barre laterale ne doit plus jamais pousser le contenu). Un seul
 * bouton flottant en haut a droite (logo Dialarme sur fond jaune) ouvre/
 * ferme le tiroir, qui glisse par-dessus la page avec un fond assombri
 * derriere -- ne consomme aucune largeur quand il est ferme.
 *
 * "Tableau de bord" n'a pas encore de page reelle (chantier separe) --
 * affiche mais non cliquable pour l'instant.
 */
export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const items = [
    { key: 'dashboard', label: 'Tableau de bord', href: null },
    { key: 'create', label: 'Créer un devis', href: '/create-devis' },
    { key: 'history', label: 'Historique', href: '/mes-devis' },
  ];

  return (
    <>
      {/* Bouton flottant, toujours visible, ouvre/ferme le tiroir */}
      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1001,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#fffd01',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://dialarme.ch/wp-content/uploads/2026/09/Logotype_noir.png"
          alt="Menu Dialarme"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </button>

      {/* Fond assombri, ferme le tiroir au clic */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 999,
          }}
        />
      )}

      {/* Tiroir */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: 220,
          background: '#111111',
          borderRight: '1px solid #262626',
          padding: '16px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          zIndex: 1000,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '0 6px' }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: '#fffd01', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 3 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://dialarme.ch/wp-content/uploads/2026/09/Logotype_noir.png"
              alt="Dialarme"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Dialarme</span>
        </div>

        {items.map((item) => {
          const active = item.href !== null && pathname === item.href;
          const rowStyle: React.CSSProperties = {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '9px 8px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: active ? 500 : 400,
            color: active ? '#fffd01' : item.href ? '#8a8a8a' : '#4a4a4a',
            background: active ? 'rgba(255,253,1,0.08)' : 'transparent',
            textDecoration: 'none',
            cursor: item.href ? 'pointer' : 'default',
          };
          const content = (
            <>
              <span aria-hidden="true" style={{ width: 16, flex: 'none', textAlign: 'center' as const }}>●</span>
              <span>{item.label}</span>
            </>
          );
          return item.href ? (
            <Link key={item.key} href={item.href} style={rowStyle} onClick={() => setOpen(false)}>
              {content}
            </Link>
          ) : (
            <div key={item.key} style={rowStyle} title="Bientôt disponible">
              {content}
            </div>
          );
        })}
      </div>
    </>
  );
}
