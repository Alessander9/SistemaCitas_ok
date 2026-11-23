import React from 'react';
import { ClinicRecord } from './types';
import { IconBuilding, IconSearch } from '../../../components/ui/Icons';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface ClinicsDirectoryTableProps {
  clinics: ClinicRecord[];
  filteredClinics: ClinicRecord[];
  selectedClinic: string;
  searchFilter: string;
  setSearchFilter: (term: string) => void;
  statusFilter: 'all' | 'active' | 'suspended';
  setStatusFilter: (status: 'all' | 'active' | 'suspended') => void;
  onOpenClinicConsole?: (clinic: { id: string; name: string }) => void;
  onManageClinic: (clinic: ClinicRecord) => void;
  onToggleStatus: (clinic: ClinicRecord) => void;
}

export const ClinicsDirectoryTable: React.FC<ClinicsDirectoryTableProps> = ({
  clinics,
  filteredClinics,
  selectedClinic,
  searchFilter,
  setSearchFilter,
  statusFilter,
  setStatusFilter,
  onOpenClinicConsole,
  onManageClinic,
  onToggleStatus,
}) => {
  const activeCount = clinics.filter((c) => c.status === 'active').length;
  const suspendedCount = clinics.filter((c) => c.status === 'suspended').length;

  return (
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
            Directorio de Sedes (Tenants)
          </h2>
          <p className="table-subtitle" style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0' }}>
            Supervisa el estado operativo, ingresa en modo soporte o configura cada clínica de la red.
          </p>
        </div>

        {/* Filtro Segmentado + Búsqueda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              gap: '3px',
            }}
          >
            {(
              [
                { id: 'all', label: `Todas (${clinics.length})`, color: '#7c3aed' },
                { id: 'active', label: `Activas (${activeCount})`, color: '#15803d' },
                { id: 'suspended', label: `Suspendidas (${suspendedCount})`, color: '#b91c1c' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '7px',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: statusFilter === tab.id ? '#ffffff' : 'transparent',
                  color: statusFilter === tab.id ? tab.color : '#64748b',
                  boxShadow: statusFilter === tab.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '240px' }}>
            <span
              style={{
                position: 'absolute',
                left: '11px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                display: 'flex',
              }}
            >
              <IconSearch className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar sede, ciudad o slug..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                height: '36px',
                paddingLeft: '34px',
                paddingRight: '12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: '#0f172a',
                background: '#f8fafc',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>

      <div className="clinical-table-wrapper" style={{ marginTop: '0.75rem' }}>
        <table className="clinical-table">
          <thead>
            <tr>
              <th>Sede / Slug</th>
              <th>Ubicación</th>
              <th>Médicos</th>
              <th>Citas Hoy</th>
              <th>Ingresos Mes</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClinics.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  No se encontraron sedes con los filtros aplicados.
                </td>
              </tr>
            ) : (
              filteredClinics.map((c) => {
                const isSuspended = c.status === 'suspended';
                return (
                  <tr
                    key={c.id}
                    style={selectedClinic === c.id ? { backgroundColor: '#faf5ff' } : undefined}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            background: isSuspended ? '#fef2f2' : '#f5f3ff',
                            color: isSuspended ? '#dc2626' : '#7c3aed',
                            border: `1px solid ${isSuspended ? '#fecaca' : '#ddd6fe'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <IconBuilding className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="patient-name-cell">{c.name}</div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                            {c.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>{c.city}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{c.doctors}</span>
                    </td>
                    <td>
                      <span className="time-badge">{c.activeAppointments}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.monthlyRevenue}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${isSuspended ? 'status-in_consultation' : 'status-confirmed'}`}>
                        <span>●</span> {isSuspended ? 'Suspendida' : 'Activa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {onOpenClinicConsole && (
                          <button
                            type="button"
                            className="table-action-btn"
                            style={{
                              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                              color: '#ffffff',
                              borderColor: '#7c3aed',
                              fontWeight: 700,
                            }}
                            onClick={() => onOpenClinicConsole({ id: c.id, name: c.name })}
                            title="Entrar a la consola operativa de esta sede"
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <MaterialIcon name="open_in_new" size={14} />
                              <span>Operar Sede</span>
                            </span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => onManageClinic(c)}
                          title="Editar datos y configuración del tenant"
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <MaterialIcon name="settings" size={14} />
                            <span>Configurar</span>
                          </span>
                        </button>

                        <button
                          type="button"
                          className="table-action-btn"
                          style={{
                            color: isSuspended ? '#15803d' : '#b91c1c',
                            borderColor: isSuspended ? '#bbf7d0' : '#fecaca',
                            background: isSuspended ? '#f0fdf4' : '#fef2f2',
                          }}
                          onClick={() => onToggleStatus(c)}
                          title={isSuspended ? 'Reactivar esta sede' : 'Suspender acceso de esta sede'}
                        >
                          {isSuspended ? 'Reactivar' : 'Suspender'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
