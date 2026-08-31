import { X, Sparkles, Phone, Mail, MapPin, Users, Award, Music, Heart, Landmark } from 'lucide-react';

export default function NavModals({ modalType = null, onClose = () => {} }) {
  if (!modalType) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-[#0d1322] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#161f32] text-slate-400 hover:text-white border border-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* ── ARTISTS MODAL ────────────────────────────────────────── */}
        {modalType === 'artists' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Music size={24} />
              </div>
              <div>
                <h2 className="font-['Cinzel'] text-2xl font-bold text-white">Renowned Artists</h2>
                <p className="text-xs text-amber-400">Pune Festival Performing Legends</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              For over three decades, the Pune Festival has hosted India's greatest classical vocalists, instrumental maestros, Kathak and Bharatnatyam exponents, Bollywood stars, and folk ensembles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { name: 'Classical Vocalists', desc: 'Hindustani and Carnatic maestros' },
                { name: 'Instrumental Virtuosos', desc: 'Sitar, Sarod, Santoor, Tabla legends' },
                { name: 'Classical Dance Troupes', desc: 'Kathak, Lavani, Bharatnatyam, Odissi' },
                { name: 'Theatre & Folk Groups', desc: 'Traditional Maharashtrian cultural folk' },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#131a2c] border border-white/5 space-y-1">
                  <h4 className="text-amber-400 font-bold text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ABOUT MODAL ──────────────────────────────────────────── */}
        {modalType === 'about' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Pune Festival"
                className="w-12 h-12 object-contain bg-white/5 border border-amber-500/30 p-1 rounded-2xl shadow-lg shadow-amber-500/10"
              />
              <div>
                <h2 className="font-['Cinzel'] text-2xl font-bold text-white">About Pune Festival</h2>
                <p className="text-xs text-amber-400">Pride of Maharashtra's Cultural Heritage</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Founded during the auspicious Ganesh Festival, **Pune Festival** is a grand 10 to 12 day celebration showcasing the rich tapestry of Indian art, music, dance, sports, and Maharashtrian culture.
            </p>

            <div className="p-4 rounded-2xl bg-[#131a2c] border border-amber-500/20 space-y-2">
              <h4 className="text-amber-400 font-bold text-sm flex items-center gap-2">
                <Award size={16} /> Official Photo Gallery Archive
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                This digital archive preserves high-resolution photographs, event moments, and behind-the-scenes memories across all editions of the Pune Festival.
              </p>
            </div>
          </div>
        )}

        {/* ── CONTACT MODAL ────────────────────────────────────────── */}
        {modalType === 'contact' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Phone size={24} />
              </div>
              <div>
                <h2 className="font-['Cinzel'] text-2xl font-bold text-white">Contact & Secretariat</h2>
                <p className="text-xs text-amber-400">Pune Festival Committee</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#131a2c] border border-white/5">
                <MapPin size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white block mb-0.5">Secretariat Address:</span>
                  Pune Festival Committee, Shivajinagar, Pune 411005, Maharashtra, India
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#131a2c] border border-white/5">
                <Mail size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white block mb-0.5">Email Inquiries:</span>
                  info@punefestival.com / media@punefestival.com
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#131a2c] border border-white/5">
                <Phone size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white block mb-0.5">Phone:</span>
                  +91 20 2553 5555 / +91 20 2553 6666
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
