import React, { useCallback, useMemo, useState } from 'react';
import { MedicalService, Specialty } from '@citassistema/shared-types';
import { IconArrowLeft } from './AppointmentIcons';
import { SelectedSpecialtyCard } from './SelectedSpecialtyCard';
import { ServiceGrid } from './ServiceGrid';
import { ServiceToolbar } from './ServiceToolbar';
import { TrustPanel } from './TrustPanel';
import { ServiceFilterOption, ServiceSortOption } from './appointmentTypes';
import { applyServiceToolbar, buildServiceCards } from './serviceCatalog';
import { buildSelectedSpecialtySummary } from './specialtyCatalog';
import './AppointmentStep.css';

export interface AppointmentServiceStepProps {
  /** Specialty chosen in step 1 (the flow keys everything by its id). */
  specialty: Specialty;
  /** Services of that specialty — GET /specialties/:specialtyId/services. */
  services: MedicalService[];
  selectedServiceId: string | null;
  onSelectService: (service: MedicalService) => void;
  onChangeSpecialty: () => void;
}

/**
 * Step 2 of the booking wizard — "Selecciona el Servicio o Terapia".
 * Owns the toolbar state; every visual piece stays presentational.
 */
export const AppointmentServiceStep: React.FC<AppointmentServiceStepProps> = ({
  specialty,
  services,
  selectedServiceId,
  onSelectService,
  onChangeSpecialty,
}) => {
  const [filter, setFilter] = useState<ServiceFilterOption>('all');
  const [sort, setSort] = useState<ServiceSortOption>('relevance');

  const summary = useMemo(() => buildSelectedSpecialtySummary(specialty), [specialty]);
  const cards = useMemo(() => buildServiceCards(services), [services]);
  const visibleCards = useMemo(() => applyServiceToolbar(cards, filter, sort), [cards, filter, sort]);

  const handleSelect = useCallback(
    (serviceId: string) => {
      const service = services.find((item) => item.id === serviceId);
      if (service) onSelectService(service);
    },
    [services, onSelectService],
  );

  const resetFilters = useCallback(() => {
    setFilter('all');
    setSort('relevance');
  }, []);

  return (
    <section className="apx-step" aria-labelledby="apx-step-title">
      <button type="button" className="apx-backlink" onClick={onChangeSpecialty}>
        <IconArrowLeft size={15} />
        Volver a especialidades
      </button>

      <div className="apx-step__top">
        <div className="apx-step__intro">
          <h2 className="apx-step__title" id="apx-step-title">
            2. Selecciona el Servicio o Terapia
          </h2>
          <p className="apx-step__desc">
            Elige el servicio que necesitas para continuar con la reserva.
          </p>
        </div>
      </div>

      <div className="apx-split">
        <div className="apx-split__main">
          <SelectedSpecialtyCard specialty={summary} onChangeSpecialty={onChangeSpecialty} />

          {cards.length === 0 ? (
            <div className="apx-empty" role="status">
              <h3 className="apx-empty__title">Sin servicios publicados</h3>
              <p className="apx-empty__text">
                Esta especialidad todavía no tiene servicios disponibles. Vuelve a especialidades
                para elegir otra área de atención.
              </p>
            </div>
          ) : (
            <>
              <ServiceToolbar
                count={visibleCards.length}
                filter={filter}
                sort={sort}
                onFilterChange={setFilter}
                onSortChange={setSort}
              />
              <ServiceGrid
                services={visibleCards}
                selectedServiceId={selectedServiceId}
                onSelect={handleSelect}
                onResetFilters={resetFilters}
              />
            </>
          )}
        </div>

        <TrustPanel />
      </div>
    </section>
  );
};
