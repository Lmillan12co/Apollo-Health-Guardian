export const roles = {
  PATIENT: ['profile:read', 'seizure:create'],
  CAREGIVER: ['patient:read', 'alert:create'],
  DOCTOR: ['patient:read', 'reports:read'],
  ADMIN: ['users:manage']
} as const;
