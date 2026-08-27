import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Pencil, Trash2, Eye, EyeOff, Loader2, 
  CalendarDays, X, Sparkles, Upload, Image as ImageIcon, Trash
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import { eventsAPI, getImageUrl } from '../../api';
import toast from 'react-hot-toast';

function EventModal({ event, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: event?.name || '',
    year: event?.year || new Date().getFullYear(),
    description: event?.description || '',
    is_published: event?.is_published ?? true,
  });

  // Cover image management state
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(
    event?.cover_image_url || event?.cover_medium || event?.cover_thumbnail || null
  );
  const [removeCover, setRemoveCover] = useState(false);
  const fileInputRef = useRef(null);

  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid image file (JPG, PNG, WebP)');
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setRemoveCover(false);
  };

  const handleRemoveCover = () => {
    if (coverFile && coverPreview && coverPreview.startsWith('blob:')) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverFile(null);
    setCoverPreview(null);
    setRemoveCover(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('year', form.year);
      fd.append('description', form.description || '');
      fd.append('is_published', form.is_published);

      if (coverFile) {
        fd.append('cover_image', coverFile);
      } else if (removeCover) {
        fd.append('remove_cover', 'true');
      }

      if (event) {
        await eventsAPI.update(event.id, fd);
        toast.success('Event & cover image updated!');
      } else {
        await eventsAPI.create(fd);
        toast.success('Event & cover image created!');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-[#0d1322] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
              <CalendarDays size={18} />
            </div>
            <h2 className="text-white font-['Cinzel'] font-bold text-lg">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 space-y-5 pr-1">
          
          {/* ── Event Cover Picture Management ────────────────────── */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-white/10 space-y-3">
            <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
              Event Cover Picture
            </label>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Current Cover Preview or Empty Drop Zone */}
            <div className="relative aspect-[16/8] sm:aspect-[16/7] rounded-xl overflow-hidden bg-[#090d16] border border-white/10 flex items-center justify-center group">
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview.startsWith('blob:') ? coverPreview : getImageUrl(coverPreview)}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-[#080c14] text-xs font-bold shadow-md cursor-pointer"
                    >
                      Change Cover
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="px-3 py-1.5 rounded-lg bg-red-500/90 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Remove Cover
                    </button>
                  </div>
                </>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:text-amber-400 transition-colors w-full h-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-1.5">
                    <ImageIcon size={20} className="stroke-[2]" />
                  </div>
                  <p className="text-xs font-bold text-slate-200">
                    Click to Upload Event Cover Picture
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    JPG, PNG, WebP · Automatically optimized with Sharp
                  </p>
                </div>
              )}
            </div>

            {/* Cover Action Buttons */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-dark-outline text-xs !py-1.5 !px-3 font-semibold cursor-pointer"
              >
                <Upload size={13} />
                <span>{coverPreview ? 'Replace Cover Image' : 'Upload Cover Image'}</span>
              </button>

              {coverPreview && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash size={13} />
                  <span>Remove Cover</span>
                </button>
              )}
            </div>
          </div>

          {/* ── Event Details ─────────────────────────────────────── */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Event Name *
            </label>
            <input
              className="input-dark"
              placeholder="e.g. Opening Ceremony / Classical Sitar Concert"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Festival Year *
            </label>
            <input
              type="number"
              className="input-dark"
              min="2000"
              max="2100"
              required
              value={form.year}
              onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              className="input-dark"
              rows={3}
              placeholder="Describe this festival event, performers, venue..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-[#141d30] border border-white/5">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-[#0d121e] border-white/20"
            />
            <span className="text-xs font-semibold text-slate-200">
              Published (Visible on Public Gallery)
            </span>
          </label>

          {/* Modal Footer Submit */}
          <div className="flex gap-3 pt-3 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn-dark-outline flex-1 justify-center !py-2.5 text-xs cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-gold flex-1 justify-center !py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer">
              {saving ? <><Loader2 size={15} className="animate-spin" /> Saving Event...</> : 'Save Event'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await eventsAPI.getAll();
      setEvents(res.data.events || []);
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (event) => {
    if (!confirm(`Delete "${event.name}"? This will also delete all photos inside this event.`)) return;
    try {
      await eventsAPI.delete(event.id);
      toast.success('Event deleted');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const handleTogglePublish = async (event) => {
    try {
      await eventsAPI.update(event.id, { is_published: !event.is_published });
      toast.success(event.is_published ? 'Event unpublished' : 'Event published');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to update event');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-['Plus_Jakarta_Sans']">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-10 overflow-auto">
        
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Cinzel'] text-white">
              Event Management
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Create events, upload cover pictures, and manage festival editions
            </p>
          </div>

          <button onClick={() => { setEditEvent(null); setModalOpen(true); }} className="btn-gold !py-2.5 !px-5 text-xs font-extrabold tracking-wider uppercase cursor-pointer">
            <Plus size={16} className="stroke-[3]" />
            New Event
          </button>
        </div>

        {/* ── Events Table ──────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton-dark h-20 rounded-2xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="dark-panel rounded-3xl p-16 text-center max-w-md mx-auto my-10 space-y-4">
            <CalendarDays size={38} className="text-amber-500/40 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Events Yet</h3>
            <p className="text-xs text-slate-400">Create your first festival event and set its cover picture.</p>
            <button onClick={() => { setEditEvent(null); setModalOpen(true); }} className="btn-gold text-xs">
              <Plus size={14} /> Create First Event
            </button>
          </div>
        ) : (
          <div className="dark-panel rounded-2xl overflow-hidden shadow-xl border border-white/10">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-[#101624] border-b border-white/10 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3.5 px-5">Cover</th>
                  <th className="py-3.5 px-4">Event Name</th>
                  <th className="py-3.5 px-4">Year</th>
                  <th className="py-3.5 px-4">Photos</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {events.map(ev => {
                  const cover = ev.cover_image_url || ev.cover_medium || ev.cover_thumbnail;
                  return (
                    <tr key={ev.id} className="hover:bg-[#141d30] transition-colors">
                      {/* Cover Thumbnail */}
                      <td className="py-3.5 px-5 w-20">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-[#090d16] border border-white/10 flex items-center justify-center flex-shrink-0">
                          {cover ? (
                            <img
                              src={getImageUrl(cover)}
                              alt={ev.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={16} className="text-slate-600" />
                          )}
                        </div>
                      </td>

                      {/* Event Name & Description */}
                      <td className="py-4 px-4">
                        <p className="font-bold text-white text-sm sm:text-base">{ev.name}</p>
                        {ev.description && (
                          <p className="text-xs text-slate-400 truncate max-w-sm mt-0.5">{ev.description}</p>
                        )}
                      </td>

                      <td className="py-4 px-4 font-semibold text-amber-400">{ev.year}</td>
                      <td className="py-4 px-4 text-slate-300 font-medium">{ev.photo_count ?? 0}</td>
                      
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          ev.is_published
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}>
                          {ev.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTogglePublish(ev)}
                            className="p-2 rounded-lg bg-[#161f32] hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 transition-colors"
                            title={ev.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {ev.is_published ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button
                            onClick={() => { setEditEvent(ev); setModalOpen(true); }}
                            className="p-2 rounded-lg bg-[#161f32] hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 transition-colors"
                            title="Edit Event & Cover"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(ev)}
                            className="p-2 rounded-lg bg-[#161f32] hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <EventModal
            event={editEvent}
            onClose={() => setModalOpen(false)}
            onSaved={fetchEvents}
          />
        )}

      </div>
    </div>
  );
}
