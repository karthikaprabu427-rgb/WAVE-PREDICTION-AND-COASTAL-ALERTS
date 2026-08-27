import { Request, Response, Router } from 'express';
import multer from 'multer';
import { CoastalAlert, PredictionInput, PredictionResult } from '../src/types';
import { db } from './db';
import { mlEngine } from './mlEngine';
import { calculateCoastalRisk } from './riskCalculator';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const apiRouter = Router();

// Helper to simulate authentication token decoding / session
function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  // Token is base64 encoded JSON string: { userId, role, exp }
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const user = db.findUserById(payload.userId);
    if (!user || user.status === 'inactive') return null;
    return user;
  } catch (e) {
    return null;
  }
}

function generateToken(user: { id: string; role: string }): string {
  const payload = {
    userId: user.id,
    role: user.role,
    exp: Date.now() + 7 * 24 * 3600 * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// ----------------------------------------------------
// 1. AUTHENTICATION ROUTES
// ----------------------------------------------------

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword, organization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email address is already registered.' });
    }

    const newUser = db.createUser(
      {
        name,
        email,
        role: 'user',
        organization: organization || 'Maritime Operator',
      },
      password
    );

    const token = generateToken(newUser);

    // Send welcome notification
    db.createNotification({
      userId: newUser.id,
      title: 'Welcome to Wave Prediction & Coastal Alerts',
      message: 'Your account is active. You can now monitor ocean stations and run ML wave predictions.',
      type: 'system',
      severity: 'info',
      read: false,
      link: '/dashboard',
    });

    return res.status(201).json({
      message: 'Registration successful',
      user: newUser,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error during registration' });
  }
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Your account has been deactivated by administrator.' });
    }

    const isValid = db.verifyPassword(user.id, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Login successful',
      user,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed' });
  }
});

apiRouter.post('/auth/admin-login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Admin email and master key/password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Account does not have Administrator privileges.' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ error: 'Admin account is deactivated.' });
    }

    const isValid = db.verifyPassword(user.id, password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const token = generateToken(user);
    return res.json({
      message: 'Admin authorization successful',
      user,
      token,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Admin login failed' });
  }
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized or session expired.' });
  }
  return res.json({ user });
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'No account registered with that email address.' });
  }
  return res.json({
    message: 'Password reset link has been dispatched to your email address (Demo mode: Use master key or contact administrator).',
  });
});

apiRouter.put('/auth/profile', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const { name, organization, phone, avatar } = req.body;
  const updated = db.updateUserProfile(user.id, { name, organization, phone, avatar });
  return res.json({ message: 'Profile updated successfully', user: updated });
});

// ----------------------------------------------------
// 2. OCEAN CONDITIONS & REAL-TIME BUOY TELEMETRY
// ----------------------------------------------------

apiRouter.get('/ocean-conditions', (req: Request, res: Response) => {
  const conditions = db.getOceanConditions();
  return res.json({
    timestamp: new Date().toISOString(),
    stations: conditions,
    totalStations: conditions.length,
    highRiskCount: conditions.filter((c) => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length,
  });
});

apiRouter.get('/ocean-conditions/:id', (req: Request, res: Response) => {
  const station = db.getOceanConditionById(req.params.id);
  if (!station) {
    return res.status(404).json({ error: 'Coastal station not found.' });
  }
  return res.json({ station });
});

// ----------------------------------------------------
// 3. MACHINE LEARNING WAVE PREDICTION & RISK EVAL
// ----------------------------------------------------

apiRouter.post('/predict', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const input: PredictionInput = req.body;

    if (input.waveHeight === undefined || input.windSpeed === undefined || input.wavePeriod === undefined) {
      return res.status(400).json({ error: 'Wave height, wave period, and wind speed parameters are required.' });
    }

    // Run ML Engine inference
    const mlPrediction = mlEngine.predict(input);

    // Compute Coastal Risk Level based on predicted parameters & current thresholds
    const riskAnalysis = calculateCoastalRisk(
      mlPrediction.predictedWaveHeight,
      mlPrediction.predictedWavePeriod,
      input.windSpeed,
      input.pressure,
      input.currentSpeed,
      db.getThresholds()
    );

    const predictionRecord: PredictionResult = {
      id: `pred-${Date.now()}`,
      userId: user ? user.id : 'guest',
      userName: user ? user.name : 'Guest Maritime User',
      timestamp: new Date().toISOString(),
      inputParams: input,
      predictedWaveHeight: mlPrediction.predictedWaveHeight,
      predictedWavePeriod: mlPrediction.predictedWavePeriod,
      predictedWaveCategory: riskAnalysis.waveCategory,
      riskLevel: riskAnalysis.riskLevel,
      confidenceScore: mlPrediction.confidenceScore,
      explanation: riskAnalysis.explanation,
      recommendedAction: riskAnalysis.recommendedAction,
    };

    // Store in Database
    db.addPrediction(predictionRecord);

    // If Critical or High Risk predicted, push an in-app notification
    if (riskAnalysis.riskLevel === 'CRITICAL' || riskAnalysis.riskLevel === 'HIGH') {
      db.createNotification({
        userId: user ? user.id : undefined,
        title: `High Wave Warning for ${input.location || 'Selected Coastal Area'}`,
        message: `Predicted wave height of ${mlPrediction.predictedWaveHeight}m (Risk: ${riskAnalysis.riskLevel}). Caution advised.`,
        type: 'prediction',
        severity: riskAnalysis.riskLevel === 'CRITICAL' ? 'danger' : 'warning',
        read: false,
        link: '/prediction-result',
      });
    }

    return res.status(201).json({
      message: 'Wave prediction computed successfully',
      result: predictionRecord,
      modelVersion: mlEngine.getModelVersion().version,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Prediction computation error' });
  }
});

apiRouter.get('/predictions', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const { all } = req.query;

  if (all === 'true' && user?.role === 'admin') {
    return res.json({ predictions: db.getPredictions() });
  }

  const userId = user ? user.id : undefined;
  return res.json({ predictions: db.getPredictions(userId) });
});

// ----------------------------------------------------
// 4. COASTAL ALERTS
// ----------------------------------------------------

apiRouter.get('/alerts', (req: Request, res: Response) => {
  const alerts = db.getAlerts();
  return res.json({
    alerts,
    activeAlertsCount: alerts.filter((a) => a.status === 'active').length,
    criticalCount: alerts.filter((a) => a.riskLevel === 'CRITICAL' && a.status === 'active').length,
  });
});

apiRouter.post('/alerts', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only administrators can broadcast coastal alerts.' });
  }

  const { title, message, location, riskLevel, severity, affectedRadiusKm } = req.body;
  if (!title || !message || !location || !riskLevel) {
    return res.status(400).json({ error: 'Title, message, location, and risk level are required.' });
  }

  const alert = db.createAlert({
    title,
    message,
    location,
    riskLevel,
    status: 'active',
    severity: severity || 'WARNING',
    affectedRadiusKm: affectedRadiusKm || 30,
    source: 'National Coastal Warning Center (Admin Broadcast)',
    createdBy: user.name,
  });

  return res.status(201).json({ message: 'Coastal alert broadcasted successfully', alert });
});

apiRouter.put('/alerts/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const updated = db.updateAlert(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Alert not found.' });
  }
  return res.json({ message: 'Alert updated successfully', alert: updated });
});

apiRouter.delete('/alerts/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  const success = db.deleteAlert(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Alert not found.' });
  }
  return res.json({ message: 'Alert deleted successfully' });
});

// ----------------------------------------------------
// 5. IN-APP NOTIFICATIONS
// ----------------------------------------------------

apiRouter.get('/notifications', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const notifications = db.getNotifications(user?.id);
  const unreadCount = notifications.filter((n) => !n.read).length;
  return res.json({ notifications, unreadCount });
});

apiRouter.put('/notifications/:id/read', (req: Request, res: Response) => {
  const success = db.markNotificationAsRead(req.params.id);
  return res.json({ success });
});

apiRouter.put('/notifications/read-all', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  const updatedCount = db.markAllNotificationsAsRead(user?.id);
  return res.json({ success: true, updatedCount });
});

// ----------------------------------------------------
// 6. ANALYTICS
// ----------------------------------------------------

apiRouter.get('/analytics', (req: Request, res: Response) => {
  const stations = db.getOceanConditions();
  const predictions = db.getPredictions();
  const alerts = db.getAlerts();

  // Summary stats
  const avgWaveHeight = Number((stations.reduce((acc, s) => acc + s.waveHeight, 0) / (stations.length || 1)).toFixed(2));
  const maxWaveHeight = Number(Math.max(...stations.map((s) => s.waveHeight), 0).toFixed(2));
  const avgWindSpeed = Number((stations.reduce((acc, s) => acc + s.windSpeed, 0) / (stations.length || 1)).toFixed(1));
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter((a) => a.riskLevel === 'CRITICAL' && a.status === 'active').length;
  const highRiskLocations = stations.filter((s) => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length;

  // Risk Distribution
  const riskDistribution = [
    { name: 'LOW', count: stations.filter((s) => s.riskLevel === 'LOW').length, color: '#10b981' },
    { name: 'MODERATE', count: stations.filter((s) => s.riskLevel === 'MODERATE').length, color: '#f59e0b' },
    { name: 'HIGH', count: stations.filter((s) => s.riskLevel === 'HIGH').length, color: '#f97316' },
    { name: 'CRITICAL', count: stations.filter((s) => s.riskLevel === 'CRITICAL').length, color: '#ef4444' },
  ];

  // 24-hour Time series mock/historical trend from active dataset
  const activeDataset = db.getDatasets()[0];
  const rows = activeDataset ? db.getDatasetRows(activeDataset.id).slice(0, 24) : [];
  const timeSeries = rows.map((r, i) => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    waveHeight: r.wave_height,
    predictedHeight: r.next_wave_height || Number((r.wave_height * 1.06).toFixed(2)),
    windSpeed: r.wind_speed,
    wavePeriod: r.wave_period,
    pressure: r.pressure,
  }));

  return res.json({
    summary: {
      avgWaveHeight,
      maxWaveHeight,
      avgWindSpeed,
      totalAlerts,
      criticalAlerts,
      highRiskLocations,
      totalPredictions: predictions.length,
    },
    riskDistribution,
    timeSeries,
    stationComparison: stations.map((s) => ({
      station: s.stationName.split('(')[0].trim(),
      waveHeight: s.waveHeight,
      windSpeed: s.windSpeed,
      period: s.wavePeriod,
      risk: s.riskLevel,
    })),
  });
});

// ----------------------------------------------------
// 7. ADMIN MANAGEMENT
// ----------------------------------------------------

apiRouter.get('/admin/overview', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const users = db.getUsers();
  const predictions = db.getPredictions();
  const alerts = db.getAlerts();
  const datasets = db.getDatasets();
  const activeModel = mlEngine.getModelVersion();
  const stations = db.getOceanConditions();

  return res.json({
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    totalPredictions: predictions.length,
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter((a) => a.status === 'active').length,
    criticalAlerts: alerts.filter((a) => a.riskLevel === 'CRITICAL' && a.status === 'active').length,
    highRiskLocations: stations.filter((s) => s.riskLevel === 'HIGH' || s.riskLevel === 'CRITICAL').length,
    datasetRecords: datasets.reduce((acc, d) => acc + d.rowCount, 0),
    currentModelVersion: activeModel.version,
    modelMetrics: activeModel.metrics,
    systemStatus: 'ONLINE_OPTIMAL',
  });
});

apiRouter.get('/admin/users', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  return res.json({ users: db.getUsers() });
});

apiRouter.put('/admin/users/:id/status', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const { status } = req.body;
  if (status !== 'active' && status !== 'inactive') {
    return res.status(400).json({ error: 'Invalid status. Must be active or inactive.' });
  }

  const updated = db.updateUserStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ message: 'User status updated', user: updated });
});

apiRouter.delete('/admin/users/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  if (req.params.id === user.id) {
    return res.status(400).json({ error: 'You cannot delete your own admin account.' });
  }

  const deleted = db.deleteUser(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ message: 'User removed successfully.' });
});

apiRouter.get('/admin/datasets', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  return res.json({ datasets: db.getDatasets() });
});

apiRouter.post('/admin/datasets/upload', upload.single('datasetFile'), (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator access required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No CSV file was uploaded.' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const lines = fileContent.split('\n').filter((l) => l.trim().length > 0);

    if (lines.length < 2) {
      return res.status(400).json({ error: 'Uploaded file is empty or does not contain header and data rows.' });
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows: any[] = [];
    let missingValuesCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      const rowObj: Record<string, any> = { id: `row-${i}` };

      headers.forEach((hdr, idx) => {
        const val = parts[idx];
        if (val === undefined || val === '' || val === 'NaN' || val === 'null') {
          missingValuesCount++;
          rowObj[hdr] = null;
        } else {
          const numVal = Number(val);
          rowObj[hdr] = !isNaN(numVal) ? numVal : val;
        }
      });
      rows.push(rowObj);
    }

    const datasetName = req.body.datasetName || req.file.originalname.replace('.csv', '');
    const newDataset = db.addDataset(
      {
        id: `dataset-${Date.now()}`,
        name: datasetName,
        filename: req.file.originalname,
        rowCount: rows.length,
        columnCount: headers.length,
        columns: headers,
        missingValues: missingValuesCount,
        uploadedBy: user.name,
        uploadedAt: new Date().toISOString(),
        status: 'active',
        fileSize: `${(req.file.size / 1024).toFixed(1)} KB`,
        previewData: rows.slice(0, 10),
      },
      rows
    );

    return res.status(201).json({
      message: `Dataset '${datasetName}' successfully validated and stored with ${rows.length} rows.`,
      dataset: newDataset,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Dataset processing failed' });
  }
});

apiRouter.delete('/admin/datasets/:id', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const success = db.deleteDataset(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Dataset not found.' });
  }
  return res.json({ message: 'Dataset deleted successfully.' });
});

apiRouter.get('/admin/models', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  return res.json({
    activeModel: mlEngine.getModelVersion(),
    versions: db.getModelVersions(),
    featureImportance: mlEngine.getFeatureImportance(),
  });
});

apiRouter.post('/admin/models/train', (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator access required.' });
    }

    const { datasetId, algorithm } = req.body;
    const activeDatasetId = datasetId || db.getDatasets()[0]?.id;

    if (!activeDatasetId) {
      return res.status(400).json({ error: 'No active dataset available for model training.' });
    }

    const rows = db.getDatasetRows(activeDatasetId);
    if (!rows || rows.length < 10) {
      return res.status(400).json({ error: 'Selected dataset does not contain sufficient rows (min 10 required).' });
    }

    // Trigger ML Training
    const trainResult = mlEngine.retrainModel(rows, algorithm || 'Random Forest Regressor (Ensemble)');
    db.addModelVersion(trainResult.version);

    // Broadcast system notification
    db.createNotification({
      title: 'New ML Wave Model Deployed',
      message: `Model version ${trainResult.version.version} trained with R² score ${trainResult.metrics.r2Score} and MAE ${trainResult.metrics.mae}m.`,
      type: 'system',
      severity: 'info',
      read: false,
      link: '/admin/models',
    });

    return res.json({
      message: 'ML Model retrained and activated successfully',
      result: trainResult,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Model training failed.' });
  }
});

apiRouter.get('/admin/settings/thresholds', (req: Request, res: Response) => {
  return res.json({ thresholds: db.getThresholds() });
});

apiRouter.put('/admin/settings/thresholds', (req: Request, res: Response) => {
  const user = getAuthenticatedUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }

  const updated = db.updateThresholds(req.body);
  return res.json({ message: 'Risk thresholds updated successfully', thresholds: updated });
});
