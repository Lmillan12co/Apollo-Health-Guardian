export interface RealtimeEvent {
  type: string;
  patientId: string;
  payload: unknown;
}

export function emitRealtimeEvent(event: RealtimeEvent) {
  // WebSocket integration will be added here.
  return event;
}
