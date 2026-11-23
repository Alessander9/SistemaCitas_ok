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
  filterSpecialtyCards,
} from './specialtyCatalog';
import { applyServiceToolbar, buildServiceCards } from './serviceCatalog';
import {
  buildAnyProfessionalOption,
  buildProfessionalCards,
} from './professionalCatalog';
import { IconCheck, IconChevronDown, IconChevronUp } from './AppointmentIcons';
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

  // Accordion active section: 'specialty' | 'service' | 'professional' | null
  const [openSection, setOpenSection] = useState<'specialty' | 'service' | 'professional' | null>(() => {
    if (!selectedSpecialtyId) return 'specialty';
    if (!selectedServiceId) return 'service';
    return 'professional';
  });

  // Specialty Cards
  const allSpecialtyCards = useMemo(
    () => buildSpecialtyCards({ specialties: specialties || [], professionals: professionals || [], services: services || [] }),
    [specialties, professionals, services],
  );

  const visibleSpecialtyCards = useMemo(
    () => filterSpecialtyCards(allSpecialtyCards, specialtyQuery),
    [allSpecialtyCards, specialtyQuery],
  );

  const selectedSpecialty = useMemo(
    () => (specialties || []).find((s) => s.id === selectedSpecialtyId) || null,
    [specialties, selectedSpecialtyId],
  );

  // Filtered Services for the chosen specialty
  const specialtyServices = useMemo(
    () => (selectedSpecialtyId ? (services || []).filter((s) => s.specialtyId === selectedSpecialtyId) : (services || [])),
    [services, selectedSpecialtyId],
  );

  const selectedService = useMemo(
    () => (services || []).find((s) => s.id === selectedServiceId) || null,
    [services, selectedServiceId],
  );

  const serviceCards = useMemo(() => buildServiceCards(specialtyServices), [specialtyServices]);
  const visibleServiceCards = useMemo(
    () => applyServiceToolbar(serviceCards, serviceFilter, serviceSort),
    [serviceCards, serviceFilter, serviceSort],
  );

  // Doctors filtered by the selected service (when service links exist on the professional)
  const filteredProfessionals = useMemo(() => {
    const list = professionals || [];
    if (!selectedServiceId) return list;
    const matching = list.filter((p) => {
      if (!p.services || p.services.length === 0) return true;
      return p.services.some((s) => s.id === selectedServiceId);
    });
    return matching.length > 0 ? matching : list;
  }, [professionals, selectedServiceId]);

  const doctorCards = useMemo(
    () =>
      buildProfessionalCards({
        professionals: filteredProfessionals,
        specialtyName: selectedSpecialty?.name,
      }),
    [filteredProfessionals, selectedSpecialty],
  );

  const anyDoctorOption = useMemo(() => buildAnyProfessionalOption(), []);

  const selectedDoctorSummary = useMemo(() => {
    if (!selectedProfessionalId || selectedProfessionalId === ANY_AVAILABLE_PROFESSIONAL_ID) {
      return 'Cualquier profesional disponible (Mayor disponibilidad)';
    }
    const prof = (professionals || []).find((p) => p.id === selectedProfessionalId);
    if (prof) {
      const firstName = prof.firstName || prof.user?.firstName || '';
      const lastName = prof.lastName || prof.user?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) return fullName;
    }
    return 'Profesional seleccionado';
  }, [professionals, selectedProfessionalId]);

  return (
    <section className="apx-step apx-selection-step" aria-labelledby="selection-step-title">
      <div className="apx-step__top">
        <div className="apx-step__intro">
          <h2 className="apx-step__title" id="selection-step-title">
            1. Especialidad, Servicio y Profesional
          </h2>
          <p className="apx-step__desc">
            Elige la especialidad médica, el tratamiento o consulta y el especialista. Las secciones se minimizan automáticamente para mayor comodidad.
          </p>
        </div>
      </div>

      {/* 1.1 Especialidad Block */}
      <div
        className={`apx-selection-block ${
          openSection === 'specialty' ? 'apx-selection-block--expanded' : 'apx-selection-block--collapsed'
        }`}
      >
        <button
          type="button"
          className="apx-selection-block__header-btn"
          onClick={() => setOpenSection(openSection === 'specialty' ? null : 'specialty')}
          aria-expanded={openSection === 'specialty'}
        >
          <div className="apx-selection-block__head">
            <span className="apx-selection-block__number">1.1</span>
            <div className="apx-selection-block__title-col">
              <h3 className="apx-selection-block__title">Especialidad Médica</h3>
              {openSection === 'specialty' ? (
                <p className="apx-selection-block__sub">Área médica en la que deseas recibir atención</p>
              ) : selectedSpecialty ? (
                <span className="apx-selection-summary-text">{selectedSpecialty.name}</span>
              ) : (
                <span className="apx-selection-summary-text apx-selection-summary-text--pending">
                  Pendiente de selección
                </span>
              )}
            </div>
          </div>

          <div className="apx-selection-block__header-actions">
            {selectedSpecialty && (
              <span className="apx-selection-summary-badge">
                <IconCheck size={13} className="apx-selection-summary-check" />
                <span className="apx-selection-summary-label">{selectedSpecialty.name}</span>
              </span>
            )}
            <span className="apx-selection-toggle-pill">
              {openSection === 'specialty' ? (
                <>
                  <span>Minimizar</span>
                  <IconChevronUp size={15} />
                </>
              ) : (
                <>
                  <span>{selectedSpecialty ? 'Cambiar' : 'Seleccionar'}</span>
                  <IconChevronDown size={15} />
                </>
              )}
            </span>
          </div>
        </button>

        {openSection === 'specialty' && (
          <div className="apx-selection-block__body">
            <SpecialtySearch
              value={specialtyQuery}
              resultCount={visibleSpecialtyCards.length}
              onChange={setSpecialtyQuery}
            />

            <SpecialtyGrid
              cards={visibleSpecialtyCards}
              selectedSpecialtyId={selectedSpecialtyId}
              onSelect={(id) => {
                const spec = (specialties || []).find((s) => s.id === id);
                if (spec) {
                  onSelectSpecialty(spec);
                  // Auto-collapse specialty & auto-expand service
                  setOpenSection('service');
                }
              }}
              onViewTreatments={(card) => {
                const spec = (specialties || []).find((s) => s.id === card.specialtyId);
                if (spec) {
                  onSelectSpecialty(spec);
                  setOpenSection('service');
                }
              }}
              query={specialtyQuery}
              onClearSearch={() => setSpecialtyQuery('')}
            />
          </div>
        )}
      </div>

      {/* 1.2 Servicio Block */}
      {selectedSpecialty && (
        <div
          className={`apx-selection-block apx-selection-block--highlight ${
            openSection === 'service' ? 'apx-selection-block--expanded' : 'apx-selection-block--collapsed'
          }`}
        >
          <button
            type="button"
            className="apx-selection-block__header-btn"
            onClick={() => setOpenSection(openSection === 'service' ? null : 'service')}
            aria-expanded={openSection === 'service'}
          >
            <div className="apx-selection-block__head">
              <span className="apx-selection-block__number">1.2</span>
              <div className="apx-selection-block__title-col">
                <h3 className="apx-selection-block__title">
                  Servicio en {selectedSpecialty.name}
                </h3>
                {openSection === 'service' ? (
                  <p className="apx-selection-block__sub">Elige el tratamiento o consulta requerida</p>
                ) : selectedService ? (
                  <span className="apx-selection-summary-text">
                    {selectedService.name} · S/ {selectedService.price.toFixed(2)}
                  </span>
                ) : (
                  <span className="apx-selection-summary-text apx-selection-summary-text--pending">
                    Pendiente de selección
                  </span>
                )}
              </div>
            </div>

            <div className="apx-selection-block__header-actions">
              {selectedService && (
                <span className="apx-selection-summary-badge">
                  <IconCheck size={13} className="apx-selection-summary-check" />
                  <span className="apx-selection-summary-label">
                    {selectedService.name} · S/ {selectedService.price.toFixed(2)} ({selectedService.durationMinutes} min)
                  </span>
                </span>
              )}
              <span className="apx-selection-toggle-pill">
                {openSection === 'service' ? (
                  <>
                    <span>Minimizar</span>
                    <IconChevronUp size={15} />
                  </>
                ) : (
                  <>
                    <span>{selectedService ? 'Cambiar' : 'Seleccionar'}</span>
                    <IconChevronDown size={15} />
                  </>
                )}
              </span>
            </div>
          </button>

          {openSection === 'service' && (
            <div className="apx-selection-block__body">
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
                  if (serv) {
                    onSelectService(serv);
                    // Auto-collapse service & auto-expand professional
                    setOpenSection('professional');
                  }
                }}
                onResetFilters={() => {
                  setServiceFilter('all');
                  setServiceSort('relevance');
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* 1.3 Profesional Block */}
      {selectedSpecialty && selectedServiceId && (
        <div
          className={`apx-selection-block ${
            openSection === 'professional' ? 'apx-selection-block--expanded' : 'apx-selection-block--collapsed'
          }`}
        >
          <button
            type="button"
            className="apx-selection-block__header-btn"
            onClick={() => setOpenSection(openSection === 'professional' ? null : 'professional')}
            aria-expanded={openSection === 'professional'}
          >
            <div className="apx-selection-block__head">
              <span className="apx-selection-block__number">1.3</span>
              <div className="apx-selection-block__title-col">
                <h3 className="apx-selection-block__title">Profesional Médico</h3>
                {openSection === 'professional' ? (
                  <p className="apx-selection-block__sub">
                    Puedes elegir un especialista colegiado o autoasignación para mayor disponibilidad.
                  </p>
                ) : (
                  <span className="apx-selection-summary-text">{selectedDoctorSummary}</span>
                )}
              </div>
            </div>

            <div className="apx-selection-block__header-actions">
              <span className="apx-selection-summary-badge">
                <IconCheck size={13} className="apx-selection-summary-check" />
                <span className="apx-selection-summary-label">{selectedDoctorSummary}</span>
              </span>
              <span className="apx-selection-toggle-pill">
                {openSection === 'professional' ? (
                  <>
                    <span>Minimizar</span>
                    <IconChevronUp size={15} />
                  </>
                ) : (
                  <>
                    <span>Cambiar</span>
                    <IconChevronDown size={15} />
                  </>
                )}
              </span>
            </div>
          </button>

          {openSection === 'professional' && (
            <div className="apx-selection-block__body">
              <ProfessionalGrid
                anyOption={anyDoctorOption}
                professionals={doctorCards}
                selectedProfessionalId={selectedProfessionalId || ANY_AVAILABLE_PROFESSIONAL_ID}
                onSelect={(profId) => {
                  onSelectProfessional(profId);
                }}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};
