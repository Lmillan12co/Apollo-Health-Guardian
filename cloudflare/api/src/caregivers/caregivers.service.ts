import type { PrismaClient } from '@prisma/client';
import { assertPatientOwned } from '../patients/patients.service';

export interface CreateCaregiverInput {
  patientId: string;
  name: string;
}

export async function addCaregiver(
  prisma: PrismaClient,
  input: CreateCaregiverInput,
  userId: string,
) {
  await assertPatientOwned(prisma, input.patientId, userId);
  return prisma.caregiver.create({ data: input });
}

export async function listCaregiversForPatient(
  prisma: PrismaClient,
  patientId: string,
  userId: string,
) {
  await assertPatientOwned(prisma, patientId, userId);
  return prisma.caregiver.findMany({ where: { patientId } });
}
