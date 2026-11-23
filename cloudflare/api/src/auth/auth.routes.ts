import { Hono } from 'hono';
import { getPrisma } from '../db';
import { createToken } from './jwt.service';
import { verifyPassword } from './password.service';
import { createUser, toPublicUser } from '../users/users.service';
import type { AppEnv } from '../hono-types';
import type { UserRole } from './auth.types';

const ROLES: UserRole[] = ['PATIENT', 'CAREGIVER', 'DOCTOR', 'ADMIN'];

export const authRoutes = new Hono<AppEnv>();

authRoutes.post('/register', async (c) => {
  try {
    const body = (c.get('body') ?? {}) as Record<string, unknown>;
    const { name, email, password, role } = body;
    if (!name || !email || !password || !role) {
      return c.json({ message: 'name, email, password and role are required' }, 400);
    }
    if (!ROLES.includes(role as UserRole)) {
      return c.json({ message: `role must be one of: ${ROLES.join(', ')}` }, 400);
    }
    if (typeof password !== 'string' || password.length < 8) {
      return c.json({ message: 'password must be at least 8 characters' }, 400);
    }
    const prisma = getPrisma(c.env);
    const user = await createUser(prisma, {
      name: name as string,
      email: email as string,
      password,
      role: role as string,
    });
    const token = await createToken(
      { id: user.id, email: user.email, role: user.role as UserRole },
      c.env,
    );
    return c.json({ user, token }, 201);
  } catch (err) {
    if (err instanceof Error && err.message === 'EMAIL_ALREADY_REGISTERED') {
      return c.json({ message: 'That email is already registered' }, 409);
    }
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});

authRoutes.post('/login', async (c) => {
  try {
    const body = (c.get('body') ?? {}) as Record<string, unknown>;
    const { email, password } = body;
    if (!email || !password) {
      return c.json({ message: 'email and password are required' }, 400);
    }
    const prisma = getPrisma(c.env);
    const user = await prisma.user.findUnique({ where: { email: email as string } });
    if (!user || !(await verifyPassword(password as string, user.password))) {
      return c.json({ message: 'Invalid email or password' }, 401);
    }
    const publicUser = toPublicUser(user);
    const token = await createToken(
      { id: user.id, email: user.email, role: user.role as UserRole },
      c.env,
    );
    return c.json({ user: publicUser, token });
  } catch (err) {
    console.error(err);
    return c.json({ message: 'Internal server error' }, 500);
  }
});
