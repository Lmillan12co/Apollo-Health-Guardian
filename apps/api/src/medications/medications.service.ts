export interface CreateMedicationInput {
  patientId: string;
  name: string;
  dosage?: string;
  schedule?: string;
}

export function prepareMedication(input: CreateMedicationInput) {
  return input;
}
