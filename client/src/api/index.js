import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://peblo-notes-1.onrender.com/api',
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
    author: note.author || note.author_name || null,
    createdAt: note.createdAt || note.created_at || null,
    updatedAt: note.updatedAt || note.updated_at || null,
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
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/signup');

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
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
  const response = await api.patch(`/notes/${id}/share`);
  return { ...response, data: normalizeNote(response.data.note) };
};
export const setNoteArchived = async (id, isArchived) => {
  const response = await api.patch(`/notes/${id}`, { is_archived: isArchived });
  return { ...response, data: normalizeNote(response.data.note) };
};
export const getUserTags = () => api.get('/notes/tags');

// AI endpoints
export const generateSummary = async (id) => {
  const response = await api.post(`/ai/notes/${id}/generate-summary`);
  return {
    ...response,
    data: {
      summary: response.data.summary,
      summaryPoints: response.data.summaryPoints || response.data.summary_points || [],
      actionItems: response.data.actionItems || response.data.action_items || [],
      suggestedTitle: response.data.suggestedTitle || response.data.suggested_title || '',
      model: response.data.model,
    },
  };
};

// Shared endpoints
export const getSharedNote = async (shareId) => {
  const response = await api.get(`/shared/${shareId}`);
  return { ...response, data: normalizeNote(response.data.note) };
};

// Insights endpoints
export const getInsights = async () => {
  const response = await api.get('/insights');
  const data = response.data || {};
  return {
    ...response,
    data: {
      totalNotes: data.total_notes || 0,
      archivedNotes: data.archived_notes || 0,
      publicNotes: data.public_notes || 0,
      aiSummariesThisWeek: data.ai_stats?.calls_this_week || 0,
      aiCallsTotal: data.ai_stats?.total_calls || 0,
      weeklyActivity: (data.weekly_activity || []).map((item) => ({
        day: new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' }),
        date: item.date,
        notes: item.count,
      })),
      topTags: data.top_tags || [],
      recentlyEdited: (data.recent_notes || []).map((note) => ({
        ...normalizeNote(note),
        updatedAtLabel: note.updated_at
          ? new Date(note.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
          : 'No date',
      })),
    },
  };
};

export default api;
