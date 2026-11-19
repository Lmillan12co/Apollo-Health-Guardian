import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { addCaregiver, listCaregiversForPatient } from './caregivers.service';

const router = Router();

// All caregiver routes require a valid JWT (see auth.middleware).
router.use(authMiddleware);

function authUserId(req: unknown): string {
  return (req as unknown as { user: { id: string } }).user.id;
}

router.post('/', async (req, res) => {
  const { patientId, name } = req.body ?? {};
  if (!patientId || !name) {
    return res.status(400).json({ message: 'patientId and name are required' });
  }
  try {
    const caregiver = await addCaregiver({ patientId, name }, authUserId(req));
    return res.status(201).json({ caregiver });
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
    const caregivers = await listCaregiversForPatient(req.params.patientId, authUserId(req));
    return res.json({ patientId: req.params.patientId, caregivers });
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
