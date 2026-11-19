import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './auth/auth.routes';
import usersRoutes from './users/users.routes';
import patientsRoutes from './patients/patients.routes';
import seizuresRoutes from './seizures/seizures.routes';
import medicationsRoutes from './medications/medications.routes';
import alertsRoutes from './alerts/alerts.routes';
import caregiversRoutes from './caregivers/caregivers.routes';

if (!process.env.JWT_SECRET) {
  console.error(
    'FATAL: JWT_SECRET is not set. Copy apps/api/.env.example to apps/api/.env ' +
      'and set a long random secret, or set JWT_SECRET in the environment.',
  );
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error(
    'FATAL: DATABASE_URL is not set. Copy apps/api/.env.example to apps/api/.env ' +
      'and set the PostgreSQL connection string.',
  );
  process.exit(1);
}

const app = express();

// CORS is allow-listed: only the origins in CORS_ORIGIN (comma-separated)
// may call the API from a browser. The demo page (demo/index.html) calls the
// API cross-origin, so set CORS_ORIGIN to the origin that serves the demo
// page when you deploy it. With CORS_ORIGIN unset, no cross-origin browser
// call is allowed at all (safest default).
const corsOrigins = (process.env.CORS_ORIGIN ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: corsOrigins.length > 0 ? corsOrigins : false }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    service: 'apollo-api',
    status: 'ok',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/seizures', seizuresRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/caregivers', caregiversRoutes);

// JSON 404 for unknown /api routes (instead of Express' default HTML error page).
app.use('/api', (_req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Cloud Run injects PORT. Default 3001 for local development.
const port = Number(process.env.PORT) || 3001;

app.listen(port, () => {
  console.log(`Apollo API running on port ${port}`);
});
