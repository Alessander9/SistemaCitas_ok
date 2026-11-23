import React, { useEffect, useState, useCallback } from 'react';
import {
  AdminAuditEvent,
  AdminOverview,
  fetchAdminAuditFeed,
} from '../../../services/api/admin.api';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface SuperAdminAuditViewProps {
  overview: AdminOverview | null;
  onRefreshOverview: () => void;
}

export const SuperAdminAuditView: React.FC<SuperAdminAuditViewProps> = ({
  overview,
  onRefreshOverview,
}) => {
  const [events, setEvents] = useState<AdminAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'audit' | 'email'>('all');

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAuditFeed(50);
      setEvents(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const filtered = events.filter((e) => sourceFilter === 'all' || e.source === sourceFilter);

  const health = overview?.health;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Live System Health Panel */}
      <section className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Base de Datos PostgreSQL</span>
          </div>
          <div className="kpi-value" style={{ color: '#0d9488' }}>
            {health?.database === 'degraded' ? 'Degradada' : 'Saludable'}
          </div>
          <div className="kpi-footer">
            <span>Latencia medida: <strong>{health?.latencyMs ?? '—'} ms</strong></span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Proveedor de Correos</span>
          </div>
          <div className="kpi-value" style={{ textTransform: 'uppercase' }}>
            {health?.emailProvider ?? 'BREVO'}
          </div>
          <div className="kpi-footer">
            <span style={{ color: '#16a34a', fontWeight: 600 }}>● Canal transaccional activo</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Correos (Últimas 24h)</span>
          </div>
          <div className="kpi-value">{health?.emailsLast24h.sent ?? 0}</div>
          <div className="kpi-footer">
            <span style={{ color: (health?.emailsLast24h.failed ?? 0) > 0 ? '#dc2626' : '#64748b' }}>
              {health?.emailsLast24h.failed ?? 0} fallido(s) de {health?.emailsLast24h.total ?? 0}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Usuarios de la Plataforma</span>
          </div>
          <div className="kpi-value">{overview?.totalUsers ?? 0}</div>
          <div className="kpi-footer">
            <span style={{ color: '#64748b' }}>En {overview?.totalClinics ?? 0} sede(s)</span>
          </div>
        </div>
      </section>

      {/* Real Audit & Email Activity Feed */}
      <section className="table-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f1f5f9',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 className="table-title" style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Bitácora de Auditoría y Trazabilidad (Ley N° 29733)
            </h2>
            <p className="table-subtitle" style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
              Eventos reales registrados en base de datos: acciones administrativas y despachos de correo.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', gap: '3px' }}>
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'audit', label: 'Seguridad & Cambios' },
                  { id: 'email', label: 'Correos' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSourceFilter(tab.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '7px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: sourceFilter === tab.id ? '#ffffff' : 'transparent',
                    color: sourceFilter === tab.id ? '#7c3aed' : '#64748b',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                onRefreshOverview();
                void loadFeed();
              }}
            >
              <MaterialIcon name="refresh" size={16} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        <div className="clinical-table-wrapper" style={{ marginTop: '0.75rem' }}>
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Evento</th>
                <th>Actor / Destinatario</th>
                <th>Detalle</th>
                <th>Sede</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Cargando registros de auditoría...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No hay eventos registrados aún.
                  </td>
                </tr>
              ) : (
                filtered.map((evt) => (
                  <tr key={evt.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(evt.createdAt).toLocaleString('es-PE', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: evt.source === 'email' ? '#0f766e' : '#7c3aed',
                          background: evt.source === 'email' ? '#f0fdfa' : '#f5f3ff',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '6px',
                        }}
                      >
                        {evt.action}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                      {evt.actor}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#475569', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {evt.resource}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {evt.clinicName}
                    </td>
                    <td>
                      <span className={`status-pill ${evt.status === 'ok' ? 'status-confirmed' : 'status-in_consultation'}`}>
                        ● {evt.status === 'ok' ? 'OK' : 'Error'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
