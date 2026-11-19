import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { logSeizureEvent, listSeizuresForPatient } from './seizures.service';

const router = Router();

// All seizure routes require a valid JWT (see auth.middleware).
router.use(authMiddleware);

function authUserId(req: unknown): string {
  return (req as unknown as { user: { id: string } }).user.id;
}

router.post('/', async (req, res) => {
  const { patientId, occurredAt, durationSeconds, notes } = req.body ?? {};
  if (!patientId) return res.status(400).json({ message: 'patientId is required' });
  try {
    const event = await logSeizureEvent(
      {
        patientId,
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        durationSeconds: durationSeconds !== undefined ? Number(durationSeconds) : undefined,
        notes,
      },
      authUserId(req),
    );
    return res.status(201).json({ event });
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:patientId', async (req, res) => {
  try {
    const events = await listSeizuresForPatient(req.params.patientId, authUserId(req));
    return res.json({ patientId: req.params.patientId, events });
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
