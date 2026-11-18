import { prisma } from '../db';

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

export async function logSeizureEvent(input: CreateSeizureInput) {
  return prisma.seizureEvent.create({ data: prepareSeizureEvent(input) });
}

export async function listSeizuresForPatient(patientId: string) {
  return prisma.seizureEvent.findMany({
    where: { patientId },
    orderBy: { occurredAt: 'desc' },
  });
}
