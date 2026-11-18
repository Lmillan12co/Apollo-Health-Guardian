import { prisma } from '../db';

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

export async function createAlertRecord(input: CreateAlertInput) {
  return prisma.alert.create({ data: createAlert(input) });
}

export async function listAlertsForPatient(patientId: string) {
  return prisma.alert.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function acknowledgeAlert(id: string) {
  return prisma.alert.update({ where: { id }, data: { status: 'ACKNOWLEDGED' } });
}
