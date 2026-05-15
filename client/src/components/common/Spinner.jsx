import React from 'react';

export function Spinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className={`spinner ${sizeClasses[size]}`} />
    </div>
  );
}
