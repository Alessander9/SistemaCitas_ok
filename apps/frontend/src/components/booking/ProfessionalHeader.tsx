import React from 'react';
import './AppointmentStep.css';

export interface ProfessionalHeaderProps {
  /** Small label above the title, e.g. "PASO 3 DE 11". */
  eyebrow?: string;
  title: string;
  description: string;
  titleId?: string;
}

/** Title block of the professional selection step. */
export const ProfessionalHeader: React.FC<ProfessionalHeaderProps> = ({
  eyebrow = 'Paso 3 de 11',
  title,
  description,
  titleId = 'apx-step-title',
}) => (
  <div className="apx-step__intro">
    <span className="apx-step__eyebrow">{eyebrow}</span>
    <h2 className="apx-step__title" id={titleId}>
      {title}
    </h2>
    <p className="apx-step__desc">{description}</p>
  </div>
);
