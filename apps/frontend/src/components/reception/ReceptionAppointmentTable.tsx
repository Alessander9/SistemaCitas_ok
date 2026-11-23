import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { WaitingTimeBadge } from '../common/WaitingTimeBadge';
import { ReceptionAppointment, ReceptionStatus } from './types';

interface ReceptionAppointmentTableProps {
  appointments: ReceptionAppointment[];
  onUpdateStatus: (id: string, nextStatus: ReceptionStatus) => void;
  onOpenPayment: (apt: ReceptionAppointment) => void;
  onOpenWhatsApp: (apt: ReceptionAppointment) => void;
}

const STATUS_META: Record<ReceptionStatus, { label: string; className: string }> = {
  pending_arrival: { label: 'Por llegar', className: 'sky' },
  waiting: { label: 'En sala de espera', className: 'amber' },
  in_consultation: { label: 'En consulta', className: 'green' },
  completed: { label: 'Finalizado', className: 'slate' },
  cancelled: { label: 'Cancelado', className: 'rose' },
};

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

export const ReceptionAppointmentTable: React.FC<ReceptionAppointmentTableProps> = ({
  appointments,
  onUpdateStatus,
  onOpenPayment,
  onOpenWhatsApp,
}) => {
  if (appointments.length === 0) {
    return (
      <div className="rd-empty-state">
        <MaterialIcon name="search_off" size={28} />
        <p>No hay citas que coincidan con tu búsqueda o filtro actual.</p>
      </div>
    );
  }

  return (
    <div className="rd-table-wrap">
      <table className="rd-table">
        <thead>
          <tr>
            <th>Hora</th>
            <th>Paciente</th>
            <th>Atención</th>
            <th>Pago</th>
            <th>Estado</th>
            <th className="rd-th-right">Acción rápida</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => {
            const statusInfo = STATUS_META[apt.status];
            return (
              <tr key={apt.id} className={`rd-row-${apt.status}`}>
                <td className="rd-cell-time">
                  <strong>{apt.time}</strong>
                  {apt.urgent && <span className="rd-urgent-tag">Urgente</span>}
                </td>

                <td>
                  <div className="rd-patient-cell">
                    <span className="rd-patient-avatar">{getInitials(apt.patientName)}</span>
                    <div>
                      <strong className="rd-patient-name">{apt.patientName}</strong>
                      <span className="rd-patient-dni">DNI {apt.dni}</span>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="rd-service-cell">
                    <strong>{apt.service}</strong>
                    <span>
                      {apt.doctor}
                      {apt.room ? ` · ${apt.room}` : ''}
                    </span>
                  </div>
                </td>

                <td>
                  {apt.paid ? (
                    <span className="rd-paid-pill">
                      <MaterialIcon name="check" size={13} />
                      <span>
                        Pagado ({apt.priceLabel})
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="rd-btn-pay-inline"
                      onClick={() => onOpenPayment(apt)}
                    >
                      <MaterialIcon name="payments" size={14} />
                      <span>Cobrar {apt.priceLabel}</span>
                    </button>
                  )}
                </td>

                <td>
                  <div className="rd-status-cell">
                    <span className={`rd-status-badge ${statusInfo.className}`}>
                      <span className="rd-dot" />
                      {statusInfo.label}
                    </span>
                    {apt.status === 'waiting' && (
                      <div className="rd-wait-badge-wrap">
                        <WaitingTimeBadge arrivalTime={apt.time} />
                      </div>
                    )}
                  </div>
                </td>

                <td className="rd-cell-actions">
                  <div className="rd-actions-cluster">
                    <button
                      type="button"
                      className="rd-icon-btn wa"
                      title="Enviar recordatorio por WhatsApp"
                      aria-label={`Enviar WhatsApp a ${apt.patientName}`}
                      onClick={() => onOpenWhatsApp(apt)}
                    >
                      <MaterialIcon name="chat" size={15} />
                    </button>

                    {apt.status === 'pending_arrival' && (
                      <button
                        type="button"
                        className="rd-action-btn checkin"
                        onClick={() => onUpdateStatus(apt.id, 'waiting')}
                      >
                        <MaterialIcon name="how_to_reg" size={15} />
                        <span>Marcar llegada</span>
                      </button>
                    )}

                    {apt.status === 'waiting' && (
                      <button
                        type="button"
                        className="rd-action-btn call"
                        onClick={() => onUpdateStatus(apt.id, 'in_consultation')}
                      >
                        <MaterialIcon name="campaign" size={15} />
                        <span>Pasar a consulta</span>
                      </button>
                    )}

                    {apt.status === 'in_consultation' && (
                      <button
                        type="button"
                        className="rd-action-btn finish"
                        onClick={() => {
                          if (!apt.paid) {
                            onOpenPayment(apt);
                          } else {
                            onUpdateStatus(apt.id, 'completed');
                          }
                        }}
                      >
                        <MaterialIcon name="check_circle" size={15} />
                        <span>{apt.paid ? 'Finalizar' : 'Cobrar y salir'}</span>
                      </button>
                    )}

                    {apt.status === 'completed' && (
                      <span className="rd-done-label">Atendido</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
