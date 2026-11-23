export type UserRole =
  | 'PATIENT'
  | 'CAREGIVER'
  | 'DOCTOR'
  | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}
