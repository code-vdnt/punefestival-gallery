import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Images, Loader2, ChevronDown, 
  Calendar, Sparkles, Download, X, Eye
} from 'lucide-react';
import { eventsAPI, photosAPI, getImageUrl } from '../api';
import Navbar from '../components/Navbar';
import Lightbox from '../components/Lightbox';

const PAGE_SIZE = 32;

export default function EventPhotosPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  // Lightbox index (null = closed)
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Search filter inside event
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Event details
  useEffect(() => {
    eventsAPI.getOne(id)
      .then((res) => {
        setEvent(res.data.event);
      })
      .catch((err) => {
        console.error('Failed to fetch event:', err);
      });
  }, [id]);

  // Fetch Photos
  const fetchPhotos = useCallback((pageToLoad = 1, append = false) => {
    if (pageToLoad === 1) setLoading(true);
    else setLoadingMore(true);

    photosAPI.getAll({
      event_id: id,
      page: pageToLoad,
      limit: PAGE_SIZE,
      search: searchQuery || undefined,
    })
      .then((res) => {
        const incoming = res.data.photos || [];
        setPhotos(prev => append ? [...prev, ...incoming] : incoming);
        setTotal(res.data.total || 0);
        setHasMore(pageToLoad < (res.data.totalPages || 1));
      })
      .catch((err) => {
        console.error('Failed to load event photos:', err);
      })
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [id, searchQuery]);

  useEffect(() => {
    setPage(1);
    fetchPhotos(1, false);
  }, [fetchPhotos]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPhotos(nextPage, true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1B1104] flex flex-col font-['Plus_Jakarta_Sans']">
      
      {/* ── 1. Minimal Navbar ───────────────────────────────────── */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={true}
      />

      {/* ── 2. Event Header ─────────────────────────────────────── */}
      <div className="border-b border-[#E8DFD5] bg-white py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Back Navigation Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#D82820] hover:text-[#b81c15] transition-colors"
          >
            <ArrowLeft size={16} className="stroke-[2.5]" />
            <span>Back to All Events</span>
          </Link>

          {/* Event Title & Metadata */}
          <div className="flex flex-wrap items-start justify-between gap-4 pt-2">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="px-3 py-1 rounded-full bg-[#FAF0E6] border border-[#D82820]/30 text-xs font-extrabold text-[#D82820]">
                  Pune Festival {event?.year || 2025}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-['Cinzel'] text-[#1B1104] tracking-tight leading-tight">
                {event?.name || 'Event Photo Gallery'}
              </h1>

              {event?.description && (
                <p className="text-[#5A524A] text-sm sm:text-base max-w-3xl mt-3 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            <div className="px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#E8DFD5] text-xs sm:text-sm font-extrabold text-[#D82820] shadow-sm">
              {total.toLocaleString()} Photos
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Photos Grid ────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-light aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center max-w-md mx-auto my-12 space-y-4 border border-[#E8DFD5] shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#F8D800]/15 border border-[#F8D800]/40 flex items-center justify-center mx-auto text-[#D82820]">
              <Images size={30} className="stroke-[1.8]" />
            </div>
            
            <h3 className="text-xl font-bold font-['Cinzel'] text-[#1B1104]">
              No Photos in This Event Yet
            </h3>
            
            <p className="text-xs sm:text-sm text-[#5A524A] leading-relaxed">
              Photographs for this event will appear here once added to the event folder.
            </p>

            <Link
              to="/"
              className="btn-pf-crimson text-xs uppercase tracking-wider inline-flex"
            >
              Browse Other Events
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
              {photos.map((photo, index) => (
                <div
                  key={photo.id || index}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-white border border-[#E8DFD5] hover:border-[#D82820]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#D82820]/10 hover:-translate-y-1"
                >
                  <img
                    src={getImageUrl(photo.thumbnail_path || photo.medium_path)}
                    alt={photo.title || event?.name || 'Photo'}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                  />

                  {/* Dark gradient hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 sm:p-4 flex flex-col justify-end">
                    {photo.title && (
                      <p className="text-white text-xs sm:text-sm font-bold truncate">
                        {photo.title}
                      </p>
                    )}
                    <span className="text-[11px] text-[#F8D800] font-extrabold flex items-center gap-1 mt-0.5">
                      <Eye size={12} />
                      <span>View Fullscreen</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-12 mb-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-pf-crimson !py-3.5 !px-8 text-xs sm:text-sm uppercase tracking-wider disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      Loading Photos...
                    </span>
                  ) : (
                    'Load More Photos'
                  )}
                </button>
              </div>
            )}
          </>
        )}

      </main>

      {/* ── 4. Lightbox Fullscreen Modal ─────────────────────────── */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(i => (i > 0 ? i - 1 : photos.length - 1))}
          onNext={() => setLightboxIndex(i => (i < photos.length - 1 ? i + 1 : 0))}
          onSelectIndex={(idx) => setLightboxIndex(idx)}
        />
      )}

      {/* ── 5. Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-[#E8DFD5] bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs font-semibold text-[#5A524A]">
            © {new Date().getFullYear()} <span className="text-[#D82820] font-bold">Pune Festival</span>. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-[#8C827A]">
            <Link to="/" className="hover:text-[#D82820] transition-colors">
              All Events
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
