import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import {
  addMedication,
  listMedicationsForPatient,
  deleteMedication,
} from './medications.service';

const router = Router();

// All medication routes require a valid JWT (see auth.middleware).
router.use(authMiddleware);

function authUserId(req: unknown): string {
  return (req as unknown as { user: { id: string } }).user.id;
}

router.post('/', async (req, res) => {
  const { patientId, name, dosage, schedule } = req.body ?? {};
  if (!patientId || !name) {
    return res.status(400).json({ message: 'patientId and name are required' });
  }
  try {
    const medication = await addMedication({ patientId, name, dosage, schedule }, authUserId(req));
    return res.status(201).json({ medication });
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
    const medications = await listMedicationsForPatient(req.params.patientId, authUserId(req));
    return res.json({ patientId: req.params.patientId, medications });
  } catch (err) {
    if (err instanceof Error && err.message === 'PATIENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteMedication(req.params.id, authUserId(req));
    return res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message === 'MEDICATION_NOT_FOUND') {
      return res.status(404).json({ message: 'Medication not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
