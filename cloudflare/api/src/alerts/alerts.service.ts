import type { PrismaClient } from '@prisma/client';
import { assertPatientOwned } from '../patients/patients.service';

export interface CreateAlertInput {
  patientId: string;
  type: 'SOS' | 'SEIZURE_DETECTED' | 'MEDICATION_REMINDER';
}

export function createAlert(input: CreateAlertInput) {
  return {
    ...input,
    status: 'PENDING',
    createdAt: new Date(),
  };
}

export async function createAlertRecord(
  prisma: PrismaClient,
  input: CreateAlertInput,
  userId: string,
) {
  await assertPatientOwned(prisma, input.patientId, userId);
  return prisma.alert.create({ data: createAlert(input) });
}

export async function listAlertsForPatient(
  prisma: PrismaClient,
  patientId: string,
  userId: string,
) {
  await assertPatientOwned(prisma, patientId, userId);
  return prisma.alert.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function acknowledgeAlert(prisma: PrismaClient, id: string, userId: string) {
  const result = await prisma.alert.updateMany({
    where: { id, patient: { userId } },
    data: { status: 'ACKNOWLEDGED' },
  });
  if (result.count === 0) throw new Error('ALERT_NOT_FOUND');
  return prisma.alert.findUnique({ where: { id } });
}
