/**
 * CitasSistema - Core API Client Router
 *
 * Sliced into dedicated domain modules under ./api/:
 * - booking.api.ts (Specialties, Services, Professionals, Availability, Appointment Booking)
 * - patients.api.ts (Patient Document Lookup)
 * - clinical.api.ts (Pain Map, Speech Parser, Voice Consultation, Kardex Supplies)
 * - auth.api.ts (Password Recovery & Turnstile)
 * - admin.api.ts (SuperAdmin Clinics Management)
 * - knowledge.api.ts (Clinical Knowledge Protocols & Guidelines)
 * - http.ts (Shared HTTP utilities)
 */

export * from './api/index';
