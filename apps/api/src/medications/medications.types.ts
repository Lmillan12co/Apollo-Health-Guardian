export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage?: string;
  schedule?: string;
}
