import { useState, useEffect, useCallback } from 'react';
import {
  Upload, Trash2, Pencil, X, Loader2, CheckSquare, Square,
  Move, Search, ChevronDown, Images, AlertCircle, Eye, EyeOff,
  Sparkles, Layers, Calendar
} from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import UploadZone from '../../components/UploadZone';
import { photosAPI, eventsAPI, albumsAPI, getImageUrl } from '../../api';
import toast from 'react-hot-toast';

const LIMIT = 24;

function UploadModal({ events, albums, onUploaded, onClose }) {
  const [files, setFiles] = useState([]);
  const [selectedYear, setSelectedYear] = useState('2025');
  const [eventId, setEventId] = useState(events[0]?.id || '');
  const [albumId, setAlbumId] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const filteredEvents = events.filter(e => !selectedYear || String(e.year) === String(selectedYear));
  const filteredAlbums = albums.filter(a => a.event_id === eventId);

  // Update selected event if year changes
  useEffect(() => {
    if (filteredEvents.length > 0 && !filteredEvents.find(e => e.id === eventId)) {
      setEventId(filteredEvents[0].id);
      setAlbumId('');
    }
  }, [selectedYear, filteredEvents]);

  const [uploadStatus, setUploadStatus] = useState('');

  const handleUpload = async () => {
    if (!files.length) { toast.error('Please select at least one photo'); return; }
    if (!eventId) { toast.error('Please select an event'); return; }

    setUploading(true);
    setProgress(0);
    setResult(null);

    // Process in batches of 4 photos to keep browser memory and server CPU smooth
    const CHUNK_SIZE = 4;
    const totalFiles = files.length;
    let totalUploaded = 0;
    let totalFailed = 0;

    try {
      for (let i = 0; i < totalFiles; i += CHUNK_SIZE) {
        const chunk = files.slice(i, i + CHUNK_SIZE);
        const currentBatchNum = Math.floor(i / CHUNK_SIZE) + 1;
        const totalBatches = Math.ceil(totalFiles / CHUNK_SIZE);

        setUploadStatus(`Processing batch ${currentBatchNum} of ${totalBatches} (${i + 1}-${Math.min(i + chunk.length, totalFiles)} of ${totalFiles})...`);

        const fd = new FormData();
        chunk.forEach(f => fd.append('photos', f));
        fd.append('event_id', eventId);
        if (albumId) fd.append('album_id', albumId);
        if (title) fd.append('title', title);
        if (tags) fd.append('tags', tags);

        const res = await photosAPI.upload(fd);
        totalUploaded += (res.data.uploaded || chunk.length);
        if (res.data.failed) totalFailed += res.data.failed;

        const currentPercent = Math.min(100, Math.round(((i + chunk.length) / totalFiles) * 100));
        setProgress(currentPercent);

        // Yield to browser event loop so UI stays 100% responsive
        await new Promise(resolve => setTimeout(resolve, 60));
      }

      setResult({ uploaded: totalUploaded, failed: totalFailed });
      onUploaded();
      toast.success(`${totalUploaded} photo${totalUploaded !== 1 ? 's' : ''} uploaded and processed smoothly!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadStatus('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0d1322] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
              <Upload size={18} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-white font-['Cinzel'] font-bold text-lg">
                Batch Photo Upload
              </h2>
              <p className="text-[11px] text-amber-400">
                Automatic Sharp Processing (Thumbnail, Medium, Large WebP)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
          
          {/* Hierarchy Selectors: Year → Day / Event → Album */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Year Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Year
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="input-dark pr-8 appearance-none text-xs font-medium"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Event Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Event *
              </label>
              <div className="relative">
                <select
                  value={eventId}
                  onChange={e => { setEventId(e.target.value); setAlbumId(''); }}
                  className="input-dark pr-8 appearance-none text-xs font-medium"
                  required
                >
                  {filteredEvents.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Day / Album Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select Day / Album
              </label>
              <div className="relative">
                <select
                  value={albumId}
                  onChange={e => setAlbumId(e.target.value)}
                  className="input-dark pr-8 appearance-none text-xs font-medium"
                >
                  <option value="">No Specific Album</option>
                  {filteredAlbums.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

          </div>

          {/* Optional Title & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Photo Title (Numbered automatically if batch)
              </label>
              <input
                className="input-dark text-xs"
                placeholder="e.g. Sitar Performance"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                className="input-dark text-xs"
                placeholder="classical, music, sitar, 2025"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <UploadZone onFilesSelected={setFiles} />

          {/* Progress Bar & Processing Indicator */}
          {uploading && (
            <div className="p-4 rounded-xl bg-[#141d30] border border-amber-500/20 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Loader2 size={13} className="animate-spin" />
                  {uploadStatus || 'Uploading & Processing with Sharp...'}
                </span>
                <span className="font-mono text-amber-400">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#080c14] overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Generating original backup, 400px thumbnail, 1200px medium, and 2000px large WebP variants.
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              ✓ Successfully processed and saved {result.uploaded} photos!
            </div>
          )}

        </div>

        {/* Footer Submit */}
        <div className="pt-4 border-t border-white/10 flex-shrink-0 flex gap-3">
          <button type="button" onClick={onClose} className="btn-dark-outline flex-1 justify-center !py-2.5 text-xs">
            Close
          </button>
          
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="btn-gold flex-1 justify-center !py-2.5 text-xs font-extrabold uppercase tracking-wider disabled:opacity-50"
          >
            {uploading ? (
              <><Loader2 size={15} className="animate-spin" /> Processing {files.length} Photos...</>
            ) : (
              <><Upload size={15} className="stroke-[2.5]" /> Upload {files.length > 0 ? files.length : ''} Photos</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function PhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const [events, setEvents] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [filters, setFilters] = useState({});
  
  const [selected, setSelected] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchPhotos = useCallback(async (pg, f, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const params = { page: pg, limit: LIMIT, ...f };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);

      const res = await photosAPI.getAll(params);
      const fetched = res.data.photos || [];

      setPhotos(prev => append ? [...prev, ...fetched] : fetched);
      setTotal(res.data.total || 0);
    } catch (err) {
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([eventsAPI.getAll(), albumsAPI.getAll()])
      .then(([evRes, alRes]) => {
        setEvents(evRes.data.events || []);
        setAlbums(alRes.data.albums || []);
      });
  }, []);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
    fetchPhotos(1, filters, false);
  }, [filters, fetchPhotos]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPhotos(next, filters, true);
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(photos.map(p => p.id)));
  const clearSelection = () => setSelected(new Set());

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} selected photos? This cannot be undone.`)) return;
    try {
      await photosAPI.bulkDelete([...selected]);
      toast.success(`${selected.size} photos deleted`);
      setSelected(new Set());
      fetchPhotos(1, filters, false);
    } catch (err) {
      toast.error('Failed to delete photos');
    }
  };

  const handleDelete = async (photo) => {
    if (!confirm(`Delete this photo? This cannot be undone.`)) return;
    try {
      await photosAPI.delete(photo.id);
      toast.success('Photo deleted');
      fetchPhotos(1, filters, false);
    } catch (err) {
      toast.error('Failed to delete photo');
    }
  };

  const handleTogglePublish = async (photo) => {
    try {
      await photosAPI.update(photo.id, { is_published: !photo.is_published });
      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, is_published: !p.is_published } : p));
      toast.success(photo.is_published ? 'Photo set to draft' : 'Photo published');
    } catch {
      toast.error('Failed to update photo');
    }
  };

  const hasMore = photos.length < total;

  return (
    <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-['Plus_Jakarta_Sans']">
      <AdminSidebar />

      <div className="flex-1 p-6 sm:p-10 overflow-auto">
        
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-['Cinzel'] text-white">
                Photo Archive
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-400">
                {total.toLocaleString()} Photos
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Manage, publish, delete, and bulk upload festival photography
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectMode && selected.size > 0 && (
              <button onClick={handleBulkDelete} className="px-4 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 text-red-300 text-xs font-bold flex items-center gap-1.5">
                <Trash2 size={14} /> Delete ({selected.size})
              </button>
            )}

            <button
              onClick={() => { setSelectMode(s => !s); setSelected(new Set()); }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                selectMode
                  ? 'bg-amber-500 text-[#080c14] border-amber-500'
                  : 'btn-dark-outline'
              }`}
            >
              {selectMode ? <><X size={14} className="inline mr-1" /> Done</> : <><CheckSquare size={14} className="inline mr-1" /> Select Photos</>}
            </button>

            <button onClick={() => setUploadOpen(true)} className="btn-gold !py-2.5 !px-5 text-xs font-extrabold tracking-wider uppercase">
              <Upload size={15} className="stroke-[2.5]" />
              Upload Photos
            </button>
          </div>
        </div>

        {/* ── Filters Bar ───────────────────────────────────────── */}
        <div className="dark-panel p-4 rounded-2xl mb-8 flex flex-wrap items-center gap-3">
          
          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input-dark pl-9 text-xs"
              placeholder="Search by title, description..."
              value={filters.search || ''}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </div>

          {/* Event Filter */}
          <div className="relative min-w-[170px]">
            <select
              className="input-dark pr-8 appearance-none text-xs font-medium"
              value={filters.event_id || ''}
              onChange={e => setFilters(f => ({ ...f, event_id: e.target.value, album_id: '' }))}
            >
              <option value="">All Events</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name} ({ev.year})</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Album Filter */}
          <div className="relative min-w-[150px]">
            <select
              className="input-dark pr-8 appearance-none text-xs font-medium"
              value={filters.album_id || ''}
              onChange={e => setFilters(f => ({ ...f, album_id: e.target.value }))}
            >
              <option value="">All Albums</option>
              {albums.filter(a => !filters.event_id || a.event_id === filters.event_id).map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Select all in select mode */}
          {selectMode && (
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={selectAll} className="text-xs text-amber-400 hover:underline font-bold">
                Select All
              </button>
              <span className="text-slate-600">·</span>
              <button onClick={clearSelection} className="text-xs text-slate-400 hover:text-white">
                Clear
              </button>
            </div>
          )}
        </div>

        {/* ── Photo Grid ────────────────────────────────────────── */}
        {loading ? (
          <div className="gallery-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton-dark aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="dark-panel rounded-3xl p-16 text-center max-w-md mx-auto my-10 space-y-4">
            <Images size={38} className="text-amber-500/40 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Photos Uploaded</h3>
            <p className="text-xs text-slate-400">Upload high-resolution festival photographs to this event.</p>
            <button onClick={() => setUploadOpen(true)} className="btn-gold text-xs">
              <Upload size={14} /> Upload First Photos
            </button>
          </div>
        ) : (
          <>
            <div className="gallery-grid">
              {photos.map(photo => {
                const isSelected = selected.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={() => selectMode && toggleSelect(photo.id)}
                    className={`group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-[#090d16] border transition-all ${
                      isSelected
                        ? 'border-2 border-amber-400 shadow-xl shadow-amber-500/20 scale-[0.98]'
                        : 'border-white/10 hover:border-amber-500/40'
                    }`}
                  >
                    {/* Select Checkbox */}
                    {selectMode && (
                      <div className={`absolute top-2.5 left-2.5 z-20 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-amber-400 border-amber-400' : 'bg-black/60 border-white/60'
                      }`}>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-[#080c14] font-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    )}

                    {/* Draft Badge */}
                    {!photo.is_published && (
                      <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300">
                        Draft
                      </div>
                    )}

                    <img
                      src={getImageUrl(photo.thumbnail_path || photo.medium_path)}
                      alt={photo.title || 'Photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Admin Actions Overlay */}
                    {!selectMode && (
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080c14]/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 pr-2">
                            <p className="text-white text-xs font-bold truncate">{photo.title || 'Photo'}</p>
                            <p className="text-amber-400 text-[10px] font-medium">{photo.event_name}</p>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleTogglePublish(photo); }}
                              className="p-1.5 rounded-lg bg-[#161f32] text-slate-300 hover:text-amber-400"
                              title={photo.is_published ? 'Unpublish' : 'Publish'}
                            >
                              {photo.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(photo); }}
                              className="p-1.5 rounded-lg bg-[#161f32] text-slate-300 hover:text-red-400"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-gold !py-3 !px-8 text-xs font-bold uppercase tracking-wider"
                >
                  {loadingMore ? <><Loader2 size={15} className="animate-spin" /> Loading...</> : `Load More (${total - photos.length} remaining)`}
                </button>
              </div>
            )}
          </>
        )}

        {/* Upload Modal */}
        {uploadOpen && (
          <UploadModal
            events={events}
            albums={albums}
            onUploaded={() => { setPage(1); fetchPhotos(1, filters, false); }}
            onClose={() => setUploadOpen(false)}
          />
        )}

      </div>
    </div>
  );
}
