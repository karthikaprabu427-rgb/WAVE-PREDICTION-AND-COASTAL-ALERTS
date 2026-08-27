import { RiskLevel, RiskThresholds } from '../src/types';

export const defaultRiskThresholds: RiskThresholds = {
  lowMaxWaveHeight: 1.5,
  modMaxWaveHeight: 2.5,
  highMaxWaveHeight: 4.0,
  highWindSpeed: 45.0,
  criticalWindSpeed: 70.0,
};

let currentThresholds: RiskThresholds = { ...defaultRiskThresholds };

export function getRiskThresholds(): RiskThresholds {
  return currentThresholds;
}

export function updateRiskThresholds(newThresholds: Partial<RiskThresholds>): RiskThresholds {
  currentThresholds = { ...currentThresholds, ...newThresholds };
  return currentThresholds;
}

export interface RiskAnalysis {
  riskLevel: RiskLevel;
  waveCategory: string;
  riskScore: number; // 0 to 100
  explanation: string;
  recommendedAction: string;
}

/**
 * Calculates Coastal Risk based on standard Oceanographic and WMO hazard indexes:
 * Parameters:
 * - Significant Wave Height (Hs)
 * - Peak Wave Period (Tp)
 * - Sustained Wind Speed (U10)
 * - Atmospheric Pressure anomaly (Pn)
 * - Surface Current velocity (Vc)
 */
export function calculateCoastalRisk(
  waveHeight: number,
  wavePeriod: number,
  windSpeed: number,
  pressure: number = 1013,
  currentSpeed: number = 0.5,
  thresholds: RiskThresholds = currentThresholds
): RiskAnalysis {
  let score = 0;

  // Wave Height factor (0 - 45 points)
  if (waveHeight <= thresholds.lowMaxWaveHeight) {
    score += (waveHeight / thresholds.lowMaxWaveHeight) * 15;
  } else if (waveHeight <= thresholds.modMaxWaveHeight) {
    score += 15 + ((waveHeight - thresholds.lowMaxWaveHeight) / (thresholds.modMaxWaveHeight - thresholds.lowMaxWaveHeight)) * 15;
  } else if (waveHeight <= thresholds.highMaxWaveHeight) {
    score += 30 + ((waveHeight - thresholds.modMaxWaveHeight) / (thresholds.highMaxWaveHeight - thresholds.modMaxWaveHeight)) * 10;
  } else {
    score += 40 + Math.min(10, (waveHeight - thresholds.highMaxWaveHeight) * 3);
  }

  // Wind Speed factor (0 - 25 points)
  if (windSpeed <= 25) {
    score += (windSpeed / 25) * 8;
  } else if (windSpeed <= thresholds.highWindSpeed) {
    score += 8 + ((windSpeed - 25) / (thresholds.highWindSpeed - 25)) * 10;
  } else {
    score += 18 + Math.min(7, ((windSpeed - thresholds.highWindSpeed) / (thresholds.criticalWindSpeed - thresholds.highWindSpeed)) * 7);
  }

  // Wave Period energy factor (Long period swells carry disproportionately high coastal energy) (0 - 15 points)
  if (wavePeriod > 14) {
    score += 14;
  } else if (wavePeriod > 10) {
    score += 9;
  } else if (wavePeriod > 6) {
    score += 5;
  } else {
    score += 2;
  }

  // Pressure depression factor (cyclonic / storm depression) (0 - 10 points)
  if (pressure < 990) {
    score += 10;
  } else if (pressure < 1000) {
    score += 7;
  } else if (pressure < 1008) {
    score += 3;
  }

  // Current velocity factor (0 - 5 points)
  if (currentSpeed > 2.0) {
    score += 5;
  } else if (currentSpeed > 1.2) {
    score += 3;
  } else {
    score += 1;
  }

  score = Math.min(100, Math.max(0, Math.round(score)));

  let riskLevel: RiskLevel = 'LOW';
  let waveCategory = 'Calm to Slight Sea';
  let explanation = '';
  let recommendedAction = '';

  if (waveHeight >= thresholds.highMaxWaveHeight || windSpeed >= thresholds.criticalWindSpeed || score >= 75) {
    riskLevel = 'CRITICAL';
    waveCategory = 'Very Rough to Phenomenal Sea';
    explanation = `Severe coastal conditions detected. Significant wave height (${waveHeight.toFixed(1)}m) combined with strong wind forces (${windSpeed.toFixed(0)} km/h) presents extreme hazard for vessels, harbor operations, and shorelines.`;
    recommendedAction = 'Immediate warning: Suspend all maritime and beach activities. Vessels should remain in port or seek deep-water refuge. Follow local emergency directives.';
  } else if (waveHeight >= thresholds.modMaxWaveHeight || windSpeed >= thresholds.highWindSpeed || score >= 50) {
    riskLevel = 'HIGH';
    waveCategory = 'Rough Swell / High Sea';
    explanation = `High risk conditions with wave heights of ${waveHeight.toFixed(1)}m and wind speeds of ${windSpeed.toFixed(0)} km/h. Dangerous surf zones, rip currents, and reduced navigational safety.`;
    recommendedAction = 'Small craft advisory in effect. Recreational swimming and offshore angling are prohibited. Commercial operators must exercise extreme caution.';
  } else if (waveHeight >= thresholds.lowMaxWaveHeight || windSpeed >= 30 || score >= 25) {
    riskLevel = 'MODERATE';
    waveCategory = 'Moderate Chop / Gentle Swell';
    explanation = `Moderate ocean activity with wave heights of ${waveHeight.toFixed(1)}m. Sea surface is choppy with occasional whitecaps and breaking coastal swells.`;
    recommendedAction = 'Caution advised for small watercraft and beachgoers. Monitor continuous coastal forecasts for sudden weather shifts.';
  } else {
    riskLevel = 'LOW';
    waveCategory = 'Calm to Smooth Sea';
    explanation = `Favorable ocean and coastal meteorological conditions with wave height of ${waveHeight.toFixed(1)}m and calm winds (${windSpeed.toFixed(0)} km/h).`;
    recommendedAction = 'Normal coastal activities and navigation permitted under standard marine safety guidelines.';
  }

  return {
    riskLevel,
    waveCategory,
    riskScore: score,
    explanation,
    recommendedAction,
  };
}
