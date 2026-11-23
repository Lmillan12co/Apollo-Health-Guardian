import { SignJWT, jwtVerify } from 'jose';
import type { AuthUser } from './auth.types';
import { getJwtExpiresIn, type Env } from '../env';

function getSecret(env: Env): Uint8Array {
  if (!env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET is not set. Set it with `wrangler secret put JWT_SECRET`.',
    );
  }
  return new TextEncoder().encode(env.JWT_SECRET);
}

// Real signed JWT (HS256) using WebCrypto via `jose` — the
// Workers-compatible replacement for `jsonwebtoken` (Node-only).
// Tokens are byte-identical in shape to the Express version's (same claims,
// same algorithm, same default 7d expiry), so a token minted by one
// deployment verifies on the other as long as JWT_SECRET matches.
export async function createToken(user: AuthUser, env: Env): Promise<string> {
  return new SignJWT({ id: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(getJwtExpiresIn(env))
    .sign(getSecret(env));
}

export async function verifyToken(token: string, env: Env): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(env), {
      algorithms: ['HS256'],
    });
    const id = payload.id as string | undefined;
    const email = payload.email as string | undefined;
    const role = payload.role as AuthUser['role'] | undefined;
    if (!id || !email || !role) return null;
    return { id, email, role };
  } catch {
    return null;
  }
}
