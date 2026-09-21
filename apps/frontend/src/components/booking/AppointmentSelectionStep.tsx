import React, { useState, useMemo } from 'react';
import { MedicalService, Specialty, Professional } from '@citassistema/shared-types';
import { SpecialtyGrid } from './SpecialtyGrid';
import { SpecialtySearch } from './SpecialtySearch';
import { ServiceGrid } from './ServiceGrid';
import { ServiceToolbar } from './ServiceToolbar';
import { ProfessionalGrid } from './ProfessionalGrid';
import {
  ServiceFilterOption,
  ServiceSortOption,
  ANY_AVAILABLE_PROFESSIONAL_ID,
} from './appointmentTypes';
import {
  buildSpecialtyCards,
  filterSpecialties,
} from './specialtyCatalog';
import { applyServiceToolbar, buildServiceCards } from './serviceCatalog';
import {
  buildAnyProfessionalOption,
  buildProfessionalCards,
} from './professionalCatalog';
import './AppointmentStep.css';

export interface AppointmentSelectionStepProps {
  specialties: Specialty[];
  services: MedicalService[];
  professionals: Professional[];
  selectedSpecialtyId: string | null;
  selectedServiceId: string | null;
  selectedProfessionalId: string | null;
  onSelectSpecialty: (specialty: Specialty) => void;
  onSelectService: (service: MedicalService) => void;
  onSelectProfessional: (professionalId: string) => void;
}

export const AppointmentSelectionStep: React.FC<AppointmentSelectionStepProps> = ({
  specialties,
  services,
  professionals,
  selectedSpecialtyId,
  selectedServiceId,
  selectedProfessionalId,
  onSelectSpecialty,
  onSelectService,
  onSelectProfessional,
}) => {
  const [specialtyQuery, setSpecialtyQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<ServiceFilterOption>('all');
  const [serviceSort, setServiceSort] = useState<ServiceSortOption>('relevance');

  // Specialty Cards
  const allSpecialtyCards = useMemo(
    () => buildSpecialtyCards({ specialties, professionals, services }),
    [specialties, professionals, services],
  );

  const visibleSpecialtyCards = useMemo(
    () => filterSpecialties(allSpecialtyCards, specialtyQuery),
    [allSpecialtyCards, specialtyQuery],
  );

  const selectedSpecialty = useMemo(
    () => specialties.find((s) => s.id === selectedSpecialtyId) || null,
    [specialties, selectedSpecialtyId],
  );

  // Filtered Services for the chosen specialty
  const specialtyServices = useMemo(
    () => (selectedSpecialtyId ? services.filter((s) => s.specialtyId === selectedSpecialtyId) : services),
    [services, selectedSpecialtyId],
  );

  const serviceCards = useMemo(() => buildServiceCards(specialtyServices), [specialtyServices]);
  const visibleServiceCards = useMemo(
    () => applyServiceToolbar(serviceCards, serviceFilter, serviceSort),
    [serviceCards, serviceFilter, serviceSort],
  );

  // Doctors
  const doctorCards = useMemo(
    () =>
      buildProfessionalCards({
        professionals,
        specialtyName: selectedSpecialty?.name,
      }),
    [professionals, selectedSpecialty],
  );

  const anyDoctorOption = useMemo(() => buildAnyProfessionalOption(), []);

  return (
    <section className="apx-step apx-selection-step" aria-labelledby="selection-step-title">
      <div className="apx-step__top">
        <div className="apx-step__intro">
          <h2 className="apx-step__title" id="selection-step-title">
            1. Especialidad, Servicio y Profesional
          </h2>
          <p className="apx-step__desc">
            Elige la especialidad médica, el tipo de consulta o terapia y el especialista de tu preferencia.
          </p>
        </div>
      </div>

      {/* Specialty Picker */}
      <div className="apx-selection-block">
        <div className="apx-selection-block__head">
          <span className="apx-selection-block__number">1.1</span>
          <div>
            <h3 className="apx-selection-block__title">Selecciona la Especialidad</h3>
            <p className="apx-selection-block__sub">Área médica en la que deseas recibir atención</p>
          </div>
        </div>

        <SpecialtySearch
          query={specialtyQuery}
          matchCount={visibleSpecialtyCards.length}
          onChange={setSpecialtyQuery}
          onClear={() => setSpecialtyQuery('')}
        />

        <SpecialtyGrid
          specialties={visibleSpecialtyCards}
          selectedSpecialtyId={selectedSpecialtyId}
          onSelect={(id) => {
            const spec = specialties.find((s) => s.id === id);
            if (spec) onSelectSpecialty(spec);
          }}
        />
      </div>

      {/* Service Picker */}
      {selectedSpecialty && (
        <div className="apx-selection-block apx-selection-block--highlight">
          <div className="apx-selection-block__head">
            <span className="apx-selection-block__number">1.2</span>
            <div>
              <h3 className="apx-selection-block__title">
                Selecciona el Servicio en {selectedSpecialty.name}
              </h3>
              <p className="apx-selection-block__sub">Elige el tratamiento o consulta requerida</p>
            </div>
          </div>

          <ServiceToolbar
            count={visibleServiceCards.length}
            filter={serviceFilter}
            sort={serviceSort}
            onFilterChange={setServiceFilter}
            onSortChange={setServiceSort}
          />

          <ServiceGrid
            services={visibleServiceCards}
            selectedServiceId={selectedServiceId}
            onSelect={(serviceId) => {
              const serv = specialtyServices.find((s) => s.id === serviceId);
              if (serv) onSelectService(serv);
            }}
            onResetFilters={() => {
              setServiceFilter('all');
              setServiceSort('relevance');
            }}
          />
        </div>
      )}

      {/* Professional Picker */}
      {selectedSpecialty && selectedServiceId && (
        <div className="apx-selection-block">
          <div className="apx-selection-block__head">
            <span className="apx-selection-block__number">1.3</span>
            <div>
              <h3 className="apx-selection-block__title">Selecciona el Profesional Médico</h3>
              <p className="apx-selection-block__sub">
                Puedes elegir un especialista colegiado o seleccionar autoasignación para mayor disponibilidad.
              </p>
            </div>
          </div>

          <ProfessionalGrid
            anyOption={anyDoctorOption}
            professionals={doctorCards}
            selectedProfessionalId={selectedProfessionalId || ANY_AVAILABLE_PROFESSIONAL_ID}
            onSelect={onSelectProfessional}
          />
        </div>
      )}
    </section>
  );
};
