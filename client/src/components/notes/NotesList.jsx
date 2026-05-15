import React, { useState, useEffect } from 'react';
import { Search, Archive, X } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { Spinner } from '../common/Spinner';
import { EmptyState } from '../common/EmptyState';

export function NotesList({
  notes,
  activeNote,
  onSelectNote,
  onCreateNote,
  isLoading,
  searchQuery,
  onSearchChange,
  selectedTag,
  onTagSelect,
  tags,
  showArchived,
  onToggleArchived,
}) {
  const [allTags, setAllTags] = useState(tags || []);
  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    setAllTags(tags || []);
  }, [tags]);

  const handleTagClick = (tag) => {
    if (selectedTag === tag) {
      onTagSelect(null);
    } else {
      onTagSelect(tag);
    }
  };

  return (
    <div style={{ width: '320px', backgroundColor: 'var(--bg-secondary)', borderRightColor: 'var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', borderRight: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={onCreateNote}
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: '16px' }}
        >
          + New Note
        </button>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes..."
            className="form-input"
            style={{ width: '100%', fontSize: '13px', paddingLeft: '36px' }}
          />
        </div>

        {/* Tags Filter */}
        {allTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {allTags.map((tag, idx) => {
              const tagName = typeof tag === 'string' ? tag : tag.name || tag;
              return (
                <button
                  key={idx}
                  onClick={() => handleTagClick(tagName)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    borderRadius: '999px',
                    backgroundColor: selectedTag === tagName ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: selectedTag === tagName ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {tagName}
                </button>
              );
            })}
          </div>
        )}

        {/* Archived Toggle */}
        <button
          onClick={onToggleArchived}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '13px',
            backgroundColor: showArchived ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: showArchived ? 'white' : 'var(--text-secondary)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <Archive size={14} />
          {showArchived ? 'Showing Archived' : 'Show Archived'}
        </button>
      </div>

      {/* Notes List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Spinner size="md" />
          </div>
        ) : !Array.isArray(notes) || notes.length === 0 ? (
          <EmptyState
            icon={null}
            title="No notes yet"
            description="Create your first note to get started!"
          />
        ) : (
          <div style={{ padding: '8px' }}>
            {notes.filter(n => n && n.id).map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  backgroundColor: activeNote?.id === note.id ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                <h3 style={{ fontWeight: '500', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                  {note.title || 'Untitled'}
                </h3>
                <p style={{ fontSize: '12px', color: '#999999', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '8px' }}>
                  {note.content || 'No content'}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : 'No date'}
                </p>
                {note.tags && note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {note.tags.slice(0, 2).map((tag, idx) => {
                      const tagName = typeof tag === 'string' ? tag : tag.name || tag;
                      return (
                        <span
                          key={idx}
                          className="tag"
                          style={{ fontSize: '11px' }}
                        >
                          {tagName}
                        </span>
                      );
                    })}
                    {note.tags.length > 2 && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>+{note.tags.length - 2}</span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
