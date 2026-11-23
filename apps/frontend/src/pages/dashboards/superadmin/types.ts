export interface SuperAdminDashboardProps {
  onSwitchClinic?: (clinicId: string) => void;
  onOpenClinicConsole?: (clinic: { id: string; name: string }) => void;
  onNavigate?: (view: string) => void;
}

export interface DoctorItem {
  id: string;
  name: string;
  specialty: string;
  cmp: string;
  shift?: 'Mañana' | 'Tarde' | 'Completo';
  room?: string;
  status: 'Activo' | 'Vacaciones' | 'Licencia';
}

export interface ClinicRecord {
  id: string;
  name: string;
  legalName?: string;
  ruc?: string;
  slug: string;
  city: string;
  address?: string;
  mapsUrl?: string;
  phone?: string;
  email?: string;
  operatingDays?: string[];
  toleranceMinutes?: number;
  directorName?: string;
  directorCmp?: string;
  licenseExpiry?: string;
  renipressCode?: string;
  ipressCategory?: string;
  openingHours?: string;
  slotDuration?: number;
  doctors: number;
  consultingRooms: number;
  activeAppointments: number;
  status: 'active' | 'onboarding' | 'suspended' | 'maintenance';
  monthlyRevenue: string;
  revenueAmount: number;
  assignedDoctorsList?: DoctorItem[];
}

export interface AuditEvent {
  id: string;
  time: string;
  user: string;
  action: string;
  tenant: string;
  ip: string;
  status: string;
}
