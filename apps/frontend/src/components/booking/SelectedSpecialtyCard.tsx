import React from 'react';
import { IconSwap, resolveSpecialtyIcon } from './AppointmentIcons';
import { SelectedSpecialtySummary } from './appointmentTypes';
import './AppointmentStep.css';

export interface SelectedSpecialtyCardProps {
  specialty: SelectedSpecialtySummary;
  /** Returns to step 1 without losing the rest of the wizard state. */
  onChangeSpecialty: () => void;
}

/** Compact context card: which specialty the services below belong to. */
export const SelectedSpecialtyCard: React.FC<SelectedSpecialtyCardProps> = ({
  specialty,
  onChangeSpecialty,
}) => {
  const SpecialtyIcon = resolveSpecialtyIcon(specialty.icon);

  return (
    <section className={`apx-selected apx-selected--${specialty.accent}`} aria-label="Especialidad seleccionada">
      <span className="apx-selected__art" aria-hidden="true">
        <img className="apx-selected__art-image" src={specialty.imageUrl} alt="" loading="lazy" />
      </span>

      <span className="apx-selected__icon" aria-hidden="true">
        <SpecialtyIcon size={24} />
      </span>

      <div className="apx-selected__text">
        <span className="apx-selected__eyebrow">Especialidad seleccionada</span>
        <h3 className="apx-selected__title">{specialty.name}</h3>
        <p className="apx-selected__desc">{specialty.description}</p>
      </div>

      <button type="button" className="apx-selected__action" onClick={onChangeSpecialty}>
        <IconSwap size={15} />
        Cambiar especialidad
      </button>
    </section>
  );
};
