export class AppointmentConfirmedEvent {
  constructor(
    public readonly clinicId: string,
    public readonly appointmentId: string,
  ) {}
}

export class AppointmentCancelledEvent {
  constructor(
    public readonly clinicId: string,
    public readonly appointmentId: string,
    public readonly reason?: string,
  ) {}
}
