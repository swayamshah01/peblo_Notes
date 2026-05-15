import React, { useState, useEffect, useRef } from 'react';
import { Archive, ArchiveRestore, ArrowLeft, Share2, Trash2, Sparkles, Check } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { TagInput } from './TagInput';
import { AISummaryPanel } from './AISummaryPanel';
import { EmptyState } from '../common/EmptyState';
import { ShareDialog } from './ShareDialog';

export function NoteEditor({
  note,
  onUpdate,
  onDelete,
  onShare,
  onArchive,
  onGenerateSummary,
  onBack,
  isSaving,
  isGeneratingSummary,
  aiResult,
  onCloseAI,
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const loadedNoteIdRef = useRef(null);

  useEffect(() => {
    const nextNoteId = note?.id || null;

    if (!nextNoteId) {
      loadedNoteIdRef.current = null;
      setTitle('');
      setContent('');
      setTags([]);
      return;
    }

    if (loadedNoteIdRef.current !== nextNoteId) {
      loadedNoteIdRef.current = nextNoteId;
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
      setShowAI(false);
      setShowShare(false);
    }
  }, [note]);

  const debouncedTitle = useDebounce(title, 1500);
  const debouncedContent = useDebounce(content, 1500);

  useEffect(() => {
    if (!note) return;

    // When switching notes, the previous note's debounce can resolve late.
    // Only save once the debounced values match the editor currently on screen.
    if (debouncedTitle !== title || debouncedContent !== content) {
      return;
    }

    const currentTitle = note.title || '';
    const currentContent = note.content || '';

    if (debouncedTitle !== currentTitle || debouncedContent !== currentContent) {
      onUpdate({
        title: debouncedTitle || 'Untitled',
        content: debouncedContent,
      });
    }
  }, [debouncedTitle, debouncedContent, title, content, note, onUpdate]);

  const handleTagsChange = async (newTags) => {
    setTags(newTags);
    if (note) {
      await onUpdate({ tags: newTags });
    }
  };

  const handleShare = async () => {
    const updatedNote = await onShare();
    if (updatedNote?.isPublic && updatedNote.shareId) {
      const shareUrl = `${window.location.origin}/shared/${updatedNote.shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGenerateSummary = async () => {
    setShowAI(true);
    await onGenerateSummary();
  };

  if (!note) {
    return (
      <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon={null}
          title="Select a note"
          description="Choose a note from the left sidebar or create a new one"
        />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: 'var(--bg-primary)' }}>
        <button
          onClick={onBack}
          className="icon-button"
          style={{ marginRight: '12px', flexShrink: 0 }}
          title="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)', backgroundColor: 'transparent', border: 'none', outline: 'none', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Save Status */}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {isSaving ? 'Saving...' : 'Saved ✓'}
          </div>

          {/* Buttons */}
          <button
            onClick={() => onDelete()}
            style={{ padding: '8px', color: 'var(--text-secondary)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => e.target.style.color = '#ef4444'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            title="Delete note"
          >
            <Trash2 size={20} />
          </button>

          <button
            onClick={() => setShowShare(true)}
            style={{
              padding: '8px',
              color: note.isPublic ? 'var(--success)' : 'var(--text-secondary)',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={(e) => !note.isPublic && (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => !note.isPublic && (e.currentTarget.style.color = 'var(--text-secondary)')}
            title={note.isPublic ? 'Shared' : 'Share'}
          >
            <Share2 size={20} />
            {note.isPublic && copied && <Check size={14} />}
          </button>

          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            style={{ padding: '8px', color: 'var(--text-secondary)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', opacity: isGeneratingSummary ? 0.5 : 1 }}
            onMouseEnter={(e) => !isGeneratingSummary && (e.target.style.color = 'var(--accent)')}
            onMouseLeave={(e) => !isGeneratingSummary && (e.target.style.color = 'var(--text-secondary)')}
            title="Generate AI Summary"
          >
            <Sparkles size={20} />
          </button>

          <button
            onClick={() => onArchive()}
            style={{ padding: '8px', color: 'var(--text-secondary)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            title={note.isArchived ? 'Restore note' : 'Archive note'}
          >
            {note.isArchived ? <ArchiveRestore size={20} /> : <Archive size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px' }}>
          {/* Editor */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '16px',
              resize: 'none',
              outline: 'none',
              border: 'none',
            }}
          />

          {/* Tags */}
          <TagInput tags={tags} onTagsChange={handleTagsChange} />
        </div>

        {/* AI Summary Panel */}
        {showAI && (
          <AISummaryPanel
            aiResult={aiResult}
            isLoading={isGeneratingSummary}
            onClose={() => setShowAI(false)}
            onApplyTitle={(newTitle) => {
              setTitle(newTitle);
              onUpdate({ title: newTitle });
            }}
          />
        )}
      </div>
      {showShare && (
        <ShareDialog
          note={note}
          onClose={() => setShowShare(false)}
          onToggleShare={handleShare}
        />
      )}
    </div>
  );
}
