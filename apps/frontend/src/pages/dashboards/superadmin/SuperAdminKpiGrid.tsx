import React from 'react';
import {
  IconBuilding,
  IconCalendar,
  IconCash,
  IconShield,
} from '../../../components/ui/Icons';
import { AdminOverview } from '../../../services/api/admin.api';

interface SuperAdminKpiGridProps {
  activeClinics: number;
  totalClinics: number;
  totalAppointments: number;
  totalRevenue: number;
  overview: AdminOverview | null;
  onOpenAudit?: () => void;
}

export const SuperAdminKpiGrid: React.FC<SuperAdminKpiGridProps> = ({
  activeClinics,
  totalClinics,
  totalAppointments,
  totalRevenue,
  overview,
  onOpenAudit,
}) => {
  const dbOk = overview?.health.database !== 'degraded';
  const latency = overview?.health.latencyMs ?? null;
  const emailProvider = overview?.health.emailProvider ?? 'brevo';
  const emailsSent = overview?.health.emailsLast24h.sent ?? 0;
  const emailsFailed = overview?.health.emailsLast24h.failed ?? 0;

  return (
    <section className="kpi-grid" style={{ marginBottom: '1.75rem' }}>
      {/* KPI 1: Sedes Activas */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">Sedes Activas</span>
          <div className="kpi-icon-wrap kpi-icon-purple">
            <IconBuilding className="w-4 h-4" />
          </div>
        </div>
        <div className="kpi-value">
          {activeClinics} / {totalClinics}
        </div>
        <div className="kpi-footer">
          <span className="kpi-trend">
            ● {totalClinics - activeClinics === 0 ? 'Todas operativas' : `${totalClinics - activeClinics} suspendida(s)`}
          </span>
          <span style={{ color: '#94a3b8' }}>
            {overview?.totalDoctors ?? 0} médicos
          </span>
        </div>
      </div>

      {/* KPI 2: Citas Hoy en la Red */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">Citas Hoy (Red)</span>
          <div className="kpi-icon-wrap kpi-icon-sky">
            <IconCalendar className="w-4 h-4" />
          </div>
        </div>
        <div className="kpi-value">{totalAppointments}</div>
        <div className="kpi-footer">
          <span className="kpi-trend">● En agenda hoy</span>
          <span style={{ color: '#94a3b8' }}>
            {overview?.monthAppointments ?? totalAppointments} en el mes
          </span>
        </div>
      </div>

      {/* KPI 3: Ingresos del Mes */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-label">Ingresos del Mes (Red)</span>
          <div className="kpi-icon-wrap kpi-icon-emerald">
            <IconCash className="w-4 h-4" />
          </div>
        </div>
        <div className="kpi-value">
          S/ {totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="kpi-footer">
          <span style={{ color: '#16a34a', fontWeight: 600 }}>● Datos reales BD</span>
          <span style={{ color: '#94a3b8' }}>Mes en curso</span>
        </div>
      </div>

      {/* KPI 4: Salud de Plataforma */}
      <div
        className="kpi-card"
        onClick={onOpenAudit}
        style={onOpenAudit ? { cursor: 'pointer' } : undefined}
        title="Ver detalle de auditoría y salud del sistema"
      >
        <div className="kpi-header">
          <span className="kpi-label">Salud de Plataforma</span>
          <div className="kpi-icon-wrap kpi-icon-teal">
            <IconShield className="w-4 h-4" />
          </div>
        </div>
        <div className="kpi-value" style={{ color: dbOk ? '#0d9488' : '#dc2626' }}>
          {dbOk ? 'Operativa' : 'Degradada'}
        </div>
        <div className="kpi-footer">
          <span>
            BD {latency !== null ? `${latency}ms` : 'OK'} · {emailProvider.toUpperCase()}
          </span>
          <span style={{ color: emailsFailed > 0 ? '#d97706' : '#0d9488', fontWeight: 700 }}>
            {emailsSent} env. / {emailsFailed} err.
          </span>
        </div>
      </div>
    </section>
  );
};
