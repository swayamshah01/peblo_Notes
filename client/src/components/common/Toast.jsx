import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function Toast({ message, type = 'info', duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const bgColor = type === 'error'
    ? 'color-mix(in srgb, var(--error) 18%, var(--surface-elevated))'
    : 'var(--surface-elevated)';
  const borderColor = type === 'error' ? 'var(--error)' : 'var(--border)';
  const textColor = 'var(--text-primary)';

  return (
    <div style={{ position: 'fixed', bottom: '16px', right: '16px', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: bgColor, color: textColor, border: `1px solid ${borderColor}` }}>
      <span>{message}</span>
      <button onClick={() => setIsVisible(false)} style={{ marginLeft: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}>
        <X size={16} />
      </button>
    </div>
  );
}
