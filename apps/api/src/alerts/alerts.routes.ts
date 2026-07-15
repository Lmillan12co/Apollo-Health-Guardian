import { Router } from 'express';

const router = Router();

router.post('/sos', (_req, res) => {
  res.json({ message: 'SOS alert created' });
});

export default router;
