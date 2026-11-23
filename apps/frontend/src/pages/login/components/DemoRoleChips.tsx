import React from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';

export interface DemoUser {
  label: string;
  role: string;
  email: string;
  password: string;
  clinicSlug: string;
  badge: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    label: 'Admin Clínica',
    role: 'ADMIN_CLINIC',
    email: 'admin@clinica.pe',
    password: 'Password123!',
    clinicSlug: 'clinica-demo',
    badge: 'business_center',
  },
  {
    label: 'Médico',
    role: 'PROFESIONAL',
    email: 'doctor@clinica.pe',
    password: 'Password123!',
    clinicSlug: 'clinica-demo',
    badge: 'medical_services',
  },
  {
    label: 'Recepción',
    role: 'RECEPCION',
    email: 'recepcion@clinica.pe',
    password: 'Password123!',
    clinicSlug: 'clinica-demo',
    badge: 'assignment',
  },
  {
    label: 'Paciente',
    role: 'PACIENTE',
    email: 'paciente@clinica.pe',
    password: 'Password123!',
    clinicSlug: 'clinica-demo',
    badge: 'person',
  },
  {
    label: 'Super Admin',
    role: 'SUPER_ADMIN',
    email: 'superadmin@citassistema.pe',
    password: 'Password123!',
    clinicSlug: 'global',
    badge: 'security',
  },
];

interface DemoRoleChipsProps {
  selectedRole: string | null;
  onSelect: (demo: DemoUser) => void;
}

export const DemoRoleChips: React.FC<DemoRoleChipsProps> = ({ selectedRole, onSelect }) => {
  return (
    <div className="demo-role-section">
      <div className="demo-role-title">
        <MaterialIcon name="bolt" size={15} />
        <span>Acceso rápido de prueba</span>
      </div>
      <div className="demo-chips">
        {DEMO_USERS.map((demo) => (
          <button
            type="button"
            key={demo.role}
            className={`demo-chip ${selectedRole === demo.role ? 'active' : ''}`}
            onClick={() => onSelect(demo)}
          >
            <MaterialIcon name={demo.badge} size={15} />
            <span>{demo.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
