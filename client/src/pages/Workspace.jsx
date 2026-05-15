import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { NotesList } from '../components/notes/NotesList';
import { NoteEditor } from '../components/notes/NoteEditor';
import { useNotes } from '../hooks/useNotes';
import { generateSummary } from '../api/index.js';
import { Toast } from '../components/common/Toast';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function Workspace() {
  const navigate = useNavigate();
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const requestDeleteNote = useCallback((note) => {
    if (note) {
      setDeleteTarget(note);
    }
  }, []);

  const confirmDeleteNote = useCallback(async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteNoteData(deleteTarget.id);
      setToast({ message: 'Note deleted', type: 'success' });
      setDeleteTarget(null);
    } catch (error) {
      setToast({ message: 'Failed to delete note', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, deleteNoteData]);

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
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to generate summary',
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
          onDeleteNote={requestDeleteNote}
          onShareNote={handleShareSpecificNote}
        />
        <NoteEditor
          note={activeNote}
          onUpdate={handleUpdateNote}
          onDelete={() => requestDeleteNote(activeNote)}
          onShare={handleShareNote}
          onArchive={handleArchiveNote}
          onGenerateSummary={handleGenerateSummary}
          onBack={() => navigate(-1)}
          isSaving={isSaving}
          isGeneratingSummary={isGeneratingSummary}
          aiResult={aiResult}
        />
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} duration={3000} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete this note?"
          description={`"${deleteTarget.title || 'Untitled'}" will be permanently deleted. This action cannot be undone.`}
          confirmLabel="Delete note"
          isLoading={isDeleting}
          onCancel={() => !isDeleting && setDeleteTarget(null)}
          onConfirm={confirmDeleteNote}
        />
      )}
    </div>
  );
}
