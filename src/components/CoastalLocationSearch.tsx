import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, X, Compass, Waves, Check, AlertCircle } from 'lucide-react';
import { LocationSearchResult, OceanCondition } from '../types';
import { useOceanData } from '../context/OceanDataContext';

interface CoastalLocationSearchProps {
  onLocationSelected?: (station: OceanCondition) => void;
  className?: string;
  placeholder?: string;
  compact?: boolean;
}

const POPULAR_BEACH_CHIPS = [
  { name: 'Marina Beach', lat: 13.0533, lng: 80.2833, region: 'Chennai, Tamil Nadu' },
  { name: 'Mahabalipuram', lat: 12.6196, lng: 80.1936, region: 'Chengalpattu, Tamil Nadu' },
  { name: 'Rameswaram', lat: 9.2876, lng: 79.3129, region: 'Dhanushkodi, Tamil Nadu' },
  { name: 'Kanyakumari', lat: 8.0883, lng: 77.5385, region: 'Cape Comorin, Tamil Nadu' },
  { name: 'Goa (Baga)', lat: 15.5553, lng: 73.7517, region: 'North Goa' },
  { name: 'Mumbai (Juhu)', lat: 19.0988, lng: 72.8264, region: 'Western Coast, Mumbai' },
  { name: 'Kovalam', lat: 8.4021, lng: 76.9787, region: 'Thiruvananthapuram, Kerala' },
  { name: 'Pondicherry', lat: 11.9338, lng: 79.8358, region: 'Promenade Beach' },
  { name: 'Puri Beach', lat: 19.8135, lng: 85.8312, region: 'Odisha Coast' },
];

export const CoastalLocationSearch: React.FC<CoastalLocationSearchProps> = ({
  onLocationSelected,
  className = '',
  placeholder = 'Search any beach, coast, port, or island (e.g., Marina Beach, Mahabalipuram, Rameswaram, Goa...)...',
  compact = false,
}) => {
  const { searchCoastalLocations, selectLocation, isLiveFetching, selectedStation } = useOceanData();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search logic
  const handleQueryChange = (text: string) => {
    setQuery(text);
    setSearchError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const found = await searchCoastalLocations(text);
        setResults(found);
        setIsOpen(true);
        if (found.length === 0) {
          setSearchError(`No coastal locations found matching "${text}". Try searching with beach, port, or coast.`);
        }
      } catch (err: any) {
        setSearchError('Unable to search locations right now. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 320);
  };

  const handleSelect = async (loc: { lat: number; lng: number; name: string; region?: string; country?: string }) => {
    setIsOpen(false);
    setQuery(loc.name);
    setSearchError(null);

    const updated = await selectLocation({
      lat: loc.lat,
      lng: loc.lng,
      name: loc.name,
      region: loc.region,
      country: loc.country,
    });

    if (updated && onLocationSelected) {
      onLocationSelected(updated);
    }
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSearchError(null);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-cyan-400 pointer-events-none">
          {isSearching || isLiveFetching ? (
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition shadow-inner"
        />

        {query && (
          <button
            type="button"
            onClick={clearQuery}
            className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl max-h-80 overflow-y-auto divide-y divide-slate-800/80">
          {isSearching ? (
            <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Searching coastal locations worldwide...</span>
            </div>
          ) : results.length > 0 ? (
            results.map((loc) => {
              const isSelected = selectedStation?.stationName.toLowerCase() === loc.name.toLowerCase();
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() =>
                    handleSelect({
                      lat: loc.lat,
                      lng: loc.lng,
                      name: loc.name,
                      region: loc.displayName || loc.state,
                      country: loc.country,
                    })
                  }
                  className="w-full text-left px-4 py-3 hover:bg-cyan-950/40 transition flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 group-hover:bg-cyan-900/40 group-hover:border-cyan-700 transition shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-slate-100 text-sm group-hover:text-cyan-300 transition">
                          {loc.name}
                        </span>
                        {loc.type && (
                          <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                            {loc.type}
                          </span>
                        )}
                        {loc.country && (
                          <span className="text-[11px] text-slate-400">
                            {loc.country}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {loc.displayName}
                      </p>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                        {loc.lat.toFixed(4)}°N, {loc.lng.toFixed(4)}°E
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="shrink-0 flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-full border border-emerald-800/50">
                      <Check className="w-3 h-3" />
                      <span>Active</span>
                    </div>
                  ) : (
                    <span className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition shrink-0">
                      Load Live Telemetry →
                    </span>
                  )}
                </button>
              );
            })
          ) : searchError ? (
            <div className="p-4 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{searchError}</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Quick Select Beach Chips (if not compact) */}
      {!compact && (
        <div className="mt-2.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Popular Coastal Hotspots:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_BEACH_CHIPS.map((beach) => {
              const isSelected = selectedStation?.stationName.toLowerCase().includes(beach.name.toLowerCase());
              return (
                <button
                  key={beach.name}
                  type="button"
                  onClick={() =>
                    handleSelect({
                      lat: beach.lat,
                      lng: beach.lng,
                      name: beach.name,
                      region: beach.region,
                      country: 'India',
                    })
                  }
                  className={`text-xs px-2.5 py-1 rounded-lg border transition flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-medium'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:bg-slate-800 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <Waves className={`w-3 h-3 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{beach.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
