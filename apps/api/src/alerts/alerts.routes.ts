import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import {
  createAlertRecord,
  listAlertsForPatient,
  acknowledgeAlert,
} from './alerts.service';

const router = Router();

// All alert routes require a valid JWT (see auth.middleware).
router.use(authMiddleware);

function authUserId(req: unknown): string {
  return (req as unknown as { user: { id: string } }).user.id;
}

router.post('/sos', async (req, res) => {
  const { patientId } = req.body ?? {};
  if (!patientId) return res.status(400).json({ message: 'patientId is required' });
  try {
    const alert = await createAlertRecord({ patientId, type: 'SOS' }, authUserId(req));
    return res.status(201).json({ alert, message: 'SOS alert created' });
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const { patientId, type } = req.body ?? {};
  if (!patientId || !type) {
    return res.status(400).json({ message: 'patientId and name are required' });
  }
  if (!['SOS', 'SEIZURE_DETECTED', 'MEDICATION_REMINDER'].includes(type)) {
    return res
      .status(400)
      .json({ message: 'type must be SOS, SEIZURE_DETECTED or MEDICATION_REMINDER' });
  }
  try {
    const alert = await createAlertRecord({ patientId, type }, authUserId(req));
    return res.status(201).json({ alert });
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/patient/:patientId', async (req, res) => {
  try {
    const alerts = await listAlertsForPatient(req.params.patientId, authUserId(req));
    return res.json({ patientId: req.params.patientId, alerts });
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/acknowledge', async (req, res) => {
  try {
    const alert = await acknowledgeAlert(req.params.id, authUserId(req));
    return res.json({ alert });
  } catch (err) {
    if (err instanceof Error && err.message === 'ALERT_NOT_FOUND') {
      return res.status(404).json({ message: 'Alert not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
