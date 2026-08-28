import { Link } from 'react-router-dom';
import { ArrowRight, Images, Calendar } from 'lucide-react';
import { getImageUrl } from '../api';

export default function EventCard({ event }) {
  const coverImage = event.cover_image_url || event.cover_medium || event.cover_thumbnail;
  const photoCount = event.photo_count || 0;

  return (
    <Link
      to={`/event/${event.id}`}
      className="group card-pf rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-300"
    >
      {/* ── Event Cover Photo ──────────────────────────────────── */}
      <div className="relative aspect-[16/11] bg-[#F4EFEA] overflow-hidden">
        {coverImage ? (
          <img
            src={getImageUrl(coverImage)}
            alt={event.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full pattern-placeholder flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F8D800]/20 border border-[#D82820]/30 flex items-center justify-center text-[#D82820] mb-2 group-hover:scale-110 transition-transform">
              <Images size={26} className="stroke-[1.8]" />
            </div>
            <span className="text-xs font-bold text-[#5A524A] tracking-wide">
              Pune Festival {event.year || 2025}
            </span>
          </div>
        )}

        {/* Year Pill Badge */}
        <div className="absolute top-3.5 right-3.5 px-3 py-1 rounded-full bg-[#D82820] text-xs font-extrabold text-white shadow-md">
          {event.year || 2025}
        </div>

        {/* Subtle Bottom Vignette on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* ── Event Info Details ─────────────────────────────────── */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-white">
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-extrabold tracking-wider text-[#E07810] uppercase">
              Pune Festival {event.year}
            </span>
          </div>

          <h3 className="font-['Cinzel'] font-bold text-lg sm:text-xl text-[#1B1104] group-hover:text-[#D82820] transition-colors leading-snug">
            {event.name}
          </h3>

          {event.description && (
            <p className="text-xs sm:text-sm text-[#5A524A] line-clamp-2 mt-2 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* ── Footer Stats & CTA ───────────────────────────────── */}
        <div className="pt-4 mt-4 border-t border-[#E8DFD5] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#5A524A] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#E8DFD5]">
            <Images size={14} className="text-[#D82820]" />
            <span>{photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}</span>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#D82820] group-hover:translate-x-1 transition-transform">
            <span>View Gallery</span>
            <ArrowRight size={14} className="stroke-[2.5]" />
          </span>
        </div>

      </div>

    </Link>
  );
}
