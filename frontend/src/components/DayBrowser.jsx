import { Calendar, ChevronRight, Images, Sparkles, Folder } from 'lucide-react';

export default function DayBrowser({ 
  selectedDay = null, 
  onSelectDay = () => {},
  selectedYear = 2025,
  photosByDay = {},
  events = []
}) {
  // 12 Days of Pune Festival schedule configuration
  const daysList = [
    { dayNumber: 1, date: '06', month: 'SEP', title: 'Day 1' },
    { dayNumber: 2, date: '07', month: 'SEP', title: 'Day 2' },
    { dayNumber: 3, date: '08', month: 'SEP', title: 'Day 3' },
    { dayNumber: 4, date: '09', month: 'SEP', title: 'Day 4' },
    { dayNumber: 5, date: '10', month: 'SEP', title: 'Day 5' },
    { dayNumber: 6, date: '11', month: 'SEP', title: 'Day 6' },
    { dayNumber: 7, date: '12', month: 'SEP', title: 'Day 7' },
    { dayNumber: 8, date: '13', month: 'SEP', title: 'Day 8' },
    { dayNumber: 9, date: '14', month: 'SEP', title: 'Day 9' },
    { dayNumber: 10, date: '15', month: 'SEP', title: 'Day 10' },
    { dayNumber: 11, date: '16', month: 'SEP', title: 'Day 11' },
    { dayNumber: 12, date: '17', month: 'SEP', title: 'Day 12' },
  ];

  return (
    <section className="my-10">
      {/* ── Section Heading ─────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-xl sm:text-2xl">📅</span>
          <h2 className="text-xl sm:text-2xl font-bold font-['Cinzel'] text-white tracking-wide">
            Browse by Day
          </h2>
          <span className="hidden sm:inline-block text-xs text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-medium">
            Pune Festival {selectedYear || 2025}
          </span>
        </div>

        {selectedDay && (
          <button
            onClick={() => onSelectDay(null)}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition-colors"
          >
            Show All Days ✕
          </button>
        )}
      </div>

      {/* ── Horizontally Scrollable Day Cards ───────────────────── */}
      <div className="horizontal-scroll-container pb-4">
        {daysList.map((day) => {
          const isSelected = selectedDay === day.dayNumber;
          const photoCount = photosByDay[day.dayNumber]?.count || 0;
          const coverImg = photosByDay[day.dayNumber]?.cover;

          return (
            <div
              key={day.dayNumber}
              onClick={() => onSelectDay(isSelected ? null : day.dayNumber)}
              className={`w-64 sm:w-72 p-5 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                isSelected
                  ? 'bg-[#141d30] border-2 border-amber-400 shadow-xl shadow-amber-500/15 scale-[1.02]'
                  : 'card-dark'
              }`}
            >
              {/* Top Row: Date & Month + Thumbnail Preview */}
              <div className="flex justify-between items-start mb-4">
                
                {/* Date Block */}
                <div>
                  <div className="text-3xl sm:text-4xl font-black font-['Cinzel'] text-white tracking-tight leading-none">
                    {day.date}
                  </div>
                  <div className="text-sm font-bold text-amber-400 tracking-widest uppercase mt-1">
                    {day.month}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {selectedYear || 2025}
                  </div>
                </div>

                {/* Preview Thumbnail or Clean Geometric Dark Placeholder */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#0a0e17] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-amber-500/40 transition-colors">
                  {coverImg ? (
                    <img
                      src={coverImg}
                      alt={`${day.title} preview`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-amber-500/60 p-2 text-center">
                      <Folder size={22} className="stroke-[1.8]" />
                      <span className="text-[9px] text-slate-500 uppercase tracking-tighter mt-1 font-semibold">
                        Day {day.dayNumber}
                      </span>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Row: Day Number & Photo Count */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-['Plus_Jakarta_Sans'] group-hover:text-amber-300 transition-colors">
                    {day.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {photoCount > 0 ? `${photoCount} Photos` : 'Explore Events'}
                  </p>
                </div>

                <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isSelected ? 'bg-amber-400 text-[#080c14]' : 'bg-white/5 text-slate-400 group-hover:bg-amber-500/20 group-hover:text-amber-400'
                }`}>
                  <ChevronRight size={14} className="stroke-[2.5]" />
                </div>
              </div>

              {/* Active Gold Indicator Bar */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
