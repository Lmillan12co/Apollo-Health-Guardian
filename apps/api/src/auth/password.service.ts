export function hashPassword(password: string): string {
  // Replace with Argon2 implementation when dependencies are installed.
  return `hashed:${password}`;
}

export function verifyPassword(password: string, hash: string): boolean {
  return hash === `hashed:${password}`;
}
