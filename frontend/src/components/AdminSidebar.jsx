import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CalendarDays, FolderOpen, Images,
  Upload, Settings, LogOut, ExternalLink, Landmark, 
  Calendar, Layers, Shield
} from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/events', icon: CalendarDays, label: 'Events' },
  { to: '/admin/albums', icon: FolderOpen, label: 'Days / Folders' },
  { to: '/admin/photos', icon: Images, label: 'Photos' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  return (
    <aside className="w-64 min-h-screen bg-[#080c14] border-r border-white/10 flex flex-col justify-between p-4 flex-shrink-0">
      
      {/* ── Top Header Brand ───────────────────────────────────── */}
      <div>
        <div className="px-3 py-5 border-b border-white/10 mb-6">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-[#080c14]">
              <Landmark size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="font-['Cinzel'] font-black text-white text-sm tracking-wider leading-none">
                PUNE FESTIVAL
              </p>
              <p className="text-amber-400 text-[11px] font-bold tracking-widest uppercase mt-1">
                ADMIN PORTAL
              </p>
            </div>
          </Link>
        </div>

        {/* ── Navigation Links ─────────────────────────────────── */}
        <nav className="space-y-1.5">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-amber-500 text-[#080c14] font-bold shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#141d30]'
                }`}
              >
                <Icon size={17} className={`stroke-[2.2] ${active ? 'text-[#080c14]' : 'text-amber-400/80'}`} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom Section ─────────────────────────────────────── */}
      <div className="space-y-3 pt-6 border-t border-white/10">
        
        {/* View Public Gallery */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#101624] hover:bg-[#161f32] text-xs font-semibold text-slate-300 hover:text-amber-400 border border-white/5 transition-all"
        >
          <span className="flex items-center gap-2">
            <ExternalLink size={14} className="text-amber-400" />
            Public Gallery
          </span>
          <span className="text-[10px] text-slate-500">↗</span>
        </a>

        {/* User Card */}
        <div className="p-3 rounded-xl bg-[#101624] border border-white/5 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>

      </div>

    </aside>
  );
}
