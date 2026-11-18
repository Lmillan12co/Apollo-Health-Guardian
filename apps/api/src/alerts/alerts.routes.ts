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

router.post('/sos', async (req, res) => {
  const { patientId } = req.body ?? {};
  if (!patientId) return res.status(400).json({ message: 'patientId is required' });
  const alert = await createAlertRecord({ patientId, type: 'SOS' });
  return res.status(201).json({ alert, message: 'SOS alert created' });
});

router.post('/', async (req, res) => {
  const { patientId, type } = req.body ?? {};
  if (!patientId || !type) {
    return res.status(400).json({ message: 'patientId and type are required' });
  }
  if (!['SOS', 'SEIZURE_DETECTED', 'MEDICATION_REMINDER'].includes(type)) {
    return res
      .status(400)
      .json({ message: 'type must be SOS, SEIZURE_DETECTED or MEDICATION_REMINDER' });
  }
  const alert = await createAlertRecord({ patientId, type });
  return res.status(201).json({ alert });
});

router.get('/patient/:patientId', async (req, res) => {
  const alerts = await listAlertsForPatient(req.params.patientId);
  return res.json({ patientId: req.params.patientId, alerts });
});

router.post('/:id/acknowledge', async (req, res) => {
  try {
    const alert = await acknowledgeAlert(req.params.id);
    return res.json({ alert });
  } catch {
    return res.status(404).json({ message: 'Alert not found' });
  }
});

export default router;
