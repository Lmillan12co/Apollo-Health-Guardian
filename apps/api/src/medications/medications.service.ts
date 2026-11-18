import { prisma } from '../db';

export interface CreateMedicationInput {
  patientId: string;
  name: string;
  dosage?: string;
  schedule?: string;
}

export function prepareMedication(input: CreateMedicationInput) {
  return input;
}

export async function addMedication(input: CreateMedicationInput) {
  return prisma.medication.create({ data: prepareMedication(input) });
}

export async function listMedicationsForPatient(patientId: string) {
  return prisma.medication.findMany({ where: { patientId } });
}

export async function deleteMedication(id: string) {
  return prisma.medication.delete({ where: { id } });
}
