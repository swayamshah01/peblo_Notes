import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSharedNote } from '../api/index.js';
import { PublicNoteView } from '../components/shared/PublicNoteView';
import { Spinner } from '../components/common/Spinner';

export function PublicNote() {
  const { shareId } = useParams();
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await getSharedNote(shareId);
        setNote(response.data);
      } catch (err) {
        setError('Failed to load note');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [shareId]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Note not found</h1>
          <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </div>
    );
  }

  return <PublicNoteView note={note} />;
}
