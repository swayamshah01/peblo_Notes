import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function Toast({ message, type = 'info', duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? '#1f2937' : type === 'error' ? '#7f1d1d' : '#1e3a8a';
  const borderColor = type === 'success' ? '#16a34a' : type === 'error' ? '#991b1b' : '#1e40af';
  const textColor = type === 'success' ? '#dcfce7' : type === 'error' ? '#fecaca' : '#bfdbfe';

  return (
    <div style={{ position: 'fixed', bottom: '16px', right: '16px', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: bgColor, color: textColor, border: `1px solid ${borderColor}` }}>
      <span>{message}</span>
      <button onClick={() => setIsVisible(false)} style={{ marginLeft: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}>
        <X size={16} />
      </button>
    </div>
  );
}
