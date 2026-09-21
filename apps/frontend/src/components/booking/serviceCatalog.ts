// =============================================================================
// CitasSistema — Service Catalog (data layer, UI-agnostic)
// -----------------------------------------------------------------------------
// Maps GET /specialties/:specialtyId/services (MedicalService[]) into the
// presentational ServiceCardModel consumed by <ServiceCard />, plus the
// toolbar filter/sort options. Nothing here renders.
// =============================================================================

import { MedicalService } from '@citassistema/shared-types';
import { ServiceCardModel, ServiceFilterOption, ServiceSortOption } from './appointmentTypes';

interface ServiceCatalogEntry {
  /** Normalized (accent-free, lowercase) fragment matched against the name. */
  match: string;
  imageUrl: string;
  isPopular: boolean;
}

const FALLBACK_ENTRY: ServiceCatalogEntry = {
  match: '',
  imageUrl:
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=640',
  isPopular: false,
};

const SERVICE_CATALOG: ServiceCatalogEntry[] = [
  {
    match: 'evaluacion y diagnostico',
    imageUrl:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=640',
    isPopular: true,
  },
  {
    match: 'terapia manual',
    imageUrl:
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=640',
    isPopular: false,
  },
  {
    match: 'consulta medica traumatologica',
    imageUrl:
      'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&q=80&w=640',
    isPopular: true,
  },
  {
    match: 'rehabilitacion de mano',
    imageUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&q=80&w=640',
    isPopular: false,
  },
  {
    match: 'consulta nutricional',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=640',
    isPopular: true,
  },
];

/** Accent-free, lowercase, collapse whitespace. */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveServiceEntry(name: string): ServiceCatalogEntry {
  const normalized = normalize(name);
  if (!normalized) return FALLBACK_ENTRY;
  return SERVICE_CATALOG.find((entry) => normalized.includes(entry.match)) ?? FALLBACK_ENTRY;
}

/**
 * Turns the API services into card view-models. `serviceId` is always the
 * service primary key, which is what the wizard stores on selection.
 */
export function buildServiceCards(services: MedicalService[]): ServiceCardModel[] {
  return services
    .filter((service) => service.isActive !== false)
    .map((service) => {
      const entry = resolveServiceEntry(service.name);
      return {
        serviceId: service.id,
        name: service.name,
        description: service.description ?? '',
        price: service.price ?? 0,
        currency: service.currency || 'PEN',
        durationMinutes: service.durationMinutes,
        imageUrl: entry.imageUrl,
        isPopular: entry.isPopular,
        requiresDeposit: service.requiresDeposit,
        depositAmount: service.depositAmount ?? 0,
      };
    });
}

/** "S/ 120.00" from the service price + currency (single formatting rule). */
export function formatPriceLabel(price: number, currency = 'PEN'): string {
  const prefix = currency === 'PEN' ? 'S/' : `${currency} `;
  return `${prefix} ${price.toFixed(2)}`;
}

export const SERVICE_FILTER_OPTIONS: { value: ServiceFilterOption; label: string }[] = [
  { value: 'all', label: 'Todos los servicios' },
  { value: 'popular', label: 'Solo más solicitados' },
  { value: 'under-100', label: 'Hasta S/ 100' },
  { value: 'over-100', label: 'Más de S/ 100' },
];

export const SERVICE_SORT_OPTIONS: { value: ServiceSortOption; label: string }[] = [
  { value: 'relevance', label: 'Recomendados' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
];

export function filterServiceCards(
  cards: ServiceCardModel[],
  filter: ServiceFilterOption,
): ServiceCardModel[] {
  switch (filter) {
    case 'popular':
      return cards.filter((card) => card.isPopular);
    case 'under-100':
      return cards.filter((card) => card.price <= 100);
    case 'over-100':
      return cards.filter((card) => card.price > 100);
    default:
      return cards;
  }
}

export function sortServiceCards(
  cards: ServiceCardModel[],
  sort: ServiceSortOption,
): ServiceCardModel[] {
  const sorted = cards.slice();
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    default:
      // Recommended: highlighted services first, then the cheapest entry point.
      return sorted.sort((a, b) => Number(b.isPopular) - Number(a.isPopular) || a.price - b.price);
  }
}

/** Applies the toolbar pipeline in a single place. */
export function applyServiceToolbar(
  cards: ServiceCardModel[],
  filter: ServiceFilterOption,
  sort: ServiceSortOption,
): ServiceCardModel[] {
  return sortServiceCards(filterServiceCards(cards, filter), sort);
}
