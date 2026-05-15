import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/common/Navbar';
import { NotesList } from '../components/notes/NotesList';
import { NoteEditor } from '../components/notes/NoteEditor';
import { useNotes } from '../hooks/useNotes';
import { generateSummary } from '../api/index.js';
import { useDebounce } from '../hooks/useDebounce';
import { Toast } from '../components/common/Toast';

export function Workspace() {
  const {
    notes,
    activeNote,
    setActiveNote,
    isLoading,
    isSaving,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    showArchived,
    setShowArchived,
    createNewNote,
    updateNoteData,
    deleteNoteData,
    toggleShareNote,
    archiveNoteData,
    fetchNotes,
  } = useNotes();

  const [toast, setToast] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [allTags, setAllTags] = useState([]);

  const debouncedSearch = useDebounce(searchQuery, 400);

  useEffect(() => {
    // Extract all unique tags from notes
    const tagSet = new Set();
    if (Array.isArray(notes)) {
      notes.forEach((note) => {
        note.tags?.forEach((tag) => tagSet.add(tag));
      });
    }
    setAllTags(Array.from(tagSet));
  }, [notes]);

  const handleCreateNote = useCallback(async () => {
    try {
      await createNewNote();
      setToast({ message: 'Note created!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to create note', type: 'error' });
    }
  }, [createNewNote]);

  const handleUpdateNote = useCallback(async (data) => {
    try {
      await updateNoteData(activeNote.id, data);
    } catch (error) {
      setToast({ message: 'Failed to save note', type: 'error' });
    }
  }, [activeNote, updateNoteData]);

  const handleDeleteNote = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNoteData(activeNote.id);
        setToast({ message: 'Note deleted', type: 'success' });
      } catch (error) {
        setToast({ message: 'Failed to delete note', type: 'error' });
      }
    }
  }, [activeNote, deleteNoteData]);

  const handleShareNote = useCallback(async () => {
    try {
      const updated = await toggleShareNote(activeNote.id);
      if (updated.isPublic) {
        setToast({ message: 'Link copied!', type: 'success' });
      } else {
        setToast({ message: 'Note made private', type: 'info' });
      }
    } catch (error) {
      setToast({ message: 'Failed to toggle share', type: 'error' });
    }
  }, [activeNote, toggleShareNote]);

  const handleArchiveNote = useCallback(async () => {
    try {
      await archiveNoteData(activeNote.id);
      setToast({ message: 'Note archived', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to archive note', type: 'error' });
    }
  }, [activeNote, archiveNoteData]);

  const handleGenerateSummary = useCallback(async () => {
    setIsGeneratingSummary(true);
    try {
      const response = await generateSummary(activeNote.id);
      setAiResult(response.data);
    } catch (error) {
      setAiResult({
        error: error.response?.data?.message || 'Failed to generate summary',
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [activeNote]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <NotesList
          notes={notes}
          activeNote={activeNote}
          onSelectNote={setActiveNote}
          onCreateNote={handleCreateNote}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onTagSelect={setSelectedTag}
          tags={allTags}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
        />
        <NoteEditor
          note={activeNote}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
          onShare={handleShareNote}
          onArchive={handleArchiveNote}
          onGenerateSummary={handleGenerateSummary}
          isSaving={isSaving}
          isGeneratingSummary={isGeneratingSummary}
          aiResult={aiResult}
          onCloseAI={() => setAiResult(null)}
        />
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} duration={3000} />
      )}
    </div>
  );
}
