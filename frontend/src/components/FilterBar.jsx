import { LayoutGrid, List, ChevronDown, Sparkles, Filter } from 'lucide-react';

export default function FilterBar({ 
  years = [], 
  selectedYear = '', 
  onSelectYear = () => {},
  sortBy = 'created_at',
  sortOrder = 'DESC',
  onSortChange = () => {},
  viewMode = 'grid',
  onViewModeChange = () => {}
}) {
  // Common default years if none returned or to ensure archive options
  const defaultYears = [2025, 2024, 2023, 2022];
  const combinedYears = Array.from(new Set([...years, ...defaultYears])).sort((a, b) => b - a);

  return (
    <div className="w-full bg-[#0d121e] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        
        {/* ── Year Filters (Pill Style) ─────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => onSelectYear('')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
              !selectedYear
                ? 'pill-active'
                : 'pill-inactive'
            }`}
          >
            All Photos
          </button>

          {combinedYears.map((yr) => {
            const isSelected = String(selectedYear) === String(yr);
            return (
              <button
                key={yr}
                onClick={() => onSelectYear(yr)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'pill-active'
                    : 'pill-inactive'
                }`}
              >
                {yr}
              </button>
            );
          })}
        </div>

        {/* ── Right Side: Sort by & View Toggle (Grid / List) ───── */}
        <div className="flex items-center gap-4 self-end md:self-auto">
          
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
            <span className="text-slate-400 font-medium whitespace-nowrap">Sort by:</span>
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  onSortChange(by, order);
                }}
                className="appearance-none bg-[#161f32] border border-white/10 hover:border-amber-500/30 text-white text-xs sm:text-sm font-medium py-2 pl-3.5 pr-8 rounded-xl outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="created_at-DESC">Latest First</option>
                <option value="created_at-ASC">Oldest First</option>
                <option value="display_order-ASC">Default Order</option>
                <option value="title-ASC">Title (A-Z)</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center bg-[#161f32] border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-[#080c14] font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={17} />
            </button>
            
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-[#080c14] font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List size={17} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
