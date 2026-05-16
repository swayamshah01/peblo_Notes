import React from 'react';
import { renderNoteContent } from '../../utils/renderNoteContent.jsx';

export function PublicNoteView({ note }) {
  if (!note) {
    return <div style={{ textAlign: 'center', paddingTop: '32px', color: 'var(--text-secondary)' }}>Note not found</div>;
  }

  const updatedDate = note.updatedAt ? new Date(note.updatedAt) : null;
  const updatedLabel = updatedDate && !Number.isNaN(updatedDate.getTime())
    ? updatedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date unavailable';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '768px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '48px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>
          {note.title || 'Untitled'}
        </h1>

        {note.tags && note.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            {note.tags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border)', margin: '24px 0' }} />

        <div className="note-preview-pane public-note-content" style={{ marginBottom: '32px' }}>
          {renderNoteContent(note.content)}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <p>
            By <span style={{ color: 'var(--text-primary)' }}>{note.author || 'Anonymous'}</span>
            {' '}· Last updated{' '}
            <span style={{ color: 'var(--text-primary)' }}>{updatedLabel}</span>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Created with{' '}
            <span style={{ color: 'var(--accent)', fontWeight: '600' }}>
              Peblo Notes
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
