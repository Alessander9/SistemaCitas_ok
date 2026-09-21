import React from 'react';
import { IconArrowRight, IconCheckCircle } from '../ui/Icons';
import { IconCheck, IconUsers } from './AppointmentIcons';
import { AnyProfessionalOption } from './appointmentTypes';
import './AppointmentStep.css';

export interface AnyProfessionalCardProps {
  option: AnyProfessionalOption;
  selected: boolean;
  onSelect: (professionalId: string) => void;
}

/**
 * Auto-assignment alternative: same visual weight as the professional cards,
 * but clearly communicating "no quiero elegir un profesional específico".
 */
export const AnyProfessionalCard: React.FC<AnyProfessionalCardProps> = ({
  option,
  selected,
  onSelect,
}) => {
  const titleId = 'apx-any-professional-title';
  const select = () => onSelect(option.professionalId);

  return (
    <article
      className={`apx-pro apx-pro--any${selected ? ' is-selected' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="apx-pro__body" onClick={select}>
        <span className="apx-pro__any-visual">
          <span className="apx-pro__any-icon" aria-hidden="true">
            <IconUsers size={30} />
          </span>
          {selected && (
            <span className="apx-pro__check" aria-hidden="true">
              <IconCheck size={14} />
            </span>
          )}
        </span>

        <span className="apx-pro__info">
          <h3 className="apx-pro__name" id={titleId}>
            {option.label}
          </h3>
          <span className="apx-pro__badge">{option.badge}</span>
          <p className="apx-pro__desc">{option.description}</p>

          <ul className="apx-pro__benefits">
            {option.benefits.map((benefit) => (
              <li className="apx-pro__benefit" key={benefit}>
                <IconCheckCircle size={15} className="apx-icon apx-icon--check" />
                {benefit}
              </li>
            ))}
          </ul>
        </span>
      </div>

      <button
        type="button"
        className="apx-pro__cta"
        data-professional-card={option.professionalId}
        aria-pressed={selected}
        onClick={select}
      >
        {selected ? 'Seleccionado' : 'Seleccionar'}
        {selected ? <IconCheck size={15} /> : <IconArrowRight size={15} />}
      </button>
    </article>
  );
};
