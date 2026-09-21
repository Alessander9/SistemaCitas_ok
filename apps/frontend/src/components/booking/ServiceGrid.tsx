import React, { useCallback } from 'react';
import { IconSearch } from '../ui/Icons';
import { ServiceCard } from './ServiceCard';
import { ServiceCardModel } from './appointmentTypes';
import './AppointmentStep.css';

export interface ServiceGridProps {
  services: ServiceCardModel[];
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
  /** Clears the toolbar filter so the empty state has a way out. */
  onResetFilters?: () => void;
}

const NAVIGATION_KEYS = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'];

function resolveColumnCount(element: HTMLElement): number {
  const template = window.getComputedStyle(element).gridTemplateColumns;
  const columns = template.split(' ').filter((track) => track.length > 0).length;
  return columns > 0 ? columns : 1;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  services,
  selectedServiceId,
  onSelect,
  onResetFilters,
}) => {
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!NAVIGATION_KEYS.includes(event.key)) return;

    const nodes = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[data-service-card]'),
    );
    if (nodes.length === 0) return;

    const currentIndex = nodes.findIndex((node) => node === document.activeElement);
    if (currentIndex === -1) return;

    const columns = resolveColumnCount(event.currentTarget);
    const offset =
      event.key === 'ArrowRight'
        ? 1
        : event.key === 'ArrowLeft'
          ? -1
          : event.key === 'ArrowDown'
            ? columns
            : -columns;

    const target = nodes[currentIndex + offset];
    if (target) {
      event.preventDefault();
      target.focus();
    }
  }, []);

  if (services.length === 0) {
    return (
      <div className="apx-empty" role="status">
        <span className="apx-empty__icon">
          <IconSearch size={22} className="apx-icon" />
        </span>
        <h3 className="apx-empty__title">Sin servicios que coincidan</h3>
        <p className="apx-empty__text">
          Ajusta el filtro para ver los servicios disponibles de esta especialidad.
        </p>
        {onResetFilters && (
          <button type="button" className="apx-empty__action" onClick={onResetFilters}>
            Ver todos los servicios
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="apx-service-grid"
      role="group"
      aria-label="Servicios disponibles"
      onKeyDown={handleKeyDown}
    >
      {services.map((service) => (
        <ServiceCard
          key={service.serviceId}
          service={service}
          selected={service.serviceId === selectedServiceId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
