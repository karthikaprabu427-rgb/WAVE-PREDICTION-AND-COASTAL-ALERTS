import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { OceanCondition, RiskLevel } from '../types';
import { Layers, Compass, Wind, Waves, Thermometer, ShieldAlert, ExternalLink, Activity } from 'lucide-react';

interface LeafletMapProps {
  stations: OceanCondition[];
  selectedStationId?: string;
  onSelectStation?: (station: OceanCondition) => void;
  onPredictStation?: (station: OceanCondition) => void;
  height?: string;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  onPredictStation,
  height = '500px',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const circlesRef = useRef<L.Circle[]>([]);
  const [activeTileLayer, setActiveTileLayer] = useState<'dark' | 'satellite'>('dark');
  const [showHazardRadii, setShowHazardRadii] = useState<boolean>(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [14.5, 79.5], // Central Indian Ocean / Coastal India
      zoom: 5,
      minZoom: 3,
      maxZoom: 18,
      zoomControl: false,
    });

    // Custom Zoom controls positioned at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Default Dark Marine OpenStreetMap CartoDB Tiles
    const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> | Coastal Buoy Telemetry',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (activeTileLayer === 'satellite') {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri & NOAA',
        maxZoom: 18,
      }).addTo(map);
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO & Marine Met Unit',
        maxZoom: 19,
      }).addTo(map);
    }
  }, [activeTileLayer]);

  // Update Markers and Hazard Radii
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers & circles
    Object.values(markersRef.current).forEach((m) => map.removeLayer(m));
    markersRef.current = {};
    circlesRef.current.forEach((c) => map.removeLayer(c));
    circlesRef.current = [];

    stations.forEach((station) => {
      const isExtreme = station.riskLevel === 'CRITICAL';
      const isHigh = station.riskLevel === 'HIGH';

      const getRiskColor = (level: RiskLevel) => {
        switch (level) {
          case 'CRITICAL':
            return { color: '#ef4444', pulse: true, border: '#b91c1c' };
          case 'HIGH':
            return { color: '#f97316', pulse: true, border: '#c2410c' };
          case 'MODERATE':
            return { color: '#f59e0b', pulse: false, border: '#b45309' };
          case 'LOW':
          default:
            return { color: '#10b981', pulse: false, border: '#047857' };
        }
      };

      const style = getRiskColor(station.riskLevel);

      // Create Custom HTML Marker Icon with live wave height and glowing ring
      const customIcon = L.divIcon({
        className: 'custom-ocean-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            ${
              isExtreme
                ? `<span class="absolute w-12 h-12 rounded-full animate-ping opacity-75 bg-red-500"></span>
                   <span class="absolute w-16 h-16 rounded-full animate-pulse opacity-40 bg-red-600"></span>`
                : isHigh
                ? `<span class="absolute w-10 h-10 rounded-full animate-ping opacity-60 bg-orange-500"></span>`
                : ''
            }
            <div class="relative ${isExtreme ? 'w-10 h-10 ring-2 ring-red-400' : 'w-8 h-8'} rounded-full flex flex-col items-center justify-center text-[10px] font-bold text-white shadow-xl transition-transform hover:scale-125 backdrop-blur-md" style="background-color: ${style.color}; border: 2px solid ${style.border}; box-shadow: 0 0 16px ${style.color};">
              <span class="leading-none">${station.waveHeight.toFixed(1)}</span>
              <span class="text-[8px] font-normal leading-none opacity-90">m</span>
            </div>
            <div class="absolute -bottom-5 px-2 py-0.5 rounded-md ${
              isExtreme
                ? 'bg-red-950/95 border border-red-500/80 text-red-200'
                : isHigh
                ? 'bg-orange-950/90 border border-orange-500/70 text-orange-200'
                : 'bg-[#020c1b]/90 border border-white/20 text-cyan-200'
            } text-[9px] font-mono whitespace-nowrap shadow-md backdrop-blur-md flex items-center gap-1 font-bold">
              ${isExtreme ? '🚨 ' : isHigh ? '⚠️ ' : ''}${station.stationName.split('(')[0].trim()}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -22],
      });

      const marker = L.marker([station.lat, station.lng], { icon: customIcon }).addTo(map);

      // Popup Content HTML
      const popupHtml = document.createElement('div');
      popupHtml.className = 'p-3.5 text-slate-100 max-w-xs space-y-2.5 bg-slate-900/95 rounded-2xl border border-white/15 backdrop-blur-xl shadow-2xl';
      popupHtml.innerHTML = `
        <div class="border-b border-slate-700/80 pb-2">
          <div class="flex items-center justify-between gap-2">
            <h4 class="font-bold text-sm text-cyan-300 font-heading">${station.stationName}</h4>
            <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md font-mono ${
              isExtreme ? 'bg-red-500/30 text-red-400 border border-red-500' : isHigh ? 'bg-orange-500/30 text-orange-400 border border-orange-500' : ''
            }" style="${!isExtreme && !isHigh ? `background: ${style.color}25; color: ${style.color}; border: 1px solid ${style.color}50;` : ''}">
              ${isExtreme ? 'EXTREME HAZARD' : station.riskLevel}
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">${station.region}</p>
        </div>

        ${
          isExtreme || isHigh
            ? `<div class="p-2 rounded-xl bg-red-950/50 border border-red-500/50 text-xs text-red-200 space-y-1">
                 <div class="font-bold flex items-center gap-1 uppercase text-[10px] text-red-300">
                   ${isExtreme ? '🚨 EMERGENCY DANGER ZONE' : '⚠️ HIGH SURF WARNING'}
                 </div>
                 <p class="text-[11px] leading-snug">Avoid the shoreline immediately. Hazardous breaking waves and storm currents.</p>
               </div>`
            : ''
        }

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-slate-950/80 p-2 rounded-xl border border-white/10">
            <span class="text-slate-400 block text-[10px]">Wave Height (Hs)</span>
            <span class="font-mono font-bold text-cyan-300 text-sm">${station.waveHeight.toFixed(1)} m</span>
          </div>
          <div class="bg-slate-950/80 p-2 rounded-xl border border-white/10">
            <span class="text-slate-400 block text-[10px]">Wave Period (Tp)</span>
            <span class="font-mono font-bold text-sky-300 text-sm">${station.wavePeriod.toFixed(1)} s</span>
          </div>
          <div class="bg-slate-950/80 p-2 rounded-xl border border-white/10">
            <span class="text-slate-400 block text-[10px]">Wind Velocity</span>
            <span class="font-mono font-bold text-amber-300 text-sm">${station.windSpeed.toFixed(0)} km/h (${station.windDirection})</span>
          </div>
          <div class="bg-slate-950/80 p-2 rounded-xl border border-white/10">
            <span class="text-slate-400 block text-[10px]">Sea Temperature</span>
            <span class="font-mono font-bold text-emerald-300 text-sm">${station.waterTemperature.toFixed(1)} °C</span>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1 text-[11px] text-slate-400">
          <span>Barometer: <strong class="text-slate-200 font-mono">${station.pressure} hPa</strong></span>
          <span>Data: <strong class="${station.dataStatus === 'LIVE_DATA' ? 'text-emerald-400' : 'text-amber-400'} font-mono">${station.dataStatus === 'LIVE_DATA' ? 'LIVE' : 'SIMULATED'}</strong></span>
        </div>

        <button id="btn-predict-${station.id}" class="w-full mt-2 py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-cyan-500/20">
          Run ML Prediction for Station
        </button>
      `;

      // Attach button event listener
      popupHtml.querySelector(`#btn-predict-${station.id}`)?.addEventListener('click', () => {
        if (onPredictStation) onPredictStation(station);
      });

      marker.bindPopup(popupHtml, { minWidth: 260 });
      marker.on('click', () => {
        if (onSelectStation) onSelectStation(station);
      });

      markersRef.current[station.id] = marker;

      // Add Hazard Radius Circles with animated boundary for Extreme (Requirement 7)
      if (showHazardRadii) {
        const radiusMeters = isExtreme ? 55000 : isHigh ? 35000 : station.riskLevel === 'MODERATE' ? 20000 : 10000;

        // For Extreme risk, render an inner immediate impact danger circle + outer buffer
        if (isExtreme) {
          const innerDangerCircle = L.circle([station.lat, station.lng], {
            radius: 25000,
            color: '#dc2626',
            fillColor: '#ef4444',
            fillOpacity: 0.35,
            weight: 2.5,
            dashArray: '6, 6',
          }).addTo(map);
          circlesRef.current.push(innerDangerCircle);
        }

        const circle = L.circle([station.lat, station.lng], {
          radius: radiusMeters,
          color: style.color,
          fillColor: style.color,
          fillOpacity: isExtreme ? 0.22 : isHigh ? 0.16 : 0.08,
          weight: isExtreme ? 2.5 : 1.5,
          dashArray: isExtreme ? '8, 6' : isHigh ? '5, 5' : undefined,
        }).addTo(map);

        circlesRef.current.push(circle);
      }
    });
  }, [stations, showHazardRadii, onSelectStation, onPredictStation]);

  // Center on Selected Station
  useEffect(() => {
    if (!selectedStationId || !mapInstanceRef.current) return;
    const marker = markersRef.current[selectedStationId];
    if (marker) {
      mapInstanceRef.current.setView(marker.getLatLng(), 9, { animate: true });
      marker.openPopup();
    } else {
      const targetStation = stations.find((s) => s.id === selectedStationId);
      if (targetStation && mapInstanceRef.current) {
        mapInstanceRef.current.setView([targetStation.lat, targetStation.lng], 9, { animate: true });
      }
    }
  }, [selectedStationId, stations]);

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/80 shadow-2xl backdrop-blur-xl ${className}`}>
      {/* Map Header Floating Layer Controls */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-[#020c1b]/80 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-white/15 shadow-2xl">
        <div className="flex items-center gap-1.5 text-xs text-slate-300 mr-1.5">
          <Layers size={14} className="text-cyan-400" />
          <span className="font-semibold">Layer:</span>
        </div>
        <button
          id="btn-map-layer-dark"
          onClick={() => setActiveTileLayer('dark')}
          className={`px-2.5 py-1 text-xs rounded-xl font-medium transition ${
            activeTileLayer === 'dark'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Nautical Dark
        </button>
        <button
          id="btn-map-layer-satellite"
          onClick={() => setActiveTileLayer('satellite')}
          className={`px-2.5 py-1 text-xs rounded-xl font-medium transition ${
            activeTileLayer === 'satellite'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Satellite
        </button>
        <div className="h-3.5 w-px bg-slate-700 mx-1"></div>
        <button
          id="btn-map-toggle-radii"
          onClick={() => setShowHazardRadii(!showHazardRadii)}
          className={`px-2.5 py-1 text-xs rounded-xl font-medium transition ${
            showHazardRadii
              ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Hazard Zones
        </button>
      </div>

      {/* Map Legend Floating Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#020c1b]/85 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/15 shadow-2xl text-xs space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
          Live Marine Hazard Index
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-[11px] text-slate-300 font-medium font-mono">Low (&lt;1.5m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
            <span className="text-[11px] text-slate-300 font-medium font-mono">Moderate (1.5-2.5m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></span>
            <span className="text-[11px] text-slate-300 font-medium font-mono">High (2.5-3.8m)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-ping"></span>
            <span className="text-[11px] text-red-300 font-bold font-mono">Critical (&gt;3.8m)</span>
          </div>
        </div>
      </div>

      {/* Leaflet Map Target DOM */}
      <div ref={mapContainerRef} style={{ height }} className="w-full h-full" />
    </div>
  );
};
