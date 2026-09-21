import React, { useCallback } from 'react';
import { IconSearch } from '../ui/Icons';
import { SpecialtyCard } from './SpecialtyCard';
import { SpecialtyCardModel } from './appointmentTypes';
import './AppointmentStep.css';

export interface SpecialtyGridProps {
  cards: SpecialtyCardModel[];
  selectedSpecialtyId: string | null;
  onSelect: (specialtyId: string) => void;
  onViewTreatments: (specialty: SpecialtyCardModel) => void;
  /** Current search term, used by the empty state message. */
  query?: string;
  onClearSearch?: () => void;
}

const NAVIGATION_KEYS = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'];

/** Reads the resolved grid template so vertical arrow keys jump a full row. */
function resolveColumnCount(element: HTMLElement): number {
  const template = window.getComputedStyle(element).gridTemplateColumns;
  const columns = template.split(' ').filter((track) => track.length > 0).length;
  return columns > 0 ? columns : 1;
}

export const SpecialtyGrid: React.FC<SpecialtyGridProps> = ({
  cards = [],
  selectedSpecialtyId,
  onSelect,
  onViewTreatments,
  query = '',
  onClearSearch,
}) => {
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!NAVIGATION_KEYS.includes(event.key)) return;

    const nodes = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[data-specialty-card]'),
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

  if (!cards || cards.length === 0) {
    return (
      <div className="apx-empty" role="status">
        <span className="apx-empty__icon">
          <IconSearch size={22} className="apx-icon" />
        </span>
        <h3 className="apx-empty__title">Sin resultados</h3>
        <p className="apx-empty__text">
          No encontramos especialidades para “{query}”. Prueba con otra palabra o revisa el listado
          completo.
        </p>
        {onClearSearch && (
          <button type="button" className="apx-empty__action" onClick={onClearSearch}>
            Ver todas las especialidades
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="apx-grid" role="group" aria-label="Especialidades médicas" onKeyDown={handleKeyDown}>
      {cards.map((card) => (
        <SpecialtyCard
          key={card.specialtyId}
          specialty={card}
          selected={card.specialtyId === selectedSpecialtyId}
          onSelect={onSelect}
          onViewTreatments={onViewTreatments}
        />
      ))}
    </div>
  );
};
