import axios from 'axios';

// Get backend API base URL
const apiBase = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBase,
  timeout: 60000,
});

/**
 * Utility to resolve image URLs for both local development and cross-domain production hosting
 */
export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  const backendBase = import.meta.env.VITE_BACKEND_URL || (
    import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : ''
  );
  return `${backendBase}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ── Events ─────────────────────────────────────────────────────
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getOne: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getStats: () => api.get('/events/stats'),
};

// ── Albums ─────────────────────────────────────────────────────
export const albumsAPI = {
  getAll: (params) => api.get('/albums', { params }),
  getOne: (id) => api.get(`/albums/${id}`),
  create: (data) => api.post('/albums', data),
  update: (id, data) => api.put(`/albums/${id}`, data),
  delete: (id) => api.delete(`/albums/${id}`),
};

// ── Photos ─────────────────────────────────────────────────────
export const photosAPI = {
  getAll: (params) => api.get('/photos', { params }),
  getOne: (id) => api.get(`/photos/${id}`),
  upload: (formData, onProgress) =>
    api.post('/photos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  update: (id, data) => api.put(`/photos/${id}`, data),
  delete: (id) => api.delete(`/photos/${id}`),
  bulkDelete: (ids) => api.post('/photos/bulk-delete', { ids }),
  bulkUpdateAlbum: (photoIds, albumId) =>
    api.post('/photos/bulk-album', { photoIds, albumId }),
  getRecent: (limit = 10) => api.get('/photos/recent', { params: { limit } }),
};

export default api;
