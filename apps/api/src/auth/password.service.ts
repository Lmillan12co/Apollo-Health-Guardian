import bcrypt from 'bcryptjs';

// Real password hashing with bcrypt (cost factor 10).
// The old implementation stored `hashed:${password}` in plain text —
// never use it. Passwords are never stored or logged in plain text.
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
