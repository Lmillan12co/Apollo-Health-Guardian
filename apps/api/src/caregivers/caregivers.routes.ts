import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { addCaregiver, listCaregiversForPatient } from './caregivers.service';

const router = Router();

// All caregiver routes require a valid JWT (see auth.middleware).
router.use(authMiddleware);

router.post('/', async (req, res) => {
  const { patientId, name } = req.body ?? {};
  if (!patientId || !name) {
    return res.status(400).json({ message: 'patientId and name are required' });
  }
  const caregiver = await addCaregiver({ patientId, name });
  return res.status(201).json({ caregiver });
});

router.get('/patient/:patientId', async (req, res) => {
  const caregivers = await listCaregiversForPatient(req.params.patientId);
  return res.json({ patientId: req.params.patientId, caregivers });
});

export default router;
