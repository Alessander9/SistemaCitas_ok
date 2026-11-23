export interface SpecialtyPreset {
  id: string;
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  brandColor: string;
  defaultTagline: string;
  landingStyle: 'modern' | 'editorial' | 'express';
  highlights: string[];
}

export interface CuratedPalette {
  id: string;
  name: string;
  hex: string;
}

export const MEDICAL_PRESETS: Record<string, SpecialtyPreset> = {
  fisioterapia: {
    id: 'fisioterapia',
    name: 'Fisioterapia y Rehabilitación',
    heroTitle: 'Rehabilitación física integral y alivio del dolor',
    heroSubtitle:
      'Especialistas certificados en terapia física, deportiva y recuperación motriz con equipamiento moderno.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    brandColor: '#0d9488',
    defaultTagline: 'Tu recuperación y bienestar en manos de expertos',
    landingStyle: 'modern',
    highlights: ['Terapia física y deportiva', 'Rehabilitación postural', 'Manejo del dolor crónico'],
  },
  policlinico: {
    id: 'policlinico',
    name: 'Policlínico / Medicina General',
    heroTitle: 'Atención médica integral para toda tu familia',
    heroSubtitle:
      'Consultas médicas preventivas, diagnóstico oportuno y atención cálida con profesionales de primer nivel.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    brandColor: '#0284c7',
    defaultTagline: 'Cuidando de tu salud y la de quienes más quieres',
    landingStyle: 'modern',
    highlights: ['Medicina General y Preventiva', 'Laboratorio y Triaje', 'Atención pediátrica y adulta'],
  },
  odontologia: {
    id: 'odontologia',
    name: 'Odontología y Estética Dental',
    heroTitle: 'Sonrisas saludables, radiantes y duraderas',
    heroSubtitle:
      'Odontología digital avanzada, ortodoncia, implantes y diseño de sonrisa con mínima invasión.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    brandColor: '#4f46e5',
    defaultTagline: 'La tecnología que tu sonrisa merece',
    landingStyle: 'editorial',
    highlights: ['Diseño de Sonrisa Digital', 'Ortodoncia Invisible', 'Implantes y Rehabilitación'],
  },
  psicologia: {
    id: 'psicologia',
    name: 'Psicología y Salud Mental',
    heroTitle: 'Un espacio seguro para tu bienestar emocional',
    heroSubtitle:
      'Terapia psicológica individual, de pareja y familiar guiada por terapeutas clínicos empáticos.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1573497620053-ea5300f94f21?auto=format&fit=crop&w=1200&q=80',
    brandColor: '#059669',
    defaultTagline: 'Cuidar de tu mente es el primer paso para estar bien',
    landingStyle: 'modern',
    highlights: ['Terapia Cognitivo-Conductual', 'Manejo de Estrés y Ansiedad', 'Orientación Vocacional'],
  },
  dermatologia: {
    id: 'dermatologia',
    name: 'Dermatología y Estética',
    heroTitle: 'Cuidado experto para una piel sana y luminosa',
    heroSubtitle:
      'Tratamientos dermatológicos clínicos, estética facial y tecnología láser de última generación.',
    heroImageUrl:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    brandColor: '#e11d48',
    defaultTagline: 'Salud cutánea y belleza natural con respaldo científico',
    landingStyle: 'editorial',
    highlights: ['Dermatología Clínica', 'Rejuvenecimiento Facial', 'Láser Médico Avanzado'],
  },
};

export const CURATED_PALETTES: CuratedPalette[] = [
  { id: 'teal', name: 'Teal Clínico', hex: '#0d9488' },
  { id: 'cyan', name: 'Azul Médico', hex: '#0284c7' },
  { id: 'navy', name: 'Azul Marino', hex: '#1e40af' },
  { id: 'indigo', name: 'Índigo Salud', hex: '#4f46e5' },
  { id: 'emerald', name: 'Esmeralda', hex: '#059669' },
  { id: 'rose', name: 'Rosa Médico', hex: '#e11d48' },
  { id: 'terracotta', name: 'Terracota', hex: '#c2410c' },
  { id: 'slate', name: 'Slate Ejecutivo', hex: '#475569' },
];

export interface DerivedBrandTheme {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  softBg: string;
  softBorder: string;
  contrastText: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return { r, g, b };
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

export function deriveBrandTheme(primaryHex: string): DerivedBrandTheme {
  const rgb = hexToRgb(primaryHex) || { r: 2, g: 132, b: 199 };

  // Calculate darker shade for hover (reduce brightness by 20%)
  const darkR = Math.max(0, Math.round(rgb.r * 0.8));
  const darkG = Math.max(0, Math.round(rgb.g * 0.8));
  const darkB = Math.max(0, Math.round(rgb.b * 0.8));
  const primaryDark = `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;

  // Calculate lighter tint
  const lightR = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * 0.3));
  const lightG = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * 0.3));
  const lightB = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * 0.3));
  const primaryLight = `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;

  // Relative luminance for contrast text (WCAG 2.1)
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const contrastText = luminance > 0.6 ? '#0f172a' : '#ffffff';

  return {
    primary: primaryHex,
    primaryDark,
    primaryLight,
    softBg: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08)`,
    softBorder: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.22)`,
    contrastText,
  };
}
