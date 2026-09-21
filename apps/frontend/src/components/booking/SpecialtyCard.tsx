import React from 'react';
import { IconArrowRight, IconCheckCircle } from '../ui/Icons';
import { IconLocation, resolveSpecialtyIcon } from './AppointmentIcons';
import { SpecialtyCardModel } from './appointmentTypes';
import './AppointmentStep.css';

export interface SpecialtyCardProps {
  specialty: SpecialtyCardModel;
  selected: boolean;
  /** Selection is always reported by `specialtyId`. */
  onSelect: (specialtyId: string) => void;
  onViewTreatments: (specialty: SpecialtyCardModel) => void;
}

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
  specialty,
  selected,
  onSelect,
  onViewTreatments,
}) => {
  const SpecialtyIcon = resolveSpecialtyIcon(specialty.icon);

  const handleBodyKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(specialty.specialtyId);
    }
  };

  return (
    <article
      className={`apx-card apx-card--${specialty.accent}${selected ? ' is-selected' : ''}`}
      aria-label={specialty.name}
    >
      <div
        className="apx-card__body"
        role="button"
        tabIndex={0}
        data-specialty-card={specialty.specialtyId}
        aria-pressed={selected}
        onClick={() => onSelect(specialty.specialtyId)}
        onKeyDown={handleBodyKeyDown}
      >
        <span className="apx-card__media">
          <img
            className="apx-card__image"
            src={specialty.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span className="apx-card__media-overlay" />
          <span className="apx-card__media-top">
            <span className="apx-card__icon">
              <SpecialtyIcon size={22} />
            </span>
            <span className="apx-card__badge">{specialty.professionalLabel}</span>
          </span>
        </span>

        <span className="apx-card__content">
          <span className="apx-card__text">
            <h3 className="apx-card__title">{specialty.name}</h3>
            <span className="apx-card__desc">{specialty.description}</span>
          </span>
          <span className="apx-card__arrow" aria-hidden="true">
            <IconArrowRight size={16} className="apx-icon" />
          </span>
        </span>
      </div>

      <div className="apx-card__footer">
        <button
          type="button"
          className="apx-card__treatments"
          onClick={() => onViewTreatments(specialty)}
        >
          {selected && <IconCheckCircle size={15} className="apx-icon apx-icon--check" />}
          Ver Tratamientos
          <IconArrowRight size={14} className="apx-icon apx-icon--micro" />
        </button>

        <span className="apx-card__location">
          <IconLocation size={15} className="apx-icon apx-icon--muted" />
          {specialty.location}
        </span>
      </div>
    </article>
  );
};
