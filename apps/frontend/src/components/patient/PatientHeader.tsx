import React from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';

interface PatientHeaderProps {
  patientName: string;
  onNewBooking: () => void;
  onOpenProfile: () => void;
  onLogout?: () => void;
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || 'Paciente';
}

function getInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({
  patientName,
  onNewBooking,
  onOpenProfile,
  onLogout,
}) => {
  const firstName = getFirstName(patientName);
  const initials = getInitials(patientName);

  return (
    <header className="pd-header">
      <div className="pd-header-identity">
        <button
          type="button"
          className="pd-avatar-btn"
          onClick={onOpenProfile}
          title="Ver mi perfil"
          aria-label="Abrir mi perfil"
        >
          {initials}
        </button>
        <div className="pd-header-text">
          <span className="pd-portal-kicker">Portal del Paciente</span>
          <h1>Hola, {firstName}</h1>
        </div>
      </div>

      <div className="pd-header-actions">
        <button
          type="button"
          className="pd-btn-primary"
          onClick={onNewBooking}
        >
          <MaterialIcon name="add" size={18} />
          <span>Nueva cita</span>
        </button>

        <button
          type="button"
          className="pd-btn-icon-label"
          onClick={onOpenProfile}
          title="Mis datos y documentos"
        >
          <MaterialIcon name="person" size={18} />
          <span className="pd-hide-xs">Mi perfil</span>
        </button>

        {onLogout && (
          <button
            type="button"
            className="pd-btn-icon-only"
            onClick={onLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <MaterialIcon name="logout" size={18} />
          </button>
        )}
      </div>
    </header>
  );
};
