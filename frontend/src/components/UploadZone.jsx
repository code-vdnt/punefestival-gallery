import { useCallback, useState, useEffect } from 'react';
import { Upload, X, Images, AlertCircle, FileCheck, Layers } from 'lucide-react';

export default function UploadZone({ onFilesSelected, accept = 'image/*', multiple = true }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Cleanup object URLs on unmount to prevent browser memory leaks
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFiles = useCallback((filesList) => {
    const rawFiles = Array.from(filesList).filter(f => f.type.startsWith('image/'));
    if (rawFiles.length === 0) return;

    // Cleanup old preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));

    // Create object URLs only for the first 8 files to prevent UI memory freeze
    const newPreviewUrls = rawFiles.slice(0, 8).map(file => URL.createObjectURL(file));

    setSelectedFiles(rawFiles);
    setPreviewUrls(newPreviewUrls);
    onFilesSelected(rawFiles);
  }, [previewUrls, onFilesSelected]);

  const handleRemoveAll = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    onFilesSelected([]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const totalSizeMb = selectedFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024);

  return (
    <div className="space-y-4">
      {/* ── Drop Zone ───────────────────────────────────────────── */}
      <div
        className={`dropzone-gold p-8 sm:p-10 text-center cursor-pointer transition-all ${
          dragOver ? 'active scale-[1.01]' : ''
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload-input').click()}
      >
        <input
          id="file-upload-input"
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Upload size={24} className="stroke-[2.2]" />
          </div>
          
          <div>
            <p className="text-white font-['Cinzel'] font-bold text-base sm:text-lg">
              Drag & Drop Photos Here
            </p>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              or <span className="text-amber-400 font-semibold underline underline-offset-4">Click to Browse</span> from your device
            </p>
          </div>

          <span className="text-[11px] font-medium text-slate-500 bg-[#0a0f1b] px-3 py-1 rounded-full border border-white/5">
            JPG, PNG, WebP · Up to 50MB each · Batch processing with Sharp
          </span>
        </div>
      </div>

      {/* ── Lightweight Summary & Thumbnail Previews ────────────── */}
      {selectedFiles.length > 0 && (
        <div className="dark-panel rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck size={16} className="text-amber-400" />
              <p className="text-slate-200 text-xs sm:text-sm font-bold">
                {selectedFiles.length} Photo{selectedFiles.length > 1 ? 's' : ''} Selected
                <span className="text-slate-400 font-normal ml-1.5 text-xs">
                  ({totalSizeMb.toFixed(1)} MB total)
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemoveAll}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors font-semibold cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Compact visual thumbnails */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {previewUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-[#090d16] border border-white/10">
                <img
                  src={url}
                  alt={`preview-${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {selectedFiles.length > previewUrls.length && (
              <div className="aspect-square rounded-xl bg-[#141d30] border border-white/10 flex flex-col items-center justify-center text-center p-1">
                <span className="text-xs font-bold text-amber-400">
                  +{selectedFiles.length - previewUrls.length}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-semibold">
                  more
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
