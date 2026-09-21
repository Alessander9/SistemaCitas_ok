import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MedicalService, Professional, Specialty } from '@citassistema/shared-types';
import { fetchServices } from '../../services/api';
import { SpecialtyGrid } from './SpecialtyGrid';
import { SpecialtySearch } from './SpecialtySearch';
import { SpecialtyTreatmentsModal } from './SpecialtyTreatmentsModal';
import { SpecialtyCardModel } from './appointmentTypes';
import { buildSpecialtyCards, filterSpecialtyCards } from './specialtyCatalog';

export interface AppointmentSpecialtyStepProps {
  /** Raw API collections; the data layer turns them into card view-models. */
  specialties: Specialty[];
  services: MedicalService[];
  professionals: Professional[];
  selectedSpecialtyId: string | null;
  /** Emits the selected specialty; the flow keys everything by its id. */
  onSelectSpecialty: (specialty: Specialty) => void;
  location?: string;
  isLoading?: boolean;
}

/**
 * Step 1 of the booking wizard — "Selecciona la Especialidad Médica".
 * Owns the search + treatments preview state, keeps every visual component dumb.
 */
export const AppointmentSpecialtyStep: React.FC<AppointmentSpecialtyStepProps> = ({
  specialties,
  services,
  professionals,
  selectedSpecialtyId,
  onSelectSpecialty,
  location,
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [previewedCard, setPreviewedCard] = useState<SpecialtyCardModel | null>(null);
  const [treatments, setTreatments] = useState<MedicalService[]>([]);
  const [isLoadingTreatments, setIsLoadingTreatments] = useState(false);
  const treatmentsRequestRef = useRef(0);

  const cards = useMemo(
    () => buildSpecialtyCards({ specialties, services, professionals, location }),
    [specialties, services, professionals, location],
  );

  const visibleCards = useMemo(() => filterSpecialtyCards(cards, query), [cards, query]);

  const handleSelect = useCallback(
    (specialtyId: string) => {
      const specialty = specialties.find((item) => item.id === specialtyId);
      if (specialty) onSelectSpecialty(specialty);
    },
    [specialties, onSelectSpecialty],
  );

  const handleViewTreatments = useCallback(async (card: SpecialtyCardModel) => {
    const requestId = treatmentsRequestRef.current + 1;
    treatmentsRequestRef.current = requestId;

    setPreviewedCard(card);
    setTreatments([]);
    setIsLoadingTreatments(true);

    try {
      // GET /specialties/:id/treatments (service layer keeps the mock fallback).
      const result = await fetchServices(card.specialtyId);
      if (treatmentsRequestRef.current === requestId) {
        setTreatments(result);
      }
    } catch {
      if (treatmentsRequestRef.current === requestId) setTreatments([]);
    } finally {
      if (treatmentsRequestRef.current === requestId) setIsLoadingTreatments(false);
    }
  }, []);

  const closeTreatments = useCallback(() => {
    treatmentsRequestRef.current += 1;
    setPreviewedCard(null);
    setTreatments([]);
    setIsLoadingTreatments(false);
  }, []);

  const confirmFromTreatments = useCallback(
    (specialtyId: string) => {
      handleSelect(specialtyId);
      closeTreatments();
    },
    [handleSelect, closeTreatments],
  );

  return (
    <section className="apx-step" aria-labelledby="apx-step-title">
      <div className="apx-step__top">
        <div className="apx-step__intro">
          <h2 className="apx-step__title" id="apx-step-title">
            Selecciona la Especialidad Médica
          </h2>
          <p className="apx-step__desc">
            Elige el área de atención requerida para ver los tratamientos disponibles.
          </p>
        </div>

        <SpecialtySearch value={query} onChange={setQuery} resultCount={visibleCards.length} />
      </div>

      {isLoading ? (
        <div className="apx-grid" aria-busy="true" aria-label="Cargando especialidades">
          {[0, 1, 2, 3].map((index) => (
            <div className="apx-skeleton" key={index} />
          ))}
        </div>
      ) : (
        <SpecialtyGrid
          cards={visibleCards}
          selectedSpecialtyId={selectedSpecialtyId}
          onSelect={handleSelect}
          onViewTreatments={handleViewTreatments}
          query={query}
          onClearSearch={() => setQuery('')}
        />
      )}

      {previewedCard && (
        <SpecialtyTreatmentsModal
          specialty={previewedCard}
          treatments={treatments}
          isLoading={isLoadingTreatments}
          onClose={closeTreatments}
          onConfirm={confirmFromTreatments}
        />
      )}
    </section>
  );
};
