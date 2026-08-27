import { 
  Sparkles, Music, Footprints, Flame, Trophy, 
  Palette, Presentation, FolderClosed, ArrowRight, Images
} from 'lucide-react';

function getCategoryIcon(eventName = '') {
  const name = eventName.toLowerCase();
  if (name.includes('ceremony') || name.includes('opening')) return Flame;
  if (name.includes('music') || name.includes('sitar') || name.includes('classical')) return Music;
  if (name.includes('dance') || name.includes('kathak') || name.includes('lavani')) return Footprints;
  if (name.includes('sport') || name.includes('marathon') || name.includes('wrestling')) return Trophy;
  if (name.includes('workshop')) return Presentation;
  if (name.includes('exhibition') || name.includes('art')) return Palette;
  return Sparkles;
}

export default function EventsSection({ 
  events = [], 
  selectedEventId = null,
  onSelectEvent = () => {},
  onViewAll = () => {} 
}) {
  return (
    <section className="my-12">
      {/* ── Section Heading & View All Link ─────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <span className="text-xl sm:text-2xl">⭐</span>
          <h2 className="text-xl sm:text-2xl font-bold font-['Cinzel'] text-white tracking-wide">
            Events
          </h2>
        </div>

        <button
          onClick={onViewAll}
          className="group flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
        >
          <span>View All Events</span>
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* ── Event Cards Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {events.map((ev) => {
          const CategoryIcon = getCategoryIcon(ev.name);
          const isSelected = selectedEventId === ev.id;
          const coverImage = ev.cover_thumbnail || ev.cover_medium;

          return (
            <div
              key={ev.id}
              onClick={() => onSelectEvent(isSelected ? null : ev.id)}
              className={`rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col group ${
                isSelected
                  ? 'bg-[#151f33] border-2 border-amber-400 shadow-xl shadow-amber-500/15 scale-[1.01]'
                  : 'card-dark'
              }`}
            >
              {/* Event Image Cover / Dark Elegant Placeholder */}
              <div className="relative aspect-[16/10] bg-[#090d16] overflow-hidden">
                {coverImage ? (
                  <img
                    src={coverImage}
                    alt={ev.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full pattern-placeholder flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                      <CategoryIcon size={24} className="stroke-[2]" />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Pune Festival {ev.year || 2025}
                    </span>
                  </div>
                )}

                {/* Year Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#080c14]/80 backdrop-blur-md border border-white/10 text-[11px] font-bold text-amber-400">
                  {ev.year || 2025}
                </div>

                {/* Dark gradient shadow */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#101624] via-transparent to-transparent opacity-80" />
              </div>

              {/* Event Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {/* Small Golden Category Icon */}
                    <div className="w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0">
                      <CategoryIcon size={13} className="stroke-[2.5]" />
                    </div>
                    <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-amber-300 transition-colors line-clamp-1">
                      {ev.name}
                    </h3>
                  </div>

                  {ev.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {ev.description}
                    </p>
                  )}
                </div>

                {/* Photo Count and Action */}
                <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Images size={13} className="text-amber-400/80" />
                    <span>{ev.photo_count || 0} Photos</span>
                    {ev.album_count > 0 && (
                      <span className="text-slate-500">· {ev.album_count} Albums</span>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-amber-400 group-hover:underline flex items-center gap-1">
                    View Photos →
                  </span>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
