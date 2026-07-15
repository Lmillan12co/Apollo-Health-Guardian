export interface CreateSeizureInput {
  patientId: string;
  occurredAt: Date;
  durationSeconds?: number;
  notes?: string;
}

export function prepareSeizureEvent(input: CreateSeizureInput) {
  return {
    ...input,
    occurredAt: input.occurredAt ?? new Date(),
  };
}
