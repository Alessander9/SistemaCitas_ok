import React from 'react';
import './ClinicAdminDashboard.css';
import { MaterialIcon } from '../../components/ui/MaterialIcon';
import {
  useClinicAdminDashboard,
  DirectorHeader,
  DirectorKpiGrid,
  TeamOccupancyPanel,
  DirectorAlertsPanel,
  DirectorScheduleView,
} from '../../components/clinic-admin';

interface ClinicAdminDashboardProps {
  onNavigate: (view: string) => void;
  clinicName?: string;
  adminName?: string;
}

export const ClinicAdminDashboard: React.FC<ClinicAdminDashboardProps> = ({
  onNavigate,
  clinicName = 'Clínica Sanitas Lima',
  adminName = 'Alessander (Director Médico)',
}) => {
  const {
    viewMode,
    setViewMode,
    team,
    appointments,
    filteredAppointments,
    metrics,
    alerts,
    searchFilter,
    setSearchFilter,
    statusFilter,
    setStatusFilter,
    toastMessage,
    clearToast,
    reassignRoom,
  } = useClinicAdminDashboard();

  return (
    <div className="cad-shell">
      {toastMessage && (
        <div className="cad-toast" role="status" aria-live="polite">
          <span>{toastMessage}</span>
          <button type="button" onClick={clearToast} aria-label="Cerrar aviso">
            <MaterialIcon name="close" size={16} />
          </button>
        </div>
      )}

      {/* 1. Header Ejecutivo Limpio */}
      <DirectorHeader
        clinicName={clinicName}
        adminName={adminName}
        viewMode={viewMode}
        onChangeView={setViewMode}
        onOpenCash={() => onNavigate('cash-register')}
      />

      {/* 2. KPIs Ejecutivos Reales y Coherentes */}
      <DirectorKpiGrid
        metrics={metrics}
        onNavigate={onNavigate}
        onOpenSchedule={() => setViewMode('schedule')}
      />

      {/* 3. Vista Principal: Resumen Ejecutivo vs Supervisión de Agenda */}
      {viewMode === 'overview' ? (
        <div className="cad-main-grid">
          <TeamOccupancyPanel
            team={team}
            onOpenSchedule={() => setViewMode('schedule')}
          />
          <DirectorAlertsPanel alerts={alerts} onNavigate={onNavigate} />
        </div>
      ) : (
        <DirectorScheduleView
          appointments={filteredAppointments}
          totalCount={appointments.length}
          searchFilter={searchFilter}
          statusFilter={statusFilter}
          onSearchChange={setSearchFilter}
          onStatusFilterChange={setStatusFilter}
          onReassignRoom={reassignRoom}
          onOpenBooking={() => onNavigate('reception-booking')}
        />
      )}
    </div>
  );
};

export default ClinicAdminDashboard;
