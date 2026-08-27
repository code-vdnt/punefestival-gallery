import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Shield, Menu, X, Landmark } from 'lucide-react';

export default function Navbar({ 
  searchQuery = '', 
  onSearchChange = () => {},
  showSearch = true
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-[#080c14]/95 backdrop-blur-md border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* ── Left Side: Brand ───────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-[#080c14] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Landmark size={20} className="stroke-[2.5]" />
            </div>
            
            <div className="flex flex-col">
              <span className="font-['Cinzel'] text-base sm:text-lg font-extrabold tracking-widest text-white leading-tight">
                PUNE FESTIVAL
              </span>
              <span className="text-[11px] font-bold tracking-[0.2em] text-amber-400 uppercase leading-none mt-0.5">
                PHOTO GALLERY
              </span>
            </div>
          </Link>

          {/* ── Center Navigation: Home, Events, Gallery ───────────── */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-semibold tracking-wider transition-colors relative py-1 ${
                isHome ? 'text-amber-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
              {isHome && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              )}
            </Link>

            <Link
              to="/#events"
              onClick={() => {
                if (isHome) {
                  document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-sm font-semibold tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              Events
            </Link>

            <Link
              to="/#gallery"
              onClick={() => {
                if (isHome) {
                  document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-sm font-semibold tracking-wider text-slate-300 hover:text-white transition-colors"
            >
              Gallery
            </Link>
          </nav>

          {/* ── Right Side: Search & Admin Button ──────────────────── */}
          <div className="hidden sm:flex items-center gap-4">
            
            {/* Search Bar */}
            {showSearch && (
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search events..."
                  className="w-48 lg:w-60 pl-9 pr-4 py-2 bg-[#101624] border border-white/10 hover:border-amber-500/30 focus:border-amber-400 focus:bg-[#141c2e] focus:w-64 text-xs lg:text-sm text-slate-100 rounded-full outline-none transition-all placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button 
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Admin Button */}
            <Link
              to="/admin"
              className="btn-gold text-xs !py-2 !px-4 !rounded-full font-bold shadow-md shadow-amber-500/20"
              title="Admin Dashboard"
            >
              <Shield size={14} className="stroke-[2.5]" />
              <span>Admin</span>
            </Link>

          </div>

          {/* ── Mobile Hamburger ───────────────────────────────────── */}
          <div className="flex items-center gap-2 sm:hidden">
            <Link
              to="/admin"
              className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold"
            >
              <Shield size={16} />
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#101624] text-slate-300 hover:text-white border border-white/10"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#090d16] border-b border-white/10 px-4 py-4 space-y-3 animate-fade-in">
          {showSearch && (
            <div className="relative mb-2">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search events..."
                className="input-dark pl-9 text-xs rounded-full"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-amber-500/10 hover:text-amber-400"
            >
              Home
            </Link>
            <Link
              to="/#events"
              onClick={() => {
                setMobileMenuOpen(false);
                document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-amber-500/10 hover:text-amber-400"
            >
              Events
            </Link>
            <Link
              to="/#gallery"
              onClick={() => {
                setMobileMenuOpen(false);
                document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-200 hover:bg-amber-500/10 hover:text-amber-400"
            >
              Gallery
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
