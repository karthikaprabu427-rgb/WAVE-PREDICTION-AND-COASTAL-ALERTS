import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { LocationSearchResult, OceanCondition } from '../types';
import { simulatePlausibleStationUpdate, StationDelta } from '../utils/simulationPhysics';

export interface TelemetryPoint {
  time: string;
  waveHeight: number;
  windSpeed: number;
  waterTemperature: number;
  wavePeriod: number;
  pressure: number;
}

interface OceanDataContextType {
  stations: OceanCondition[];
  selectedStation: OceanCondition | null;
  setSelectedStation: (stn: OceanCondition | null) => void;
  loading: boolean;
  isSimulating: boolean;
  isPlaying: boolean;
  setIsPlaying: (play: boolean) => void;
  updateInterval: number; // in seconds
  setUpdateInterval: (seconds: number) => void;
  countdown: number; // remaining seconds
  lastUpdated: string | null;
  stationDeltas: Record<string, StationDelta>;
  telemetryHistory: Record<string, TelemetryPoint[]>;
  stepSimulation: () => Promise<void>;
  resetSimulation: () => Promise<void>;
  fetchStations: () => Promise<void>;
  searchCoastalLocations: (query: string) => Promise<LocationSearchResult[]>;
  selectLocation: (params: { lat: number; lng: number; name: string; region?: string; country?: string }) => Promise<OceanCondition | null>;
  refreshActiveStation: () => Promise<void>;
  isLiveFetching: boolean;
  searchError: string | null;
  setSearchError: (err: string | null) => void;
  activePrediction: any | null;
  stats: {
    avgWaveHeight: number;
    maxWaveHeight: number;
    avgWindSpeed: number;
    avgWaterTemp: number;
    highRiskCount: number;
    criticalCount: number;
  };
}

const OceanDataContext = createContext<OceanDataContextType | undefined>(undefined);

export const OceanDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stations, setStations] = useState<OceanCondition[]>([]);
  const [selectedStation, setSelectedStation] = useState<OceanCondition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isLiveFetching, setIsLiveFetching] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [updateInterval, setUpdateIntervalState] = useState<number>(60); // Default 60 seconds
  const [countdown, setCountdown] = useState<number>(60);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [stationDeltas, setStationDeltas] = useState<Record<string, StationDelta>>({});
  const [telemetryHistory, setTelemetryHistory] = useState<Record<string, TelemetryPoint[]>>({});
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activePrediction, setActivePrediction] = useState<any | null>(null);

  const intervalRef = useRef<number>(60);
  intervalRef.current = updateInterval;

  const setUpdateInterval = (seconds: number) => {
    const valid = Math.max(3, Math.min(600, seconds));
    setUpdateIntervalState(valid);
    setCountdown(valid);
  };

  // Helper to record history points
  const recordHistory = (updatedList: OceanCondition[]) => {
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setTelemetryHistory((prev) => {
      const nextHistory = { ...prev };
      updatedList.forEach((stn) => {
        const list = nextHistory[stn.id] ? [...nextHistory[stn.id]] : [];
        list.push({
          time: timeLabel,
          waveHeight: stn.waveHeight,
          windSpeed: stn.windSpeed,
          waterTemperature: stn.waterTemperature,
          wavePeriod: stn.wavePeriod,
          pressure: stn.pressure,
        });
        if (list.length > 25) list.shift();
        nextHistory[stn.id] = list;
      });
      return nextHistory;
    });
  };

  // Initial Fetch from API
  const fetchStations = useCallback(async () => {
    try {
      const res = await fetch('/api/ocean-conditions', {
        headers: { Accept: 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        const stationList: OceanCondition[] = data.stations || [];
        setStations(stationList);
        setLastUpdated(new Date().toISOString());
        recordHistory(stationList);
        if (stationList.length > 0 && !selectedStation) {
          setSelectedStation(stationList[0]);
        }
      }
    } catch (err) {
      console.warn('Could not load ocean conditions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStation]);

  useEffect(() => {
    fetchStations();
  }, []);

  // Step Simulation Logic (Executed on interval or button click)
  const stepSimulation = useCallback(async () => {
    setIsSimulating(true);
    try {
      // First try server-side simulation endpoint
      const res = await fetch('/api/ocean-conditions/simulate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const updatedList: OceanCondition[] = data.stations || [];
        setStations(updatedList);
        setStationDeltas(data.deltas || {});
        setLastUpdated(data.timestamp || new Date().toISOString());
        recordHistory(updatedList);

        // Update selected station reference if present
        setSelectedStation((prev) => {
          if (!prev) return updatedList[0] || null;
          return updatedList.find((s) => s.id === prev.id) || updatedList[0] || null;
        });
      } else {
        // Fallback to client-side physics simulation
        setStations((prevStations) => {
          const newDeltas: Record<string, StationDelta> = {};
          const updated = prevStations.map((stn) => {
            const res = simulatePlausibleStationUpdate(stn);
            newDeltas[stn.id] = res.delta;
            return res.updated;
          });
          setStationDeltas(newDeltas);
          setLastUpdated(new Date().toISOString());
          recordHistory(updated);

          setSelectedStation((prev) => {
            if (!prev) return updated[0] || null;
            return updated.find((s) => s.id === prev.id) || updated[0] || null;
          });
          return updated;
        });
      }
    } catch (err) {
      console.warn('Simulation step API error, applying local physics engine:', err);
      setStations((prevStations) => {
        const newDeltas: Record<string, StationDelta> = {};
        const updated = prevStations.map((stn) => {
          const res = simulatePlausibleStationUpdate(stn);
          newDeltas[stn.id] = res.delta;
          return res.updated;
        });
        setStationDeltas(newDeltas);
        setLastUpdated(new Date().toISOString());
        recordHistory(updated);
        return updated;
      });
    } finally {
      setCountdown(intervalRef.current);
      setTimeout(() => setIsSimulating(false), 800);
    }
  }, []);

  // Reset Simulation to Initial Baseline
  const resetSimulation = useCallback(async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/ocean-conditions/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const resetList: OceanCondition[] = data.stations || [];
        setStations(resetList);
        setStationDeltas({});
        setLastUpdated(data.timestamp || new Date().toISOString());
        recordHistory(resetList);
        setSelectedStation((prev) => {
          if (!prev) return resetList[0] || null;
          return resetList.find((s) => s.id === prev.id) || resetList[0] || null;
        });
      }
    } catch (err) {
      console.error('Failed to reset ocean conditions:', err);
    } finally {
      setCountdown(intervalRef.current);
      setTimeout(() => setIsSimulating(false), 500);
    }
  }, []);

  // Countdown and Simulation Tick Loop
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stepSimulation();
          return intervalRef.current;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, stepSimulation]);

  // Derived Stats
  const stats = React.useMemo(() => {
    if (!stations.length) {
      return {
        avgWaveHeight: 0,
        maxWaveHeight: 0,
        avgWindSpeed: 0,
        avgWaterTemp: 0,
        highRiskCount: 0,
        criticalCount: 0,
      };
    }

    const totalWave = stations.reduce((acc, s) => acc + s.waveHeight, 0);
    const maxWave = Math.max(...stations.map((s) => s.waveHeight));
    const totalWind = stations.reduce((acc, s) => acc + s.windSpeed, 0);
    const totalTemp = stations.reduce((acc, s) => acc + s.waterTemperature, 0);
    const highRisk = stations.filter((s) => s.riskLevel === 'HIGH').length;
    const critical = stations.filter((s) => s.riskLevel === 'CRITICAL').length;

    return {
      avgWaveHeight: parseFloat((totalWave / stations.length).toFixed(2)),
      maxWaveHeight: parseFloat(maxWave.toFixed(2)),
      avgWindSpeed: parseFloat((totalWind / stations.length).toFixed(1)),
      avgWaterTemp: parseFloat((totalTemp / stations.length).toFixed(1)),
      highRiskCount: highRisk,
      criticalCount: critical,
    };
  }, [stations]);

  // Dynamic search for coastal locations
  const searchCoastalLocations = useCallback(async (query: string): Promise<LocationSearchResult[]> => {
    try {
      setSearchError(null);
      const res = await fetch(`/api/locations/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error(`Location search returned status ${res.status}`);
      }
      const data = await res.json();
      return data.results || [];
    } catch (err: any) {
      console.error('Location search failed:', err);
      setSearchError(err?.message || 'Failed to search locations');
      return [];
    }
  }, []);

  // Select any coastal location by coordinates and fetch live marine data
  const selectLocation = useCallback(
    async (params: { lat: number; lng: number; name: string; region?: string; country?: string }): Promise<OceanCondition | null> => {
      setIsLiveFetching(true);
      setSearchError(null);
      try {
        const queryParams = new URLSearchParams({
          lat: params.lat.toString(),
          lng: params.lng.toString(),
          name: params.name,
        });
        if (params.region) queryParams.set('region', params.region);

        const res = await fetch(`/api/marine/live?${queryParams.toString()}`);
        if (!res.ok) {
          throw new Error(`Marine telemetry service returned status ${res.status}`);
        }

        const data = await res.json();
        const liveStation: OceanCondition = {
          ...data.station,
          country: params.country || data.station.country,
        };

        // Add or update in stations array
        setStations((prev) => {
          const idx = prev.findIndex(
            (s) => s.id === liveStation.id || (Math.abs(s.lat - liveStation.lat) < 0.03 && Math.abs(s.lng - liveStation.lng) < 0.03)
          );
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = liveStation;
            return next;
          }
          return [liveStation, ...prev];
        });

        setSelectedStation(liveStation);
        setActivePrediction(data.mlPrediction || null);
        setLastUpdated(data.lastUpdated || new Date().toISOString());

        // Update telemetry history
        setTelemetryHistory((prev) => {
          const list = prev[liveStation.id] ? [...prev[liveStation.id]] : [];
          list.push({
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            waveHeight: liveStation.waveHeight,
            windSpeed: liveStation.windSpeed,
            waterTemperature: liveStation.waterTemperature,
            wavePeriod: liveStation.wavePeriod,
            pressure: liveStation.pressure,
          });
          if (list.length > 25) list.shift();
          return { ...prev, [liveStation.id]: list };
        });

        return liveStation;
      } catch (err: any) {
        console.error('Failed to select location and load marine data:', err);
        setSearchError(err?.message || 'Could not fetch live marine data for this location.');
        return null;
      } finally {
        setIsLiveFetching(false);
      }
    },
    []
  );

  // Refresh active station data on-demand
  const refreshActiveStation = useCallback(async () => {
    if (!selectedStation) return;
    await selectLocation({
      lat: selectedStation.lat,
      lng: selectedStation.lng,
      name: selectedStation.stationName,
      region: selectedStation.region,
      country: selectedStation.country,
    });
  }, [selectedStation, selectLocation]);

  return (
    <OceanDataContext.Provider
      value={{
        stations,
        selectedStation,
        setSelectedStation,
        loading,
        isSimulating,
        isPlaying,
        setIsPlaying,
        updateInterval,
        setUpdateInterval,
        countdown,
        lastUpdated,
        stationDeltas,
        telemetryHistory,
        stepSimulation,
        resetSimulation,
        fetchStations,
        searchCoastalLocations,
        selectLocation,
        refreshActiveStation,
        isLiveFetching,
        searchError,
        setSearchError,
        activePrediction,
        stats,
      }}
    >
      {children}
    </OceanDataContext.Provider>
  );
};

export const useOceanData = (): OceanDataContextType => {
  const context = useContext(OceanDataContext);
  if (!context) {
    throw new Error('useOceanData must be used within an OceanDataProvider');
  }
  return context;
};
