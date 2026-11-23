import { Hono } from 'hono';
import { getPrisma } from '../db';
import { authMiddleware, authUserId } from '../auth/auth.middleware';
import {
  createAlertRecord,
  listAlertsForPatient,
  acknowledgeAlert,
} from './alerts.service';
import type { AppEnv } from '../hono-types';

export const alertsRoutes = new Hono<AppEnv>();

// All alert routes require a valid JWT (see auth.middleware).
alertsRoutes.use(authMiddleware);

alertsRoutes.post('/sos', async (c) => {
  const body = (c.get('body') ?? {}) as Record<string, unknown>;
  const { patientId } = body;
  if (!patientId) return c.json({ message: 'patientId is required' }, 400);
  try {
    const alert = await createAlertRecord(
      getPrisma(c.env),
      { patientId: patientId as string, type: 'SOS' },
      authUserId(c),
    );
    return c.json({ alert, message: 'SOS alert created' }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return c.json({ message: 'Patient not found' }, 404);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

alertsRoutes.post('/', async (c) => {
  const body = (c.get('body') ?? {}) as Record<string, unknown>;
  const { patientId, type } = body;
  if (!patientId || !type) {
    return c.json({ message: 'patientId and name are required' }, 400);
  }
  if (!['SOS', 'SEIZURE_DETECTED', 'MEDICATION_REMINDER'].includes(type as string)) {
    return c.json(
      { message: 'type must be SOS, SEIZURE_DETECTED or MEDICATION_REMINDER' },
      400,
    );
  }
  try {
    const alert = await createAlertRecord(
      getPrisma(c.env),
      {
        patientId: patientId as string,
        type: type as 'SOS' | 'SEIZURE_DETECTED' | 'MEDICATION_REMINDER',
      },
      authUserId(c),
    );
    return c.json({ alert }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return c.json({ message: 'Patient not found' }, 404);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

alertsRoutes.get('/patient/:patientId', async (c) => {
  try {
    const alerts = await listAlertsForPatient(
      getPrisma(c.env),
      c.req.param('patientId'),
      authUserId(c),
    );
    return c.json({ patientId: c.req.param('patientId'), alerts });
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return c.json({ message: 'Patient not found' }, 404);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

alertsRoutes.post('/:id/acknowledge', async (c) => {
  try {
    const alert = await acknowledgeAlert(getPrisma(c.env), c.req.param('id'), authUserId(c));
    return c.json({ alert });
  } catch (err) {
    if (err instanceof Error && err.message === 'ALERT_NOT_FOUND') {
      return c.json({ message: 'Alert not found' }, 404);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});
