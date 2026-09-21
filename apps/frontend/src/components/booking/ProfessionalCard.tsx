import React from 'react';
import { IconArrowRight } from '../ui/Icons';
import { IconCheck, IconStar } from './AppointmentIcons';
import { ProfessionalCardModel } from './appointmentTypes';
import './AppointmentStep.css';

export interface ProfessionalCardProps {
  professional: ProfessionalCardModel;
  selected: boolean;
  onSelect: (professionalId: string) => void;
}

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter((word) => /[A-Za-zÁÉÍÓÚÑ]/.test(word.charAt(0)))
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

/** Professional profile card: photo, license, specialty and description. */
export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  selected,
  onSelect,
}) => {
  const titleId = `apx-professional-${professional.professionalId}`;
  const select = () => onSelect(professional.professionalId);

  const { rating, reviewCount } = professional;

  return (
    <article
      className={`apx-pro${selected ? ' is-selected' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="apx-pro__body" onClick={select}>
        <span className="apx-pro__media">
          {professional.photoUrl ? (
            <img
              className="apx-pro__photo"
              src={professional.photoUrl}
              alt=""
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="apx-pro__monogram" aria-hidden="true">
              {initialsOf(professional.name)}
            </span>
          )}

          {selected && (
            <span className="apx-pro__check" aria-hidden="true">
              <IconCheck size={14} />
            </span>
          )}
        </span>

        <span className="apx-pro__info">
          <h3 className="apx-pro__name" id={titleId}>
            {professional.name}
          </h3>

          {professional.licenseNumber && (
            <span className="apx-pro__license">{professional.licenseNumber}</span>
          )}

          {professional.profession && (
            <span className="apx-pro__specialty">{professional.profession}</span>
          )}

          {typeof rating === 'number' && rating > 0 && (
            <span
              className="apx-pro__rating"
              aria-label={`Valoración ${rating} de 5${
                reviewCount ? `, ${reviewCount} valoraciones` : ''
              }`}
            >
              <span className="apx-pro__stars" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((star) => (
                  <IconStar size={13} key={star} className="apx-icon apx-icon--star" />
                ))}
              </span>
              <strong>{rating.toFixed(1)}</strong>
              {reviewCount ? <span>({reviewCount})</span> : null}
            </span>
          )}

          {professional.description && (
            <p className="apx-pro__desc apx-pro__desc--clamped">{professional.description}</p>
          )}

          {professional.availability && (
            <span className="apx-pro__availability">{professional.availability}</span>
          )}
        </span>
      </div>

      <button
        type="button"
        className="apx-pro__cta"
        data-professional-card={professional.professionalId}
        aria-pressed={selected}
        onClick={select}
      >
        {selected ? 'Seleccionado' : 'Seleccionar'}
        {selected ? <IconCheck size={15} /> : <IconArrowRight size={15} />}
      </button>
    </article>
  );
};
