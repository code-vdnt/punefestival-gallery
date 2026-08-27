import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Images, CalendarDays, FolderOpen, Upload, Plus, 
  Clock, Sparkles, ArrowRight, Shield, Landmark, Calendar
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { eventsAPI, photosAPI, getImageUrl } from '../../api';

function StatCard({ icon: Icon, label, value, to }) {
  const content = (
    <div className="card-dark p-6 rounded-2xl relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
          <Icon size={22} className="stroke-[2.2]" />
        </div>
        <span className="text-[11px] font-bold text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          Metric
        </span>
      </div>
      <p className="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans'] tracking-tight">
        {value ?? '—'}
      </p>
      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
  return to ? <Link to={to} className="block cursor-pointer">{content}</Link> : content;
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      eventsAPI.getStats(),
      photosAPI.getRecent(),
    ]).then(([statsRes, recentRes]) => {
      setStats(statsRes.data.stats);
      setRecent(recentRes.data.photos || []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-['Plus_Jakarta_Sans']">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-10 overflow-auto">
        
        {/* ── Top Header ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Cinzel'] text-white">
                Admin Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-400">
                Live
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Pune Festival Photo Archive & Hierarchy Management
            </p>
          </div>

          <Link to="/admin/photos" className="btn-gold !py-2.5 !px-5 text-xs font-extrabold tracking-wider uppercase">
            <Upload size={15} className="stroke-[2.5]" />
            Upload Photos
          </Link>
        </div>

        {/* ── 4 Stats Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard
            icon={Images}
            label="Total Photos"
            value={stats?.total_photos?.toLocaleString() ?? 0}
            to="/admin/photos"
          />
          <StatCard
            icon={Calendar}
            label="Total Days"
            value={12}
            to="/admin/albums"
          />
          <StatCard
            icon={CalendarDays}
            label="Total Events"
            value={stats?.total_events ?? 6}
            to="/admin/events"
          />
          <StatCard
            icon={Clock}
            label="Recent Uploads"
            value={recent.length}
            to="/admin/photos"
          />
        </div>

        {/* ── Quick Actions ─────────────────────────────────────── */}
        <div className="mb-10">
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-widest mb-4">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { to: '/admin/events', icon: Plus, title: 'Create Event', desc: 'Add a new festival event & select year' },
              { to: '/admin/albums', icon: FolderOpen, title: 'Manage Days & Folders', desc: 'Organize festival hierarchy & day folders' },
              { to: '/admin/photos', icon: Upload, title: 'Upload Photos', desc: 'Batch upload photos with automatic Sharp processing' },
            ].map(({ to, icon: Icon, title, desc }) => (
              <Link
                key={to}
                to={to}
                className="card-dark p-5 rounded-2xl flex items-start gap-4 group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon size={18} className="stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent Photo Uploads Grid ─────────────────────────── */}
        <div className="dark-panel rounded-2xl p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock size={17} className="text-amber-400" />
              <h2 className="text-base font-bold text-white font-['Cinzel'] tracking-wide">
                Recent Photo Uploads
              </h2>
            </div>
            <Link to="/admin/photos" className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton-dark aspect-square rounded-xl" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-3">
              <Images size={36} className="mx-auto text-amber-500/30" />
              <p className="text-sm font-medium">No photos uploaded yet.</p>
              <Link to="/admin/photos" className="btn-gold !py-2 !px-4 text-xs font-bold inline-flex">
                <Upload size={13} /> Upload First Photos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {recent.map((photo) => (
                <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-[#101624] border border-white/10">
                  <img
                    src={getImageUrl(photo.thumbnail_path || photo.medium_path)}
                    alt={photo.title || 'Recent'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-[10px] text-white">
                    <span className="truncate font-semibold text-amber-300">{photo.event_name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
