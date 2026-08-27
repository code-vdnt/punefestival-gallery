import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import GalleryPage from './pages/GalleryPage';
import EventPhotosPage from './pages/EventPhotosPage';

// Admin Pages
import AdminLoginPage from './pages/admin/LoginPage';
import DashboardPage from './pages/admin/DashboardPage';
import EventsPage from './pages/admin/EventsPage';
import AlbumsPage from './pages/admin/AlbumsPage';
import PhotosPage from './pages/admin/PhotosPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Gallery (Events as Main Focus) */}
          <Route path="/" element={<GalleryPage />} />
          
          {/* Dedicated Event Photos Page */}
          <Route path="/event/:id" element={<EventPhotosPage />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Admin — Protected */}
          <Route path="/admin" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
          <Route path="/admin/albums" element={<ProtectedRoute><AlbumsPage /></ProtectedRoute>} />
          <Route path="/admin/photos" element={<ProtectedRoute><PhotosPage /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1322',
            color: '#f1f5f9',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '14px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#f59e0b', secondary: '#080c14' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </AuthProvider>
  );
}
