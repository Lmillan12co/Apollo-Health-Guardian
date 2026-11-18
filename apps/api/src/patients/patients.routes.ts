import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { createPatient, listPatients, getPatientById } from './patients.service';

const router = Router();

// All patient routes require a valid JWT (see auth.middleware).
router.use(authMiddleware);

router.get('/', async (_req, res) => {
  const patients = await listPatients();
  return res.json({ patients });
});

router.post('/', async (req, res) => {
  const { name, birthDate } = req.body ?? {};
  if (!name) return res.status(400).json({ message: 'name is required' });
  const patient = await createPatient({ name, birthDate });
  return res.status(201).json({ patient });
});

router.get('/:id', async (req, res) => {
  const patient = await getPatientById(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  return res.json({ patient });
});

export default router;
