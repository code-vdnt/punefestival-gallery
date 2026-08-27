import { ChevronRight, Home, ArrowLeft, Calendar, Sparkles } from 'lucide-react';

export default function Breadcrumbs({
  year = null,
  day = null,
  event = null,
  album = null,
  onReset = () => {},
  onSelectYear = () => {},
  onSelectDay = () => {},
  onSelectEvent = () => {},
  onBack = () => {}
}) {
  const hasDrillDown = year || day || event || album;

  if (!hasDrillDown) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-4 sm:px-6 rounded-2xl bg-[#0d121e] border border-white/10 mb-8 animate-fade-in">
      
      {/* ── Breadcrumb Path ─────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm font-medium flex-wrap">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
        >
          <Home size={14} />
          <span>Gallery</span>
        </button>

        {year && (
          <>
            <ChevronRight size={13} className="text-slate-600" />
            <button
              onClick={() => onSelectYear(year)}
              className={`hover:text-amber-400 transition-colors cursor-pointer ${
                !day && !event && !album ? 'text-amber-400 font-bold' : 'text-slate-300'
              }`}
            >
              {year}
            </button>
          </>
        )}

        {day && (
          <>
            <ChevronRight size={13} className="text-slate-600" />
            <button
              onClick={() => onSelectDay(day)}
              className={`hover:text-amber-400 transition-colors cursor-pointer ${
                !event && !album ? 'text-amber-400 font-bold' : 'text-slate-300'
              }`}
            >
              Day {day}
            </button>
          </>
        )}

        {event && (
          <>
            <ChevronRight size={13} className="text-slate-600" />
            <button
              onClick={() => onSelectEvent(event.id)}
              className={`hover:text-amber-400 transition-colors cursor-pointer ${
                !album ? 'text-amber-400 font-bold' : 'text-slate-300'
              }`}
            >
              {event.name}
            </button>
          </>
        )}

        {album && (
          <>
            <ChevronRight size={13} className="text-slate-600" />
            <span className="text-amber-400 font-bold">
              {album.name}
            </span>
          </>
        )}
      </nav>

      {/* ── Back Button ─────────────────────────────────────────── */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161f32] hover:bg-amber-500 hover:text-[#080c14] text-slate-300 text-xs font-bold transition-all border border-white/10 cursor-pointer"
      >
        <ArrowLeft size={13} className="stroke-[2.5]" />
        <span>Back</span>
      </button>

    </div>
  );
}
