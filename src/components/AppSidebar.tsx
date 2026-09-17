'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Barre de navigation latérale, rétractable. Wrapping layer au-dessus de
 * chaque page — /create-devis, /mes-devis, et (plus tard) /tableau-de-bord —
 * distincte des onglets "Type d'installation" (Alarme/Caméras/Fog/
 * Visiophone) qui restent internes à la page /create-devis elle-même.
 *
 * "Tableau de bord" n'a pas encore de page réelle (chantier séparé) — le
 * lien est affiché pour matcher la maquette mais n'est pas cliquable pour
 * l'instant.
 */
export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const items = [
    { key: 'dashboard', label: 'Tableau de bord', href: null },
    { key: 'create', label: 'Créer un devis', href: '/create-devis' },
    { key: 'history', label: 'Historique', href: '/mes-devis' },
  ];

  return (
    <div
      style={{
        width: collapsed ? 60 : 190,
        background: '#111111',
        borderRight: '1px solid #262626',
        padding: '16px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        flex: 'none',
        transition: 'width .15s ease',
        minHeight: '100vh',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '0 6px' }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: '#fffd01', flex: 'none' }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Dialarme</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Déplier le menu' : 'Réduire le menu'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8a8a', fontSize: 16, padding: 4 }}
        >
          {collapsed ? '»' : '«'}
        </button>
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
            {!collapsed && <span>{item.label}</span>}
          </>
        );
        return item.href ? (
          <Link key={item.key} href={item.href} style={rowStyle}>
            {content}
          </Link>
        ) : (
          <div key={item.key} style={rowStyle} title="Bientôt disponible">
            {content}
          </div>
        );
      })}
    </div>
  );
}
