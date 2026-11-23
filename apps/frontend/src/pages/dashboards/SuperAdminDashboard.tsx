import React, { useState, useEffect } from 'react';
import './ClinicalDashboard.css';
import { IconPlus } from '../../components/ui/Icons';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import { SuperAdminDashboardProps, SuperAdminSection } from './superadmin/types';
import { useSuperAdminClinics } from './superadmin/useSuperAdminClinics';
import { SuperAdminKpiGrid } from './superadmin/SuperAdminKpiGrid';
import { ClinicsDirectoryTable } from './superadmin/ClinicsDirectoryTable';
import { CreateClinicModal } from './superadmin/CreateClinicModal';
import { ClinicManagementModal } from './superadmin/ClinicManagementModal';
import { SuperAdminUsersView } from './superadmin/SuperAdminUsersView';
import { SuperAdminFinanceView } from './superadmin/SuperAdminFinanceView';
import { SuperAdminAuditView } from './superadmin/SuperAdminAuditView';

const SECTION_META: Record<SuperAdminSection, { title: string; subtitle: string; viewId: string }> = {
  overview: {
    title: 'Panel de Control Global de Clínicas',
    subtitle: 'Gobernanza multi-tenant, estado operativo de sedes y métricas consolidadas en tiempo real.',
    viewId: 'dashboard',
  },
  users: {
    title: 'Administradores y Accesos',
    subtitle: 'Alta de directores de clínica, asignación por sede y control de cuentas administrativas.',
    viewId: 'superadmin-users',
  },
  finance: {
    title: 'Finanzas Consolidadas de la Red',
    subtitle: 'Ingresos reales del mes por sede y método de cobro con exportación contable.',
    viewId: 'superadmin-finance',
  },
  audit: {
    title: 'Auditoría y Salud de Plataforma',
    subtitle: 'Monitoreo en vivo de PostgreSQL, envíos de correo y bitácora de trazabilidad (Ley N° 29733).',
    viewId: 'superadmin-audit',
  },
};

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  activeSection = 'overview',
  onSwitchClinic,
  onOpenClinicConsole,
  onNavigate,
}) => {
  const [section, setSection] = useState<SuperAdminSection>(activeSection);

  useEffect(() => {
    setSection(activeSection);
  }, [activeSection]);

  const {
    clinics,
    filteredClinics,
    overview,
    selectedClinic,
    managingClinic,
    setManagingClinic,
    isNewClinicModalOpen,
    setIsNewClinicModalOpen,
    searchFilter,
    setSearchFilter,
    statusFilter,
    setStatusFilter,
    toastMessage,
    setToastMessage,
    showToast,
    refreshData,
    handleSwitchContext,
    addClinic,
    updateClinic,
    toggleStatus,
    activeClinicsCount,
    totalClinicsCount,
    totalAppointments,
    totalRevenue,
  } = useSuperAdminClinics(onSwitchClinic);

  const handleSelectSection = (next: SuperAdminSection) => {
    setSection(next);
    if (onNavigate) {
      onNavigate(SECTION_META[next].viewId);
    }
  };

  const meta = SECTION_META[section];

  return (
    <div className="dashboard-canvas">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            background: '#0f172a',
            color: '#ffffff',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.84rem',
            fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.12)',
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
            }}
          >
            <MaterialIcon name="close" size={18} />
          </button>
        </div>
      )}

      {/* Clean Header — Single Primary CTA */}
      <header className="dashboard-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <div className="clinic-badge" style={{ background: '#f5f3ff', borderColor: '#ddd6fe', color: '#7c3aed' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: '#7c3aed', display: 'inline-block' }} />
            Super Admin · Gobernanza Multi-Tenant
          </div>
          <h1 className="dashboard-title">{meta.title}</h1>
          <p className="dashboard-subtitle">{meta.subtitle}</p>
        </div>

        {section === 'overview' && (
          <div className="header-actions">
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
              <span>Nueva Sede</span>
            </button>
          </div>
        )}
      </header>

      {/* Quick Section Switcher (in sync with Sidebar) */}
      <nav
        aria-label="Secciones de SuperAdmin"
        style={{
          display: 'inline-flex',
          background: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          gap: '4px',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {(
          [
            { id: 'overview', label: 'Resumen & Sedes', icon: 'domain' },
            { id: 'users', label: 'Administradores', icon: 'manage_accounts' },
            { id: 'finance', label: 'Finanzas Red', icon: 'account_balance' },
            { id: 'audit', label: 'Auditoría & Salud', icon: 'verified_user' },
          ] as const
        ).map((item) => {
          const isActive = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelectSection(item.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#7c3aed' : '#64748b',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 120ms ease',
              }}
            >
              <MaterialIcon name={item.icon} size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Active Section Content */}
      {section === 'overview' && (
        <>
          <SuperAdminKpiGrid
            activeClinics={activeClinicsCount}
            totalClinics={totalClinicsCount}
            totalAppointments={totalAppointments}
            totalRevenue={totalRevenue}
            overview={overview}
            onOpenAudit={() => handleSelectSection('audit')}
          />

          <ClinicsDirectoryTable
            clinics={clinics}
            filteredClinics={filteredClinics}
            selectedClinic={selectedClinic}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onOpenClinicConsole={onOpenClinicConsole}
            onManageClinic={(clinic) => {
              handleSwitchContext(clinic);
              setManagingClinic(clinic);
            }}
            onToggleStatus={(clinic) => void toggleStatus(clinic)}
          />
        </>
      )}

      {section === 'users' && (
        <SuperAdminUsersView clinics={clinics} onShowToast={showToast} />
      )}

      {section === 'finance' && (
        <SuperAdminFinanceView onShowToast={showToast} />
      )}

      {section === 'audit' && (
        <SuperAdminAuditView
          overview={overview}
          onRefreshOverview={() => void refreshData()}
        />
      )}

      {/* Modales limpios de aprovisionamiento y configuración */}
      <CreateClinicModal
        isOpen={isNewClinicModalOpen}
        onClose={() => setIsNewClinicModalOpen(false)}
        onSubmit={(data) => void addClinic(data)}
      />

      <ClinicManagementModal
        clinic={managingClinic}
        onClose={() => setManagingClinic(null)}
        onSave={(updated) => void updateClinic(updated)}
        onOpenClinicConsole={onOpenClinicConsole}
      />
    </div>
  );
};

export default SuperAdminDashboard;
export * from './superadmin/types';
