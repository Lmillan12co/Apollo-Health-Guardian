import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import { verifyToken } from './jwt.service';
import type { AppEnv } from '../hono-types';

// Hono middleware: reads the Bearer token, verifies the HS256 JWT and
// stores the user in the request context. Same 401 responses as the
// Express version ("Missing authorization token" / "Invalid token").
export const authMiddleware = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization');

  if (!header) {
    return c.json({ message: 'Missing authorization token' }, 401);
  }

  const token = header.replace('Bearer ', '');
  const user = await verifyToken(token, c.env);

  if (!user) {
    return c.json({ message: 'Invalid token' }, 401);
  }

  c.set('user', user);
  await next();
});

// Reads the user the middleware stored. Only call after authMiddleware ran.
export function authUserId(c: Context<AppEnv>): string {
  const user = c.get('user');
  if (!user) throw new Error('authMiddleware did not run before this route');
  return user.id;
}
