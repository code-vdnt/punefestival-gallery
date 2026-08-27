import { Link } from 'react-router-dom';
import { ArrowRight, Images, Calendar } from 'lucide-react';
import { getImageUrl } from '../api';

export default function EventCard({ event }) {
  const coverImage = event.cover_image_url || event.cover_medium || event.cover_thumbnail;
  const photoCount = event.photo_count || 0;

  return (
    <Link
      to={`/event/${event.id}`}
      className="group card-dark rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300 border border-white/10 hover:border-amber-500/40 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/70"
    >
      {/* ── Event Cover Photo ──────────────────────────────────── */}
      <div className="relative aspect-[16/11] bg-[#0a0e18] overflow-hidden">
        {coverImage ? (
          <img
            src={getImageUrl(coverImage)}
            alt={event.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full pattern-placeholder flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
              <Images size={26} className="stroke-[1.8]" />
            </div>
            <span className="text-xs font-semibold text-slate-400 tracking-wide">
              Pune Festival {event.year || 2025}
            </span>
          </div>
        )}

        {/* Year Pill Badge */}
        <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-[#080c14]/85 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-400 shadow-md">
          {event.year || 2025}
        </div>

        {/* Dark subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101624] via-[#101624]/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
      </div>

      {/* ── Event Details ──────────────────────────────────────── */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3 bg-[#101624]">
        <div>
          <h3 className="font-['Cinzel'] font-bold text-white text-lg sm:text-xl group-hover:text-amber-300 transition-colors line-clamp-1">
            {event.name}
          </h3>
          
          <p className="text-xs font-medium text-amber-400/90 mt-1">
            Pune Festival {event.year || 2025}
          </p>

          {event.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed font-normal">
              {event.description}
            </p>
          )}
        </div>

        {/* Bottom Stats & Action */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Images size={14} className="text-amber-400/80" />
            <span>{photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}</span>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 group-hover:text-amber-300 group-hover:translate-x-1 transition-all">
            <span>View Photos</span>
            <ArrowRight size={14} className="stroke-[2.5]" />
          </span>
        </div>
      </div>
    </Link>
  );
}
