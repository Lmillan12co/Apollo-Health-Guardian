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
