// =============================================================================
// CitasSistema — Professional Catalog (data layer, UI-agnostic)
// -----------------------------------------------------------------------------
// Maps GET /specialties/:specialtyId/services/:serviceId/professionals
// (Professional[]) into the presentational ProfessionalCardModel.
//
// The API contract has no rating/review fields yet, so those properties are
// only copied when the backend actually sends them — never invented.
// =============================================================================

import { Professional } from '@citassistema/shared-types';
import {
  ANY_AVAILABLE_PROFESSIONAL_ID,
  AnyProfessionalOption,
  ProfessionalCardModel,
} from './appointmentTypes';

/** Optional fields the backend may add later without breaking this module. */
type ProfessionalWithOptionalProfile = Professional & {
  profession?: string;
  specialty?: string;
  photoUrl?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
};

export interface BuildProfessionalCardsParams {
  professionals: Professional[];
  /** Specialty chosen in step 1, used when the API sends no profession. */
  specialtyName?: string;
}

function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function buildProfessionalCards({
  professionals,
  specialtyName,
}: BuildProfessionalCardsParams): ProfessionalCardModel[] {
  return professionals
    .filter((professional) => professional.isActive !== false)
    .map((professional) => {
      const extras = professional as ProfessionalWithOptionalProfile;
      const name = `${professional.firstName} ${professional.lastName}`.replace(/\s+/g, ' ').trim();

      return {
        professionalId: professional.id,
        name,
        // Real profession from the API, falling back to the booking specialty.
        profession: extras.profession ?? extras.specialty ?? specialtyName,
        licenseNumber: professional.licenseNumber,
        description: professional.bio,
        photoUrl: extras.photoUrl ?? professional.avatarUrl,
        rating: toOptionalNumber(extras.rating),
        reviewCount: toOptionalNumber(extras.reviewCount),
        availability:
          typeof extras.availability === 'string' && extras.availability.trim().length > 0
            ? extras.availability
            : undefined,
      };
    });
}

/** Resolves the selected professional card (null for auto-assignment). */
export function findProfessionalCard(
  professionals: Professional[],
  professionalId: string | null | undefined,
  specialtyName?: string,
): ProfessionalCardModel | null {
  if (!professionalId || professionalId === ANY_AVAILABLE_PROFESSIONAL_ID) return null;
  return (
    buildProfessionalCards({ professionals, specialtyName }).find(
      (card) => card.professionalId === professionalId,
    ) ?? null
  );
}

/** Builds the auto-assignment option (first available professional). */
export function buildAnyProfessionalOption(): AnyProfessionalOption {
  return {
    professionalId: ANY_AVAILABLE_PROFESSIONAL_ID,
    label: 'Cualquier Profesional Disponible',
    badge: 'Opción recomendada',
    description:
      'Asigna automáticamente al especialista con mayor disponibilidad en la fecha elegida.',
    benefits: ['Atención más rápida', 'Misma calidad de atención', 'Especialistas verificados'],
  };
}
