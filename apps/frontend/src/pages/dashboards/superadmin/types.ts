export type SuperAdminSection = 'overview' | 'users' | 'finance' | 'audit';

export interface SuperAdminDashboardProps {
  activeSection?: SuperAdminSection;
  onSwitchClinic?: (clinicId: string) => void;
  onOpenClinicConsole?: (clinic: { id: string; name: string }) => void;
  onNavigate?: (view: string) => void;
}

export interface ClinicRecord {
  id: string;
  name: string;
  legalName?: string;
  ruc?: string;
  slug: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
  specialtyPreset?: string;
  landingStyle?: string;
  brandColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  loginTagline?: string;
  whatsappNumber?: string;
  aiAssistantName?: string;
  enableSelfBooking?: boolean;
  renipressCode?: string;
  ipressCategory?: string;
  openingHours?: string;
  slotDuration?: number;
  doctors: number;
  adminsCount?: number;
  consultingRooms: number;
  activeAppointments: number;
  monthAppointments?: number;
  status: 'active' | 'onboarding' | 'suspended' | 'maintenance';
  isActive?: boolean;
  monthlyRevenue: string;
  revenueAmount: number;
  initialAdmin?: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  };
}
