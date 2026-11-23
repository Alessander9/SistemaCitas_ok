import React from 'react';
import { ClinicRecord } from './types';
import {
  IconBuilding,
  IconSearch,
  IconArrowRight,
  IconShield,
  IconCash,
  IconChart,
} from '../../../components/ui/Icons';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

interface ClinicsDirectoryTableProps {
  clinics: ClinicRecord[];
  filteredClinics: ClinicRecord[];
  selectedClinic: string;
  searchFilter: string;
  setSearchFilter: (term: string) => void;
  statusFilter: 'all' | 'active' | 'onboarding' | 'suspended';
  setStatusFilter: (status: 'all' | 'active' | 'onboarding' | 'suspended') => void;
  onOpenNewClinicModal: () => void;
  onOpenAuditModal: () => void;
  onOpenClinicConsole?: (clinic: { id: string; name: string }) => void;
  onManageClinic: (clinic: ClinicRecord) => void;
  onFinanceClinic: (clinic: ClinicRecord) => void;
  onShowToast: (msg: string) => void;
}

export const ClinicsDirectoryTable: React.FC<ClinicsDirectoryTableProps> = ({
  clinics,
  filteredClinics,
  selectedClinic,
  searchFilter,
  setSearchFilter,
  statusFilter,
  setStatusFilter,
  onOpenNewClinicModal,
  onOpenAuditModal,
  onOpenClinicConsole,
  onManageClinic,
  onFinanceClinic,
  onShowToast,
}) => {
  return (
    <>
      {/* Nivel 2: Directorio de Sedes y Clínicas Multi-Tenant */}
      <section className="table-card" style={{ marginBottom: '2rem' }}>
        {/* Fila 1: Título y Botón Principal de Aprovisionamiento */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1.25rem',
            borderBottom: '1.5px solid #f1f5f9',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 className="table-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Directorio de Sedes y Clínicas de la Red
            </h2>
            <p className="table-subtitle" style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.25rem 0 0' }}>
              Administración centralizada de infraestructura, staff médico asignado y estados operativos en tiempo real.
            </p>
          </div>

          <button
            type="button"
            className="cash-btn primary"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              borderColor: '#7c3aed',
              boxShadow: '0 4px 14px -2px rgba(124, 58, 237, 0.35)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              fontSize: '0.84rem',
              fontWeight: 700,
              borderRadius: '12px',
            }}
            onClick={onOpenNewClinicModal}
          >
            <span>+ Aprovisionar Nueva Sede</span>
            <IconArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Fila 2: Barra de Filtros y Búsqueda */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.15rem 0 1.25rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Filtro Segmentado por Estado */}
          <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'all' ? '#ffffff' : 'transparent',
                color: statusFilter === 'all' ? '#7c3aed' : '#64748b',
                boxShadow: statusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 120ms ease',
              }}
            >
              Todas ({clinics.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'active' ? '#ffffff' : 'transparent',
                color: statusFilter === 'active' ? '#15803d' : '#64748b',
                boxShadow: statusFilter === 'active' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 120ms ease',
              }}
            >
              ● Operativas ({clinics.filter((c) => c.status === 'active').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('onboarding')}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: statusFilter === 'onboarding' ? '#ffffff' : 'transparent',
                color: statusFilter === 'onboarding' ? '#b45309' : '#64748b',
                boxShadow: statusFilter === 'onboarding' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 120ms ease',
              }}
            >
              ● En Setup ({clinics.filter((c) => c.status === 'onboarding').length})
            </button>
          </div>

          {/* Buscador y Contador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '280px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                <IconSearch className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Buscar por sede, ciudad o slug..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '36px',
                  paddingRight: '14px',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  background: '#f8fafc',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              Mostrando {filteredClinics.length} de {clinics.length} sedes
            </span>
          </div>
        </div>

        <div className="clinical-table-wrapper">
          <table className="clinical-table">
            <thead>
              <tr>
                <th>Clínica / Sede</th>
                <th>Ubicación</th>
                <th>Staff Médico</th>
                <th>Citas Activas</th>
                <th>Facturación Mes</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClinics.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No se encontraron sedes clínicas que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredClinics.map((c) => (
                  <tr
                    key={c.id}
                    style={selectedClinic === c.id ? { backgroundColor: '#f5f3ff' } : undefined}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconBuilding className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="patient-name-cell">{c.name}</div>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>{c.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#475569' }}>{c.city}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{c.doctors} profesionales</span>
                    </td>
                    <td>
                      <span className="time-badge">{c.activeAppointments} citas</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{c.monthlyRevenue}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${c.status === 'active' ? 'status-confirmed' : c.status === 'suspended' ? 'status-in_consultation' : 'status-waiting'}`}>
                        <span>●</span> {c.status === 'active' ? 'Operativa' : c.status === 'suspended' ? 'Suspendida' : 'En Configuración'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem', flexWrap: 'wrap' }}>
                        {onOpenClinicConsole && (
                          <button
                            type="button"
                            className="table-action-btn"
                            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', color: '#ffffff', borderColor: '#7c3aed', fontWeight: 800 }}
                            onClick={() => onOpenClinicConsole(c)}
                            title="Operar y supervisar consola médica de esta sede"
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                              <MaterialIcon name="verified_user" size={15} />
                              <span>Operar Sede ↗</span>
                            </span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="table-action-btn"
                          style={selectedClinic === c.id ? { background: '#f5f3ff', color: '#7c3aed', borderColor: '#c4b5fd', fontWeight: 700 } : undefined}
                          onClick={() => onManageClinic(c)}
                          title="Gestionar configuración, staff y consultorios de esta sede"
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <MaterialIcon name="settings" size={15} />
                            <span>Gestionar Sede</span>
                          </span>
                        </button>

                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={() => onFinanceClinic(c)}
                          title="Supervisar desglose financiero y liquidación de esta sede"
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <MaterialIcon name="account_balance" size={15} />
                            <span>Finanzas</span>
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Nivel 3: Módulos de Supervisión Global (Super Admin) */}
      <section>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>
          Módulos de Gestión Master
        </h2>
        <div className="modules-grid">
          <div onClick={onOpenNewClinicModal} className="module-card">
            <div>
              <div className="module-icon module-icon-purple">
                <IconBuilding className="w-6 h-6" />
              </div>
              <h3 className="module-title">Aprovisionamiento de Sedes</h3>
              <p className="module-desc">
                Alta de nuevas clínicas médicas, asignación de slugs únicos, cuotas de consultorios y credenciales maestras de director.
              </p>
            </div>
            <span className="module-link" style={{ color: '#7c3aed' }}>
              <span>Aprovisionar Sede</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div onClick={onOpenAuditModal} className="module-card">
            <div>
              <div className="module-icon module-icon-teal">
                <IconShield className="w-6 h-6" />
              </div>
              <h3 className="module-title">Auditoría Ley N° 29733</h3>
              <p className="module-desc">
                Registro inmutable de trazabilidad sobre datos sensibles de salud, accesos de staff médico y exportación pericial en PDF.
              </p>
            </div>
            <span className="module-link" style={{ color: '#0d9488' }}>
              <span>Ver Registros de Seguridad</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => {
              const active = clinics.find((c) => c.id === selectedClinic) || clinics[0];
              if (active) onFinanceClinic(active);
            }}
            className="module-card"
          >
            <div>
              <div className="module-icon module-icon-emerald">
                <IconCash className="w-6 h-6" />
              </div>
              <h3 className="module-title">Liquidación & Finanzas</h3>
              <p className="module-desc">
                Facturación global de la red, conciliación de pagos electrónicos (Yape/Plin/POS) y liquidación de comisiones de doctores.
              </p>
            </div>
            <span className="module-link" style={{ color: '#059669' }}>
              <span>Supervisar Finanzas</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div
            onClick={() => onShowToast('Verificación de integridad de base de datos PostgreSQL: Todos los nodos saludables. Latencia: 1.8ms. Réplicas sincronizadas.')}
            className="module-card"
          >
            <div>
              <div className="module-icon module-icon-sky">
                <IconChart className="w-6 h-6" />
              </div>
              <h3 className="module-title">Monitor de Backups & DB</h3>
              <p className="module-desc">
                Estado de aislamiento de clúster PostgreSQL, políticas de retención de respaldos y monitoreo de disponibilidad en la nube.
              </p>
            </div>
            <span className="module-link" style={{ color: '#0284c7' }}>
              <span>Ver Estado del Clúster</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>
    </>
  );
};
