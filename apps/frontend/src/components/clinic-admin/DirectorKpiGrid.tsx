import React from 'react';
import { IconCalendar, IconCash, IconChart, IconAlert } from '../ui/Icons';
import { formatPen } from './useClinicAdminDashboard';

interface DirectorKpiGridProps {
  metrics: {
    totalRevenueToday: number;
    occupancyRate: number;
    totalBooked: number;
    totalCapacity: number;
    activeRooms: number;
    criticalStockAlerts: number;
  };
  onNavigate: (view: string) => void;
  onOpenSchedule: () => void;
}

export const DirectorKpiGrid: React.FC<DirectorKpiGridProps> = ({
  metrics,
  onNavigate,
  onOpenSchedule,
}) => {
  return (
    <section className="cad-kpi-grid" aria-label="Indicadores ejecutivos del día">
      {/* KPI 1: Caja Chica Hoy */}
      <article className="cad-kpi-card">
        <div className="cad-kpi-top">
          <span>Caja Chica Hoy</span>
          <span className="cad-kpi-icon emerald">
            <IconCash className="w-4 h-4" />
          </span>
        </div>
        <strong className="cad-kpi-value">{formatPen(metrics.totalRevenueToday)}</strong>
        <div className="cad-kpi-foot">
          <span className="tone-green">● Turno abierto</span>
          <button type="button" className="cad-link" onClick={() => onNavigate('cash-register')}>
            Arqueo →
          </button>
        </div>
      </article>

      {/* KPI 2: Tasa de Ocupación */}
      <article className="cad-kpi-card">
        <div className="cad-kpi-top">
          <span>Tasa de Ocupación</span>
          <span className="cad-kpi-icon teal">
            <IconChart className="w-4 h-4" />
          </span>
        </div>
        <strong className="cad-kpi-value">{metrics.occupancyRate}%</strong>
        <div className="cad-kpi-foot">
          <span>{metrics.activeRooms} consultorios activos</span>
          <span className="tone-teal">Alta demanda</span>
        </div>
      </article>

      {/* KPI 3: Citas de Hoy */}
      <article className="cad-kpi-card">
        <div className="cad-kpi-top">
          <span>Citas de Hoy</span>
          <span className="cad-kpi-icon sky">
            <IconCalendar className="w-4 h-4" />
          </span>
        </div>
        <strong className="cad-kpi-value">
          {metrics.totalBooked} / {metrics.totalCapacity}
        </strong>
        <div className="cad-kpi-foot">
          <span>Turnos cubiertos</span>
          <button type="button" className="cad-link" onClick={onOpenSchedule}>
            Supervisar →
          </button>
        </div>
      </article>

      {/* KPI 4: Insumos Críticos */}
      <article className="cad-kpi-card tone-amber">
        <div className="cad-kpi-top">
          <span>Insumos Críticos</span>
          <span className="cad-kpi-icon amber">
            <IconAlert className="w-4 h-4" />
          </span>
        </div>
        <strong className="cad-kpi-value tone-amber-text">
          {metrics.criticalStockAlerts} alertas
        </strong>
        <div className="cad-kpi-foot">
          <span>Gel y agujas</span>
          <button type="button" className="cad-link" onClick={() => onNavigate('inventory')}>
            Kardex →
          </button>
        </div>
      </article>
    </section>
  );
};
