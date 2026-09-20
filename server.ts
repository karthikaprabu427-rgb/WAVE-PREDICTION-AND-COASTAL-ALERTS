import cors from 'cors';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API Routes
  app.use('/api', apiRouter);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Wave Prediction & Coastal Alerts Full-Stack Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Catch unhandled /api requests with a clean JSON 404 response instead of falling through to Vite/HTML
  app.all(['/api', '/api/*'], (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  });

  // Global API error handler to guarantee JSON responses for all /api endpoints
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.error('API Error:', err);
      return res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    }
    next(err);
  });

  // Start background simulation ticker (default 60s cycle for server-side telemetry evolution)
  setInterval(() => {
    try {
      db.simulateOceanConditionsStep();
    } catch (err) {
      console.error('Simulation step error:', err);
    }
  }, 60000);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌊 Wave Prediction & Coastal Alerts server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to boot fullstack server:', err);
});
