import { Router } from 'express';

const router = Router();

router.post('/', (_req, res) => {
  res.json({ message: 'Seizure event registration ready' });
});

router.get('/:patientId', (req, res) => {
  res.json({ patientId: req.params.patientId, events: [] });
});

export default router;
