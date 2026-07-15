import { hashPassword } from '../auth/password.service';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: string;
}

export function prepareUser(input: CreateUserInput) {
  return {
    ...input,
    password: hashPassword(input.password),
  };
}
