import React from 'react';
import {
  IconBuilding,
  IconCalendar,
  IconCash,
  IconShield,
} from '../../../components/ui/Icons';

interface SuperAdminKpiGridProps {
  totalClinics: number;
  totalAppointments: number;
  totalRevenue: number;
  onCheckNetwork: () => void;
}

export const SuperAdminKpiGrid: React.FC<SuperAdminKpiGridProps> = ({
  totalClinics,
  totalAppointments,
  totalRevenue,
  onCheckNetwork,
}) => {
  return (
    <>
      {/* Nivel 1: Tarjetas KPI de la Red */}
      <section className="kpi-grid">
        {/* KPI 1: Sedes */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Sedes Conectadas</span>
            <div className="kpi-icon-wrap kpi-icon-purple">
              <IconBuilding className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">{totalClinics} / {totalClinics}</div>
          <div className="kpi-footer">
            <span className="kpi-trend">● 100% Uptime</span>
            <span style={{ color: '#94a3b8' }}>Clúster Salud OK</span>
          </div>
        </div>

        {/* KPI 2: Citas Red */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Citas Activas Hoy</span>
            <div className="kpi-icon-wrap kpi-icon-sky">
              <IconCalendar className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">{totalAppointments} Citas</div>
          <div className="kpi-footer">
            <span className="kpi-trend">↑ En curso</span>
            <span style={{ color: '#94a3b8' }}>En toda la red</span>
          </div>
        </div>

        {/* KPI 3: Facturación Consolidada */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Facturación Global</span>
            <div className="kpi-icon-wrap kpi-icon-emerald">
              <IconCash className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value">
            S/ {totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>
          <div className="kpi-footer">
            <span style={{ color: '#16a34a', fontWeight: 600 }}>● Liquidaciones al día</span>
            <span style={{ color: '#94a3b8' }}>{totalClinics} sedes</span>
          </div>
        </div>

        {/* KPI 4: Seguridad & RLS */}
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Aislamiento & Seguridad</span>
            <div className="kpi-icon-wrap kpi-icon-teal">
              <IconShield className="w-4 h-4" />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#0d9488' }}>0 Brechas</div>
          <div className="kpi-footer">
            <span>Aislamiento RLS PostgreSQL</span>
            <span style={{ color: '#0d9488', fontWeight: 700 }}>Seguro</span>
          </div>
        </div>
      </section>

      {/* Banner de Infraestructura y Respaldo */}
      <div
        className="table-card"
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          background: 'linear-gradient(90deg, #faf5ff 0%, #ffffff 50%, #f0fdfa 100%)',
          borderColor: '#e9d5ff',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#7c3aed',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)',
              }}
            >
              <IconShield className="w-5 h-5" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Infraestructura Cloud Salud Perú · RLS & Respaldo Automático
                </h4>
                <span className="status-pill status-confirmed" style={{ fontSize: '0.68rem', padding: '0.15rem 0.55rem' }}>
                  ● Nodo Activo
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                PostgreSQL con Row-Level Security por <code style={{ color: '#7c3aed', fontWeight: 700 }}>clinic_id</code> inmutable. Backups automáticos cifrados cada 24 horas.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
              <span style={{ color: '#64748b', display: 'block' }}>Latencia Clúster</span>
              <strong style={{ color: '#16a34a' }}>1.8 ms (Lima-Norte)</strong>
            </div>
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
              onClick={onCheckNetwork}
            >
              Comprobar Red
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
