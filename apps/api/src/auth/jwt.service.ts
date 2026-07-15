import type { AuthUser } from './auth.types';

export function createToken(user: AuthUser): string {
  return Buffer.from(JSON.stringify(user)).toString('base64');
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString()) as AuthUser;
  } catch {
    return null;
  }
}
