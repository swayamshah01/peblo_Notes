import React, { useState, useEffect, useRef } from 'react';
import { Archive, ArchiveRestore, ArrowLeft, Share2, Trash2, Sparkles, Check, Bold, Italic, Underline, Code2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { TagInput } from './TagInput';
import { AISummaryPanel } from './AISummaryPanel';
import { EmptyState } from '../common/EmptyState';
import { ShareDialog } from './ShareDialog';
import { renderNoteContent } from '../../utils/renderNoteContent.jsx';

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
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editorMode, setEditorMode] = useState('edit');
  const loadedNoteIdRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const nextNoteId = note?.id || null;

    if (!nextNoteId) {
      loadedNoteIdRef.current = null;
      setTitle('');
      setContent('');
      setTags([]);
      setEditorMode('edit');
      return;
    }

    if (loadedNoteIdRef.current !== nextNoteId) {
      loadedNoteIdRef.current = nextNoteId;
      setTitle(note.title || '');
      setContent(note.content || '');
      setTags(note.tags || []);
      setShowAI(false);
      setShowShare(false);
      setEditorMode('edit');
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

  const applyInlineFormat = (before, after = before, placeholder = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.slice(start, end);
    const innerText = selectedText || placeholder;
    const nextContent = `${content.slice(0, start)}${before}${innerText}${after}${content.slice(end)}`;
    const nextCursorStart = start + before.length;
    const nextCursorEnd = nextCursorStart + innerText.length;

    setContent(nextContent);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursorStart, selectedText ? nextCursorEnd : nextCursorEnd);
    });
  };

  const handleEditorShortcut = (event) => {
    if (!event.ctrlKey && !event.metaKey) return;

    const key = event.key.toLowerCase();
    if (key === 'b') {
      event.preventDefault();
      applyInlineFormat('**', '**', 'bold text');
    }
    if (key === 'i') {
      event.preventDefault();
      applyInlineFormat('*', '*', 'italic text');
    }
    if (key === 'u') {
      event.preventDefault();
      applyInlineFormat('<u>', '</u>', 'underlined text');
    }
    if (key === '`') {
      event.preventDefault();
      applyInlineFormat('`', '`', 'code');
    }
  };

  const formatActions = [
    { label: 'Bold', icon: Bold, action: () => applyInlineFormat('**', '**', 'bold text') },
    { label: 'Italic', icon: Italic, action: () => applyInlineFormat('*', '*', 'italic text') },
    { label: 'Underline', icon: Underline, action: () => applyInlineFormat('<u>', '</u>', 'underlined text') },
    { label: 'Code', icon: Code2, action: () => applyInlineFormat('`', '`', 'code') },
  ];

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
            {isSaving ? 'Saving...' : 'Saved'}
          </div>

          {/* Buttons */}
          <button
            onClick={() => onDelete()}
            style={{ padding: '8px', color: 'var(--text-secondary)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => e.target.style.color = 'var(--error)'}
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
          <div className="editor-format-toolbar" aria-label="Editor formatting toolbar">
            <div className="editor-mode-switch" aria-label="Editor mode">
              <button
                type="button"
                className={editorMode === 'edit' ? 'active' : ''}
                onClick={() => setEditorMode('edit')}
              >
                Edit
              </button>
              <button
                type="button"
                className={editorMode === 'preview' ? 'active' : ''}
                onClick={() => setEditorMode('preview')}
              >
                Preview
              </button>
            </div>

            {editorMode === 'edit' && (
              <div className="editor-format-group">
                {formatActions.map(({ label, icon: Icon, action }) => (
                  <button
                    key={label}
                    type="button"
                    className="editor-format-button"
                    onClick={action}
                    title={label}
                    aria-label={label}
                  >
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {editorMode === 'edit' ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleEditorShortcut}
              placeholder="Start typing..."
              className="note-editor-textarea"
              style={{
                flex: 1,
              }}
            />
          ) : (
            <div className="note-preview-pane">
              {renderNoteContent(content)}
            </div>
          )}

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
