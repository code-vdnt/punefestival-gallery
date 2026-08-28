import axios from 'axios';

// Backend API base URL (used for Admin panel and dynamic endpoints)
const apiBase = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBase,
  timeout: 60000,
});

/**
 * Static Manifest Cache
 */
let staticManifest = null;
let manifestFetchPromise = null;

async function getStaticManifest() {
  if (staticManifest) return staticManifest;
  if (manifestFetchPromise) return manifestFetchPromise;

  manifestFetchPromise = fetch('/gallery-data.json')
    .then(res => {
      if (!res.ok) throw new Error('No static manifest');
      return res.json();
    })
    .then(data => {
      staticManifest = data;
      return data;
    })
    .catch(() => {
      staticManifest = null;
      return null;
    })
    .finally(() => {
      manifestFetchPromise = null;
    });

  return manifestFetchPromise;
}

/**
 * Utility to resolve image URLs for static hosting and dynamic backend
 */
export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  // Static gallery images under /gallery or public assets
  if (path.startsWith('/gallery/') || path.startsWith('/assets/') || path.startsWith('/favicon.')) {
    return path;
  }
  // Dynamic uploads from backend
  const backendBase = import.meta.env.VITE_BACKEND_URL || (
    import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : ''
  );
  return `${backendBase}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Attach JWT token to every request for admin operations
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

// ── Auth (Admin Portal) ────────────────────────────────────────
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ── Events (Hybrid: Static Manifest + Backend API) ─────────────
export const eventsAPI = {
  getAll: async (params = {}) => {
    const manifest = await getStaticManifest();
    if (manifest && manifest.events && manifest.events.length > 0) {
      let filtered = [...manifest.events];
      if (params.year) {
        filtered = filtered.filter(e => String(e.year) === String(params.year));
      }
      return {
        data: {
          events: filtered,
          years: manifest.years || [],
        },
      };
    }
    return api.get('/events', { params });
  },

  getOne: async (id) => {
    const manifest = await getStaticManifest();
    if (manifest && manifest.events) {
      const found = manifest.events.find(e => e.id === id || e.slug === id);
      if (found) return { data: { event: found } };
    }
    return api.get(`/events/${id}`);
  },

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

// ── Photos (Hybrid: Static Manifest + Backend API) ─────────────
export const photosAPI = {
  getAll: async (params = {}) => {
    const manifest = await getStaticManifest();
    if (manifest && manifest.photos) {
      let allPhotos = [];

      if (params.event_id) {
        allPhotos = manifest.photos[params.event_id] || [];
      } else {
        // Collect all photos across all events
        Object.values(manifest.photos).forEach(list => {
          allPhotos.push(...list);
        });
      }

      if (params.year) {
        allPhotos = allPhotos.filter(p => String(p.year) === String(params.year));
      }

      if (params.search) {
        const query = params.search.toLowerCase();
        allPhotos = allPhotos.filter(p => 
          (p.title && p.title.toLowerCase().includes(query)) ||
          (p.event_name && p.event_name.toLowerCase().includes(query))
        );
      }

      const page = parseInt(params.page) || 1;
      const limit = parseInt(params.limit) || 24;
      const start = (page - 1) * limit;
      const paginated = allPhotos.slice(start, start + limit);

      return {
        data: {
          photos: paginated,
          total: allPhotos.length,
          page,
          limit,
          totalPages: Math.ceil(allPhotos.length / limit),
        },
      };
    }

    return api.get('/photos', { params });
  },

  getOne: async (id) => {
    const manifest = await getStaticManifest();
    if (manifest && manifest.photos) {
      for (const list of Object.values(manifest.photos)) {
        const p = list.find(item => item.id === id);
        if (p) return { data: { photo: p } };
      }
    }
    return api.get(`/photos/${id}`);
  },

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
