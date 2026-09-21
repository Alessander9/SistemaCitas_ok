import React from 'react';
import { IconUsers } from './AppointmentIcons';
import './AppointmentStep.css';

export interface ProfessionalTrustPanelProps {
  message?: string;
}

/** Small confidentiality/quality note shown next to the step title. */
export const ProfessionalTrustPanel: React.FC<ProfessionalTrustPanelProps> = ({
  message = 'Todos nuestros profesionales están certificados y cuentan con amplia experiencia.',
}) => (
  <aside className="apx-note" aria-label="Información sobre los profesionales">
    <span className="apx-note__icon" aria-hidden="true">
      <IconUsers size={20} />
    </span>
    <p className="apx-note__text">{message}</p>
  </aside>
);
