import { prisma } from '../db';
import { assertPatientOwned } from '../patients/patients.service';

export interface CreateCaregiverInput {
  patientId: string;
  name: string;
}

export async function addCaregiver(input: CreateCaregiverInput, userId: string) {
  await assertPatientOwned(input.patientId, userId);
  return prisma.caregiver.create({ data: input });
}

export async function listCaregiversForPatient(patientId: string, userId: string) {
  await assertPatientOwned(patientId, userId);
  return prisma.caregiver.findMany({ where: { patientId } });
}
