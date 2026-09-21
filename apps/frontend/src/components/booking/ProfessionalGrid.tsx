import React, { useCallback } from 'react';
import { AnyProfessionalCard } from './AnyProfessionalCard';
import { ProfessionalCard } from './ProfessionalCard';
import { AnyProfessionalOption, ProfessionalCardModel } from './appointmentTypes';
import './AppointmentStep.css';

export interface ProfessionalGridProps {
  anyOption: AnyProfessionalOption;
  professionals: ProfessionalCardModel[];
  /** null when nothing is selected; ANY_AVAILABLE_... for auto-assignment. */
  selectedProfessionalId: string | null;
  onSelect: (professionalId: string) => void;
}

const NAVIGATION_KEYS = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'];

function resolveColumnCount(element: HTMLElement): number {
  const template = window.getComputedStyle(element).gridTemplateColumns;
  const columns = template.split(' ').filter((track) => track.length > 0).length;
  return columns > 0 ? columns : 1;
}

export const ProfessionalGrid: React.FC<ProfessionalGridProps> = ({
  anyOption,
  professionals,
  selectedProfessionalId,
  onSelect,
}) => {
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!NAVIGATION_KEYS.includes(event.key)) return;

    const nodes = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[data-professional-card]'),
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

  return (
    <div
      className="apx-professional-grid"
      role="group"
      aria-label="Profesionales disponibles"
      onKeyDown={handleKeyDown}
    >
      <AnyProfessionalCard
        option={anyOption}
        selected={selectedProfessionalId === anyOption.professionalId}
        onSelect={onSelect}
      />

      {professionals.map((professional) => (
        <ProfessionalCard
          key={professional.professionalId}
          professional={professional}
          selected={professional.professionalId === selectedProfessionalId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};
