import type { PrismaClient } from '@prisma/client';
import { assertPatientOwned } from '../patients/patients.service';

export interface CreateSeizureInput {
  patientId: string;
  occurredAt: Date;
  durationSeconds?: number;
  notes?: string;
}

export function prepareSeizureEvent(input: CreateSeizureInput) {
  return {
    ...input,
    occurredAt: input.occurredAt ?? new Date(),
  };
}

export async function logSeizureEvent(
  prisma: PrismaClient,
  input: CreateSeizureInput,
  userId: string,
) {
  await assertPatientOwned(prisma, input.patientId, userId);
  return prisma.seizureEvent.create({ data: prepareSeizureEvent(input) });
}

export async function listSeizuresForPatient(
  prisma: PrismaClient,
  patientId: string,
  userId: string,
) {
  await assertPatientOwned(prisma, patientId, userId);
  return prisma.seizureEvent.findMany({
    where: { patientId },
    orderBy: { occurredAt: 'desc' },
  });
}
