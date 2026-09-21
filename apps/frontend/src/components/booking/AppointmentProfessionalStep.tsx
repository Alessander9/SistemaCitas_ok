import React, { useMemo } from 'react';
import { Professional } from '@citassistema/shared-types';
import { ProfessionalGrid } from './ProfessionalGrid';
import { ProfessionalHeader } from './ProfessionalHeader';
import { ProfessionalTrustPanel } from './ProfessionalTrustPanel';
import {
  buildAnyProfessionalOption,
  buildProfessionalCards,
} from './professionalCatalog';
import './AppointmentStep.css';

export interface AppointmentProfessionalStepProps {
  /**
   * Professionals for the chosen service —
   * GET /specialties/:specialtyId/services/:serviceId/professionals
   */
  professionals: Professional[];
  /** Specialty from step 1, used when the API sends no profession. */
  specialtyName?: string;
  /** null when nothing is selected; ANY_AVAILABLE_... for auto-assignment. */
  selectedProfessionalId: string | null;
  onSelectProfessional: (professionalId: string) => void;
  isLoading?: boolean;
}

/**
 * Step 3 of the booking wizard — "Elige a tu Profesional de Confianza".
 * Pure composition: the catalog resolves the data, the components render.
 */
export const AppointmentProfessionalStep: React.FC<AppointmentProfessionalStepProps> = ({
  professionals,
  specialtyName,
  selectedProfessionalId,
  onSelectProfessional,
  isLoading = false,
}) => {
  const cards = useMemo(
    () => buildProfessionalCards({ professionals, specialtyName }),
    [professionals, specialtyName],
  );
  const anyOption = useMemo(() => buildAnyProfessionalOption(), []);

  return (
    <section className="apx-step" aria-labelledby="apx-step-title">
      <div className="apx-step__top apx-step__top--center">
        <ProfessionalHeader
          title="Elige a tu Profesional de Confianza"
          description="Puedes seleccionar un especialista específico o permitir que el sistema asigne el primero disponible."
        />
        <ProfessionalTrustPanel />
      </div>

      {isLoading ? (
        <div className="apx-professional-grid" aria-busy="true" aria-label="Cargando profesionales">
          {[0, 1, 2, 3].map((index) => (
            <div className="apx-skeleton apx-skeleton--professional" key={index} />
          ))}
        </div>
      ) : (
        <ProfessionalGrid
          anyOption={anyOption}
          professionals={cards}
          selectedProfessionalId={selectedProfessionalId}
          onSelect={onSelectProfessional}
        />
      )}
    </section>
  );
};
