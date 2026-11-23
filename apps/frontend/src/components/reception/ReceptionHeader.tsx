import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { formatPen } from './useReceptionDashboard';

interface ReceptionHeaderProps {
  totalCashToday: number;
  onNewBooking: () => void;
  onOpenCash: () => void;
  onOpenCalendar: () => void;
}

export const ReceptionHeader: React.FC<ReceptionHeaderProps> = ({
  totalCashToday,
  onNewBooking,
  onOpenCash,
  onOpenCalendar,
}) => {
  const todayLabel = new Date().toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="rd-header">
      <div className="rd-header-title-wrap">
        <span className="rd-kicker">Recepción · {todayLabel}</span>
        <h1>Mostrador de Atención al Paciente</h1>
      </div>

      <div className="rd-header-actions">
        <button
          type="button"
          className="rd-btn-secondary"
          onClick={onOpenCalendar}
          title="Abrir calendario completo por profesional y box"
        >
          <MaterialIcon name="calendar_month" size={17} />
          <span>Agenda</span>
        </button>

        <button
          type="button"
          className="rd-btn-secondary"
          onClick={onOpenCash}
          title="Abrir Caja Chica"
        >
          <MaterialIcon name="point_of_sale" size={17} />
          <span>Caja · {formatPen(totalCashToday)}</span>
        </button>

        <button
          type="button"
          className="rd-btn-primary"
          onClick={onNewBooking}
        >
          <MaterialIcon name="add" size={18} />
          <span>Nueva cita</span>
        </button>
      </div>
    </header>
  );
};
