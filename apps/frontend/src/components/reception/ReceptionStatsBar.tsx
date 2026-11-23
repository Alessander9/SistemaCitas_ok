import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { ReceptionFilter } from './types';
import { formatPen } from './useReceptionDashboard';

interface ReceptionStatsBarProps {
  counts: {
    pendingArrival: number;
    waiting: number;
    inConsultation: number;
    unpaid: number;
    totalCashToday: number;
  };
  activeFilter: ReceptionFilter;
  onSelectFilter: (filter: ReceptionFilter) => void;
}

export const ReceptionStatsBar: React.FC<ReceptionStatsBarProps> = ({
  counts,
  activeFilter,
  onSelectFilter,
}) => {
  const toggleFilter = (target: ReceptionFilter) => {
    onSelectFilter(activeFilter === target ? 'all' : target);
  };

  return (
    <section className="rd-stats-grid" aria-label="Resumen operativo del día">
      <button
        type="button"
        className={`rd-stat-card ${activeFilter === 'pending_arrival' ? 'active' : ''}`}
        onClick={() => toggleFilter('pending_arrival')}
      >
        <div className="rd-stat-top">
          <span>Por llegar</span>
          <span className="rd-stat-icon sky">
            <MaterialIcon name="schedule" size={17} />
          </span>
        </div>
        <strong className="rd-stat-value">{counts.pendingArrival}</strong>
        <small>Pendientes de check-in</small>
      </button>

      <button
        type="button"
        className={`rd-stat-card tone-amber ${activeFilter === 'waiting' ? 'active' : ''}`}
        onClick={() => toggleFilter('waiting')}
      >
        <div className="rd-stat-top">
          <span>En sala de espera</span>
          <span className="rd-stat-icon amber">
            <MaterialIcon name="hourglass_top" size={17} />
          </span>
        </div>
        <strong className="rd-stat-value">{counts.waiting}</strong>
        <small>Listos para pasar a box</small>
      </button>

      <button
        type="button"
        className={`rd-stat-card tone-green ${activeFilter === 'in_consultation' ? 'active' : ''}`}
        onClick={() => toggleFilter('in_consultation')}
      >
        <div className="rd-stat-top">
          <span>En consulta</span>
          <span className="rd-stat-icon green">
            <MaterialIcon name="medical_services" size={17} />
          </span>
        </div>
        <strong className="rd-stat-value">{counts.inConsultation}</strong>
        <small>En atención médica</small>
      </button>

      <button
        type="button"
        className={`rd-stat-card ${counts.unpaid > 0 ? 'tone-rose' : ''} ${activeFilter === 'unpaid' ? 'active' : ''}`}
        onClick={() => toggleFilter('unpaid')}
      >
        <div className="rd-stat-top">
          <span>Cobrado hoy</span>
          <span className="rd-stat-icon violet">
            <MaterialIcon name="payments" size={17} />
          </span>
        </div>
        <strong className="rd-stat-value rd-stat-money">{formatPen(counts.totalCashToday)}</strong>
        <small>
          {counts.unpaid > 0
            ? `${counts.unpaid} pendiente(s) por cobrar`
            : 'Todos los pagos al día'}
        </small>
      </button>
    </section>
  );
};
