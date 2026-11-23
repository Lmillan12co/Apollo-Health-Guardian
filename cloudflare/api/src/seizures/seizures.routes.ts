import { Hono } from 'hono';
import { getPrisma } from '../db';
import { authMiddleware, authUserId } from '../auth/auth.middleware';
import { logSeizureEvent, listSeizuresForPatient } from './seizures.service';
import type { AppEnv } from '../hono-types';

export const seizuresRoutes = new Hono<AppEnv>();

// All seizure routes require a valid JWT (see auth.middleware).
seizuresRoutes.use(authMiddleware);

seizuresRoutes.post('/', async (c) => {
  const body = (c.get('body') ?? {}) as Record<string, unknown>;
  const { patientId, occurredAt, durationSeconds, notes } = body;
  if (!patientId) return c.json({ message: 'patientId is required' }, 400);
  try {
    const event = await logSeizureEvent(
      getPrisma(c.env),
      {
        patientId: patientId as string,
        occurredAt: occurredAt ? new Date(occurredAt as string) : new Date(),
        durationSeconds:
          durationSeconds !== undefined ? Number(durationSeconds) : undefined,
        notes: notes as string | undefined,
      },
      authUserId(c),
    );
    return c.json({ event }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return c.json({ message: 'Patient not found' }, 404);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

seizuresRoutes.get('/:patientId', async (c) => {
  try {
    const events = await listSeizuresForPatient(
      getPrisma(c.env),
      c.req.param('patientId'),
      authUserId(c),
    );
    return c.json({ patientId: c.req.param('patientId'), events });
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return c.json({ message: 'Patient not found' }, 404);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});
