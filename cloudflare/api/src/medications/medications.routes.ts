import { Hono } from 'hono';
import { getPrisma } from '../db';
import { authMiddleware, authUserId } from '../auth/auth.middleware';
import {
  addMedication,
  listMedicationsForPatient,
  deleteMedication,
} from './medications.service';
import type { AppEnv } from '../hono-types';

export const medicationsRoutes = new Hono<AppEnv>();

// All medication routes require a valid JWT (see auth.middleware).
medicationsRoutes.use(authMiddleware);

medicationsRoutes.post('/', async (c) => {
  const body = (c.get('body') ?? {}) as Record<string, unknown>;
  const { patientId, name, dosage, schedule } = body;
  if (!patientId || !name) {
    return c.json({ message: 'patientId and name are required' }, 400);
  }
  try {
    const medication = await addMedication(
      getPrisma(c.env),
      {
        patientId: patientId as string,
        name: name as string,
        dosage: dosage as string | undefined,
        schedule: schedule as string | undefined,
      },
      authUserId(c),
    );
    return c.json({ medication }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return c.json({ message: 'Patient not found' }, 404);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

medicationsRoutes.get('/patient/:patientId', async (c) => {
  try {
    const medications = await listMedicationsForPatient(
      getPrisma(c.env),
      c.req.param('patientId'),
      authUserId(c),
    );
    return c.json({ patientId: c.req.param('patientId'), medications });
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return c.json({ message: 'Patient not found' }, 404);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

medicationsRoutes.delete('/:id', async (c) => {
  try {
    await deleteMedication(getPrisma(c.env), c.req.param('id'), authUserId(c));
    return new Response(null, { status: 204 });
  } catch (err) {
    if (err instanceof Error && err.message === 'MEDICATION_NOT_FOUND') {
      return c.json({ message: 'Medication not found' }, 404);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});
