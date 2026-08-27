import { 
  Sparkles, Music, Footprints, Flame, Trophy, 
  Palette, Presentation, Layers, Star
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', label: 'All Categories', icon: Layers },
  { id: 'opening-ceremony', label: 'Opening Ceremony', icon: Flame },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'dance', label: 'Dance', icon: Footprints },
  { id: 'cultural', label: 'Cultural Events', icon: Sparkles },
  { id: 'sports', label: 'Sports', icon: Trophy },
  { id: 'workshops', label: 'Workshops', icon: Presentation },
  { id: 'exhibitions', label: 'Exhibitions', icon: Palette },
  { id: 'others', label: 'Others', icon: Star },
];

export default function CategoryNav({ 
  selectedCategory = 'all', 
  onSelectCategory = () => {} 
}) {
  return (
    <div className="w-full bg-[#0a0f1b] border-b border-white/10 overflow-x-auto scrollbar-none py-1">
      <div className="max-w-7xl mx-auto px-4 flex items-center min-w-max justify-start md:justify-center">
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <div key={cat.id} className="flex items-center">
              <button
                onClick={() => onSelectCategory(cat.id)}
                className={`group flex items-center gap-2.5 px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold tracking-wide transition-all relative cursor-pointer ${
                  isSelected
                    ? 'text-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon 
                  size={16} 
                  className={`transition-colors stroke-[2.2] ${
                    isSelected ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400/70'
                  }`} 
                />
                <span className="whitespace-nowrap">{cat.label}</span>

                {/* Golden Active Underline */}
                {isSelected && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-amber-400 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                )}
              </button>

              {/* Subtle Vertical Separator between items */}
              {idx < CATEGORIES.length - 1 && (
                <span className="h-4 w-[1px] bg-white/10 my-auto" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
