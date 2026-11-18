import { prisma } from '../db';

export interface CreatePatientInput {
  name: string;
  birthDate?: string;
}

export async function createPatient(input: CreatePatientInput) {
  return prisma.patient.create({
    data: {
      name: input.name,
      birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
    },
  });
}

export async function listPatients() {
  return prisma.patient.findMany({
    orderBy: { createdAt: 'desc' },
    include: { caregivers: true, medications: true },
  });
}

export async function getPatientById(id: string) {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      caregivers: true,
      medications: true,
      seizures: { orderBy: { occurredAt: 'desc' } },
      alerts: { orderBy: { createdAt: 'desc' } },
    },
  });
}
