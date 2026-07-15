import { Router } from 'express';

const router = Router();

router.get('/profile', (_req, res) => {
  res.json({ message: 'Profile endpoint ready' });
});

export default router;
