import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Helper function to normalize tags from objects to strings
const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  return tags.map(tag => (typeof tag === 'string' ? tag : tag.name || tag));
};

// Helper function to normalize a single note's tags
const normalizeNote = (note) => {
  if (!note) return note;
  return {
    ...note,
    tags: normalizeTags(note.tags),
    // Convert snake_case fields from backend to camelCase for frontend
    isPublic: note.is_public || false,
    shareId: note.share_id || null,
    isArchived: note.is_archived || false,
  };
};

// Helper function to normalize multiple notes
const normalizeNotes = (notes) => {
  if (!Array.isArray(notes)) return [];
  return notes.map(normalizeNote);
};

// Request interceptor - attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Notes endpoints
export const getNotes = async (params) => {
  const response = await api.get('/notes', { params });
  return { ...response, data: normalizeNotes(response.data.notes) };
};
export const getNoteById = async (id) => {
  const response = await api.get(`/notes/${id}`);
  return { ...response, data: normalizeNote(response.data.note) };
};
export const createNote = async (data) => {
  const response = await api.post('/notes', data);
  return { ...response, data: normalizeNote(response.data.note) };
};
export const updateNote = async (id, data) => {
  const response = await api.patch(`/notes/${id}`, data);
  return { ...response, data: normalizeNote(response.data.note) };
};
export const deleteNote = (id) => api.delete(`/notes/${id}`);
export const toggleShare = async (id) => {
  // First, update the share status
  await api.patch(`/notes/${id}/share`);
  // Then fetch the updated note to get all fields
  const response = await api.get(`/notes/${id}`);
  return { ...response, data: normalizeNote(response.data.note) };
};
export const archiveNote = async (id) => {
  const response = await api.patch(`/notes/${id}`, { is_archived: true });
  return { ...response, data: normalizeNote(response.data.note) };
};
export const getUserTags = () => api.get('/notes/tags');

// AI endpoints
export const generateSummary = async (id) => {
  const response = await api.post(`/ai/notes/${id}/generate-summary`);
  return { ...response, data: response.data.summary };
};

// Shared endpoints
export const getSharedNote = async (shareId) => {
  const response = await api.get(`/shared/${shareId}`);
  return { ...response, data: normalizeNote(response.data.note) };
};

// Insights endpoints
export const getInsights = async () => {
  const response = await api.get('/insights');
  return { ...response, data: response.data.insights };
};

export default api;
