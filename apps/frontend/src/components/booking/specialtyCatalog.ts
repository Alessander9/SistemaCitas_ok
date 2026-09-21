// =============================================================================
// CitasSistema — Specialty Catalog (data layer, UI-agnostic)
// -----------------------------------------------------------------------------
// Maps the backend contract (GET /specialties, /professionals, /services) into
// the presentational SpecialtyCardModel consumed by <SpecialtyCard />.
//
// Nothing here renders. When the API starts returning real professionals linked
// to services, `buildSpecialtyCards()` picks the real counts up automatically
// and the catalog entry is only used as a presentation fallback.
// =============================================================================

import { MedicalService, Professional, Specialty } from '@citassistema/shared-types';
import {
  SelectedSpecialtySummary,
  SpecialtyAccent,
  SpecialtyCardModel,
  SpecialtyIconKey,
} from './appointmentTypes';

/** Single branch of the clinic network (will come from the clinic API later). */
export const DEFAULT_SPECIALTY_LOCATION = 'Sede San Isidro';

/**
 * Street address of the default branch. Same rule as the card images: it is a
 * presentation fallback only and must be replaced by the branch record
 * (GET /clinics/branches) as soon as the API returns it.
 */
export const DEFAULT_SPECIALTY_LOCATION_ADDRESS =
  'Av. Emilio Cavenecia 225, San Isidro, Lima';

interface SpecialtyCatalogEntry {
  /** Normalized (accent-free, lowercase) fragment matched against the name. */
  match: string;
  /** Plural role used for the badge: "5 médicos", "3 especialistas". */
  rolesLabel: string;
  fallbackProfessionalCount: number;
  fallbackTreatmentCount: number;
  accent: SpecialtyAccent;
  icon: SpecialtyIconKey;
  imageUrl: string;
  keywords: string[];
}

const FALLBACK_ENTRY: SpecialtyCatalogEntry = {
  match: '',
  rolesLabel: 'especialistas',
  fallbackProfessionalCount: 1,
  fallbackTreatmentCount: 1,
  accent: 'teal',
  icon: 'default',
  imageUrl:
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&q=80&w=640',
  keywords: [],
};

const SPECIALTY_CATALOG: SpecialtyCatalogEntry[] = [
  {
    match: 'fisioterapia',
    rolesLabel: 'médicos',
    fallbackProfessionalCount: 5,
    fallbackTreatmentCount: 8,
    accent: 'teal',
    icon: 'physiotherapy',
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=640',
    keywords: [
      'fisioterapia',
      'rehabilitacion',
      'movilidad',
      'lesiones deportivas',
      'dolor cronico',
      'terapia manual',
    ],
  },
  {
    match: 'traumatologia',
    rolesLabel: 'especialistas',
    fallbackProfessionalCount: 3,
    fallbackTreatmentCount: 6,
    accent: 'blue',
    icon: 'orthopedics',
    imageUrl:
      'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&q=80&w=640',
    keywords: [
      'traumatologia',
      'ortopedia',
      'musculo-esqueletico',
      'articulaciones',
      'rodilla',
      'hombro',
      'fracturas',
    ],
  },
  {
    match: 'terapia ocupacional',
    rolesLabel: 'especialistas',
    fallbackProfessionalCount: 4,
    fallbackTreatmentCount: 5,
    accent: 'amber',
    icon: 'occupational',
    imageUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=640',
    keywords: [
      'terapia ocupacional',
      'ergonomia',
      'postural',
      'reintegracion funcional',
      'vida diaria',
      'mano y muñeca',
    ],
  },
  {
    match: 'nutricion',
    rolesLabel: 'nutricionistas',
    fallbackProfessionalCount: 2,
    fallbackTreatmentCount: 4,
    accent: 'green',
    icon: 'nutrition',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=640',
    keywords: [
      'nutricion',
      'nutricion clinica',
      'nutricion deportiva',
      'planes nutricionales',
      'bioimpedancia',
      'rendimiento fisico',
    ],
  },
];

/** Accent-free, lowercase, collapse whitespace. Used for search + matching. */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Resolves the presentation entry for a specialty name (never returns null). */
export function resolveSpecialtyCatalogEntry(name: string): SpecialtyCatalogEntry {
  const normalized = normalizeSearchText(name);
  if (!normalized) return FALLBACK_ENTRY;
  return SPECIALTY_CATALOG.find((entry) => normalized.includes(entry.match)) ?? FALLBACK_ENTRY;
}

/**
 * Compact specialty summary used by step 2 as visual context (never renders
 * the full card: same icon/accent resolution as the step 1 grid).
 */
export function buildSelectedSpecialtySummary(
  specialty: Specialty,
): SelectedSpecialtySummary {
  const entry = resolveSpecialtyCatalogEntry(specialty.name);
  return {
    specialtyId: specialty.id,
    name: specialty.name,
    description: specialty.description ?? '',
    icon: entry.icon,
    accent: entry.accent,
    imageUrl: entry.imageUrl,
  };
}

export interface BuildSpecialtyCardsParams {
  specialties: Specialty[];
  services?: MedicalService[];
  professionals?: Professional[];
  location?: string;
}

/**
 * Builds the card view-models from the API collections.
 * `specialtyId` is always the specialty primary key, so step 2 can call
 * GET /specialties/:id/treatments with it directly.
 */
export function buildSpecialtyCards({
  specialties,
  services = [],
  professionals = [],
  location = DEFAULT_SPECIALTY_LOCATION,
}: BuildSpecialtyCardsParams): SpecialtyCardModel[] {
  return specialties
    .filter((specialty) => specialty.isActive !== false)
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((specialty) => {
      const entry = resolveSpecialtyCatalogEntry(specialty.name);
      const treatments = services.filter((service) => service.specialtyId === specialty.id);
      const treatmentIds = new Set(treatments.map((service) => service.id));

      // Real professionals win when the API links them to the specialty services.
      const linkedProfessionals = professionals.filter((professional) =>
        (professional.services ?? []).some(
          (service) => treatmentIds.has(service.id) || service.specialtyId === specialty.id,
        ),
      );

      const professionalCount = linkedProfessionals.length || entry.fallbackProfessionalCount;
      const treatmentCount = treatments.length || entry.fallbackTreatmentCount;

      return {
        specialtyId: specialty.id,
        name: specialty.name,
        description: specialty.description ?? '',
        professionalCount,
        professionalLabel: `${professionalCount} ${entry.rolesLabel}`,
        treatmentCount,
        location,
        accent: entry.accent,
        icon: entry.icon,
        imageUrl: entry.imageUrl,
        keywords: [
          ...entry.keywords,
          ...treatments.flatMap((service) => [service.name, service.description ?? '']),
        ],
      };
    });
}

/** Client-side filter for the search box (name, description, aliases, treatments). */
export function filterSpecialtyCards(
  cards: SpecialtyCardModel[],
  query: string,
): SpecialtyCardModel[] {
  const needle = normalizeSearchText(query);
  if (!needle) return cards;

  const tokens = needle.split(' ');
  return cards.filter((card) => {
    const haystack = normalizeSearchText(
      [card.name, card.description, card.location, ...card.keywords].join(' '),
    );
    return tokens.every((token) => haystack.includes(token));
  });
}
