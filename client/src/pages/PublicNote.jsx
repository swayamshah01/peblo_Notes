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
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Note not found</h1>
          <p className="text-[#a0a0a0]">{error}</p>
        </div>
      </div>
    );
  }

  return <PublicNoteView note={note} />;
}
