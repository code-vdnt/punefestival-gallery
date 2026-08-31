import { Images, Calendar, FolderClosed, Sparkles, Flame } from 'lucide-react';

export default function HeroSection({ 
  totalPhotos = 0, 
  totalEvents = 0, 
  totalDays = 12 
}) {
  // Display count or baseline archive count
  const displayPhotoCount = totalPhotos > 0 ? totalPhotos.toLocaleString() : '12,450+';
  const displayEventCount = totalEvents > 0 ? totalEvents : '48';
  const displayDayCount = totalDays > 0 ? totalDays : '12';

  return (
    <section className="relative overflow-hidden bg-[#090d16] border-b border-white/10">
      {/* ── Background Subtle Glow & Cultural Geometric Pattern ──────── */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 90% 70% at 20% 30%, rgba(245, 158, 11, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 85% 80%, rgba(217, 119, 6, 0.08) 0%, transparent 50%)
          `
        }}
      />

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#f59e0b 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── Left Side Content ─────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-4 text-left">
            
            {/* Small uppercase tag with Official Logo */}
            <div className="flex items-center gap-3.5">
              <img 
                src="/logo.png" 
                alt="Pune Festival Official Logo" 
                className="w-14 h-14 sm:w-16 sm:h-16 object-contain bg-white/5 border border-amber-500/30 p-1 rounded-2xl shadow-lg shadow-amber-500/10 backdrop-blur-sm"
              />
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-widest uppercase">
                <Sparkles size={13} className="text-amber-400" />
                <span>OFFICIAL PHOTO ARCHIVE</span>
              </div>
            </div>

            {/* Main Headings */}
            <div className="space-y-1">
              <h1 className="font-['Cinzel'] text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                Pune Festival
              </h1>
              <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold gold-text-gradient italic tracking-wide">
                Photo Gallery
              </h2>
            </div>

            {/* Description */}
            <p className="text-slate-300 text-base sm:text-lg lg:text-xl font-normal max-w-2xl leading-relaxed pt-2">
              Relive the magical moments of Pune Festival through our lens. Explore years of heritage, music, dance, and cultural celebrations.
            </p>
          </div>

          {/* ── Right Side Statistics ─────────────────────────────── */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-lg p-6 sm:p-7 rounded-2xl bg-[#0d1322]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
              <div className="grid grid-cols-3 divide-x divide-white/10 items-center text-center">
                
                {/* Stat 1: Photos */}
                <div className="px-2 sm:px-4 flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <Images size={20} className="stroke-[2]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xl sm:text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                      {displayPhotoCount}
                    </p>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Photos
                    </p>
                  </div>
                </div>

                {/* Stat 2: Days */}
                <div className="px-2 sm:px-4 flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <Calendar size={20} className="stroke-[2]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xl sm:text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                      {displayDayCount}
                    </p>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Days
                    </p>
                  </div>
                </div>

                {/* Stat 3: Events */}
                <div className="px-2 sm:px-4 flex flex-col items-center space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                    <FolderClosed size={20} className="stroke-[2]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xl sm:text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
                      {displayEventCount}
                    </p>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Events
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
