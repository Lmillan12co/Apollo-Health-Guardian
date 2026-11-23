import { Hono } from 'hono';
import { getPrisma } from '../db';
import { authMiddleware, authUserId } from '../auth/auth.middleware';
import { findUserById } from './users.service';
import type { AppEnv } from '../hono-types';

export const usersRoutes = new Hono<AppEnv>();

usersRoutes.get('/profile', authMiddleware, async (c) => {
  const user = await findUserById(getPrisma(c.env), authUserId(c));
  if (!user) return c.json({ message: 'User not found' }, 404);
  return c.json({ user });
});
