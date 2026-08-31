import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Shield, Menu, X } from 'lucide-react';

export default function Navbar({ 
  searchQuery = '', 
  onSearchChange = () => {},
  showSearch = true
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8DFD5] shadow-sm transition-all">
      
      {/* Decorative Festive Top Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#D82820] via-[#F8D800] to-[#E07810]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* ── Left Side: Pune Festival Brand ───────────────────── */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src="/logo.png"
              alt="Pune Festival Logo"
              className="h-12 sm:h-14 w-auto object-contain max-h-[56px] group-hover:scale-105 transition-transform flex-shrink-0"
            />
            
            <div className="flex flex-col">
              <span className="font-['Cinzel'] text-base sm:text-lg font-extrabold tracking-wider text-[#D82820] leading-tight">
                PUNE FESTIVAL
              </span>
              <span className="text-[10px] font-extrabold tracking-[0.25em] text-[#E07810] uppercase leading-none mt-0.5">
                PHOTO GALLERY
              </span>
            </div>
          </Link>

          {/* ── Center Navigation: Home, Events, Gallery ───────────── */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-bold tracking-wide transition-colors relative py-1 ${
                isHome ? 'text-[#D82820]' : 'text-[#5A524A] hover:text-[#D82820]'
              }`}
            >
              Home
              {isHome && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#D82820] rounded-full" />
              )}
            </Link>

            <Link
              to="/#events"
              onClick={() => {
                if (isHome) {
                  document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-sm font-bold tracking-wide text-[#5A524A] hover:text-[#D82820] transition-colors"
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
              className="text-sm font-bold tracking-wide text-[#5A524A] hover:text-[#D82820] transition-colors"
            >
              Archive
            </Link>
          </nav>

          {/* ── Right Side: Search + Admin Portal ─────────────────── */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search Box */}
            {showSearch && (
              <div className="relative hidden sm:block w-48 lg:w-64">
                <input
                  type="text"
                  placeholder="Search events & photos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-[#FAF8F5] text-xs font-semibold text-[#1B1104] placeholder:text-[#8C827A] pl-8 pr-3 py-2 rounded-full border border-[#E8DFD5] focus:outline-none focus:border-[#D82820] focus:ring-1 focus:ring-[#D82820] transition-all"
                />
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C827A]" />
              </div>
            )}

            {/* Admin Portal Button */}
            <Link
              to="/admin/login"
              className="btn-pf-crimson text-xs !py-2 !px-4 uppercase tracking-wider"
              title="Admin Portal"
            >
              <Shield size={14} className="stroke-[2.5]" />
              <span className="hidden sm:inline">Admin</span>
            </Link>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#1B1104] hover:bg-[#FAF8F5] transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>

        </div>
      </div>

      {/* ── Mobile Menu Dropdown ──────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DFD5] bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg animate-fade-in">
          {showSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search events & photos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#FAF8F5] text-xs text-[#1B1104] pl-8 pr-3 py-2 rounded-full border border-[#E8DFD5] focus:outline-none focus:border-[#D82820]"
              />
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C827A]" />
            </div>
          )}

          <div className="flex flex-col space-y-2 pt-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                isHome ? 'bg-[#D82820] text-white' : 'text-[#1B1104] hover:bg-[#FAF8F5]'
              }`}
            >
              Home
            </Link>
            
            <Link
              to="/#events"
              onClick={() => {
                setMobileMenuOpen(false);
                document.getElementById('events-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3 py-2 rounded-xl text-sm font-bold text-[#1B1104] hover:bg-[#FAF8F5] transition-colors"
            >
              Events
            </Link>

            <Link
              to="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-sm font-bold text-[#D82820] hover:bg-[#FAF8F5] transition-colors"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      )}

    </header>
  );
}
