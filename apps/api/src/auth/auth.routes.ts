import { Router } from 'express';

const router = Router();

router.post('/register', (_req, res) => {
  res.json({ message: 'Register endpoint ready' });
});

router.post('/login', (_req, res) => {
  res.json({ message: 'Login endpoint ready' });
});

export default router;
