import { OceanCondition, RiskLevel, RiskThresholds } from '../src/types';
import { calculateCoastalRisk } from './riskCalculator';

export interface StationDelta {
  waveDelta: number;
  windDelta: number;
  tempDelta: number;
  periodDelta: number;
  pressureDelta: number;
}

export const STATION_BASELINES: Record<string, { waveHeight: number; windSpeed: number; waterTemp: number; pressure: number; wavePeriod: number }> = {
  'stn-chennai': { waveHeight: 3.1, windSpeed: 48.5, waterTemp: 28.6, pressure: 1004.2, wavePeriod: 10.4 },
  'stn-mumbai': { waveHeight: 4.3, windSpeed: 74.0, waterTemp: 27.2, pressure: 994.0, wavePeriod: 12.8 },
  'stn-goa': { waveHeight: 2.1, windSpeed: 32.0, waterTemp: 29.0, pressure: 1011.5, wavePeriod: 8.5 },
  'stn-vizag': { waveHeight: 2.8, windSpeed: 44.0, waterTemp: 28.1, pressure: 1007.8, wavePeriod: 9.2 },
  'stn-kochi': { waveHeight: 1.3, windSpeed: 21.0, waterTemp: 29.4, pressure: 1012.8, wavePeriod: 6.8 },
  'stn-kanyakumari': { waveHeight: 3.6, windSpeed: 52.0, waterTemp: 27.8, pressure: 1006.1, wavePeriod: 11.5 },
  'stn-puri': { waveHeight: 2.4, windSpeed: 38.0, waterTemp: 28.5, pressure: 1009.4, wavePeriod: 8.8 },
  'stn-portblair': { waveHeight: 1.1, windSpeed: 16.0, waterTemp: 30.1, pressure: 1013.2, wavePeriod: 5.9 },
  'stn-dwarka': { waveHeight: 2.9, windSpeed: 46.0, waterTemp: 26.5, pressure: 1008.0, wavePeriod: 9.6 },
};

const COMPASS_DIRECTIONS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function degToCompass(deg: number): string {
  const val = Math.floor((deg / 22.5) + 0.5);
  return COMPASS_DIRECTIONS[val % 16];
}

export function simulateStationStep(
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

  const waveMeanReversion = -0.08 * (current.waveHeight - baseline.waveHeight);
  const windMeanReversion = -0.06 * (current.windSpeed - baseline.windSpeed);
  const tempMeanReversion = -0.05 * (current.waterTemperature - baseline.waterTemp);
  const pressureMeanReversion = -0.07 * (current.pressure - baseline.pressure);

  const randNorm1 = (Math.random() - 0.5) * 2;
  const randNorm2 = (Math.random() - 0.5) * 2;
  const randNorm3 = (Math.random() - 0.5) * 2;

  const windDelta = parseFloat((windMeanReversion + randNorm1 * 1.8).toFixed(1));
  const newWindSpeed = Math.max(6.0, Math.min(115.0, parseFloat((current.windSpeed + windDelta).toFixed(1))));

  const windCoupling = (newWindSpeed - current.windSpeed) * 0.025;
  const waveDelta = parseFloat((waveMeanReversion + randNorm2 * 0.12 + windCoupling).toFixed(2));
  const newWaveHeight = Math.max(0.4, Math.min(8.5, parseFloat((current.waveHeight + waveDelta).toFixed(2))));

  const periodCoupling = (newWaveHeight - current.waveHeight) * 0.4;
  const periodDelta = parseFloat((randNorm3 * 0.15 + periodCoupling).toFixed(1));
  const newWavePeriod = Math.max(3.5, Math.min(16.0, parseFloat((current.wavePeriod + periodDelta).toFixed(1))));

  const tempDelta = parseFloat((tempMeanReversion + (Math.random() - 0.5) * 0.1).toFixed(2));
  const newWaterTemp = Math.max(18.0, Math.min(33.0, parseFloat((current.waterTemperature + tempDelta).toFixed(1))));

  const pressureDelta = parseFloat((pressureMeanReversion - (windDelta * 0.1) + (Math.random() - 0.5) * 0.4).toFixed(1));
  const newPressure = Math.max(965.0, Math.min(1030.0, parseFloat((current.pressure + pressureDelta).toFixed(1))));

  const currentDelta = (Math.random() - 0.5) * 0.1;
  const newCurrentSpeed = Math.max(0.2, Math.min(3.5, parseFloat((current.currentSpeed + currentDelta).toFixed(1))));

  const windDegShift = Math.floor((Math.random() - 0.5) * 8);
  const newWindDeg = (current.windDirectionDeg + windDegShift + 360) % 360;
  const newWindDir = degToCompass(newWindDeg);

  const waveDegShift = Math.floor((Math.random() - 0.5) * 6);
  const newWaveDeg = (current.waveDirectionDeg + waveDegShift + 360) % 360;
  const newWaveDir = degToCompass(newWaveDeg);

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
