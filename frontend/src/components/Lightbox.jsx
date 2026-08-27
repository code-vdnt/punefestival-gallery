import { useEffect, useCallback, useRef, useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Download, ZoomIn, 
  Calendar, MapPin, Tag, Sparkles, Maximize2 
} from 'lucide-react';
import { getImageUrl } from '../api';

export default function Lightbox({ 
  photos = [], 
  currentIndex = 0, 
  onClose = () => {}, 
  onPrev = () => {}, 
  onNext = () => {},
  onSelectIndex = () => {}
}) {
  const photo = photos[currentIndex];
  const thumbStripRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbStripRef.current) {
      const activeEl = thumbStripRef.current.children[currentIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
    setImageLoaded(false);
  }, [currentIndex]);

  // Mobile Touch Swipe
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      diff > 0 ? onNext() : onPrev();
    }
    touchStartX.current = null;
  };

  if (!photo) return null;

  return (
    <div
      className="lightbox-modal animate-fade-in"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Top Bar Controls ────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 sm:p-6 z-50">
        
        {/* Left: Counter & Title */}
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <div className="px-3.5 py-1.5 rounded-full bg-[#101624]/90 border border-white/10 text-xs sm:text-sm font-bold text-amber-400">
            {currentIndex + 1} / {photos.length}
          </div>
          {photo.event_name && (
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              {photo.event_name} {photo.year ? `(${photo.year})` : ''}
            </span>
          )}
        </div>

        {/* Right: Download & Close */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <a
            href={getImageUrl(photo.large_path || photo.medium_path || photo.original_path)}
            download={photo.title || 'pune-festival-photo'}
            className="p-2.5 rounded-full bg-[#101624]/90 hover:bg-amber-500 hover:text-[#080c14] text-slate-200 border border-white/10 transition-all cursor-pointer"
            title="Download Full Resolution"
          >
            <Download size={18} />
          </a>
          
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-[#101624]/90 hover:bg-red-500/80 text-slate-200 border border-white/10 transition-all cursor-pointer"
            title="Close (ESC)"
          >
            <X size={20} />
          </button>
        </div>

      </div>

      {/* ── Main Photo Container ─────────────────────────────────── */}
      <div 
        className="flex-1 flex items-center justify-center relative px-4 sm:px-16"
        onClick={onClose}
      >
        {/* Left Arrow Button */}
        {photos.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-[#101624]/90 hover:bg-amber-500 hover:text-[#080c14] text-white border border-white/10 transition-all z-40 cursor-pointer shadow-2xl"
            title="Previous (←)"
          >
            <ChevronLeft size={24} className="stroke-[2.5]" />
          </button>
        )}

        {/* The Image Itself */}
        <div 
          className="max-w-[92vw] max-h-[68vh] sm:max-h-[72vh] flex flex-col items-center justify-center relative"
          onClick={(e) => e.stopPropagation()}
        >
          {!imageLoaded && (
            <div className="w-80 h-64 skeleton-dark flex items-center justify-center" />
          )}

          <img
            src={getImageUrl(photo.large_path || photo.medium_path)}
            alt={photo.title || 'Pune Festival Photo'}
            onLoad={() => setImageLoaded(true)}
            className={`max-w-full max-h-[68vh] sm:max-h-[72vh] object-contain rounded-2xl shadow-2xl transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
            }`}
          />
        </div>

        {/* Right Arrow Button */}
        {photos.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-[#101624]/90 hover:bg-amber-500 hover:text-[#080c14] text-white border border-white/10 transition-all z-40 cursor-pointer shadow-2xl"
            title="Next (→)"
          >
            <ChevronRight size={24} className="stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* ── Photo Details Panel ─────────────────────────────────── */}
      <div 
        className="max-w-3xl mx-auto px-4 text-center my-2"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.title && (
          <h2 className="text-white text-base sm:text-lg font-bold font-['Plus_Jakarta_Sans']">
            {photo.title}
          </h2>
        )}
        {photo.description && (
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            {photo.description}
          </p>
        )}
      </div>

      {/* ── Bottom Thumbnail Navigation Strip ──────────────────── */}
      {photos.length > 1 && (
        <div 
          className="p-3 sm:p-4 bg-[#080c14]/90 border-t border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            ref={thumbStripRef}
            className="flex items-center gap-2.5 overflow-x-auto max-w-4xl mx-auto py-1 scrollbar-none justify-start sm:justify-center"
          >
            {photos.map((p, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={p.id || idx}
                  onClick={() => onSelectIndex(idx)}
                  className={`relative w-12 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all border-2 cursor-pointer ${
                    isActive
                      ? 'border-amber-400 scale-110 shadow-lg shadow-amber-500/30'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getImageUrl(p.thumbnail_path || p.medium_path)}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
