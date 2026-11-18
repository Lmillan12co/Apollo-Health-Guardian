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

router.post('/', async (req, res) => {
  const { patientId, name, dosage, schedule } = req.body ?? {};
  if (!patientId || !name) {
    return res.status(400).json({ message: 'patientId and name are required' });
  }
  const medication = await addMedication({ patientId, name, dosage, schedule });
  return res.status(201).json({ medication });
});

router.get('/patient/:patientId', async (req, res) => {
  const medications = await listMedicationsForPatient(req.params.patientId);
  return res.json({ patientId: req.params.patientId, medications });
});

router.delete('/:id', async (req, res) => {
  try {
    await deleteMedication(req.params.id);
    return res.status(204).send();
  } catch {
    return res.status(404).json({ message: 'Medication not found' });
  }
});

export default router;
