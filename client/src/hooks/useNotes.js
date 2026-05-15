import { useState, useCallback, useEffect } from 'react';
import * as noteAPI from '../api/index.js';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [showArchived, setShowArchived] = useState(false);

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedTag) params.tag = selectedTag;
      if (showArchived) params.archived = true;

      const response = await noteAPI.getNotes(params);
      setNotes(response.data);
      
      if (response.data.length === 0) {
        setActiveNote(null);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedTag, showArchived]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Create note
  const createNewNote = useCallback(async () => {
    try {
      const response = await noteAPI.createNote({
        title: 'Untitled',
        content: '',
        tags: [],
      });
      const newNote = response.data;
      setNotes([newNote, ...(Array.isArray(notes) ? notes : [])]);
      setActiveNote(newNote);
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }, [notes]);

  // Update note
  const updateNoteData = useCallback(async (id, data) => {
    setIsSaving(true);
    try {
      const response = await noteAPI.updateNote(id, data);
      const updatedNote = response.data;
      if (Array.isArray(notes)) {
        setNotes(notes.map(n => n.id === id ? updatedNote : n));
      }
      if (activeNote?.id === id) {
        setActiveNote(updatedNote);
      }
      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [notes, activeNote]);

  // Delete note
  const deleteNoteData = useCallback(async (id) => {
    try {
      await noteAPI.deleteNote(id);
      if (Array.isArray(notes)) {
        const filtered = notes.filter(n => n.id !== id);
        setNotes(filtered);
        if (activeNote?.id === id) {
          setActiveNote(filtered.length > 0 ? filtered[0] : null);
        }
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }, [notes, activeNote]);

  // Toggle share
  const toggleShareNote = useCallback(async (id) => {
    try {
      const response = await noteAPI.toggleShare(id);
      const updatedNote = response.data;
      // Verify we have valid note data
      if (!updatedNote || !updatedNote.id) {
        throw new Error('Invalid note returned from share endpoint');
      }
      if (Array.isArray(notes)) {
        setNotes(notes.map(n => n.id === id ? updatedNote : n).filter(n => n));
      }
      if (activeNote?.id === id) {
        setActiveNote(updatedNote);
      }
      return updatedNote;
    } catch (error) {
      console.error('Error toggling share:', error);
      throw error;
    }
  }, [notes, activeNote]);

  // Archive or restore note
  const setNoteArchivedData = useCallback(async (id, isArchived = true) => {
    try {
      const response = await noteAPI.setNoteArchived(id, isArchived);
      const updatedNote = response.data;
      if (Array.isArray(notes)) {
        const shouldRemainVisible = showArchived === updatedNote.isArchived;
        const nextNotes = shouldRemainVisible
          ? notes.map(n => n.id === id ? updatedNote : n)
          : notes.filter(n => n.id !== id);
        setNotes(nextNotes);
        if (activeNote?.id === id) {
          setActiveNote(shouldRemainVisible ? updatedNote : (nextNotes[0] || null));
        }
      }
      return updatedNote;
    } catch (error) {
      console.error('Error updating archive status:', error);
      throw error;
    }
  }, [notes, activeNote, showArchived]);

  return {
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
    fetchNotes,
    createNewNote,
    updateNoteData,
    deleteNoteData,
    toggleShareNote,
    archiveNoteData: setNoteArchivedData,
  };
}
