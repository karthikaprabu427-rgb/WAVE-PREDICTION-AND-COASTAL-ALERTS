import bcrypt from 'bcryptjs';
import {
  CoastalAlert,
  DatasetInfo,
  InAppNotification,
  MLModelVersion,
  OceanCondition,
  PredictionResult,
  RiskLevel,
  RiskThresholds,
  User,
} from '../src/types';
import { mlEngine } from './mlEngine';
import { calculateCoastalRisk, defaultRiskThresholds } from './riskCalculator';

export interface DBState {
  users: User[];
  passwords: Record<string, string>; // userId -> bcryptHash
  oceanConditions: OceanCondition[];
  predictions: PredictionResult[];
  alerts: CoastalAlert[];
  notifications: InAppNotification[];
  datasets: DatasetInfo[];
  datasetRows: Record<string, any[]>; // datasetId -> rows
  modelVersions: MLModelVersion[];
  thresholds: RiskThresholds;
}

// In-memory Database with initial real-world data seeds
class DatabaseService {
  private state: DBState;

  constructor() {
    this.state = {
      users: [],
      passwords: {},
      oceanConditions: [],
      predictions: [],
      alerts: [],
      notifications: [],
      datasets: [],
      datasetRows: {},
      modelVersions: [],
      thresholds: { ...defaultRiskThresholds },
    };
    this.seedDatabase();
  }

  private seedDatabase() {
    // 1. Seed Users
    const salt = bcrypt.genSaltSync(10);
    const adminPassHash = bcrypt.hashSync('Admin@123', salt);
    const userPassHash = bcrypt.hashSync('User@123', salt);

    const adminUser: User = {
      id: 'usr-admin-001',
      name: 'Dr. A. Sharma (Chief Oceanographer)',
      email: 'admin@wavepredict.org',
      role: 'admin',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      organization: 'National Coastal Warning Center',
      phone: '+91 98450 11223',
    };

    const regularUser: User = {
      id: 'usr-demo-002',
      name: 'Capt. Rajesh Varma',
      email: 'user@wavepredict.org',
      role: 'user',
      status: 'active',
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      organization: 'Maritime Logistics & Port Safety',
      phone: '+91 98765 43210',
    };

    this.state.users.push(adminUser, regularUser);
    this.state.passwords[adminUser.id] = adminPassHash;
    this.state.passwords[regularUser.id] = userPassHash;

    // 2. Seed Real-world Coastal Monitoring Buoy Stations
    const stations: Omit<OceanCondition, 'riskLevel'>[] = [
      {
        id: 'stn-chennai',
        stationName: 'Marina Coastal Buoy (CB-01)',
        region: 'Bay of Bengal - Tamil Nadu Coast',
        lat: 13.0475,
        lng: 80.2825,
        waveHeight: 3.1,
        wavePeriod: 10.4,
        windSpeed: 48.5,
        windDirection: 'ENE',
        windDirectionDeg: 65,
        waveDirection: 'E',
        waveDirectionDeg: 90,
        waterTemperature: 28.6,
        pressure: 1004.2,
        currentSpeed: 1.4,
        currentDirection: 'NNE',
        visibility: 7.5,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'stn-mumbai',
        stationName: 'Mumbai Offshore Platform (MB-04)',
        region: 'Arabian Sea - Maharashtra Coast',
        lat: 18.922,
        lng: 72.8347,
        waveHeight: 4.3,
        wavePeriod: 12.8,
        windSpeed: 74.0,
        windDirection: 'WSW',
        windDirectionDeg: 240,
        waveDirection: 'WSW',
        waveDirectionDeg: 245,
        waterTemperature: 27.2,
        pressure: 994.0,
        currentSpeed: 2.3,
        currentDirection: 'NE',
        visibility: 4.0,
        lastUpdated: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: 'stn-goa',
        stationName: 'Goa Coastal Radar & Buoy (GB-02)',
        region: 'Central Arabian Sea - Goa Coast',
        lat: 15.4909,
        lng: 73.8278,
        waveHeight: 2.1,
        wavePeriod: 8.5,
        windSpeed: 32.0,
        windDirection: 'SW',
        windDirectionDeg: 225,
        waveDirection: 'SW',
        waveDirectionDeg: 220,
        waterTemperature: 29.0,
        pressure: 1011.5,
        currentSpeed: 0.8,
        currentDirection: 'NW',
        visibility: 12.0,
        lastUpdated: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
      {
        id: 'stn-vizag',
        stationName: 'Visakhapatnam Outer Harbor (VB-07)',
        region: 'North Bay of Bengal - Andhra Coast',
        lat: 17.6868,
        lng: 83.2185,
        waveHeight: 2.8,
        wavePeriod: 9.2,
        windSpeed: 44.0,
        windDirection: 'SE',
        windDirectionDeg: 135,
        waveDirection: 'SSE',
        waveDirectionDeg: 150,
        waterTemperature: 28.1,
        pressure: 1007.8,
        currentSpeed: 1.1,
        currentDirection: 'N',
        visibility: 9.0,
        lastUpdated: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
      {
        id: 'stn-kochi',
        stationName: 'Kochi Port Marine Observatory (KB-03)',
        region: 'Laccadive Sea - Kerala Coast',
        lat: 9.9312,
        lng: 76.2673,
        waveHeight: 1.3,
        wavePeriod: 6.8,
        windSpeed: 21.0,
        windDirection: 'WNW',
        windDirectionDeg: 290,
        waveDirection: 'W',
        waveDirectionDeg: 270,
        waterTemperature: 29.4,
        pressure: 1012.8,
        currentSpeed: 0.6,
        currentDirection: 'SSE',
        visibility: 15.0,
        lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'stn-kanyakumari',
        stationName: 'Cape Comorin Tri-Sea Buoy (TB-09)',
        region: 'Indian Ocean Confluence - Kanyakumari',
        lat: 8.0883,
        lng: 77.5385,
        waveHeight: 3.6,
        wavePeriod: 11.5,
        windSpeed: 52.0,
        windDirection: 'S',
        windDirectionDeg: 180,
        waveDirection: 'SSW',
        waveDirectionDeg: 195,
        waterTemperature: 27.8,
        pressure: 1006.1,
        currentSpeed: 1.8,
        currentDirection: 'E',
        visibility: 8.0,
        lastUpdated: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: 'stn-puri',
        stationName: 'Puri Coastal Swell Station (PB-05)',
        region: 'Bay of Bengal - Odisha Coast',
        lat: 19.8135,
        lng: 85.8312,
        waveHeight: 2.4,
        wavePeriod: 8.8,
        windSpeed: 38.0,
        windDirection: 'E',
        windDirectionDeg: 90,
        waveDirection: 'ESE',
        waveDirectionDeg: 110,
        waterTemperature: 28.5,
        pressure: 1009.4,
        currentSpeed: 0.9,
        currentDirection: 'NE',
        visibility: 11.0,
        lastUpdated: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: 'stn-portblair',
        stationName: 'Andaman & Nicobar Deep-Sea Buoy (AB-08)',
        region: 'Andaman Sea - Port Blair Channel',
        lat: 11.6234,
        lng: 92.7265,
        waveHeight: 1.1,
        wavePeriod: 5.9,
        windSpeed: 16.0,
        windDirection: 'NE',
        windDirectionDeg: 45,
        waveDirection: 'ENE',
        waveDirectionDeg: 60,
        waterTemperature: 30.1,
        pressure: 1013.2,
        currentSpeed: 0.4,
        currentDirection: 'S',
        visibility: 18.0,
        lastUpdated: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      },
      {
        id: 'stn-dwarka',
        stationName: 'Gulf of Kutch Maritime Station (DB-06)',
        region: 'Northern Arabian Sea - Gujarat Coast',
        lat: 22.2442,
        lng: 68.9685,
        waveHeight: 2.9,
        wavePeriod: 9.6,
        windSpeed: 46.0,
        windDirection: 'NW',
        windDirectionDeg: 315,
        waveDirection: 'WNW',
        waveDirectionDeg: 295,
        waterTemperature: 26.5,
        pressure: 1008.0,
        currentSpeed: 1.5,
        currentDirection: 'SE',
        visibility: 10.0,
        lastUpdated: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
    ];

    this.state.oceanConditions = stations.map((stn) => {
      const risk = calculateCoastalRisk(
        stn.waveHeight,
        stn.wavePeriod,
        stn.windSpeed,
        stn.pressure,
        stn.currentSpeed,
        this.state.thresholds
      );
      return {
        ...stn,
        riskLevel: risk.riskLevel,
      };
    });

    // 3. Seed Coastal Alerts
    this.state.alerts = [
      {
        id: 'alt-001',
        title: 'CRITICAL STORM SURGE ALERT',
        message: 'Severe offshore squalls and hazardous swell heights exceeding 4.3m detected near Mumbai Offshore. Complete prohibition of recreational and artisanal fishing activities.',
        location: 'Mumbai Offshore Platform (MB-04)',
        riskLevel: 'CRITICAL',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: 'active',
        severity: 'EMERGENCY',
        affectedRadiusKm: 65,
        source: 'INCOIS / National Early Warning Center',
        createdBy: 'Dr. A. Sharma',
      },
      {
        id: 'alt-002',
        title: 'HIGH WAVE WARNING',
        message: 'Long-period swells of 3.6m reaching the shoreline at Cape Comorin. High energy surf zone causing dangerous rip currents. Small crafts must return to harbor immediately.',
        location: 'Cape Comorin Tri-Sea Buoy (TB-09)',
        riskLevel: 'HIGH',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        status: 'active',
        severity: 'WARNING',
        affectedRadiusKm: 45,
        source: 'Coastal Marine Forecast Unit',
        createdBy: 'Dr. A. Sharma',
      },
      {
        id: 'alt-003',
        title: 'STRONG WIND ADVISORY',
        message: 'Sustained easterly gale winds up to 48.5 km/h recorded along the Chennai coastal belt. Choppy sea state with wave heights climbing to 3.1m.',
        location: 'Marina Coastal Buoy (CB-01)',
        riskLevel: 'HIGH',
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        status: 'active',
        severity: 'ADVISORY',
        affectedRadiusKm: 35,
        source: 'Regional Met Observatory',
        createdBy: 'Dr. A. Sharma',
      },
      {
        id: 'alt-004',
        title: 'MODERATE SWELL ADVISORY (RESOLVED)',
        message: 'Swell surge has subsided to 1.3m near Kochi harbor entrance. Normal commercial docking resumed.',
        location: 'Kochi Port Marine Observatory (KB-03)',
        riskLevel: 'MODERATE',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        status: 'resolved',
        severity: 'WATCH',
        affectedRadiusKm: 20,
        source: 'Harbor Master Office',
        createdBy: 'System Auto-Monitor',
      },
    ];

    // 4. Seed Notifications
    this.state.notifications = [
      {
        id: 'notif-001',
        title: 'Critical Risk Threshold Exceeded',
        message: 'Mumbai Offshore station reported wave height 4.3m, triggering Emergency Coastal Alert #alt-001.',
        type: 'risk_change',
        severity: 'danger',
        read: false,
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        link: '/alerts',
      },
      {
        id: 'notif-002',
        title: 'New High Wave Advisory Broadcasted',
        message: 'A High Wave warning was published for Cape Comorin Tri-Sea location.',
        type: 'alert',
        severity: 'warning',
        read: false,
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        link: '/alerts',
      },
      {
        id: 'notif-003',
        title: 'ML Model Update Deployed',
        message: 'Wave ML Engine updated to version v1.4.2-RandomForest-Ensemble (R²: 0.942, MAE: 0.14m).',
        type: 'system',
        severity: 'info',
        read: true,
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        link: '/analytics',
      },
      {
        id: 'notif-004',
        title: 'Wave Prediction Completed',
        message: 'Your custom wave prediction for Visakhapatnam Outer Harbor was processed successfully.',
        type: 'prediction',
        severity: 'success',
        read: true,
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        link: '/history',
      },
    ];

    // 5. Seed Predictions History
    this.state.predictions = [
      {
        id: 'pred-901',
        userId: regularUser.id,
        userName: regularUser.name,
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        inputParams: {
          location: 'Marina Coastal Buoy (CB-01)',
          latitude: 13.0475,
          longitude: 80.2825,
          waveHeight: 3.1,
          wavePeriod: 10.4,
          windSpeed: 48.5,
          windDirection: 'ENE',
          waveDirection: 'E',
          waterTemperature: 28.6,
          pressure: 1004.2,
          currentSpeed: 1.4,
          currentDirection: 'NNE',
        },
        predictedWaveHeight: 3.42,
        predictedWavePeriod: 11.2,
        predictedWaveCategory: 'Rough Swell / High Sea',
        riskLevel: 'HIGH',
        confidenceScore: 94.2,
        explanation: 'Wave conditions are currently considered HIGH RISK. Sustained onshore wind fetch of 48.5 km/h is driving wave heights upwards over the next 6-hour forecast window.',
        recommendedAction: 'Small craft advisory in effect. Coastal recreational activities should be postponed.',
      },
      {
        id: 'pred-902',
        userId: regularUser.id,
        userName: regularUser.name,
        timestamp: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        inputParams: {
          location: 'Goa Coastal Radar & Buoy (GB-02)',
          latitude: 15.4909,
          longitude: 73.8278,
          waveHeight: 2.1,
          wavePeriod: 8.5,
          windSpeed: 32.0,
          windDirection: 'SW',
          waveDirection: 'SW',
          waterTemperature: 29.0,
          pressure: 1011.5,
          currentSpeed: 0.8,
          currentDirection: 'NW',
        },
        predictedWaveHeight: 2.24,
        predictedWavePeriod: 8.9,
        predictedWaveCategory: 'Moderate Chop / Gentle Swell',
        riskLevel: 'MODERATE',
        confidenceScore: 96.0,
        explanation: 'Moderate sea state forecasted. Normal diurnal breeze with wave heights around 2.2m.',
        recommendedAction: 'Caution advised for small watercraft and beachgoers. Monitor continuous coastal forecasts.',
      },
      {
        id: 'pred-903',
        userId: regularUser.id,
        userName: regularUser.name,
        timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
        inputParams: {
          location: 'Kochi Port Marine Observatory (KB-03)',
          latitude: 9.9312,
          longitude: 76.2673,
          waveHeight: 1.2,
          wavePeriod: 6.5,
          windSpeed: 18.0,
          windDirection: 'WNW',
          waveDirection: 'W',
          waterTemperature: 29.5,
          pressure: 1013.0,
          currentSpeed: 0.5,
          currentDirection: 'SSE',
        },
        predictedWaveHeight: 1.28,
        predictedWavePeriod: 6.8,
        predictedWaveCategory: 'Calm to Smooth Sea',
        riskLevel: 'LOW',
        confidenceScore: 97.5,
        explanation: 'Favorable marine parameters. Minimal swell growth expected.',
        recommendedAction: 'Normal coastal activities and navigation permitted under standard marine safety guidelines.',
      },
    ];

    // 6. Seed Dataset Records (Generate 500+ realistic hourly records across stations)
    const datasetId = 'dataset-indian-ocean-2026';
    const sampleRows: any[] = [];
    const baseDate = new Date(Date.now() - 45 * 24 * 3600 * 1000);

    for (let i = 0; i < 650; i++) {
      const rowDate = new Date(baseDate.getTime() + i * 2 * 3600 * 1000);
      const stn = stations[i % stations.length];
      const noiseH = (Math.sin(i * 0.15) * 0.6) + ((i % 17 === 0) ? 1.5 : 0);
      const waveH = Math.max(0.4, Number((stn.waveHeight + noiseH).toFixed(2)));
      const windSpd = Math.max(8, Number((stn.windSpeed + Math.cos(i * 0.2) * 8).toFixed(1)));
      const wavePer = Math.max(4.0, Number((stn.wavePeriod + Math.sin(i * 0.1) * 1.5).toFixed(1)));
      const pres = Number((stn.pressure + (Math.sin(i * 0.05) * 4)).toFixed(1));
      const temp = Number((stn.waterTemperature + (Math.cos(i * 0.08) * 1.2)).toFixed(1));
      const curr = Number((stn.currentSpeed + Math.abs(Math.sin(i * 0.3) * 0.4)).toFixed(2));
      const nextH = Math.max(0.3, Number((waveH * 0.95 + (windSpd / 60) * 0.8 + (1013 - pres) * 0.02).toFixed(2)));
      const nextP = Math.max(3.5, Number((wavePer * 0.9 + (windSpd / 40) * 0.7).toFixed(1)));

      sampleRows.push({
        id: `row-${i + 1}`,
        timestamp: rowDate.toISOString(),
        station_name: stn.stationName,
        latitude: stn.lat,
        longitude: stn.lng,
        wave_height: waveH,
        wave_period: wavePer,
        wind_speed: windSpd,
        wind_direction: stn.windDirection,
        wave_direction: stn.waveDirection,
        water_temperature: temp,
        pressure: pres,
        current_speed: curr,
        current_direction: stn.currentDirection,
        next_wave_height: nextH,
        next_wave_period: nextP,
      });
    }

    this.state.datasets.push({
      id: datasetId,
      name: 'INCOIS-NOAA Coastal Buoy Master Dataset (2025-2026)',
      filename: 'ocean_buoy_timeseries_2026.csv',
      rowCount: sampleRows.length,
      columnCount: 16,
      columns: [
        'timestamp',
        'station_name',
        'latitude',
        'longitude',
        'wave_height',
        'wave_period',
        'wind_speed',
        'wind_direction',
        'wave_direction',
        'water_temperature',
        'pressure',
        'current_speed',
        'current_direction',
        'next_wave_height',
        'next_wave_period',
      ],
      missingValues: 0,
      uploadedBy: 'Dr. A. Sharma',
      uploadedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      status: 'active',
      fileSize: '184.2 KB',
      previewData: sampleRows.slice(0, 15),
    });

    this.state.datasetRows[datasetId] = sampleRows;

    // 7. Seed Model Versions
    this.state.modelVersions.push(
      mlEngine.getModelVersion(),
      {
        id: 'model-v1.3-baseline',
        version: 'v1.3.0-GradientBoosting',
        algorithm: 'Gradient Boosting Regressor',
        trainedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
        metrics: {
          mae: 0.19,
          rmse: 0.26,
          r2Score: 0.912,
          accuracy: 93.8,
          trainingRecords: 1100,
          testingRecords: 275,
        },
        features: ['wave_height', 'wave_period', 'wind_speed', 'pressure', 'water_temperature'],
        targetVariable: 'predicted_wave_height',
        isActive: false,
        notes: 'Initial baseline model without current velocity feature coupling.',
      }
    );
  }

  // --- Getters & Queries ---

  public getUsers(): User[] {
    return this.state.users;
  }

  public findUserById(id: string): User | undefined {
    return this.state.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public verifyPassword(userId: string, plainText: string): boolean {
    const hash = this.state.passwords[userId];
    if (!hash) return false;
    return bcrypt.compareSync(plainText, hash);
  }

  public createUser(userData: Omit<User, 'id' | 'createdAt' | 'status'>, plainPassword: string): User {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(plainPassword, salt);
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.name)}`,
    };

    this.state.users.push(newUser);
    this.state.passwords[newUser.id] = passwordHash;
    return newUser;
  }

  public updateUserStatus(userId: string, status: 'active' | 'inactive'): User | null {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) return null;
    user.status = status;
    return user;
  }

  public deleteUser(userId: string): boolean {
    const index = this.state.users.findIndex((u) => u.id === userId);
    if (index === -1) return false;
    this.state.users.splice(index, 1);
    delete this.state.passwords[userId];
    return true;
  }

  public updateUserProfile(userId: string, updates: Partial<User>): User | null {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) return null;
    Object.assign(user, updates);
    return user;
  }

  // --- Ocean Conditions ---
  public getOceanConditions(): OceanCondition[] {
    // Re-evaluate risk levels using current thresholds
    return this.state.oceanConditions.map((stn) => {
      const risk = calculateCoastalRisk(
        stn.waveHeight,
        stn.wavePeriod,
        stn.windSpeed,
        stn.pressure,
        stn.currentSpeed,
        this.state.thresholds
      );
      return {
        ...stn,
        riskLevel: risk.riskLevel,
      };
    });
  }

  public getOceanConditionById(id: string): OceanCondition | undefined {
    return this.getOceanConditions().find((c) => c.id === id);
  }

  // --- Predictions ---
  public getPredictions(userId?: string): PredictionResult[] {
    if (userId) {
      return this.state.predictions.filter((p) => p.userId === userId);
    }
    return this.state.predictions;
  }

  public addPrediction(pred: PredictionResult): PredictionResult {
    this.state.predictions.unshift(pred);
    return pred;
  }

  // --- Alerts ---
  public getAlerts(): CoastalAlert[] {
    return this.state.alerts;
  }

  public createAlert(alertData: Omit<CoastalAlert, 'id' | 'timestamp'>): CoastalAlert {
    const newAlert: CoastalAlert = {
      ...alertData,
      id: `alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.state.alerts.unshift(newAlert);

    // Also trigger broadcast in-app notification
    this.createNotification({
      title: `Coastal Alert: ${newAlert.title}`,
      message: `${newAlert.message} [Location: ${newAlert.location}]`,
      type: 'alert',
      severity: newAlert.riskLevel === 'CRITICAL' ? 'danger' : 'warning',
      read: false,
      link: '/alerts',
    });

    return newAlert;
  }

  public updateAlert(id: string, updates: Partial<CoastalAlert>): CoastalAlert | null {
    const alert = this.state.alerts.find((a) => a.id === id);
    if (!alert) return null;
    Object.assign(alert, updates);
    return alert;
  }

  public deleteAlert(id: string): boolean {
    const index = this.state.alerts.findIndex((a) => a.id === id);
    if (index === -1) return false;
    this.state.alerts.splice(index, 1);
    return true;
  }

  // --- Notifications ---
  public getNotifications(userId?: string): InAppNotification[] {
    return this.state.notifications.filter((n) => !n.userId || n.userId === userId);
  }

  public createNotification(notifData: Omit<InAppNotification, 'id' | 'timestamp'>): InAppNotification {
    const newNotif: InAppNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
    };
    this.state.notifications.unshift(newNotif);
    return newNotif;
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId?: string): number {
    let count = 0;
    for (const notif of this.state.notifications) {
      if (!userId || !notif.userId || notif.userId === userId) {
        if (!notif.read) {
          notif.read = true;
          count++;
        }
      }
    }
    return count;
  }

  // --- Datasets ---
  public getDatasets(): DatasetInfo[] {
    return this.state.datasets;
  }

  public getDatasetRows(datasetId: string): any[] {
    return this.state.datasetRows[datasetId] || [];
  }

  public addDataset(datasetInfo: DatasetInfo, rows: any[]): DatasetInfo {
    this.state.datasets.unshift(datasetInfo);
    this.state.datasetRows[datasetInfo.id] = rows;
    return datasetInfo;
  }

  public deleteDataset(id: string): boolean {
    const index = this.state.datasets.findIndex((d) => d.id === id);
    if (index === -1) return false;
    this.state.datasets.splice(index, 1);
    delete this.state.datasetRows[id];
    return true;
  }

  // --- Models ---
  public getModelVersions(): MLModelVersion[] {
    return this.state.modelVersions;
  }

  public addModelVersion(version: MLModelVersion) {
    this.state.modelVersions.forEach((m) => (m.isActive = false));
    version.isActive = true;
    this.state.modelVersions.unshift(version);
  }

  // --- Settings ---
  public getThresholds(): RiskThresholds {
    return this.state.thresholds;
  }

  public updateThresholds(newThresholds: Partial<RiskThresholds>): RiskThresholds {
    this.state.thresholds = { ...this.state.thresholds, ...newThresholds };
    return this.state.thresholds;
  }
}

export const db = new DatabaseService();
