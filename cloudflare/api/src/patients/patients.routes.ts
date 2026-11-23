import { Hono } from 'hono';
import { getPrisma } from '../db';
import { authMiddleware, authUserId } from '../auth/auth.middleware';
import { createPatient, listPatients, getPatientById } from './patients.service';
import type { AppEnv } from '../hono-types';

export const patientsRoutes = new Hono<AppEnv>();

// All patient routes require a valid JWT (see auth.middleware).
patientsRoutes.use(authMiddleware);

// The JWT payload (see auth.types.ts) carries the caller's id. Every query
// is scoped to that user, so one account can only ever see its own patients.
patientsRoutes.get('/', async (c) => {
  const patients = await listPatients(getPrisma(c.env), authUserId(c));
  return c.json({ patients });
});

patientsRoutes.post('/', async (c) => {
  const body = (c.get('body') ?? {}) as Record<string, unknown>;
  const { name, birthDate } = body;
  if (!name) return c.json({ message: 'name is required' }, 400);
  const patient = await createPatient(
    getPrisma(c.env),
    { name: name as string, birthDate: birthDate as string | undefined },
    authUserId(c),
  );
  return c.json({ patient }, 201);
});

patientsRoutes.get('/:id', async (c) => {
  const patient = await getPatientById(getPrisma(c.env), c.req.param('id'), authUserId(c));
  if (!patient) return c.json({ message: 'Patient not found' }, 404);
  return c.json({ patient });
});
