import jwt, { type SignOptions } from 'jsonwebtoken';
import type { AuthUser } from './auth.types';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      'JWT_SECRET is not set. Set it in the environment (see apps/api/.env.example).',
    );
  }
  return secret;
}

// Real signed JWT (HS256). The old implementation was plain base64 —
// anyone could forge a token. Never use it.
export function createToken(user: AuthUser): string {
  // JWT_EXPIRES_IN is a plain string from the environment; jsonwebtoken's
  // types only accept a number or a "<number><unit>" string like "7d",
  // so validate the shape instead of passing an arbitrary string.
  const raw = process.env.JWT_EXPIRES_IN ?? '7d';
  const expiresIn: SignOptions['expiresIn'] = /^\d+[smhdw]$/.test(raw)
    ? (raw as SignOptions['expiresIn'])
    : '7d';
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getSecret(),
    { expiresIn },
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as AuthUser;
    return { id: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}
