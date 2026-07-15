export type AlertType = 'SOS' | 'SEIZURE_DETECTED' | 'MEDICATION_REMINDER';

export interface Alert {
  id: string;
  patientId: string;
  type: AlertType;
  createdAt: string;
  status: 'PENDING' | 'SENT' | 'RESOLVED';
}
