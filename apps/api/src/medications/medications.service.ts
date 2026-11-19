import { prisma } from '../db';
import { assertPatientOwned } from '../patients/patients.service';

export interface CreateMedicationInput {
  patientId: string;
  name: string;
  dosage?: string;
  schedule?: string;
}

export function prepareMedication(input: CreateMedicationInput) {
  return input;
}

export async function addMedication(input: CreateMedicationInput, userId: string) {
  await assertPatientOwned(input.patientId, userId);
  return prisma.medication.create({ data: prepareMedication(input) });
}

export async function listMedicationsForPatient(patientId: string, userId: string) {
  await assertPatientOwned(patientId, userId);
  return prisma.medication.findMany({ where: { patientId } });
}

export async function deleteMedication(id: string, userId: string) {
  const result = await prisma.medication.deleteMany({
    where: { id, patient: { userId } },
  });
  if (result.count === 0) throw new Error('MEDICATION_NOT_FOUND');
}
