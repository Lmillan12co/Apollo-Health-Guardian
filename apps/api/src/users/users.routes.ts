import { Router } from 'express';
import { authMiddleware } from '../auth/auth.middleware';
import { findUserById } from './users.service';

const router = Router();

router.get('/profile', authMiddleware, async (req, res) => {
  const authUser = (req as unknown as { user: { id: string } }).user;
  const user = await findUserById(authUser.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user });
});

export default router;
