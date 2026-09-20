import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { OceanCondition, RiskLevel } from '../types';
import { emergencyAudio } from '../utils/emergencyAudio';
import {
  coastalVoiceBroadcast,
  CoastalVoiceState,
  EmergencyLanguageKey,
  EMERGENCY_LANGUAGES,
} from '../utils/coastalVoiceBroadcast';

export interface EmergencyAlertContextType {
  activeRiskLevel: RiskLevel;
  isHighRisk: boolean;
  isExtremeRisk: boolean;
  emergencyStation: OceanCondition | null;
  isModalOpen: boolean;
  isMuted: boolean;
  isAudioBlocked: boolean;
  isAcknowledged: boolean;
  lastAcknowledgedConditionId: string | null;
  activeNotificationToast: {
    id: string;
    title: string;
    message: string;
    severity: 'caution' | 'warning' | 'danger';
    location: string;
    waveHeight: number;
    riskLevel: RiskLevel;
  } | null;
  voiceState: CoastalVoiceState;
  enableAudio: () => Promise<void>;
  toggleMute: () => void;
  acknowledgeAlert: () => void;
  openAlertModal: () => void;
  closeAlertModal: () => void;
  dismissNotificationToast: () => void;
  triggerSimulatedHazard: (level: 'HIGH' | 'EXTREME', locationName?: string, waveHeight?: number) => void;
  resolveHazard: () => void;
  evaluateStation: (station: OceanCondition | null) => void;
  playVoiceAnnouncement: (lang?: EmergencyLanguageKey) => Promise<boolean>;
  playEmergencyAnnouncement: (lang?: EmergencyLanguageKey) => Promise<boolean>;
  stopVoiceAnnouncement: () => void;
  testVoiceAnnouncement: (lang?: EmergencyLanguageKey) => Promise<boolean>;
  broadcastAll5Languages: (locationName?: string) => Promise<boolean>;
  playHighRiskRegionalBroadcast: (lang: EmergencyLanguageKey, locationName?: string) => Promise<boolean>;
  setVoiceLanguage: (lang: EmergencyLanguageKey | null) => void;
}

const EmergencyAlertContext = createContext<EmergencyAlertContextType | undefined>(undefined);

export const EmergencyAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRiskLevel, setActiveRiskLevel] = useState<RiskLevel>('LOW');
  const [emergencyStation, setEmergencyStation] = useState<OceanCondition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(coastalVoiceBroadcast.getIsMuted());
  const [isAudioBlocked, setIsAudioBlocked] = useState<boolean>(false);
  const [isAcknowledged, setIsAcknowledged] = useState<boolean>(false);
  const [lastAcknowledgedConditionId, setLastAcknowledgedConditionId] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<CoastalVoiceState>(coastalVoiceBroadcast.getState());
  const [activeNotificationToast, setActiveNotificationToast] = useState<{
    id: string;
    title: string;
    message: string;
    severity: 'caution' | 'warning' | 'danger';
    location: string;
    waveHeight: number;
    riskLevel: RiskLevel;
  } | null>(null);

  // Keep track of previous risk level to detect escalation and resolution
  const prevRiskLevelRef = useRef<RiskLevel>('LOW');

  // Subscribe to coastalVoiceBroadcast state
  useEffect(() => {
    const unsubscribe = coastalVoiceBroadcast.subscribe((newState) => {
      setVoiceState(newState);
      setIsMuted(newState.isMuted);
      setIsAudioBlocked(newState.autoplayBlocked);
    });
    return unsubscribe;
  }, []);

  const enableAudio = async () => {
    coastalVoiceBroadcast.unlockUserGesture();
    setIsAudioBlocked(false);
    if ((activeRiskLevel === 'HIGH' || activeRiskLevel === 'CRITICAL') && !isAcknowledged && !isMuted) {
      coastalVoiceBroadcast.playAnnouncement();
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    coastalVoiceBroadcast.setMuted(nextMuted);
    emergencyAudio.setMuted(nextMuted);
    if (nextMuted) {
      coastalVoiceBroadcast.stopAnnouncement();
    } else {
      if ((activeRiskLevel === 'HIGH' || activeRiskLevel === 'CRITICAL') && !isAcknowledged) {
        coastalVoiceBroadcast.playAnnouncement();
      }
    }
  };

  const acknowledgeAlert = () => {
    setIsAcknowledged(true);
    setIsModalOpen(false);
    coastalVoiceBroadcast.stopAnnouncement();
    if (emergencyStation) {
      setLastAcknowledgedConditionId(`${emergencyStation.id}-${emergencyStation.riskLevel}-${emergencyStation.waveHeight}`);
    }
  };

  const openAlertModal = () => {
    setIsModalOpen(true);
  };

  const closeAlertModal = () => {
    setIsModalOpen(false);
  };

  const dismissNotificationToast = () => {
    setActiveNotificationToast(null);
  };

  // Listen for global user interaction to unlock audio
  useEffect(() => {
    const handleUserGesture = () => {
      coastalVoiceBroadcast.unlockUserGesture();
      setIsAudioBlocked(false);
    };

    window.addEventListener('click', handleUserGesture, { passive: true });
    window.addEventListener('keydown', handleUserGesture, { passive: true });
    window.addEventListener('touchstart', handleUserGesture, { passive: true });

    return () => {
      window.removeEventListener('click', handleUserGesture);
      window.removeEventListener('keydown', handleUserGesture);
      window.removeEventListener('touchstart', handleUserGesture);
    };
  }, []);

  /**
   * Helper function to handle risk transitions:
   * Escalation & Resolution with Multilingual Voice Broadcast
   * Sirens are completely removed.
   */
  const handleRiskTransition = useCallback(
    (newLevel: RiskLevel, station: OceanCondition | null) => {
      const prevLevel = prevRiskLevelRef.current;
      const conditionKey = station ? `${station.id}-${newLevel}-${station.waveHeight.toFixed(1)}` : newLevel;
      const hasConditionChanged = conditionKey !== lastAcknowledgedConditionId;

      setActiveRiskLevel(newLevel);
      setEmergencyStation(station);

      // 1. ESCALATION TO EXTREME (CRITICAL)
      if (newLevel === 'CRITICAL') {
        if (hasConditionChanged || !isAcknowledged) {
          setIsAcknowledged(false);
          setIsModalOpen(true);

          // Voice Announcement Trigger (Siren Removed)
          if (!isMuted) {
            const alertId = `crit-${station?.id || 'alert'}-${Date.now().toString().slice(0, 8)}`;
            coastalVoiceBroadcast.triggerAutomaticHazardAlert(
              alertId,
              'CRITICAL',
              station?.stationName || 'Coastal Sector',
              station?.waveHeight || 4.2
            );
          }

          emergencyAudio.playNotificationSound('danger');
          setActiveNotificationToast({
            id: `toast-${Date.now()}`,
            title: 'Emergency Coastal Alert',
            message: `EXTREME risk detected at ${station?.stationName || 'Coastal Sector'}. Avoid the shoreline immediately.`,
            severity: 'danger',
            location: station?.stationName || 'Coastline',
            waveHeight: station?.waveHeight || 4.2,
            riskLevel: 'CRITICAL',
          });
        }
      }
      // 2. ESCALATION TO HIGH
      else if (newLevel === 'HIGH') {
        if (hasConditionChanged || !isAcknowledged) {
          setIsAcknowledged(false);

          // Voice Announcement Trigger (Siren Removed)
          if (!isMuted) {
            const alertId = `high-${station?.id || 'alert'}-${Date.now().toString().slice(0, 8)}`;
            coastalVoiceBroadcast.triggerAutomaticHazardAlert(
              alertId,
              'HIGH',
              station?.stationName || 'Coastal Sector',
              station?.waveHeight || 3.2
            );
          }

          emergencyAudio.playNotificationSound('warning');
          setActiveNotificationToast({
            id: `toast-${Date.now()}`,
            title: 'Coastal Alert',
            message: `HIGH risk detected at ${station?.stationName || 'Coastal Sector'}. Wave Height: ${station?.waveHeight?.toFixed(1) || '3.2'} m`,
            severity: 'warning',
            location: station?.stationName || 'Coastline',
            waveHeight: station?.waveHeight || 3.2,
            riskLevel: 'HIGH',
          });
        }
      }
      // 3. RESOLUTION / DE-ESCALATION
      else if (newLevel === 'MODERATE') {
        if (prevLevel === 'HIGH' || prevLevel === 'CRITICAL') {
          coastalVoiceBroadcast.stopAnnouncement();
          setIsModalOpen(false);
          setIsAcknowledged(true);

          emergencyAudio.playNotificationSound('caution');
          setActiveNotificationToast({
            id: `toast-${Date.now()}`,
            title: 'Risk De-escalated',
            message: `Hazard level reduced to MODERATE at ${station?.stationName || 'Coastal Sector'}. Dangerous condition resolved.`,
            severity: 'caution',
            location: station?.stationName || 'Coastline',
            waveHeight: station?.waveHeight || 1.8,
            riskLevel: 'MODERATE',
          });
        }
      }
      // 4. LOW: NORMAL CONDITIONS
      else if (newLevel === 'LOW') {
        if (prevLevel === 'HIGH' || prevLevel === 'CRITICAL' || prevLevel === 'MODERATE') {
          coastalVoiceBroadcast.stopAnnouncement();
          setIsModalOpen(false);
          setIsAcknowledged(true);

          setActiveNotificationToast({
            id: `toast-${Date.now()}`,
            title: 'Conditions Normal',
            message: `Ocean conditions at ${station?.stationName || 'Coastline'} have normalized. All hazards cleared.`,
            severity: 'caution',
            location: station?.stationName || 'Coastline',
            waveHeight: station?.waveHeight || 0.9,
            riskLevel: 'LOW',
          });
        }
      }

      prevRiskLevelRef.current = newLevel;
    },
    [isAcknowledged, isMuted, lastAcknowledgedConditionId]
  );

  const triggerSimulatedHazard = (level: 'HIGH' | 'EXTREME', locationName: string = 'Marina Beach', waveHeightVal?: number) => {
    const isExtreme = level === 'EXTREME';
    const riskLevel: RiskLevel = isExtreme ? 'CRITICAL' : 'HIGH';
    const height = waveHeightVal || (isExtreme ? 4.3 : 3.2);

    const mockStation: OceanCondition = {
      id: `hazard-demo-${Date.now()}`,
      stationName: locationName,
      region: 'Tamil Nadu Coastal Corridor',
      lat: 13.0533,
      lng: 80.2833,
      waveHeight: height,
      wavePeriod: isExtreme ? 14.5 : 10.8,
      windSpeed: isExtreme ? 58.0 : 44.0,
      windDirection: 'NE',
      windDirectionDeg: 45,
      waveDirection: 'ENE',
      waveDirectionDeg: 65,
      waterTemperature: 28.5,
      pressure: isExtreme ? 988.0 : 1004.0,
      currentSpeed: isExtreme ? 2.4 : 1.5,
      currentDirection: 'NNE',
      visibility: 4.5,
      riskLevel,
      lastUpdated: new Date().toISOString(),
      dataSource: 'Simulated Hazard Stress Test Engine',
      dataStatus: 'SIMULATED',
    };

    setLastAcknowledgedConditionId(null);
    handleRiskTransition(riskLevel, mockStation);
  };

  const resolveHazard = () => {
    coastalVoiceBroadcast.stopAnnouncement();
    const normalStation: OceanCondition | null = emergencyStation
      ? {
          ...emergencyStation,
          waveHeight: 0.9,
          windSpeed: 14.0,
          riskLevel: 'LOW',
          lastUpdated: new Date().toISOString(),
        }
      : null;

    handleRiskTransition('LOW', normalStation);
  };

  const evaluateStation = (stn: OceanCondition | null) => {
    if (!stn) {
      if (activeRiskLevel !== 'LOW') {
        handleRiskTransition('LOW', null);
      }
      return;
    }
    handleRiskTransition(stn.riskLevel, stn);
  };

  const playVoiceAnnouncement = async (lang?: EmergencyLanguageKey) => {
    return coastalVoiceBroadcast.playEmergencyAnnouncement(lang);
  };

  const playEmergencyAnnouncement = async (lang?: EmergencyLanguageKey) => {
    return coastalVoiceBroadcast.playEmergencyAnnouncement(lang);
  };

  const stopVoiceAnnouncement = () => {
    coastalVoiceBroadcast.stopAnnouncement();
  };

  const testVoiceAnnouncement = async (lang?: EmergencyLanguageKey) => {
    return coastalVoiceBroadcast.playTestVoice(lang);
  };

  const broadcastAll5Languages = async (locationName?: string) => {
    const targetLoc = locationName || emergencyStation?.stationName || 'Marina Beach Coastal Region';
    return coastalVoiceBroadcast.broadcastAll5Languages(targetLoc);
  };

  const playHighRiskRegionalBroadcast = async (lang: EmergencyLanguageKey, locationName?: string) => {
    const targetLoc = locationName || emergencyStation?.stationName || 'Marina Beach Coastal Region';
    return coastalVoiceBroadcast.playHighRiskRegionalBroadcast(lang, targetLoc);
  };

  const setVoiceLanguage = (lang: EmergencyLanguageKey | null) => {
    coastalVoiceBroadcast.setSelectedLanguage(lang);
  };

  const isHighRisk = activeRiskLevel === 'HIGH';
  const isExtremeRisk = activeRiskLevel === 'CRITICAL';

  return (
    <EmergencyAlertContext.Provider
      value={{
        activeRiskLevel,
        isHighRisk,
        isExtremeRisk,
        emergencyStation,
        isModalOpen,
        isMuted,
        isAudioBlocked,
        isAcknowledged,
        lastAcknowledgedConditionId,
        activeNotificationToast,
        voiceState,
        enableAudio,
        toggleMute,
        acknowledgeAlert,
        openAlertModal,
        closeAlertModal,
        dismissNotificationToast,
        triggerSimulatedHazard,
        resolveHazard,
        evaluateStation,
        playVoiceAnnouncement,
        playEmergencyAnnouncement,
        stopVoiceAnnouncement,
        testVoiceAnnouncement,
        broadcastAll5Languages,
        playHighRiskRegionalBroadcast,
        setVoiceLanguage,
      }}
    >
      {children}
    </EmergencyAlertContext.Provider>
  );
};

export const useEmergencyAlert = () => {
  const context = useContext(EmergencyAlertContext);
  if (!context) {
    throw new Error('useEmergencyAlert must be used within an EmergencyAlertProvider');
  }
  return context;
};
