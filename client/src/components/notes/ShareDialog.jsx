import React, { useState } from 'react';
import { Check, Copy, Globe2, Link, Lock, Share2, X } from 'lucide-react';

export function ShareDialog({ note, onClose, onToggleShare }) {
  const [isWorking, setIsWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = note?.shareId ? `${window.location.origin}/shared/${note.shareId}` : '';

  const copyLink = async () => {
    if (!note?.isPublic) {
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handlePrimary = async () => {
    setIsWorking(true);
    try {
      const updatedNote = note.isPublic ? note : await onToggleShare();
      if (updatedNote?.shareId) {
        await navigator.clipboard.writeText(`${window.location.origin}/shared/${updatedNote.shareId}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } finally {
      setIsWorking(false);
    }
  };

  const handleMakePrivate = async () => {
    setIsWorking(true);
    try {
      await onToggleShare();
      setCopied(false);
    } finally {
      setIsWorking(false);
    }
  };

  if (!note) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section className="share-dialog" onMouseDown={(event) => event.stopPropagation()}>
        <header className="share-header">
          <div>
            <h2>Share note</h2>
            <p>{note.title || 'Untitled'}</p>
          </div>
          <button className="icon-button" onClick={onClose} title="Close share dialog">
            <X size={18} />
          </button>
        </header>

        <div className="share-access">
          <div className="share-person">
            <span>{note.title?.slice(0, 2).toUpperCase() || 'PN'}</span>
            <div>
              <strong>Your private workspace</strong>
              <p>Only you can edit this note.</p>
            </div>
          </div>
        </div>

        <div className="access-row">
          <div className="access-icon">
            {note.isPublic ? <Globe2 size={24} /> : <Lock size={24} />}
          </div>
          <div>
            <strong>{note.isPublic ? 'Anyone with the link' : 'Private note'}</strong>
            <p>{note.isPublic ? 'People with this link can view the note.' : 'Create a public link when you are ready to share.'}</p>
          </div>
          <span className="access-pill">{note.isPublic ? 'Can view' : 'No access'}</span>
        </div>

        {note.isPublic && (
          <button className="share-url" onClick={copyLink}>
            <Link size={18} />
            <span>{shareUrl}</span>
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        )}

        <button className="btn btn-primary share-primary" onClick={handlePrimary} disabled={isWorking}>
          {copied ? <Check size={18} /> : <Share2 size={18} />}
          {note.isPublic ? (copied ? 'Link copied' : 'Copy link') : 'Create public link'}
        </button>

        {note.isPublic && (
          <button className="btn btn-ghost share-secondary" onClick={handleMakePrivate} disabled={isWorking}>
            <Lock size={18} />
            Make private
          </button>
        )}
      </section>
    </div>
  );
}
