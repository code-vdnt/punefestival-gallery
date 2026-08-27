import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Images, Loader2, Sparkles, Search, 
  Calendar, ArrowRight, Shield 
} from 'lucide-react';
import { eventsAPI } from '../api';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';

export default function GalleryPage() {
  const [events, setEvents] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simple Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Load events
  useEffect(() => {
    eventsAPI.getAll()
      .then((res) => {
        setEvents(res.data.events || []);
        setYears(res.data.years || [2025, 2024]);
      })
      .catch((err) => {
        console.error('Failed to load events:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filtered Events based on Year and Search query
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchYear = !selectedYear || String(ev.year) === String(selectedYear);
      const matchSearch = !searchQuery.trim() || 
        ev.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchYear && matchSearch;
    });
  }, [events, selectedYear, searchQuery]);

  const defaultYears = [2025, 2024, 2023, 2022];
  const combinedYears = Array.from(new Set([...years, ...defaultYears])).sort((a, b) => b - a);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      
      {/* ── 1. Minimal Header / Navigation ──────────────────────── */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={true}
      />

      {/* ── 2. Hero Section ─────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#080c14] py-16 sm:py-20 lg:py-24">
        {/* Subtle background glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 50% at 50% 20%, rgba(245, 158, 11, 0.12) 0%, transparent 60%)
            `
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold tracking-widest uppercase">
            <Sparkles size={13} />
            <span>OFFICIAL ARCHIVE</span>
          </div>

          <h1 className="font-['Cinzel'] text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            PUNE FESTIVAL
          </h1>

          <h2 className="font-['Playfair_Display'] text-3xl sm:text-4xl lg:text-5xl font-bold gold-text-gradient italic">
            Photo Gallery
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed pt-2">
            Explore memorable moments from Pune Festival through our collection of events.
          </p>

        </div>
      </section>

      {/* ── 3. Events Grid Section ───────────────────────────────── */}
      <main id="events-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        
        {/* ── Year Filters & Search Summary ───────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          
          {/* Year Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedYear('')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                !selectedYear ? 'pill-active' : 'pill-inactive'
              }`}
            >
              All Events
            </button>

            {combinedYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  String(selectedYear) === String(yr) ? 'pill-active' : 'pill-inactive'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Result Count / Clear button */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'} Available</span>
            
            {(searchQuery || selectedYear) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedYear(''); }}
                className="text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
              >
                Reset Filters ✕
              </button>
            )}
          </div>

        </div>

        {/* ── Event Cards Grid ────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-dark rounded-2xl aspect-[16/14]" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          /* ── Empty State ── */
          <div className="dark-panel rounded-3xl p-16 text-center max-w-md mx-auto my-12 border border-white/10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto text-amber-400">
              <Images size={30} className="stroke-[1.8]" />
            </div>
            
            <h3 className="text-xl font-bold font-['Cinzel'] text-white">
              No Events Available Yet
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              New Pune Festival memories will appear here soon. Check back later or explore other years.
            </p>

            {(searchQuery || selectedYear) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedYear(''); }}
                className="btn-gold !py-2 !px-4 text-xs font-bold uppercase tracking-wider inline-flex"
              >
                Show All Events
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 animate-fade-in">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

      </main>

      {/* ── Minimal Footer ──────────────────────────────────────── */}
      <footer className="bg-[#05080e] border-t border-white/10 mt-20 py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-['Cinzel'] font-bold text-white tracking-widest text-sm">
              PUNE FESTIVAL
            </span>
            <span>· Official Photo Gallery</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <Link to="/#events" className="hover:text-amber-400 transition-colors">
              Events
            </Link>
            <Link to="/admin" className="text-amber-400 hover:underline font-semibold">
              Admin Login
            </Link>
          </div>

          <p>© {new Date().getFullYear()} Pune Festival. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
