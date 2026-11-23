import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { IconStethoscope } from '../ui/Icons';
import { DoctorMainView } from './types';

interface DoctorHeaderProps {
  doctorName: string;
  specialty: string;
  mainView: DoctorMainView;
  todayCount: number;
  onChangeView: (view: DoctorMainView) => void;
  onOpenConsultation: () => void;
}

export const DoctorHeader: React.FC<DoctorHeaderProps> = ({
  doctorName,
  specialty,
  mainView,
  todayCount,
  onChangeView,
  onOpenConsultation,
}) => {
  return (
    <header className="dd-header">
      <div className="dd-header-info">
        <span className="dd-kicker">
          {doctorName} · {specialty}
        </span>
        <h1>Mi Agenda de Consultas y Pacientes</h1>
      </div>

      <div className="dd-header-controls">
        <div className="dd-view-switch" role="tablist" aria-label="Vista de agenda">
          <button
            type="button"
            role="tab"
            aria-selected={mainView === 'queue'}
            className={`dd-switch-btn ${mainView === 'queue' ? 'active' : ''}`}
            onClick={() => onChangeView('queue')}
          >
            <MaterialIcon name="today" size={16} />
            <span>Hoy ({todayCount})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mainView === 'weekly'}
            className={`dd-switch-btn ${mainView === 'weekly' ? 'active' : ''}`}
            onClick={() => onChangeView('weekly')}
          >
            <MaterialIcon name="calendar_month" size={16} />
            <span>Semana</span>
          </button>
        </div>

        <button
          type="button"
          className="dd-btn-primary"
          onClick={onOpenConsultation}
        >
          <IconStethoscope className="w-4 h-4" />
          <span>Abrir Ficha Clínica (Escala EVA)</span>
        </button>
      </div>
    </header>
  );
};
