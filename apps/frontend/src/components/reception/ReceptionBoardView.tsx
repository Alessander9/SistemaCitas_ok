import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { WaitingTimeBadge } from '../common/WaitingTimeBadge';
import { ReceptionAppointment, ReceptionStatus } from './types';

interface ReceptionBoardViewProps {
  appointments: ReceptionAppointment[];
  onUpdateStatus: (id: string, nextStatus: ReceptionStatus) => void;
  onOpenPayment: (apt: ReceptionAppointment) => void;
  onOpenWhatsApp: (apt: ReceptionAppointment) => void;
}

const COLUMNS: Array<{
  id: ReceptionStatus;
  title: string;
  tone: string;
  nextStatus?: ReceptionStatus;
  nextLabel?: string;
}> = [
  {
    id: 'pending_arrival',
    title: 'Por llegar',
    tone: 'sky',
    nextStatus: 'waiting',
    nextLabel: 'Marcar llegada',
  },
  {
    id: 'waiting',
    title: 'En sala de espera',
    tone: 'amber',
    nextStatus: 'in_consultation',
    nextLabel: 'Pasar a consulta',
  },
  {
    id: 'in_consultation',
    title: 'En consulta',
    tone: 'green',
    nextStatus: 'completed',
    nextLabel: 'Finalizar',
  },
  {
    id: 'completed',
    title: 'Finalizados',
    tone: 'slate',
  },
];

export const ReceptionBoardView: React.FC<ReceptionBoardViewProps> = ({
  appointments,
  onUpdateStatus,
  onOpenPayment,
  onOpenWhatsApp,
}) => {
  return (
    <div className="rd-board-grid">
      {COLUMNS.map((col) => {
        const items = appointments.filter((a) => a.status === col.id);
        return (
          <div key={col.id} className={`rd-board-col tone-${col.tone}`}>
            <div className="rd-board-col-head">
              <h3>{col.title}</h3>
              <span className="rd-board-count">{items.length}</span>
            </div>

            <div className="rd-board-list">
              {items.length === 0 ? (
                <div className="rd-board-empty">Sin pacientes</div>
              ) : (
                items.map((apt) => (
                  <article key={apt.id} className="rd-board-card">
                    <div className="rd-board-card-top">
                      <span className="rd-board-time">{apt.time}</span>
                      {apt.paid ? (
                        <span className="rd-paid-mini">Pagado</span>
                      ) : (
                        <button
                          type="button"
                          className="rd-unpaid-mini"
                          onClick={() => onOpenPayment(apt)}
                        >
                          Cobrar {apt.priceLabel}
                        </button>
                      )}
                    </div>

                    <strong className="rd-board-patient">{apt.patientName}</strong>
                    <span className="rd-board-meta">
                      {apt.service} · {apt.doctor}
                    </span>

                    {apt.status === 'waiting' && (
                      <div className="rd-wait-badge-wrap">
                        <WaitingTimeBadge arrivalTime={apt.time} />
                      </div>
                    )}

                    <div className="rd-board-card-actions">
                      <button
                        type="button"
                        className="rd-icon-btn wa"
                        title="Enviar WhatsApp"
                        onClick={() => onOpenWhatsApp(apt)}
                      >
                        <MaterialIcon name="chat" size={14} />
                      </button>

                      {col.nextStatus && col.nextLabel && (
                        <button
                          type="button"
                          className="rd-board-next-btn"
                          onClick={() => onUpdateStatus(apt.id, col.nextStatus!)}
                        >
                          <span>{col.nextLabel}</span>
                          <MaterialIcon name="arrow_forward" size={14} />
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
