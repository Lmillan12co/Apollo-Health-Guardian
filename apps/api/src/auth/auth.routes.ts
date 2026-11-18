import { Router } from 'express';
import { prisma } from '../db';
import { createToken } from './jwt.service';
import { verifyPassword } from './password.service';
import { createUser, toPublicUser } from '../users/users.service';
import type { UserRole } from './auth.types';

const router = Router();

const ROLES: UserRole[] = ['PATIENT', 'CAREGIVER', 'DOCTOR', 'ADMIN'];

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body ?? {};
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: `role must be one of: ${ROLES.join(', ')}` });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'password must be at least 8 characters' });
    }
    const user = await createUser({ name, email, password, role });
    const token = createToken({ id: user.id, email: user.email, role: user.role as UserRole });
    return res.status(201).json({ user, token });
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_ALREADY_REGISTERED') {
      return res.status(409).json({ message: 'That email is already registered' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const publicUser = toPublicUser(user);
    const token = createToken({ id: user.id, email: user.email, role: user.role as UserRole });
    return res.json({ user: publicUser, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
