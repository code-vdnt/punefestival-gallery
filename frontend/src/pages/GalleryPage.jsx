import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Images, Loader2, Sparkles, Search, 
  Calendar, ArrowRight, Shield, Award, Heart
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
    <div className="min-h-screen bg-[#FAF8F5] text-[#1B1104] flex flex-col font-['Plus_Jakarta_Sans']">
      
      {/* ── 1. Minimal Header / Navigation ──────────────────────── */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSearch={true}
      />

      {/* ── 2. Hero Section ─────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[#E8DFD5] bg-white py-14 sm:py-20 lg:py-24">
        {/* Subtle festive background glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 70% 50% at 50% 10%, rgba(248, 216, 0, 0.18) 0%, transparent 70%),
              radial-gradient(ellipse 60% 40% at 85% 40%, rgba(216, 40, 32, 0.06) 0%, transparent 60%)
            `
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF0E6] border border-[#D82820]/30 text-[#D82820] text-xs font-extrabold tracking-widest uppercase shadow-sm">
            <Sparkles size={13} className="text-[#E07810]" />
            <span>OFFICIAL PHOTO ARCHIVE</span>
          </div>

          {/* Main Title */}
          <h1 className="font-['Cinzel'] text-4xl sm:text-5xl lg:text-6xl font-black text-[#D82820] tracking-tight leading-tight">
            PUNE FESTIVAL
          </h1>

          <h2 className="font-['Playfair_Display'] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#E07810] italic">
            Celebrating 37 Glorious Years of Culture & Art
          </h2>

          <p className="text-[#5A524A] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed pt-1">
            Immerse yourself in high-definition photographs from classical music concerts, traditional dance performances, arts, sports, and cultural spectacles.
          </p>

        </div>
      </section>

      {/* ── 3. Events Grid Section ───────────────────────────────── */}
      <main id="events-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        
        {/* ── Year Filters & Search Summary ───────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E8DFD5]">
          
          {/* Year Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedYear('')}
              className={`pill-pf ${selectedYear === '' ? 'active' : ''}`}
            >
              All Years
            </button>
            {combinedYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(String(yr))}
                className={`pill-pf ${selectedYear === String(yr) ? 'active' : ''}`}
              >
                {yr}
              </button>
            ))}
          </div>

          {/* Result Count Indicator */}
          <div className="text-xs sm:text-sm font-semibold text-[#8C827A]">
            Showing <span className="font-bold text-[#D82820]">{filteredEvents.length}</span> {filteredEvents.length === 1 ? 'Event' : 'Events'}
            {selectedYear && <span> in {selectedYear}</span>}
          </div>

        </div>

        {/* ── Events Grid / Loading / Empty States ────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-light aspect-[16/11] rounded-2xl" />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center max-w-lg mx-auto my-12 space-y-4 border border-[#E8DFD5] shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#F8D800]/15 border border-[#F8D800]/40 flex items-center justify-center mx-auto text-[#D82820]">
              <Images size={30} className="stroke-[1.8]" />
            </div>
            
            <h3 className="text-xl font-bold font-['Cinzel'] text-[#1B1104]">
              No Events Found
            </h3>
            
            <p className="text-xs sm:text-sm text-[#5A524A] leading-relaxed">
              {searchQuery 
                ? `No events matched "${searchQuery}". Try clearing your search.`
                : `No events are available for the selected year.`}
            </p>

            {(searchQuery || selectedYear) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedYear(''); }}
                className="btn-pf-crimson text-xs uppercase tracking-wider inline-flex"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-fade-in">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

      </main>

      {/* ── 4. Minimal Cultural Footer ───────────────────────────── */}
      <footer className="border-t border-[#E8DFD5] bg-white py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#F8D800] border border-[#D82820] rotate-45 flex items-center justify-center">
              <span className="-rotate-45 font-['Cinzel'] font-black text-[#D82820] text-[10px]">
                ॐ
              </span>
            </div>
            <p className="text-xs font-semibold text-[#5A524A]">
              © {new Date().getFullYear()} <span className="text-[#D82820] font-bold">Pune Festival</span>. All Rights Reserved.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-[#8C827A]">
            <a href="https://punefestival.in" target="_blank" rel="noreferrer" className="hover:text-[#D82820] transition-colors">
              Official Website
            </a>
            <Link to="/#events" className="hover:text-[#D82820] transition-colors">
              All Events
            </Link>
            <Link to="/admin/login" className="hover:text-[#D82820] transition-colors">
              Admin
            </Link>
          </div>

        </div>
      </footer>

    </div>
  );
}
