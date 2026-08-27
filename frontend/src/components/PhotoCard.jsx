import { useState } from 'react';
import { Images, Calendar, Tag, Sparkles } from 'lucide-react';
import { getImageUrl } from '../api';

export default function PhotoCard({ 
  photo, 
  onClick = () => {}, 
  selectable = false, 
  selected = false, 
  onSelect = () => {},
  viewMode = 'grid'
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // ── List View Mode ───────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div
        onClick={() => selectable ? onSelect(photo.id) : onClick()}
        className={`flex items-center gap-4 sm:gap-6 p-4 rounded-2xl cursor-pointer transition-all duration-200 group ${
          selected
            ? 'bg-[#182338] border-2 border-amber-400'
            : 'card-dark'
        }`}
      >
        {/* Thumbnail on left */}
        <div className="relative w-28 sm:w-36 h-20 sm:h-24 rounded-xl overflow-hidden bg-[#090d16] flex-shrink-0 border border-white/10">
          {!loaded && !error && <div className="absolute inset-0 skeleton-dark" />}
          
          <img
            src={error ? '' : getImageUrl(photo.thumbnail_path || photo.medium_path)}
            alt={photo.title || 'Pune Festival Photo'}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => { setError(true); setLoaded(true); }}
            className={`w-full h-full object-cover group-hover:scale-108 transition-transform duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {error && (
            <div className="w-full h-full flex items-center justify-center text-slate-600 pattern-placeholder">
              <Images size={20} />
            </div>
          )}
        </div>

        {/* Details in center/right */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {photo.event_name && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] sm:text-xs font-bold text-amber-400">
                {photo.event_name}
              </span>
            )}
            {photo.year && (
              <span className="text-slate-500 text-xs font-medium">
                {photo.year}
              </span>
            )}
          </div>

          <h3 className="text-white font-bold text-sm sm:text-base group-hover:text-amber-300 transition-colors truncate">
            {photo.title || `${photo.event_name || 'Festival'} Photo`}
          </h3>

          {photo.description && (
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
              {photo.description}
            </p>
          )}
        </div>

        {/* Action Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="hidden sm:inline-flex btn-dark-outline text-xs !py-1.5 !px-3 font-semibold text-amber-400 hover:!bg-amber-500 hover:!text-[#080c14]"
        >
          View Large
        </button>
      </div>
    );
  }

  // ── Grid View Mode (Default) ─────────────────────────────────
  return (
    <div
      className={`group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-[#0e1320] border transition-all duration-300 ${
        selected
          ? 'border-2 border-amber-400 shadow-xl shadow-amber-500/20 scale-[0.98]'
          : 'border-white/10 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-black/60 hover:-translate-y-1'
      }`}
      onClick={() => selectable ? onSelect(photo.id) : onClick()}
    >
      {/* Skeleton Loading State */}
      {!loaded && !error && (
        <div className="absolute inset-0 skeleton-dark" />
      )}

      {/* Select Checkbox for Admin */}
      {selectable && (
        <div
          className={`absolute top-3 left-3 z-20 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            selected
              ? 'bg-amber-400 border-amber-400 shadow-md'
              : 'bg-black/60 border-white/60 backdrop-blur-sm'
          }`}
          onClick={(e) => { e.stopPropagation(); onSelect(photo.id); }}
        >
          {selected && (
            <svg className="w-3.5 h-3.5 text-[#080c14] font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      )}

      {/* Actual Image */}
      <img
        src={error ? '' : getImageUrl(photo.thumbnail_path || photo.medium_path)}
        alt={photo.title || 'Festival photo'}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); setLoaded(true); }}
        className={`w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Error / Placeholder state if image fails */}
      {error && (
        <div className="absolute inset-0 pattern-placeholder flex flex-col items-center justify-center text-slate-500 p-4 text-center">
          <Images size={28} className="text-amber-500/40 mb-1" />
          <span className="text-xs font-semibold text-slate-400">Pune Festival Photo</span>
        </div>
      )}

      {/* Dark Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080c14]/95 via-[#080c14]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-5">
        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 space-y-1">
          
          <div className="flex items-center gap-2">
            {photo.event_name && (
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                {photo.event_name}
              </span>
            )}
            {photo.year && (
              <span className="text-[11px] text-slate-400 font-medium">
                · {photo.year}
              </span>
            )}
          </div>

          <h3 className="text-white text-sm sm:text-base font-bold leading-snug line-clamp-1">
            {photo.title || `${photo.event_name || 'Festival'} Photo`}
          </h3>

          {photo.description && (
            <p className="text-xs text-slate-300 line-clamp-1 opacity-90">
              {photo.description}
            </p>
          )}

        </div>
      </div>

    </div>
  );
}
