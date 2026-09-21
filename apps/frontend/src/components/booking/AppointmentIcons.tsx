import React from 'react';
import { SpecialtyIconKey } from './appointmentTypes';

// =============================================================================
// CitasSistema — Appointment Icons (inline SVG, no emoji, no extra dependency)
// Modern 24px stroke set (Lucide/Heroicons style) used by the booking shell.
// =============================================================================

export interface AppointmentIconProps {
  className?: string;
  size?: number;
}

interface BaseIconProps extends AppointmentIconProps {
  children: React.ReactNode;
  strokeWidth?: number;
  viewBox?: string;
}

const BaseIcon: React.FC<BaseIconProps> = ({
  className = 'apx-icon',
  size,
  strokeWidth = 2,
  viewBox = '0 0 24 24',
  children,
}) => (
  <svg
    width={size}
    height={size}
    className={className}
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

/** Platform mark: medical leaf crossed by a health cross. */
export const IconClinicMark: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.7} {...props}>
    <path d="M12 21c0-5.25 3.75-9 9-9-0 5.25-3.75 9-9 9Z" />
    <path d="M12 21c0-5.25-3.75-9-9-9 0 5.25 3.75 9 9 9Z" />
    <path d="M12 21V9.5" />
    <path d="M12 3v5" />
    <path d="M9.5 5.5h5" />
  </BaseIcon>
);

export const IconActivity: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M22 12h-4l-3 8-4-16-3 8H2" />
  </BaseIcon>
);

export const IconBone: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="M7.5 6.5a2.5 2.5 0 1 0-2 4l6 6a2.5 2.5 0 1 0 4 2 2.5 2.5 0 1 0 2-4l-6-6a2.5 2.5 0 1 0-4-2Z" />
    <path d="M8.5 8.5l7 7" />
  </BaseIcon>
);

export const IconHandCare: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="M11 11V6.5a1.5 1.5 0 0 1 3 0V11" />
    <path d="M14 10.5V5a1.5 1.5 0 0 1 3 0v6" />
    <path d="M17 11V7.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.6a4 4 0 0 1-3.1-1.5L6 15.5a1.8 1.8 0 0 1 2.4-2.6L10 14" />
    <path d="M8 9.5V8a1.5 1.5 0 0 0-3 0v4" />
  </BaseIcon>
);

export const IconNutrition: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="M4 13c0 4 3.1 6.5 7.5 6.5S19 17 19 13Z" />
    <path d="M4 13h15" />
    <path d="M12 13c0-4.5 2.5-7.5 7-8-.5 4.5-2.6 7.4-7 8Z" />
    <path d="M12 13C10.6 9.4 8 7.5 5 7.6c.6 3 2.2 4.9 5 5.4" />
  </BaseIcon>
);

export const IconStethoscope: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon {...props}>
    <path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
    <path d="M9 12.5v2.25A4.75 4.75 0 0 0 13.75 19.5h1.5A4.75 4.75 0 0 0 20 14.75V13" />
    <circle cx="20" cy="11" r="2" />
  </BaseIcon>
);

export const IconLocation: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.9} {...props}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="2.75" />
  </BaseIcon>
);

export const IconArrowLeft: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </BaseIcon>
);

export const IconX: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={2.2} {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </BaseIcon>
);

export const IconCheck: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={3} {...props}>
    <polyline points="20 6 9 17 4 12" />
  </BaseIcon>
);

export const IconChevronDown: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={2.2} {...props}>
    <polyline points="6 9 12 15 18 9" />
  </BaseIcon>
);

export const IconChevronUp: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={2.2} {...props}>
    <polyline points="18 15 12 9 6 15" />
  </BaseIcon>
);

export const IconEdit2: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={2} {...props}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </BaseIcon>
);

export const IconHourglass: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="M5 22h14" />
    <path d="M5 2h14" />
    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
  </BaseIcon>
);

export const IconClock: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </BaseIcon>
);

export const IconFilter: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.9} {...props}>
    <path d="M4 5h16l-6.2 7.3v5.4l-3.6 1.8v-7.2L4 5Z" />
  </BaseIcon>
);

export const IconSort: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.9} {...props}>
    <path d="M7 4v16" />
    <polyline points="3 8 7 4 11 8" />
    <path d="M17 20V4" />
    <polyline points="13 16 17 20 21 16" />
  </BaseIcon>
);



export const IconChevronLeft: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon {...props}>
    <polyline points="15 18 9 12 15 6" />
  </BaseIcon>
);

export const IconChevronRight: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon {...props}>
    <polyline points="9 18 15 12 9 6" />
  </BaseIcon>
);

export const IconPencil: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.9} {...props}>
    <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="M13.5 6.5 17 10" />
  </BaseIcon>
);

export const IconInfo: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="9" />
    <line x1="12" y1="11" x2="12" y2="16" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </BaseIcon>
);

/** Group of professionals (auto-assignment + trust panel). */
export const IconUsers: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="M15 20v-1.8a3.7 3.7 0 0 0-3.7-3.7H6.2A3.7 3.7 0 0 0 2.5 18.2V20" />
    <circle cx="8.75" cy="7.5" r="3.5" />
    <path d="M21.5 20v-1.8a3.7 3.7 0 0 0-2.8-3.6" />
    <path d="M15.5 4.2a3.5 3.5 0 0 1 0 6.6" />
  </BaseIcon>
);

/** "Cambiar especialidad" action. */
export const IconSwap: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.9} {...props}>
    <path d="M20.5 8.5A8.5 8.5 0 0 0 4.4 10" />
    <polyline points="21 3.5 21 8.5 16 8.5" />
    <path d="M3.5 15.5A8.5 8.5 0 0 0 19.6 14" />
    <polyline points="3 20.5 3 15.5 8 15.5" />
  </BaseIcon>
);

export const IconStar: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="m12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17l-5.25 2.75 1-5.85L3.5 9.75l5.9-.85L12 3.6Z" />
  </BaseIcon>
);

/** Certified professional (shield + check). */
export const IconBadgeCheck: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="M12 3 4.5 6v5.6c0 4.6 3.1 8.7 7.5 9.9 4.4-1.2 7.5-5.3 7.5-9.9V6L12 3Z" />
    <polyline points="9 11.8 11.4 14.2 15.4 10.2" />
  </BaseIcon>
);

/** Personalized, human care (heart held by a hand). */
export const IconHandHeart: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="M12 12.9 9.7 10.6a2.1 2.1 0 0 1 3-3l.3.3.3-.3a2.1 2.1 0 0 1 3 3L12 14.7" />
    <path d="M4 12.6v3.1A4.3 4.3 0 0 0 8.3 20h4.4a5.3 5.3 0 0 0 5.3-5.3v-3.4" />
  </BaseIcon>
);

// -----------------------------------------------------------------------------
// Time-of-day blocks (agenda groups) and slot states — SVG only, never emoji
// -----------------------------------------------------------------------------

/** Morning block. */
export const IconSunrise: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="M12 3v4" />
    <path d="m5.6 7.6 1.5 1.5" />
    <path d="M2.5 16h2.2" />
    <path d="M19.3 16h2.2" />
    <path d="m16.9 9.1 1.5-1.5" />
    <path d="M7.5 16a4.5 4.5 0 0 1 9 0" />
    <path d="M2 19.6h20" />
  </BaseIcon>
);

/** Afternoon block. */
export const IconSun: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2" />
    <path d="M12 19.3v2.2" />
    <path d="M2.5 12h2.2" />
    <path d="M19.3 12h2.2" />
    <path d="m5.4 5.4 1.6 1.6" />
    <path d="m17 17 1.6 1.6" />
    <path d="m18.6 5.4-1.6 1.6" />
    <path d="m7 17-1.6 1.6" />
  </BaseIcon>
);

/** Evening block. */
export const IconMoon: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="M20.8 13.4A8.6 8.6 0 1 1 10.6 3.2a6.8 6.8 0 0 0 10.2 10.2Z" />
  </BaseIcon>
);

/** Slot that cannot be booked (busy or blocked by the schedule). */
export const IconSlash: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <circle cx="12" cy="12" r="9" />
    <line x1="5.9" y1="5.9" x2="18.1" y2="18.1" />
  </BaseIcon>
);

/** Service price. */
export const IconCreditCard: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <rect x="2.5" y="5" width="19" height="14" rx="2.6" />
    <line x1="2.5" y1="10" x2="21.5" y2="10" />
    <line x1="6.5" y1="14.5" x2="10.5" y2="14.5" />
  </BaseIcon>
);

/** Calendar day (review + summary blocks). */
export const IconCalendar: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="3" x2="8" y2="6.5" />
    <line x1="16" y1="3" x2="16" y2="6.5" />
  </BaseIcon>
);

/** Single person (professional / patient blocks). */
export const IconUser: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </BaseIcon>
);

/** Missing data on the review screen. */
export const IconAlert: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.9} {...props}>
    <path d="M10.3 3.9 2.6 17.2A2 2 0 0 0 4.3 20.2h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <line x1="12" y1="9.5" x2="12" y2="14" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </BaseIcon>
);

/** Secure payment / data protection note. */
export const IconShieldCheck: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="M12 3 5 5.8v5.4c0 4.5 2.9 7.9 7 9.8 4.1-1.9 7-5.3 7-9.8V5.8L12 3Z" />
    <path d="m9.2 12 2 2 3.6-3.8" />
  </BaseIcon>
);

/** Phone / WhatsApp contact field. */
export const IconPhone: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <path d="M6.6 3.5h2.2l1.5 3.6-1.9 1.3a11.7 11.7 0 0 0 5.2 5.2l1.3-1.9 3.6 1.5v2.2a2 2 0 0 1-2.2 2A15.4 15.4 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />
  </BaseIcon>
);

/** WhatsApp (used only as a discreet hint next to the phone field). */
export const IconWhatsApp: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.7} {...props}>
    <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.5-4.5a8.4 8.4 0 1 1 15.5-4.4Z" />
    <path d="M9 9.2c0 3 2.4 5.4 5.4 5.4.5 0 .9-.5.9-1l-.9-.6-.9.5a4.3 4.3 0 0 1-2.4-2.4l.5-.9-.6-.9c-.5-.1-1 .3-1 .9Z" />
  </BaseIcon>
);

/** Document / identity field adornment. */
export const IconIdCard: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <rect x="2.8" y="5" width="18.4" height="14" rx="2.6" />
    <circle cx="8.6" cy="11" r="2.1" />
    <path d="M5.4 16.2a3.4 3.4 0 0 1 6.4 0" />
    <line x1="15.2" y1="10" x2="18.6" y2="10" />
    <line x1="15.2" y1="14" x2="18.6" y2="14" />
  </BaseIcon>
);

/** Privacy lock (patient data notice). */
export const IconLock: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2.6" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <circle cx="12" cy="15.5" r="1.2" />
  </BaseIcon>
);

/** Loading indicator (document lookup / submitting). */
export const IconLoader: React.FC<AppointmentIconProps> = ({ className = 'apx-icon', size, ...rest }) => (
  <svg
    width={size}
    height={size}
    className={`${className} apx-icon--spin`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    aria-hidden="true"
    focusable="false"
    {...rest}
  >
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);

/** Clipboard list ("Detalles de tu cita" heading). */
export const IconClipboardList: React.FC<AppointmentIconProps> = (props) => (
  <BaseIcon strokeWidth={1.8} {...props}>
    <rect x="5" y="4.5" width="14" height="17" rx="2.6" />
    <path d="M9.5 4.5V3.4a1.4 1.4 0 0 1 1.4-1.4h2.2a1.4 1.4 0 0 1 1.4 1.4v1.1" />
    <line x1="9" y1="11" x2="15" y2="11" />
    <line x1="9" y1="15" x2="13.5" y2="15" />
  </BaseIcon>
);

// -----------------------------------------------------------------------------
// Specialty icon resolution (single source for cards, summaries and panels)
// -----------------------------------------------------------------------------
const SPECIALTY_ICONS: Record<SpecialtyIconKey, React.FC<AppointmentIconProps>> = {
  physiotherapy: IconActivity,
  orthopedics: IconBone,
  occupational: IconHandCare,
  nutrition: IconNutrition,
  default: IconStethoscope,
};

export function resolveSpecialtyIcon(key: SpecialtyIconKey): React.FC<AppointmentIconProps> {
  return SPECIALTY_ICONS[key] ?? SPECIALTY_ICONS.default;
}

