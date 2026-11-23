import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import { IconCash } from '../ui/Icons';
import { DirectorViewMode } from './types';

interface DirectorHeaderProps {
  clinicName: string;
  adminName: string;
  viewMode: DirectorViewMode;
  onChangeView: (view: DirectorViewMode) => void;
  onOpenCash: () => void;
}

export const DirectorHeader: React.FC<DirectorHeaderProps> = ({
  clinicName,
  adminName,
  viewMode,
  onChangeView,
  onOpenCash,
}) => {
  return (
    <header className="cad-header">
      <div className="cad-header-info">
        <span className="cad-kicker">
          {clinicName} · {adminName}
        </span>
        <h1>Gestión Operativa y Financiera</h1>
      </div>

      <div className="cad-header-controls">
        <div className="cad-view-switch" role="tablist" aria-label="Vista del director">
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'overview'}
            className={`cad-switch-btn ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => onChangeView('overview')}
          >
            <MaterialIcon name="dashboard" size={16} />
            <span>Resumen</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'schedule'}
            className={`cad-switch-btn ${viewMode === 'schedule' ? 'active' : ''}`}
            onClick={() => onChangeView('schedule')}
          >
            <MaterialIcon name="event_note" size={16} />
            <span>Agenda</span>
          </button>
        </div>

        <button
          type="button"
          className="cad-btn-primary"
          onClick={onOpenCash}
        >
          <IconCash className="w-4 h-4" />
          <span>Ver Caja Chica</span>
        </button>
      </div>
    </header>
  );
};
