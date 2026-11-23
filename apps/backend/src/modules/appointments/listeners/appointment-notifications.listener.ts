import { Injectable, Logger, Optional } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DatabaseService } from '../../../database/database.service';
import { EmailsService } from '../../emails/emails.service';
import { AppointmentConfirmedEvent, AppointmentCancelledEvent } from '../events/appointment.events';

@Injectable()
export class AppointmentNotificationsListener {
  private readonly logger = new Logger(AppointmentNotificationsListener.name);

  constructor(
    private readonly db: DatabaseService,
    @Optional() private readonly emailsService?: EmailsService,
  ) {}

  @OnEvent('appointment.confirmed', { async: true })
  async handleAppointmentConfirmed(event: AppointmentConfirmedEvent): Promise<void> {
    const { clinicId, appointmentId } = event;
    if (!this.emailsService) return;

    try {
      const { rows } = await this.db.query<{
        patient_email?: string;
        patient_phone?: string;
        patient_name: string;
        doctor_name: string;
        specialty_name: string;
        service_name: string;
        appointment_date: string;
        start_time: string;
        price: string;
      }>(
        `SELECT
           p.email AS patient_email, p.phone AS patient_phone,
           p.first_name || ' ' || p.last_name AS patient_name,
           u.first_name || ' ' || u.last_name AS doctor_name,
           s.name AS specialty_name,
           srv.name AS service_name,
           a.appointment_date::text AS appointment_date,
           a.start_time::text AS start_time,
           COALESCE(srv.price, 0)::text AS price
         FROM appointments a
         INNER JOIN patients p ON p.id = a.patient_id
         INNER JOIN professionals pr ON pr.id = a.professional_id
         INNER JOIN users u ON u.id = pr.user_id
         INNER JOIN services srv ON srv.id = a.service_id
         INNER JOIN specialties s ON s.id = srv.specialty_id
         WHERE a.id = $1 AND a.clinic_id = $2
         LIMIT 1`,
        [appointmentId, clinicId],
      );

      if (rows.length === 0) return;
      const row = rows[0];

      const details = {
        appointmentId,
        patientName: row.patient_name,
        patientEmail: row.patient_email || undefined,
        patientPhone: row.patient_phone || undefined,
        professionalName: row.doctor_name,
        specialtyName: row.specialty_name,
        serviceName: row.service_name,
        appointmentDate: row.appointment_date,
        startTime: row.start_time ? row.start_time.slice(0, 5) : '09:00',
        amount: Number(row.price) || 0,
      };

      await Promise.allSettled([
        this.emailsService.sendAppointmentConfirmationToPatient(clinicId, details),
        this.emailsService.sendAppointmentNotificationToClinic(clinicId, details),
      ]);

      this.logger.log(`Notificaciones de confirmación despachadas para cita ${appointmentId}`);
    } catch (error) {
      this.logger.warn(`No se pudieron enviar los correos de confirmación para cita ${appointmentId}: ${(error as Error).message}`);
    }
  }

  @OnEvent('appointment.cancelled', { async: true })
  async handleAppointmentCancelled(event: AppointmentCancelledEvent): Promise<void> {
    this.logger.log(`Cita ${event.appointmentId} cancelada. Motivo: ${event.reason || 'Sin motivo especificado'}`);
  }
}
