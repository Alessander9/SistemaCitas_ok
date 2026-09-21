import React from 'react';
import { IconLock, IconShieldCheck } from './AppointmentIcons';
import './AppointmentStep.css';

export interface PrivacyNoticeProps {
  /** Overrides the default copy when the wording has to change. */
  message?: string;
  badge?: string;
}

/** Discreet strip that states what the patient data is used for. */
export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({
  message = 'Tus datos serán utilizados únicamente para gestionar tu atención y registro clínico.',
  badge = 'Información protegida',
}) => (
  <p className="apx-privacy">
    <span className="apx-privacy__icon" aria-hidden="true">
      <IconLock size={15} />
    </span>
    <span className="apx-privacy__text">{message}</span>
    <span className="apx-privacy__badge">
      <IconShieldCheck size={14} aria-hidden="true" />
      {badge}
    </span>
  </p>
);
