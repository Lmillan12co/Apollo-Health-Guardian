import { prisma } from '../db';

export interface CreateCaregiverInput {
  patientId: string;
  name: string;
}

export async function addCaregiver(input: CreateCaregiverInput) {
  return prisma.caregiver.create({ data: input });
}

export async function listCaregiversForPatient(patientId: string) {
  return prisma.caregiver.findMany({ where: { patientId } });
}
