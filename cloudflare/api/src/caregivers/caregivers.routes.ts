import { Hono } from 'hono';
import { getPrisma } from '../db';
import { authMiddleware, authUserId } from '../auth/auth.middleware';
import { addCaregiver, listCaregiversForPatient } from './caregivers.service';
import type { AppEnv } from '../hono-types';

export const caregiversRoutes = new Hono<AppEnv>();

// All caregiver routes require a valid JWT (see auth.middleware).
caregiversRoutes.use(authMiddleware);

caregiversRoutes.post('/', async (c) => {
  const body = (c.get('body') ?? {}) as Record<string, unknown>;
  const { patientId, name } = body;
  if (!patientId || !name) {
    return c.json({ message: 'patientId and name are required' }, 400);
  }
  try {
    const caregiver = await addCaregiver(
      getPrisma(c.env),
      { patientId: patientId as string, name: name as string },
      authUserId(c),
    );
    return c.json({ caregiver }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return c.json({ message: 'Patient not found' }, 404);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

caregiversRoutes.get('/patient/:patientId', async (c) => {
  try {
    const caregivers = await listCaregiversForPatient(
      getPrisma(c.env),
      c.req.param('patientId'),
      authUserId(c),
    );
    return c.json({ patientId: c.req.param('patientId'), caregivers });
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return c.json({ message: 'Patient not found' }, 404);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});
