import { prisma } from '../db';

export interface CreatePatientInput {
  name: string;
  birthDate?: string;
}

// Throws 'PATIENT_NOT_FOUND' when the patient does not exist or does not
// belong to this user. Routes translate it to 404, so one user can never
// learn whether another user's patient exists.
export async function assertPatientOwned(patientId: string, userId: string): Promise<void> {
  const patient = await prisma.patient.findFirst({
    where: { id: patientId, userId },
    select: { id: true },
  });
  if (!patient) throw new Error('PATIENT_NOT_FOUND');
}

export async function createPatient(input: CreatePatientInput, userId: string) {
  return prisma.patient.create({
    data: {
      name: input.name,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      userId,
    },
  });
}

export async function listPatients(userId: string) {
  return prisma.patient.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { caregivers: true, medications: true },
  });
}

export async function getPatientById(id: string, userId: string) {
  return prisma.patient.findFirst({
    where: { id, userId },
    include: {
      caregivers: true,
      medications: true,
      seizures: { orderBy: { occurredAt: 'desc' } },
      alerts: { orderBy: { createdAt: 'desc' } },
    },
  });
}
