export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
  avatar?: string;
  organization?: string;
  phone?: string;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface OceanCondition {
  id: string;
  stationName: string;
  region: string;
  lat: number;
  lng: number;
  waveHeight: number; // in meters
  wavePeriod: number; // in seconds
  windSpeed: number; // in km/h or knots
  windDirection: string; // e.g., 'SSW'
  windDirectionDeg: number;
  waveDirection: string;
  waveDirectionDeg: number;
  waterTemperature: number; // in Celsius
  pressure: number; // in hPa
  currentSpeed: number; // in m/s
  currentDirection: string;
  visibility: number; // in km
  riskLevel: RiskLevel;
  lastUpdated: string;
}

export interface PredictionInput {
  location: string;
  latitude: number;
  longitude: number;
  waveHeight: number;
  wavePeriod: number;
  windSpeed: number;
  windDirection: string;
  waveDirection: string;
  waterTemperature: number;
  pressure: number;
  currentSpeed: number;
  currentDirection: string;
}

export interface PredictionResult {
  id: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  inputParams: PredictionInput;
  predictedWaveHeight: number;
  predictedWavePeriod: number;
  predictedWaveCategory: string;
  riskLevel: RiskLevel;
  confidenceScore: number;
  explanation: string;
  recommendedAction: string;
}

export interface CoastalAlert {
  id: string;
  title: string;
  type?: string;
  riskLevel: RiskLevel;
  severity: 'info' | 'warning' | 'danger' | 'EMERGENCY' | 'WARNING' | 'ADVISORY' | 'WATCH' | string;
  description?: string;
  instructions?: string;
  affectedRegions?: string[];
  issuedAt?: string;
  issuedBy?: string;
  validUntil?: string;
  active?: boolean;
  message?: string;
  location?: string;
  timestamp?: string;
  status?: 'active' | 'resolved';
  affectedRadiusKm?: number;
  source?: string;
  createdBy?: string;
}

export interface InAppNotification {
  id: string;
  userId?: string; // null means broadcast to all
  title: string;
  message: string;
  type: 'alert' | 'prediction' | 'risk_change' | 'system';
  severity: 'info' | 'warning' | 'danger' | 'success';
  read: boolean;
  timestamp: string;
  link?: string;
}

export interface DatasetInfo {
  id: string;
  name: string;
  filename: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  missingValues: number;
  uploadedBy: string;
  uploadedAt: string;
  status: 'active' | 'archived';
  fileSize: string;
  previewData?: Record<string, any>[];
}

export interface MLModelMetrics {
  mae: number;
  rmse: number;
  r2Score: number;
  accuracy: number;
  trainingRecords?: number;
  testingRecords?: number;
}

export interface MLModelInfo {
  id: string;
  name?: string;
  version: string;
  algorithm: string;
  trainedAt: string;
  status?: 'active' | 'standby' | 'archived';
  metrics: MLModelMetrics;
  features?: string[];
  targetVariable?: string;
  isActive?: boolean;
  notes?: string;
}


export type MLModelVersion = MLModelInfo;

export interface RiskThresholds {
  lowMaxWaveHeight: number; // e.g. 1.5m
  moderateMaxWaveHeight?: number;
  modMaxWaveHeight?: number; // e.g. 2.5m
  highMaxWaveHeight: number; // e.g. 3.8m
  lowMaxWindSpeed?: number;
  moderateMaxWindSpeed?: number;
  highMaxWindSpeed?: number;
  highWindSpeed?: number; // e.g. 50 km/h
  criticalWindSpeed?: number; // e.g. 75 km/h
}

