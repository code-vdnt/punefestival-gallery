import { useState, useEffect } from 'react';
import { 
  Plus, Pencil, Trash2, FolderOpen, X, Loader2, 
  ChevronDown, Calendar, ChevronRight, Folder, Sparkles
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { albumsAPI, eventsAPI } from '../../api';
import toast from 'react-hot-toast';

function FolderModal({ album, events, onClose, onSaved }) {
  const [form, setForm] = useState({
    event_id: album?.event_id || (events[0]?.id || ''),
    name: album?.name || '',
    description: album?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (album) {
        await albumsAPI.update(album.id, form);
        toast.success('Folder updated!');
      } else {
        await albumsAPI.create(form);
        toast.success('Folder created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save folder');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#0d1322] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
              <FolderOpen size={18} />
            </div>
            <h2 className="text-white font-['Cinzel'] font-bold text-lg">
              {album ? 'Edit Folder / Album' : 'Create Folder / Day Album'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Parent Event *
            </label>
            <div className="relative">
              <select
                className="input-dark pr-8 appearance-none"
                required
                value={form.event_id}
                onChange={e => setForm(f => ({ ...f, event_id: e.target.value }))}
              >
                <option value="">Select event...</option>
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.name} ({ev.year})</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Folder / Album Name *
            </label>
            <input
              className="input-dark"
              placeholder="e.g. Day 1 - Highlights / Sitar Recital"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              className="input-dark"
              rows={3}
              placeholder="Brief description of this folder..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button type="button" onClick={onClose} className="btn-dark-outline flex-1 justify-center !py-2.5 text-xs">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-gold flex-1 justify-center !py-2.5 text-xs font-bold uppercase tracking-wider">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : 'Save Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEvent, setFilterEvent] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editAlbum, setEditAlbum] = useState(null);

  const fetchData = async () => {
    try {
      const [alRes, evRes] = await Promise.all([
        albumsAPI.getAll(filterEvent ? { eventId: filterEvent } : {}),
        eventsAPI.getAll(),
      ]);
      setAlbums(alRes.data.albums || []);
      setEvents(evRes.data.events || []);
    } catch (err) {
      toast.error('Failed to load albums');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterEvent]);

  const handleDelete = async (album) => {
    if (!confirm(`Delete folder "${album.name}"? Photos will remain but lose their folder assignment.`)) return;
    try {
      await albumsAPI.delete(album.id);
      toast.success('Folder deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete folder');
    }
  };

  const filtered = filterEvent ? albums.filter(a => a.event_id === filterEvent) : albums;

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-['Plus_Jakarta_Sans']">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-10 overflow-auto">
        
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Cinzel'] text-white">
              Days & Folder Hierarchy
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Organize events into day-wise folders and category albums
            </p>
          </div>

          <button onClick={() => { setEditAlbum(null); setModalOpen(true); }} className="btn-gold !py-2.5 !px-5 text-xs font-extrabold tracking-wider uppercase cursor-pointer">
            <Plus size={16} className="stroke-[3]" />
            New Folder / Album
          </button>
        </div>

        {/* ── Filter Tabs by Event ──────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          <button
            onClick={() => setFilterEvent('')}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
              !filterEvent
                ? 'pill-active'
                : 'pill-inactive'
            }`}
          >
            All Events
          </button>
          
          {events.map(ev => (
            <button
              key={ev.id}
              onClick={() => setFilterEvent(ev.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                filterEvent === ev.id
                  ? 'pill-active'
                  : 'pill-inactive'
              }`}
            >
              {ev.name} ({ev.year})
            </button>
          ))}
        </div>

        {/* ── Hierarchy Cards Grid ──────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-dark rounded-2xl h-44" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="dark-panel rounded-3xl p-16 text-center max-w-md mx-auto my-10 space-y-4">
            <FolderOpen size={38} className="text-amber-500/40 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Folders Created Yet</h3>
            <p className="text-xs text-slate-400">Create day folders inside events to organize your festival photos.</p>
            <button onClick={() => { setEditAlbum(null); setModalOpen(true); }} className="btn-gold text-xs">
              <Plus size={14} /> Create First Folder
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(album => (
              <div key={album.id} className="card-dark p-6 rounded-2xl flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <Folder size={22} className="stroke-[2]" />
                    </div>
                    
                    <div className="flex items-center gap-1 bg-[#090d16] p-1 rounded-lg border border-white/5">
                      <button
                        onClick={() => { setEditAlbum(album); setModalOpen(true); }}
                        className="p-1.5 rounded text-slate-400 hover:text-blue-400 transition-colors"
                        title="Edit Folder"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(album)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete Folder"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-amber-300 transition-colors">
                    {album.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium mt-1">
                    <span>{album.event_name}</span>
                    <span>·</span>
                    <span>{album.year}</span>
                  </div>

                  {album.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {album.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold">{album.photo_count || 0} Photos</span>
                  <span className="text-amber-400 font-bold group-hover:underline">Manage Photos →</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <FolderModal
            album={editAlbum}
            events={events}
            onClose={() => setModalOpen(false)}
            onSaved={fetchData}
          />
        )}

      </div>
    </div>
  );
}
