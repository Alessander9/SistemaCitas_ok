import React from 'react';
import './ClinicalDashboard.css';
import { IconPlus, IconFileText } from '../../components/ui/Icons';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { SuperAdminDashboardProps, AuditEvent } from './superadmin/types';
import { useSuperAdminClinics } from './superadmin/useSuperAdminClinics';
import { SuperAdminKpiGrid } from './superadmin/SuperAdminKpiGrid';
import { ClinicsDirectoryTable } from './superadmin/ClinicsDirectoryTable';
import { CreateClinicModal } from './superadmin/CreateClinicModal';
import { ClinicManagementModal } from './superadmin/ClinicManagementModal';
import { ClinicFinanceModal } from './superadmin/ClinicFinanceModal';
import { AuditLogsDrawer } from './superadmin/AuditLogsDrawer';

const AUDIT_EVENTS: AuditEvent[] = [
  { id: 'aud-1', time: '13:40:12', user: 'admin@clinica.pe', action: 'LOGIN_SUCCESS', tenant: 'clinica-demo', ip: '190.235.14.82', status: 'Verificado' },
  { id: 'aud-2', time: '13:35:05', user: 'doctor@clinica.pe', action: 'EVA_SCORE_UPDATE', tenant: 'clinica-demo', ip: '190.235.14.82', status: 'Verificado' },
  { id: 'aud-3', time: '13:20:30', user: 'recepcion@clinica.pe', action: 'APPOINTMENT_CHECKIN', tenant: 'clinica-demo', ip: '190.235.14.82', status: 'Verificado' },
  { id: 'aud-4', time: '12:55:18', user: 'superadmin@citassistema.pe', action: 'TENANT_METRICS_READ', tenant: 'global', ip: '200.12.90.11', status: 'Verificado' },
];

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onSwitchClinic,
  onOpenClinicConsole,
  onNavigate,
}) => {
  const {
    clinics,
    filteredClinics,
    selectedClinic,
    managingClinic,
    setManagingClinic,
    financeClinic,
    setFinanceClinic,
    isNewClinicModalOpen,
    setIsNewClinicModalOpen,
    isAuditModalOpen,
    setIsAuditModalOpen,
    searchFilter,
    setSearchFilter,
    statusFilter,
    setStatusFilter,
    toastMessage,
    setToastMessage,
    showToast,
    handleSwitchContext,
    addClinic,
    updateClinic,
    totalAppointments,
    totalRevenue,
  } = useSuperAdminClinics(onSwitchClinic);

  return (
    <div className="dashboard-canvas">
      {/* Dynamic Toast Feedback Banner */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: '#0f172a',
            color: '#ffffff',
            padding: '0.85rem 1.35rem',
            borderRadius: '14px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.84rem',
            fontWeight: 700,
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              marginLeft: '0.5rem',
            }}
          >
            <MaterialIcon name="close" size={18} />
          </button>
        </div>
      )}

      {/* Header & Context */}
      <header className="dashboard-header">
        <div>
          <div className="clinic-badge" style={{ background: '#f5f3ff', borderColor: '#ddd6fe', color: '#7c3aed' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#7c3aed', display: 'inline-block' }} />
            Master Multi-Tenant · Red Global de Clínicas
          </div>
          <h1 className="dashboard-title">
            Panel de Control Global de Clínicas (Super Admin)
          </h1>
          <p className="dashboard-subtitle">
            Supervisión centralizada de infraestructura, sedes médicas y cumplimiento normativo (Ley N° 29733).
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setIsAuditModalOpen(true)}
          >
            <IconFileText className="w-4 h-4 text-purple-600" />
            <span>Auditoría Ley 29733</span>
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              borderColor: '#7c3aed',
              boxShadow: '0 4px 10px -2px rgba(124, 58, 237, 0.35)',
            }}
            onClick={() => setIsNewClinicModalOpen(true)}
          >
            <IconPlus className="w-4 h-4" />
            <span>+ Nueva Clínica (Tenant)</span>
          </button>
        </div>
      </header>

      {/* Nivel 1: Tarjetas KPI de la Red y Banner RLS */}
      <SuperAdminKpiGrid
        totalClinics={clinics.length}
        totalAppointments={totalAppointments}
        totalRevenue={totalRevenue}
        onCheckNetwork={() =>
          showToast(
            'Diagnóstico de infraestructura: Servidor de base de datos operativo. Conexiones pool: 14/100. Espacio disponible: 88.4%.',
          )
        }
      />

      {/* Nivel 2: Directorio de Sedes y Nivel 3: Módulos de Gestión Master */}
      <ClinicsDirectoryTable
        clinics={clinics}
        filteredClinics={filteredClinics}
        selectedClinic={selectedClinic}
        searchFilter={searchFilter}
        setSearchFilter={setSearchFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onOpenNewClinicModal={() => setIsNewClinicModalOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onOpenClinicConsole={onOpenClinicConsole}
        onManageClinic={(clinic) => {
          handleSwitchContext(clinic);
          setManagingClinic(clinic);
        }}
        onFinanceClinic={(clinic) => setFinanceClinic(clinic)}
        onShowToast={showToast}
      />

      {/* Modales Especializados */}
      <CreateClinicModal
        isOpen={isNewClinicModalOpen}
        onClose={() => setIsNewClinicModalOpen(false)}
        onSubmit={addClinic}
      />

      <ClinicManagementModal
        clinic={managingClinic}
        onClose={() => setManagingClinic(null)}
        onSave={updateClinic}
        onSwitchContext={handleSwitchContext}
        onOpenClinicConsole={onOpenClinicConsole}
        onShowToast={showToast}
      />

      <ClinicFinanceModal
        clinic={financeClinic}
        onClose={() => setFinanceClinic(null)}
        onSwitchContext={handleSwitchContext}
        onNavigate={onNavigate}
        onShowToast={showToast}
      />

      <AuditLogsDrawer
        isOpen={isAuditModalOpen}
        events={AUDIT_EVENTS}
        onClose={() => setIsAuditModalOpen(false)}
      />
    </div>
  );
};

export default SuperAdminDashboard;
export * from './superadmin/types';
