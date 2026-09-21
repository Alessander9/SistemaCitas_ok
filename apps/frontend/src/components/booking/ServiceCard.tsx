import React from 'react';
import { IconArrowRight } from '../ui/Icons';
import { IconCheck, IconClock, IconStar } from './AppointmentIcons';
import { ServiceCardModel } from './appointmentTypes';
import './AppointmentStep.css';

export interface ServiceCardProps {
  service: ServiceCardModel;
  selected: boolean;
  /** Selection is always reported by `serviceId`. */
  onSelect: (serviceId: string) => void;
}

const formatPrice = (service: ServiceCardModel) =>
  `${service.currency === 'PEN' ? 'S/' : service.currency} ${service.price.toFixed(2)}`;

/** Treatment card: media, price and duration as a single selectable unit. */
export const ServiceCard: React.FC<ServiceCardProps> = ({ service, selected, onSelect }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(service.serviceId);
    }
  };

  return (
    <article className={`apx-service${selected ? ' is-selected' : ''}`} aria-label={service.name}>
      <div
        className="apx-service__body"
        role="button"
        tabIndex={0}
        data-service-card={service.serviceId}
        aria-pressed={selected}
        onClick={() => onSelect(service.serviceId)}
        onKeyDown={handleKeyDown}
      >
        <span className="apx-service__media">
          <img
            className="apx-service__image"
            src={service.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
          />
          {service.isPopular && (
            <span className="apx-service__badge">
              <IconStar size={13} />
              Más solicitado
            </span>
          )}
          {selected && (
            <span className="apx-service__check" aria-hidden="true">
              <IconCheck size={13} />
            </span>
          )}
        </span>

        <span className="apx-service__content">
          <h3 className="apx-service__title">{service.name}</h3>
          <span className="apx-service__desc">{service.description}</span>
        </span>

        <span className="apx-service__footer">
          <span className="apx-service__price">{formatPrice(service)}</span>

          <span className="apx-service__duration">
            <IconClock size={17} className="apx-icon apx-icon--muted" />
            <span className="apx-service__duration-text">
              <strong>{service.durationMinutes} min</strong>
              <small>Duración</small>
            </span>
          </span>

          <span className="apx-service__arrow" aria-hidden="true">
            <IconArrowRight size={17} />
          </span>
        </span>
      </div>
    </article>
  );
};
