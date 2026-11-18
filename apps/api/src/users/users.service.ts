import { prisma } from '../db';
import { hashPassword } from '../auth/password.service';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
};

// The password hash never leaves the server.
export function toPublicUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function createUser(input: CreateUserInput): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new Error('EMAIL_ALREADY_REGISTERED');
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: await hashPassword(input.password),
      role: input.role,
    },
  });
  return toPublicUser(user);
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserById(id: string): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user ? toPublicUser(user) : null;
}
