import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Images, Loader2, ChevronDown, 
  Calendar, Sparkles, Download, X 
} from 'lucide-react';
import { eventsAPI, photosAPI, getImageUrl } from '../api';
import Navbar from '../components/Navbar';
import Lightbox from '../components/Lightbox';

const LIMIT = 24;

export default function EventPhotosPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Fetch Event Details
  useEffect(() => {
    eventsAPI.getOne(id)
      .then(res => setEvent(res.data.event))
      .catch(err => {
        console.error('Failed to load event:', err);
      });
  }, [id]);

  // Fetch Photos for this Event
  const fetchPhotos = useCallback(async (currentPage, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const res = await photosAPI.getAll({
        event_id: id,
        page: currentPage,
        limit: LIMIT,
      });

      const fetched = res.data.photos || [];
      setPhotos(prev => append ? [...prev, ...fetched] : fetched);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load event photos:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [id]);

  useEffect(() => {
    setPage(1);
    fetchPhotos(1, false);
  }, [fetchPhotos]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPhotos(next, true);
  };

  const hasMore = photos.length < total;

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      
      {/* ── Navigation Bar ─────────────────────────────────────── */}
      <Navbar showSearch={false} />

      {/* ── Main Container ─────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* ── Back to Events Button ──────────────────────────────── */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#101624] hover:bg-amber-500 hover:text-[#080c14] text-slate-300 text-xs sm:text-sm font-bold border border-white/10 transition-all cursor-pointer mb-8"
        >
          <ArrowLeft size={16} className="stroke-[2.5]" />
          <span>Back to Events</span>
        </Link>

        {/* ── Event Header ───────────────────────────────────────── */}
        <div className="mb-10 pb-6 border-b border-white/10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs sm:text-sm font-bold text-amber-400 uppercase tracking-widest block mb-1">
                Pune Festival {event?.year || 2025}
              </span>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Cinzel'] text-white tracking-tight leading-tight">
                {event?.name || 'Event Photo Gallery'}
              </h1>

              {event?.description && (
                <p className="text-slate-400 text-sm sm:text-base max-w-3xl mt-3 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            <div className="px-4 py-2 rounded-full bg-[#101624] border border-amber-500/30 text-xs sm:text-sm font-bold text-amber-400 shadow-md">
              {total.toLocaleString()} Photos
            </div>
          </div>
        </div>

        {/* ── Photos Grid ────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-dark aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="dark-panel rounded-3xl p-16 text-center max-w-md mx-auto my-12 space-y-4 border border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto text-amber-400">
              <Images size={30} className="stroke-[1.8]" />
            </div>
            
            <h3 className="text-xl font-bold font-['Cinzel'] text-white">
              No Photos in This Event Yet
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Photographs for this event will appear here once uploaded by the administrator.
            </p>

            <Link
              to="/"
              className="btn-gold !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider inline-flex"
            >
              Browse Other Events
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 animate-fade-in">
              {photos.map((photo, index) => (
                <div
                  key={photo.id || index}
                  onClick={() => setLightboxIndex(index)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-[#0e1320] border border-white/10 hover:border-amber-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1"
                >
                  <img
                    src={getImageUrl(photo.thumbnail_path || photo.medium_path)}
                    alt={photo.title || event?.name || 'Photo'}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />

                  {/* Dark gradient hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080c14]/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 sm:p-4 flex flex-col justify-end">
                    {photo.title && (
                      <p className="text-white text-xs sm:text-sm font-bold truncate">
                        {photo.title}
                      </p>
                    )}
                    <span className="text-[11px] text-amber-400 font-semibold">
                      Click to View Fullscreen
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
                  className="btn-gold !py-3.5 !px-8 text-xs sm:text-sm font-extrabold tracking-wider uppercase shadow-xl shadow-amber-500/25 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <><Loader2 size={16} className="animate-spin" /> Loading Photos...</>
                  ) : (
                    <><ChevronDown size={16} className="stroke-[2.5]" /> Load More Photos ({total - photos.length} remaining)</>
                  )}
                </button>
              </div>
            )}

            {!hasMore && photos.length > 0 && (
              <p className="text-center text-slate-500 text-xs tracking-wider uppercase font-medium mt-12 mb-4">
                — End of {event?.name || 'Event'} Photos ({total} Total) —
              </p>
            )}
          </>
        )}

      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-[#05080e] border-t border-white/10 mt-20 py-8 text-slate-500 text-xs text-center">
        <p>© {new Date().getFullYear()} Pune Festival. All rights reserved.</p>
      </footer>

      {/* ── Fullscreen Lightbox ────────────────────────────────── */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex(i => (i - 1 + photos.length) % photos.length)}
          onNext={() => setLightboxIndex(i => (i + 1) % photos.length)}
          onSelectIndex={(idx) => setLightboxIndex(idx)}
        />
      )}

    </div>
  );
}
