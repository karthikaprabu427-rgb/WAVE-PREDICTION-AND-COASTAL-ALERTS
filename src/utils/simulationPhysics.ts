import { OceanCondition, RiskLevel, RiskThresholds } from '../types';
import { calculateCoastalRisk } from '../../server/riskCalculator';

export interface StationDelta {
  waveDelta: number;
  windDelta: number;
  tempDelta: number;
  periodDelta: number;
  pressureDelta: number;
}

// Station Baselines for mean-reversion so values drift naturally within plausible physical limits
export const STATION_BASELINES: Record<string, { waveHeight: number; windSpeed: number; waterTemp: number; pressure: number; wavePeriod: number }> = {
  'stn-chennai': { waveHeight: 3.0, windSpeed: 45.0, waterTemp: 28.5, pressure: 1005.0, wavePeriod: 10.0 },
  'stn-mumbai': { waveHeight: 4.2, windSpeed: 70.0, waterTemp: 27.0, pressure: 995.0, wavePeriod: 12.5 },
  'stn-goa': { waveHeight: 2.0, windSpeed: 30.0, waterTemp: 29.0, pressure: 1011.0, wavePeriod: 8.5 },
  'stn-vizag': { waveHeight: 2.7, windSpeed: 42.0, waterTemp: 28.0, pressure: 1008.0, wavePeriod: 9.0 },
  'stn-kochi': { waveHeight: 1.3, windSpeed: 20.0, waterTemp: 29.5, pressure: 1013.0, wavePeriod: 6.8 },
  'stn-kanyakumari': { waveHeight: 3.5, windSpeed: 50.0, waterTemp: 27.8, pressure: 1006.0, wavePeriod: 11.2 },
  'stn-puri': { waveHeight: 2.3, windSpeed: 36.0, waterTemp: 28.4, pressure: 1009.0, wavePeriod: 8.8 },
  'stn-portblair': { waveHeight: 1.2, windSpeed: 16.0, waterTemp: 30.0, pressure: 1013.0, wavePeriod: 6.0 },
  'stn-dwarka': { waveHeight: 2.8, windSpeed: 45.0, waterTemp: 26.5, pressure: 1008.0, wavePeriod: 9.5 },
};

const COMPASS_DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function degToCompass(deg: number): string {
  const val = Math.floor((deg / 22.5) + 0.5);
  return COMPASS_DIRECTIONS[val % 16];
}

/**
 * Generates plausible, physically coupled variations for ocean conditions.
 * - Mean-reverting stochastic Ornstein-Uhlenbeck drift
 * - Wind-wave coupling (gusts amplify wave heights)
 * - Diurnal thermal stability (water has high heat capacity -> small shifts)
 * - Barometric coupling with wind surges
 */
export function simulatePlausibleStationUpdate(
  current: OceanCondition,
  thresholds?: RiskThresholds
): { updated: OceanCondition; delta: StationDelta } {
  const baseline = STATION_BASELINES[current.id] || {
    waveHeight: current.waveHeight,
    windSpeed: current.windSpeed,
    waterTemp: current.waterTemperature,
    pressure: current.pressure,
    wavePeriod: current.wavePeriod,
  };

  // Mean-reversion factor (pulls gently toward baseline)
  const waveMeanReversion = -0.08 * (current.waveHeight - baseline.waveHeight);
  const windMeanReversion = -0.06 * (current.windSpeed - baseline.windSpeed);
  const tempMeanReversion = -0.05 * (current.waterTemperature - baseline.waterTemp);
  const pressureMeanReversion = -0.07 * (current.pressure - baseline.pressure);

  // Random stochastic fluctuation (Box-Muller gaussian or uniform micro-steps)
  const randNorm1 = (Math.random() - 0.5) * 2;
  const randNorm2 = (Math.random() - 0.5) * 2;
  const randNorm3 = (Math.random() - 0.5) * 2;

  // 1. Wind speed variation (±0.8 to ±3.2 km/h)
  const windDelta = parseFloat((windMeanReversion + randNorm1 * 1.8).toFixed(1));
  const newWindSpeed = Math.max(6.0, Math.min(115.0, parseFloat((current.windSpeed + windDelta).toFixed(1))));

  // 2. Wave height variation coupled with wind change (±0.04m to ±0.22m)
  const windCoupling = (newWindSpeed - current.windSpeed) * 0.025;
  const waveDelta = parseFloat((waveMeanReversion + randNorm2 * 0.12 + windCoupling).toFixed(2));
  const newWaveHeight = Math.max(0.4, Math.min(8.5, parseFloat((current.waveHeight + waveDelta).toFixed(2))));

  // 3. Peak Wave Period (coupled to wave height dynamics: longer period for higher swell)
  const periodCoupling = (newWaveHeight - current.waveHeight) * 0.4;
  const periodDelta = parseFloat((randNorm3 * 0.15 + periodCoupling).toFixed(1));
  const newWavePeriod = Math.max(3.5, Math.min(16.0, parseFloat((current.wavePeriod + periodDelta).toFixed(1))));

  // 4. Sea Temperature (gradual thermal drift: ±0.03°C to ±0.12°C)
  const tempDelta = parseFloat((tempMeanReversion + (Math.random() - 0.5) * 0.1).toFixed(2));
  const newWaterTemp = Math.max(18.0, Math.min(33.0, parseFloat((current.waterTemperature + tempDelta).toFixed(1))));

  // 5. Atmospheric Pressure (inversely correlated with wind surges: ±0.2 to ±0.7 hPa)
  const pressureDelta = parseFloat((pressureMeanReversion - (windDelta * 0.1) + (Math.random() - 0.5) * 0.4).toFixed(1));
  const newPressure = Math.max(965.0, Math.min(1030.0, parseFloat((current.pressure + pressureDelta).toFixed(1))));

  // 6. Current speed (minor ocean current drift)
  const currentDelta = (Math.random() - 0.5) * 0.1;
  const newCurrentSpeed = Math.max(0.2, Math.min(3.5, parseFloat((current.currentSpeed + currentDelta).toFixed(1))));

  // 7. Wind and Wave direction gentle bearing shift (±1° to ±5°)
  const windDegShift = Math.floor((Math.random() - 0.5) * 8);
  const newWindDeg = (current.windDirectionDeg + windDegShift + 360) % 360;
  const newWindDir = degToCompass(newWindDeg);

  const waveDegShift = Math.floor((Math.random() - 0.5) * 6);
  const newWaveDeg = (current.waveDirectionDeg + waveDegShift + 360) % 360;
  const newWaveDir = degToCompass(newWaveDeg);

  // Recalculate Risk Level using the updated physical variables
  const riskResult = calculateCoastalRisk(
    newWaveHeight,
    newWavePeriod,
    newWindSpeed,
    newPressure,
    newCurrentSpeed,
    thresholds
  );

  const updated: OceanCondition = {
    ...current,
    waveHeight: newWaveHeight,
    wavePeriod: newWavePeriod,
    windSpeed: newWindSpeed,
    windDirection: newWindDir,
    windDirectionDeg: newWindDeg,
    waveDirection: newWaveDir,
    waveDirectionDeg: newWaveDeg,
    waterTemperature: newWaterTemp,
    pressure: newPressure,
    currentSpeed: newCurrentSpeed,
    riskLevel: riskResult.riskLevel,
    lastUpdated: new Date().toISOString(),
  };

  return {
    updated,
    delta: {
      waveDelta: parseFloat((newWaveHeight - current.waveHeight).toFixed(2)),
      windDelta: parseFloat((newWindSpeed - current.windSpeed).toFixed(1)),
      tempDelta: parseFloat((newWaterTemp - current.waterTemperature).toFixed(2)),
      periodDelta: parseFloat((newWavePeriod - current.wavePeriod).toFixed(1)),
      pressureDelta: parseFloat((newPressure - current.pressure).toFixed(1)),
    },
  };
}
