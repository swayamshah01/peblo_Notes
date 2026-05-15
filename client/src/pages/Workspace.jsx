import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '../components/common/Navbar';
import { NotesList } from '../components/notes/NotesList';
import { NoteEditor } from '../components/notes/NoteEditor';
import { useNotes } from '../hooks/useNotes';
import { generateSummary } from '../api/index.js';
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
  } = useNotes();

  const [toast, setToast] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [allTags, setAllTags] = useState([]);

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

  const handleDeleteSpecificNote = useCallback(async (note) => {
    if (window.confirm(`Delete "${note.title || 'Untitled'}"? This cannot be undone.`)) {
      try {
        await deleteNoteData(note.id);
        setToast({ message: 'Note deleted', type: 'success' });
      } catch (error) {
        setToast({ message: 'Failed to delete note', type: 'error' });
      }
    }
  }, [deleteNoteData]);

  const handleShareNote = useCallback(async () => {
    try {
      const updated = await toggleShareNote(activeNote.id);
      if (updated.isPublic) {
        setToast({ message: 'Link copied!', type: 'success' });
      } else {
        setToast({ message: 'Note made private', type: 'info' });
      }
      return updated;
    } catch (error) {
      setToast({ message: 'Failed to toggle share', type: 'error' });
      throw error;
    }
  }, [activeNote, toggleShareNote]);

  const handleShareSpecificNote = useCallback(async (note) => {
    try {
      if (note.isPublic && note.shareId) {
        await navigator.clipboard.writeText(`${window.location.origin}/shared/${note.shareId}`);
        setToast({ message: 'Link copied!', type: 'success' });
        return note;
      }

      const updated = await toggleShareNote(note.id);
      if (updated.isPublic && updated.shareId) {
        await navigator.clipboard.writeText(`${window.location.origin}/shared/${updated.shareId}`);
        setToast({ message: 'Public link created and copied', type: 'success' });
      }
      return updated;
    } catch (error) {
      setToast({ message: 'Failed to share note', type: 'error' });
      throw error;
    }
  }, [toggleShareNote]);

  const handleArchiveNote = useCallback(async () => {
    try {
      const nextArchived = !activeNote.isArchived;
      await archiveNoteData(activeNote.id, nextArchived);
      setToast({ message: nextArchived ? 'Note archived' : 'Note restored', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to update archive status', type: 'error' });
    }
  }, [activeNote, archiveNoteData]);

  const handleArchiveSpecificNote = useCallback(async (note) => {
    try {
      const nextArchived = !note.isArchived;
      await archiveNoteData(note.id, nextArchived);
      setToast({ message: nextArchived ? 'Note archived' : 'Note restored', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to update archive status', type: 'error' });
    }
  }, [archiveNoteData]);

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
          onArchiveNote={handleArchiveSpecificNote}
          onDeleteNote={handleDeleteSpecificNote}
          onShareNote={handleShareSpecificNote}
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
