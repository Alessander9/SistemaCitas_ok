/**
 * Fuente única de verdad para el parser determinista de dictado clínico (Frontend + Backend).
 * Extrae escala EVA (rechazando negativos y > 10), secciones clínicas, técnicas canónicas y recetas.
 */

export interface SharedParsedMedication {
  medicationName: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
}

export interface SharedParsedClinicalData {
  chiefComplaint?: string;
  anamnesis?: string;
  physicalExam?: string;
  painScale?: number;
  painBefore?: number;
  painAfter?: number;
  diagnosis?: string;
  treatmentPlan?: string;
  techniques?: string[];
  medications?: SharedParsedMedication[];
  homeRecommendations?: string;
  notes?: string;
}

const CANONICAL_TECHNIQUES = [
  'Terapia Manual Ortopédica',
  'Terapia Manual',
  'Electroterapia (TENS / EMS)',
  'Electroterapia TENS',
  'Ultrasonido Terapéutico',
  'Ultrasonido',
  'Punción Seca',
  'Termoterapia / Crioterapia',
  'Termoterapia',
  'Crioterapia',
  'Ejercicio Terapéutico Funcional',
  'Ejercicios Terapéuticos',
  'Liberación Miofascial',
  'Magnetoterapia',
  'Kinesiotape',
];

export function parseClinicalSpeechShared(
  rawText: string,
  current?: Partial<SharedParsedClinicalData>,
): SharedParsedClinicalData {
  const data: SharedParsedClinicalData = { ...(current || {}) };
  const text = (rawText || '').trim();
  if (!text) return data;

  // 1. Escala EVA / Dolor (captura signo negativo para rechazar < 0 y > 10)
  const evaMatch =
    text.match(/(?:dolor|escala|eva|nivel de dolor)\s*(?:eva)?\s*(?:de\s*)?(-?\d{1,2})(?:\s*(?:sobre|\/)\s*10)?/i) ||
    text.match(/(-?\d{1,2})\s*(?:sobre|\/)\s*10/i);
  if (evaMatch) {
    const score = parseInt(evaMatch[1], 10);
    if (score >= 0 && score <= 10) {
      data.painScale = score;
    }
  }

  const evaBeforeMatch = text.match(/(?:dolor|eva)\s*(?:al ingresar|antes|inicial)\s*(?:es\s*de\s*)?(-?\d{1,2})/i);
  if (evaBeforeMatch) {
    const s = parseInt(evaBeforeMatch[1], 10);
    if (s >= 0 && s <= 10) data.painBefore = s;
  }

  const evaAfterMatch = text.match(/(?:dolor|eva)\s*(?:al salir|despu[eé]s|final)\s*(?:es\s*de\s*)?(-?\d{1,2})/i);
  if (evaAfterMatch) {
    const s = parseInt(evaAfterMatch[1], 10);
    if (s >= 0 && s <= 10) data.painAfter = s;
  }

  // 2. Secciones clínicas estructuradas
  const sectionDefs: Array<{ key: string; patterns: RegExp[] }> = [
    { key: 'chiefComplaint', patterns: [/\bmotivo(?: de consulta)?\s*[:\-]/i, /\bpaciente (?:viene por|refiere)\s*[:\-]?/i] },
    { key: 'painScaleText', patterns: [/\b(?:escala de dolor|dolor eva|escala eva)\s*[:\-]?/i] },
    { key: 'anamnesis', patterns: [/\banamnesis\s*[:\-]/i, /\benfermedad actual\s*[:\-]/i, /\bhistoria cl[ií]nica\s*[:\-]/i] },
    { key: 'physicalExam', patterns: [/\bexamen f[ií]sico\s*[:\-]/i, /\bevaluaci[oó]n f[ií]sica\s*[:\-]/i, /\ba la palpaci[oó]n\s*[:\-]?/i] },
    { key: 'diagnosis', patterns: [/\bdiagn[oó]stico\s*[:\-]/i, /\bcie-?10\s*[:\-]/i] },
    { key: 'treatmentPlan', patterns: [/\bplan(?: de tratamiento| terap[eé]utico| m[eé]dico)?\s*[:\-]/i] },
    { key: 'notes', patterns: [/\bobservaciones\s*[:\-]/i, /\bnotas(?: de evoluci[oó]n)?\s*[:\-]/i, /\bevoluci[oó]n\s*[:\-]/i] },
    { key: 'homeRecommendations', patterns: [/\brecomendaciones\s*[:\-]/i, /\bindicaciones(?: para la casa| para el hogar)?\s*[:\-]/i] },
    { key: 'techniques', patterns: [/\bt[eé]cnicas(?: aplicadas)?\s*[:\-]/i, /\bprocedimientos\s*[:\-]/i] },
    { key: 'medications', patterns: [/\brecetar\s*[:\-]/i, /\breceta(?: m[eé]dica)?\s*[:\-]/i, /\bmedicamentos?\s*[:\-]/i, /\bprescripci[oó]n\s*[:\-]/i] },
  ];

  const occurrences: Array<{ key: string; startIndex: number; headerLength: number }> = [];
  sectionDefs.forEach((def) => {
    def.patterns.forEach((pattern) => {
      const match = text.match(pattern);
      if (match && match.index !== undefined) {
        occurrences.push({ key: def.key, startIndex: match.index, headerLength: match[0].length });
      }
    });
  });

  occurrences.sort((a, b) => a.startIndex - b.startIndex);

  for (let i = 0; i < occurrences.length; i++) {
    const currentOcc = occurrences[i];
    const contentStart = currentOcc.startIndex + currentOcc.headerLength;
    const contentEnd = i + 1 < occurrences.length ? occurrences[i + 1].startIndex : text.length;
    const content = text.slice(contentStart, contentEnd).trim().replace(/[.,;]+$/, '');

    if (content) {
      if (currentOcc.key === 'medications') {
        const meds: SharedParsedMedication[] = [];
        const items = content.split(/;|\ny|\. /);
        items.forEach((item) => {
          const cleanItem = item.trim();
          if (!cleanItem) return;

          const freqMatch = cleanItem.match(/(cada\s*\d+\s*(?:horas|h|d[ií]as)|en ayunas|antes de dormir|cada ma[nñ]ana)/i);
          const durMatch = cleanItem.match(/(por\s*\d+\s*(?:d[ií]as|semanas|meses))/i);
          const doseMatch = cleanItem.match(
            /(\b(?:1|2|3|\d+)\s*(?:c[aá]psulas?|tabletas?|comprimidos?|gotas?|ampollas?|sobres?)|(?:\d+\s*(?:mg|g|ml|mcg|ui)))/i,
          );

          let drugName = cleanItem;
          if (freqMatch && freqMatch.index !== undefined) {
            drugName = drugName.slice(0, freqMatch.index);
          }
          if (durMatch && durMatch.index !== undefined && durMatch.index < drugName.length) {
            drugName = drugName.slice(0, durMatch.index);
          }
          drugName = drugName.replace(/[,;]+$/, '').trim();

          if (drugName.length > 2) {
            meds.push({
              medicationName: drugName,
              dose: doseMatch ? doseMatch[1].trim() : '1 cápsula',
              route: /t[oó]pic[oa]|crema|gel|ung[uü]ento/i.test(cleanItem)
                ? 'Tópica'
                : /inyectable|ampolla|intramuscular/i.test(cleanItem)
                  ? 'Intramuscular'
                  : 'Oral',
              frequency: freqMatch ? freqMatch[1].trim() : 'Cada 8 horas',
              duration: durMatch ? durMatch[1].trim() : 'Por 5 días',
            });
          }
        });
        if (meds.length > 0) {
          data.medications = meds;
        }
      } else if (currentOcc.key !== 'techniques' && currentOcc.key !== 'painScaleText') {
        (data as Record<string, unknown>)[currentOcc.key] = content;
      }
    }
  }

  // 3. Detección canónica de técnicas clínicas sin duplicados
  const matchedTechniques: string[] = [];
  const lowerText = text.toLowerCase();
  CANONICAL_TECHNIQUES.forEach((tech) => {
    const simpleTech = tech.toLowerCase().replace(/[()]/g, '');
    if (lowerText.includes(simpleTech) || (tech === 'Terapia Manual Ortopédica' && lowerText.includes('terapia manual'))) {
      const canonical = tech.includes('TENS')
        ? 'Electroterapia (TENS / EMS)'
        : tech.includes('Ultrasonido')
          ? 'Ultrasonido Terapéutico'
          : tech.includes('Ejercicio')
            ? 'Ejercicio Terapéutico Funcional'
            : tech.includes('Termoterapia') || tech.includes('Crioterapia')
              ? 'Termoterapia / Crioterapia'
              : tech === 'Terapia Manual'
                ? 'Terapia Manual Ortopédica'
                : tech;
      if (!matchedTechniques.includes(canonical)) {
        matchedTechniques.push(canonical);
      }
    }
  });
  if (matchedTechniques.length > 0) {
    data.techniques = matchedTechniques;
  }

  if (!data.chiefComplaint && !data.anamnesis && !data.diagnosis && text.length > 5) {
    data.chiefComplaint = text;
    data.notes = text;
  }

  return data;
}
