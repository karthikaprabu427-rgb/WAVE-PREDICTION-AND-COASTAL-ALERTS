import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  MapPin,
  Loader2,
  X,
  Compass,
  Waves,
  Check,
  AlertCircle,
  ArrowRight,
  Activity,
  ShieldAlert,
  BarChart3,
  Flame,
  Radio,
} from 'lucide-react';
import { useOceanData } from '../context/OceanDataContext';
import { LocationSearchResult, OceanCondition } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
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

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const {
    stations,
    selectedStation,
    setSelectedStation,
    searchCoastalLocations,
    selectLocation,
    isLiveFetching,
  } = useOceanData();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setSearchResults([]);
      setSearchError(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search logic
  const handleQueryChange = (text: string) => {
    setQuery(text);
    setSearchError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!text.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const found = await searchCoastalLocations(text);
        setSearchResults(found);
        if (found.length === 0) {
          setSearchError(`No coastal locations found matching "${text}". Try beach, port, or coast.`);
        }
      } catch (err: any) {
        setSearchError('Unable to search locations right now. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 280);
  };

  const handleSelectLocation = async (loc: {
    lat: number;
    lng: number;
    name: string;
    region?: string;
    country?: string;
  }) => {
    onClose();
    const updated = await selectLocation({
      lat: loc.lat,
      lng: loc.lng,
      name: loc.name,
      region: loc.region,
      country: loc.country,
    });
    if (updated) {
      setSelectedStation(updated);
    }
    onNavigate('dashboard');
  };

  const handleSelectExistingStation = (stn: OceanCondition) => {
    setSelectedStation(stn);
    onClose();
    onNavigate('dashboard');
  };

  if (!isOpen) return null;

  // Filter loaded stations based on query
  const matchingStations = query.trim()
    ? stations.filter(
        (s) =>
          s.stationName.toLowerCase().includes(query.toLowerCase()) ||
          s.region.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search coastal locations and navigation"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="text-cyan-400 shrink-0 mr-3">
            {isSearching || isLiveFetching ? (
              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search any beach, coastal point, buoy, or port (e.g., Marina Beach, Goa, Kovalam, Miami)..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm sm:text-base focus:outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSearchResults([]);
                setSearchError(null);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition mr-2"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            ESC
          </button>
        </div>

        {/* Modal Results & Content Area */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar p-2">
          {/* 1. If user is actively querying */}
          {query.trim() ? (
            <div className="space-y-3 p-2">
              {/* Loaded buoys/stations matching query */}
              {matchingStations.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider px-2 block">
                    Active Buoys &amp; Monitoring Stations ({matchingStations.length})
                  </span>
                  <div className="space-y-1">
                    {matchingStations.map((stn) => (
                      <button
                        key={stn.id}
                        type="button"
                        onClick={() => handleSelectExistingStation(stn)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-950/60 border border-slate-700 group-hover:border-cyan-500/40 transition shrink-0">
                            <Radio size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-100 text-sm block truncate group-hover:text-cyan-300">
                              {stn.stationName}
                            </span>
                            <span className="text-xs text-slate-400 block truncate font-mono">
                              {stn.region}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                            Hs: {stn.waveHeight.toFixed(1)}m
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                              stn.riskLevel === 'CRITICAL'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : stn.riskLevel === 'HIGH'
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {stn.riskLevel}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Coastal Location Results */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider px-2 block">
                  Global Coastal Locations ({searchResults.length})
                </span>

                {isSearching ? (
                  <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Searching global coastal coordinates &amp; beaches...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchResults.map((loc) => {
                      const isCurrent =
                        selectedStation?.stationName.toLowerCase() === loc.name.toLowerCase();
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() =>
                            handleSelectLocation({
                              lat: loc.lat,
                              lng: loc.lng,
                              name: loc.name,
                              region: loc.displayName || loc.state,
                              country: loc.country,
                            })
                          }
                          className="w-full text-left p-2.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-cyan-500/30 transition flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 group-hover:bg-cyan-950/60 border border-slate-700 group-hover:border-cyan-500/40 transition shrink-0">
                              <MapPin size={16} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 truncate">
                                  {loc.name}
                                </span>
                                {loc.type && (
                                  <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                                    {loc.type}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 block truncate">
                                {loc.displayName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isCurrent ? (
                              <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                                <Check size={12} /> Active
                              </span>
                            ) : (
                              <span className="text-xs text-cyan-400 group-hover:translate-x-0.5 transition flex items-center gap-1 font-semibold">
                                View Telemetry <ArrowRight size={13} />
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : searchError ? (
                  <div className="p-4 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{searchError}</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Type at least 2 characters to search global marine points.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* 2. Default state: Popular Beaches & Quick App Navigation */
            <div className="p-3 space-y-4">
              {/* Popular Coastal Beach Hotspots */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Compass size={14} className="text-cyan-400" />
                  <span>Popular Coastal Hotspots (Instant Live Forecast):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_BEACH_CHIPS.map((beach) => {
                    const isSelected =
                      selectedStation?.stationName.toLowerCase().includes(beach.name.toLowerCase());
                    return (
                      <button
                        key={beach.name}
                        type="button"
                        onClick={() =>
                          handleSelectLocation({
                            lat: beach.lat,
                            lng: beach.lng,
                            name: beach.name,
                            region: beach.region,
                            country: 'India',
                          })
                        }
                        className={`p-2 rounded-xl text-left border transition flex items-center gap-2 text-xs ${
                          isSelected
                            ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 shadow-md font-bold'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        <Waves size={14} className={isSelected ? 'text-cyan-300' : 'text-slate-400'} />
                        <span className="truncate">{beach.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Page Jump */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Page Shortcuts:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('dashboard');
                    }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs flex items-center gap-2 transition"
                  >
                    <Activity size={14} className="text-cyan-400" />
                    <span>Live Dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('risk-map');
                    }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs flex items-center gap-2 transition"
                  >
                    <MapPin size={14} className="text-cyan-400" />
                    <span>Risk Map</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('predict');
                    }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs flex items-center gap-2 transition"
                  >
                    <Waves size={14} className="text-cyan-400" />
                    <span>ML Prediction</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate('alerts');
                    }}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs flex items-center gap-2 transition"
                  >
                    <ShieldAlert size={14} className="text-amber-400" />
                    <span>Coastal Alerts</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Hint */}
        <div className="px-4 py-2.5 bg-slate-900/60 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Search any coastline worldwide using Open-Meteo &amp; GEBCO bathymetry</span>
          <span className="font-mono">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
