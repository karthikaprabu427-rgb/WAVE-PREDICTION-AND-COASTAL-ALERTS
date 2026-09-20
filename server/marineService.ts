import { LocationSearchResult, OceanCondition, RiskLevel } from '../src/types';
import { db } from './db';
import { mlEngine } from './mlEngine';
import { calculateCoastalRisk } from './riskCalculator';

// Curated quick-access index of prominent coastal destinations
const CURATED_COASTAL_LOCATIONS: LocationSearchResult[] = [
  {
    id: 'loc-marina-chennai',
    name: 'Marina Beach',
    displayName: 'Marina Beach, Chennai, Tamil Nadu, India',
    lat: 13.0533,
    lng: 80.2833,
    country: 'India',
    state: 'Tamil Nadu',
    type: 'beach',
  },
  {
    id: 'loc-mahabalipuram',
    name: 'Mahabalipuram Beach',
    displayName: 'Mahabalipuram Shore Temple Beach, Chengalpattu, Tamil Nadu, India',
    lat: 12.6196,
    lng: 80.1936,
    country: 'India',
    state: 'Tamil Nadu',
    type: 'beach',
  },
  {
    id: 'loc-rameswaram',
    name: 'Rameswaram (Dhanushkodi)',
    displayName: 'Dhanushkodi Coastal Point, Rameswaram Island, Tamil Nadu, India',
    lat: 9.2876,
    lng: 79.3129,
    country: 'India',
    state: 'Tamil Nadu',
    type: 'coast',
  },
  {
    id: 'loc-kanyakumari',
    name: 'Kanyakumari Beach',
    displayName: 'Cape Comorin Tri-Sea Beach, Kanyakumari, Tamil Nadu, India',
    lat: 8.0883,
    lng: 77.5385,
    country: 'India',
    state: 'Tamil Nadu',
    type: 'beach',
  },
  {
    id: 'loc-pondicherry',
    name: 'Pondicherry Promenade',
    displayName: 'Promenade Beach / Rock Beach, Puducherry, India',
    lat: 11.9338,
    lng: 79.8358,
    country: 'India',
    state: 'Puducherry',
    type: 'beach',
  },
  {
    id: 'loc-kovalam',
    name: 'Kovalam Beach',
    displayName: 'Lighthouse Beach, Kovalam, Thiruvananthapuram, Kerala, India',
    lat: 8.4021,
    lng: 76.9787,
    country: 'India',
    state: 'Kerala',
    type: 'beach',
  },
  {
    id: 'loc-varkala',
    name: 'Varkala Cliff Beach',
    displayName: 'Varkala Cliff Beach, Kollam-Trivandrum Coast, Kerala, India',
    lat: 8.7379,
    lng: 76.7032,
    country: 'India',
    state: 'Kerala',
    type: 'beach',
  },
  {
    id: 'loc-goa-baga',
    name: 'Baga & Calangute Beach',
    displayName: 'Baga Beach, North Goa, Goa, India',
    lat: 15.5553,
    lng: 73.7517,
    country: 'India',
    state: 'Goa',
    type: 'beach',
  },
  {
    id: 'loc-goa-palolem',
    name: 'Palolem Beach',
    displayName: 'Palolem Beach, Canacona, South Goa, India',
    lat: 15.0100,
    lng: 74.0232,
    country: 'India',
    state: 'Goa',
    type: 'beach',
  },
  {
    id: 'loc-mumbai-juhu',
    name: 'Juhu Beach (Mumbai)',
    displayName: 'Juhu Beach, Western Suburbs, Mumbai, Maharashtra, India',
    lat: 19.0988,
    lng: 72.8264,
    country: 'India',
    state: 'Maharashtra',
    type: 'beach',
  },
  {
    id: 'loc-mumbai-marinedrive',
    name: 'Marine Drive Coastal Front',
    displayName: 'Marine Drive Promontory, South Mumbai, Maharashtra, India',
    lat: 18.9432,
    lng: 72.8230,
    country: 'India',
    state: 'Maharashtra',
    type: 'coast',
  },
  {
    id: 'loc-alibaug',
    name: 'Alibaug Beach',
    displayName: 'Varsoli & Alibaug Coastal Beach, Raigad, Maharashtra, India',
    lat: 18.6584,
    lng: 72.8719,
    country: 'India',
    state: 'Maharashtra',
    type: 'beach',
  },
  {
    id: 'loc-puri',
    name: 'Puri Golden Beach',
    displayName: 'Golden Beach, Puri Coast, Odisha, India',
    lat: 19.8135,
    lng: 85.8312,
    country: 'India',
    state: 'Odisha',
    type: 'beach',
  },
  {
    id: 'loc-vizag-rk',
    name: 'Visakhapatnam RK Beach',
    displayName: 'Ramakrishna Beach, Visakhapatnam, Andhra Pradesh, India',
    lat: 17.7126,
    lng: 83.3196,
    country: 'India',
    state: 'Andhra Pradesh',
    type: 'beach',
  },
  {
    id: 'loc-gokarna',
    name: 'Gokarna Om Beach',
    displayName: 'Om Beach, Gokarna, Uttara Kannada, Karnataka, India',
    lat: 14.5173,
    lng: 74.3168,
    country: 'India',
    state: 'Karnataka',
    type: 'beach',
  },
  {
    id: 'loc-mangalore',
    name: 'Panambur Beach Mangalore',
    displayName: 'Panambur Port Beach, Mangaluru, Karnataka, India',
    lat: 12.9377,
    lng: 74.8021,
    country: 'India',
    state: 'Karnataka',
    type: 'beach',
  },
  {
    id: 'loc-kochi-port',
    name: 'Kochi Fort Beach',
    displayName: 'Fort Kochi Beach & Harbor Entrance, Kochi, Kerala, India',
    lat: 9.9674,
    lng: 76.2415,
    country: 'India',
    state: 'Kerala',
    type: 'beach',
  },
  {
    id: 'loc-digha',
    name: 'Digha Coastal Beach',
    displayName: 'New Digha Sea Beach, Purba Medinipur, West Bengal, India',
    lat: 21.6266,
    lng: 87.5075,
    country: 'India',
    state: 'West Bengal',
    type: 'beach',
  },
  {
    id: 'loc-mandvi',
    name: 'Mandvi Beach Kutch',
    displayName: 'Mandvi Wind Farm Beach, Gulf of Kutch, Gujarat, India',
    lat: 22.8277,
    lng: 69.3494,
    country: 'India',
    state: 'Gujarat',
    type: 'beach',
  },
  {
    id: 'loc-andaman-radhanagar',
    name: 'Radhanagar Beach',
    displayName: 'Radhanagar Beach (Beach #7), Havelock Island, Andaman & Nicobar, India',
    lat: 11.9840,
    lng: 92.9511,
    country: 'India',
    state: 'Andaman and Nicobar Islands',
    type: 'beach',
  },
  {
    id: 'loc-lakshadweep-agatti',
    name: 'Agatti Island Lagoon',
    displayName: 'Agatti Island Lagoon Reef, Lakshadweep, India',
    lat: 10.8530,
    lng: 72.1949,
    country: 'India',
    state: 'Lakshadweep',
    type: 'reef',
  },
  // Global Iconic Coastal Locations
  {
    id: 'loc-sydney-bondi',
    name: 'Bondi Beach',
    displayName: 'Bondi Beach, Sydney, New South Wales, Australia',
    lat: -33.8915,
    lng: 151.2767,
    country: 'Australia',
    state: 'New South Wales',
    type: 'beach',
  },
  {
    id: 'loc-bali-kuta',
    name: 'Kuta Beach (Bali)',
    displayName: 'Kuta Beach, Badung Regency, Bali, Indonesia',
    lat: -8.7185,
    lng: 115.1686,
    country: 'Indonesia',
    state: 'Bali',
    type: 'beach',
  },
  {
    id: 'loc-phuket-patong',
    name: 'Patong Beach (Phuket)',
    displayName: 'Patong Beach, Kathu District, Phuket, Thailand',
    lat: 7.8956,
    lng: 98.2970,
    country: 'Thailand',
    state: 'Phuket',
    type: 'beach',
  },
  {
    id: 'loc-malibu-surfrider',
    name: 'Malibu Surfrider Beach',
    displayName: 'Malibu Lagoon State Beach, California, United States',
    lat: 34.0357,
    lng: -118.6791,
    country: 'United States',
    state: 'California',
    type: 'beach',
  },
  {
    id: 'loc-hawaii-waikiki',
    name: 'Waikiki Beach (Honolulu)',
    displayName: 'Waikiki Beach, Honolulu, Hawaii, United States',
    lat: 21.2766,
    lng: -157.8272,
    country: 'United States',
    state: 'Hawaii',
    type: 'beach',
  },
  {
    id: 'loc-rio-copacabana',
    name: 'Copacabana Beach',
    displayName: 'Copacabana Beach, Rio de Janeiro, Brazil',
    lat: -22.9711,
    lng: -43.1822,
    country: 'Brazil',
    state: 'Rio de Janeiro',
    type: 'beach',
  },
];

// Weather code translation
function weatherCodeToText(code?: number): string {
  if (code === undefined || code === null) return 'Coastal Maritime Weather';
  if (code === 0) return 'Clear Sky & Calm Visibility';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast Oceanic Clouds';
  if (code === 45 || code === 48) return 'Marine Fog / Haze';
  if (code >= 51 && code <= 55) return 'Light Coastal Drizzle';
  if (code >= 61 && code <= 65) return 'Moderate Rain & Sea Chop';
  if (code >= 80 && code <= 82) return 'Heavy Oceanic Rain Showers';
  if (code >= 95) return 'Severe Thunderstorm & High Sea Squalls';
  return 'Cloudy / Maritime Sea Breeze';
}

function degreesToCompass(deg: number): string {
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

class MarineService {
  /**
   * Dynamic search for ANY beach, coastal town, port or maritime place.
   * Leverages OpenStreetMap Nominatim geocoding + Curated marine index.
   */
  public async searchCoastalLocations(query: string): Promise<LocationSearchResult[]> {
    const cleanQuery = (query || '').trim();
    if (!cleanQuery) {
      return CURATED_COASTAL_LOCATIONS.slice(0, 10);
    }

    const lower = cleanQuery.toLowerCase();

    // 1. Search curated list first for instant high-confidence coastal match
    const curatedMatches = CURATED_COASTAL_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(lower) ||
        loc.displayName.toLowerCase().includes(lower) ||
        (loc.state && loc.state.toLowerCase().includes(lower)) ||
        (loc.country && loc.country.toLowerCase().includes(lower))
    );

    // 2. Query OpenStreetMap Nominatim with safety timeout
    let externalResults: LocationSearchResult[] = [];
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      // Search with beach / coast context if plain query
      const encoded = encodeURIComponent(cleanQuery);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=8&addressdetails=1`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'WavePredictionCoastalAlerts/2.0 (contact: support@wavepredict.org; maritime-research-applet)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          externalResults = data.map((item: any) => {
            const addr = item.address || {};
            const country = addr.country || '';
            const state = addr.state || addr.county || addr.region || '';
            const name = item.name || item.display_name.split(',')[0].trim();

            return {
              id: `geo-${item.place_id || item.osm_id || Math.random().toString(36).substring(2, 9)}`,
              name,
              displayName: item.display_name,
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              country,
              state,
              type: item.type || item.class || 'coastal_location',
            };
          });
        }
      }
    } catch (err: any) {
      console.warn('Nominatim geocoding request warning:', err?.message || err);
    }

    // Merge and deduplicate by proximity (lat/lng within 0.05 degrees)
    const combined: LocationSearchResult[] = [...curatedMatches];
    for (const ext of externalResults) {
      const isDuplicate = combined.some(
        (c) => Math.abs(c.lat - ext.lat) < 0.04 && Math.abs(c.lng - ext.lng) < 0.04
      );
      if (!isDuplicate) {
        combined.push(ext);
      }
    }

    return combined.slice(0, 12);
  }

  /**
   * Fetches Real-Time Marine & Weather data from Open-Meteo APIs for any (lat, lng).
   * Automatically adapts inputs, generates ML prediction, calculates coastal risk,
   * and provides a defensive realistic simulation fallback if offline.
   */
  public async getLiveMarineData(
    lat: number,
    lng: number,
    locationName: string,
    regionName?: string
  ): Promise<{
    station: OceanCondition;
    mlPrediction: any;
    dataSource: string;
    status: 'LIVE_DATA' | 'FORECAST' | 'SIMULATED';
    lastUpdated: string;
    isSimulated: boolean;
    simulationReason?: string;
  }> {
    const formattedRegion = regionName || `Coastal Sector (Lat: ${lat.toFixed(2)}°, Lng: ${lng.toFixed(2)}°)`;
    let isSimulated = false;
    let simulationReason: string | undefined = undefined;
    let dataSource = 'Open-Meteo Marine & Weather API';
    let status: 'LIVE_DATA' | 'FORECAST' | 'SIMULATED' = 'LIVE_DATA';

    let waveHeight = 1.4;
    let wavePeriod = 8.5;
    let waveDirectionDeg = 180;
    let waveDirection = 'S';
    let windSpeed = 26.0;
    let windDirectionDeg = 200;
    let windDirection = 'SSW';
    let waterTemp = 28.2;
    let pressure = 1010.5;
    let weatherCode = 1;
    let visibility = 10.0;
    let hourlyForecast: Array<{ time: string; waveHeight: number; wavePeriod: number; windSpeed: number }> = [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // 1. Fetch Marine API (Wave height, period, direction, swell)
      const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_direction,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period&hourly=wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height&timezone=auto`;

      // 2. Fetch Weather API (Wind speed, direction, pressure, temp, weather code)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code&hourly=temperature_2m,wind_speed_10m,surface_pressure&wind_speed_unit=kmh&timezone=auto`;

      const [marineRes, weatherRes] = await Promise.allSettled([
        fetch(marineUrl, { signal: controller.signal }),
        fetch(weatherUrl, { signal: controller.signal }),
      ]);

      clearTimeout(timeoutId);

      let marineData: any = null;
      let weatherData: any = null;

      if (marineRes.status === 'fulfilled' && marineRes.value.ok) {
        marineData = await marineRes.value.json();
      }
      if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
        weatherData = await weatherRes.value.json();
      }

      // If marineData didn't return wave_height (coordinate is slightly inland on the beach sand)
      // try a quick offshore offset of 0.08 deg
      if (!marineData?.current?.wave_height && marineData?.current?.wave_height !== 0) {
        try {
          const offshoreLng = lng + (lng > 78 ? 0.08 : -0.08); // Sea side offset depending on subcontinental coast
          const retryRes = await fetch(
            `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${offshoreLng}&current=wave_height,wave_direction,wave_period&hourly=wave_height,wave_period&timezone=auto`
          );
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            if (retryData?.current?.wave_height != null) {
              marineData = retryData;
            }
          }
        } catch {
          // continue with weather coupling
        }
      }

      // Parse Weather parameters
      if (weatherData?.current) {
        const cur = weatherData.current;
        if (cur.wind_speed_10m != null) windSpeed = Number(cur.wind_speed_10m.toFixed(1));
        if (cur.wind_direction_10m != null) {
          windDirectionDeg = Math.round(cur.wind_direction_10m);
          windDirection = degreesToCompass(windDirectionDeg);
        }
        if (cur.surface_pressure != null) pressure = Number(cur.surface_pressure.toFixed(1));
        if (cur.temperature_2m != null) waterTemp = Number(cur.temperature_2m.toFixed(1));
        if (cur.weather_code != null) weatherCode = cur.weather_code;
      }

      // Parse Marine wave parameters
      if (marineData?.current && marineData.current.wave_height != null) {
        const mCur = marineData.current;
        waveHeight = Number(mCur.wave_height.toFixed(2));
        if (mCur.wave_period != null) wavePeriod = Number(mCur.wave_period.toFixed(1));
        if (mCur.wave_direction != null) {
          waveDirectionDeg = Math.round(mCur.wave_direction);
          waveDirection = degreesToCompass(waveDirectionDeg);
        }

        // Build 24-hour forecast from Open-Meteo hourly
        if (marineData.hourly?.time && Array.isArray(marineData.hourly.time)) {
          const times = marineData.hourly.time.slice(0, 24);
          const heights = marineData.hourly.wave_height || [];
          const periods = marineData.hourly.wave_period || [];
          const winds = weatherData?.hourly?.wind_speed_10m || [];

          hourlyForecast = times.map((t: string, idx: number) => ({
            time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            waveHeight: Number((heights[idx] != null ? heights[idx] : waveHeight).toFixed(2)),
            wavePeriod: Number((periods[idx] != null ? periods[idx] : wavePeriod).toFixed(1)),
            windSpeed: Number((winds[idx] != null ? winds[idx] : windSpeed).toFixed(1)),
          }));
        }
      } else {
        // If marine API returned no wave grid, couple with atmospheric wind physics
        waveHeight = Math.max(0.4, Number(((windSpeed / 30) ** 1.3 * 0.9 + 0.35).toFixed(2)));
        wavePeriod = Math.max(4.2, Number((4.8 + Math.sqrt(windSpeed) * 0.75).toFixed(1)));
        waveDirectionDeg = (windDirectionDeg + 15) % 360;
        waveDirection = degreesToCompass(waveDirectionDeg);
      }

      // Check if both APIs failed
      if (!marineData && !weatherData) {
        throw new Error('Real-time marine API endpoint unresponsive');
      }
    } catch (err: any) {
      console.warn('Real-time marine API offline/unreachable, applying simulated fallback:', err?.message || err);
      isSimulated = true;
      simulationReason = 'Live data temporarily unavailable – showing simulated/demo data.';
      dataSource = 'Oceanographic Dynamic Simulation Model';
      status = 'SIMULATED';

      // Realistic diurnal physics calculation based on coordinates
      const timeHour = new Date().getHours();
      const tideFactor = Math.sin((timeHour / 12) * Math.PI) * 0.5;
      waveHeight = Math.max(0.6, Number((1.8 + tideFactor + Math.sin(lat) * 0.4).toFixed(2)));
      wavePeriod = Number((8.2 + Math.cos(lng) * 1.5).toFixed(1));
      windSpeed = Math.max(12, Number((32 + tideFactor * 8).toFixed(1)));
      waterTemp = 28.5;
      pressure = 1008.5;
      waveDirection = 'SW';
      waveDirectionDeg = 225;
      windDirection = 'WSW';
      windDirectionDeg = 240;

      // Synthetic 24-hr forecast
      const now = Date.now();
      for (let i = 0; i < 24; i++) {
        const fTime = new Date(now + i * 3600 * 1000);
        const fTide = Math.sin(((timeHour + i) / 12) * Math.PI) * 0.6;
        hourlyForecast.push({
          time: fTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          waveHeight: Math.max(0.5, Number((waveHeight + fTide).toFixed(2))),
          wavePeriod: Math.max(4.5, Number((wavePeriod + Math.sin(i * 0.3) * 0.8).toFixed(1))),
          windSpeed: Math.max(10, Number((windSpeed + Math.cos(i * 0.4) * 6).toFixed(1))),
        });
      }
    }

    // Compute Coastal Risk using live parameters
    const riskAnalysis = calculateCoastalRisk(
      waveHeight,
      wavePeriod,
      windSpeed,
      pressure,
      0.9,
      db.getThresholds()
    );

    // Run ML Wave Prediction on these live ocean parameters
    const mlInference = mlEngine.predict({
      location: locationName,
      latitude: lat,
      longitude: lng,
      waveHeight,
      wavePeriod,
      windSpeed,
      windDirection,
      waveDirection,
      waterTemperature: waterTemp,
      pressure,
      currentSpeed: 0.8,
      currentDirection: 'NE',
    });

    const stationId = `stn-dyn-${encodeURIComponent(locationName.toLowerCase().replace(/[^a-z0-9]/g, '-')).substring(0, 30)}-${Math.round(lat * 100)}`;

    const stationRecord: OceanCondition = {
      id: stationId,
      stationName: locationName,
      region: formattedRegion,
      lat,
      lng,
      waveHeight,
      wavePeriod,
      windSpeed,
      windDirection,
      windDirectionDeg,
      waveDirection,
      waveDirectionDeg,
      waterTemperature: waterTemp,
      pressure,
      currentSpeed: 0.8,
      currentDirection: 'NE',
      visibility,
      riskLevel: riskAnalysis.riskLevel,
      lastUpdated: new Date().toISOString(),
      dataSource,
      dataStatus: status,
      weatherCondition: weatherCodeToText(weatherCode),
      weatherCode,
      forecast: hourlyForecast,
      isCustomSearched: true,
    };

    // Upsert into memory/database so it's instantly available in the dashboard, Leaflet map, etc.
    db.upsertOceanCondition(stationRecord);

    // Save into search history
    db.recordSearchedLocation({
      id: `srch-${Date.now()}`,
      name: locationName,
      lat,
      lng,
      region: formattedRegion,
      lastSearchedAt: new Date().toISOString(),
      latestWaveHeight: waveHeight,
      latestRiskLevel: riskAnalysis.riskLevel,
      dataSource,
    });

    return {
      station: stationRecord,
      mlPrediction: {
        predictedWaveHeight: mlInference.predictedWaveHeight,
        predictedWavePeriod: mlInference.predictedWavePeriod,
        predictedWaveCategory: riskAnalysis.waveCategory,
        riskLevel: riskAnalysis.riskLevel,
        confidenceScore: mlInference.confidenceScore,
        predictionTime: new Date().toISOString(),
        explanation: riskAnalysis.explanation,
        recommendedAction: riskAnalysis.recommendedAction,
      },
      dataSource,
      status,
      lastUpdated: new Date().toISOString(),
      isSimulated,
      simulationReason,
    };
  }
}

export const marineService = new MarineService();
