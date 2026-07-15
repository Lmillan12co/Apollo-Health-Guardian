export interface SeizureEvent {
  id: string;
  patientId: string;
  occurredAt: string;
  durationSeconds?: number;
  notes?: string;
}
