import React, { useEffect, useRef } from 'react';
import { useOceanData } from '../context/OceanDataContext';
import { useEmergencyAlert } from '../context/EmergencyAlertContext';
import { usePublicAnnouncer } from '../context/PublicAnnouncerContext';
import { OceanCondition } from '../types';

/**
 * EmergencyBridge monitors live ocean telemetry, searched locations,
 * and simulation updates, synchronizing hazard conditions with EmergencyAlertContext,
 * and automatically triggering multilingual line-by-line radio broadcasts when coastal regions reach high risk.
 */
export const EmergencyBridge: React.FC = () => {
  const { selectedStation, stations } = useOceanData();
  const { evaluateStation, activeRiskLevel } = useEmergencyAlert();

  const prevStationStateRef = useRef<string>('');

  useEffect(() => {
    // 1. Determine most critical station between selectedStation and station list
    let targetStation: OceanCondition | null = selectedStation;

    // If selectedStation is low/moderate or absent, check if there is an active extreme or high station in the network
    if (!targetStation || (targetStation.riskLevel !== 'CRITICAL' && targetStation.riskLevel !== 'HIGH')) {
      const extremeStation = stations.find((s) => s.riskLevel === 'CRITICAL');
      const highStation = stations.find((s) => s.riskLevel === 'HIGH');
      if (extremeStation) {
        targetStation = extremeStation;
      } else if (highStation) {
        targetStation = highStation;
      }
    }

    if (!targetStation) {
      if (activeRiskLevel !== 'LOW') {
        evaluateStation(null);
      }
      return;
    }

    const stateKey = `${targetStation.id}_${targetStation.riskLevel}_${targetStation.waveHeight.toFixed(1)}_${targetStation.windSpeed.toFixed(0)}`;

    if (stateKey !== prevStationStateRef.current) {
      prevStationStateRef.current = stateKey;
      evaluateStation(targetStation);
    }
  }, [selectedStation, stations, evaluateStation, activeRiskLevel]);

  return null;
};
