import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { logSeizureEvent, listSeizuresForPatient } from './seizures.service';

const router = Router();

// All seizure routes require a valid JWT (see auth.middleware).
router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { patientId, occurredAt, durationSeconds, notes } = req.body ?? {};
  if (!patientId) return res.status(400).json({ message: 'patientId is required' });
  const event = await logSeizureEvent({
    patientId,
    occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
    durationSeconds: durationSeconds !== undefined ? Number(durationSeconds) : undefined,
    notes,
  });
  return res.status(201).json({ event });
});

router.get('/:patientId', async (req, res) => {
  const events = await listSeizuresForPatient(req.params.patientId);
  return res.json({ patientId: req.params.patientId, events });
});

export default router;
