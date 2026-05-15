import React from 'react';

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '64px', paddingBottom: '64px', paddingLeft: '16px', paddingRight: '16px' }}>
      {Icon && <Icon style={{ width: '64px', height: '64px', color: 'var(--text-muted)', marginBottom: '16px' }} />}
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>{title}</h3>
      {description && <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '300px' }}>{description}</p>}
    </div>
  );
}
