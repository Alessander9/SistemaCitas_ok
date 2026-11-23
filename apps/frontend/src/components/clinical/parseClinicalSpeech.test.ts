import { describe, it, expect } from 'vitest';
import { parseClinicalSpeech } from './VoiceConsultationAssistant';

describe('parseClinicalSpeech (Pruebas Unitarias — Parser Clínico Local)', () => {
  it('extrae motivo, EVA, diagnóstico, plan, técnicas y receta en un dictado completo normal', () => {
    const input =
      'Motivo: Dolor lumbar agudo. Dolor EVA 7 sobre 10. Diagnóstico: Lumbalgia mecánica aguda. ' +
      'Plan: 10 sesiones de fisioterapia. Técnicas: Terapia Manual y Ultrasonido. ' +
      'Recetar: Paracetamol 500mg cada 8 horas por 3 días.';

    const result = parseClinicalSpeech(input);

    expect(result.chiefComplaint).toBe('Dolor lumbar agudo');
    expect(result.painScale).toBe(7);
    expect(result.diagnosis).toBe('Lumbalgia mecánica aguda');
    expect(result.treatmentPlan).toBe('10 sesiones de fisioterapia');
    expect(result.techniques).toContain('Terapia Manual Ortopédica');
    expect(result.techniques).toContain('Ultrasonido Terapéutico');
    expect(result.medications).toHaveLength(1);
    expect(result.medications?.[0]).toMatchObject({
      medicationName: 'Paracetamol 500mg',
      frequency: 'cada 8 horas',
      duration: 'por 3 días',
      route: 'Oral',
    });
  });

  it('devuelve objeto vacío cuando recibe cadena vacía o solo espacios', () => {
    expect(parseClinicalSpeech('')).toEqual({});
    expect(parseClinicalSpeech('     \n\t   ')).toEqual({});
  });

  it('acepta EVA igual a cero (paciente sin dolor)', () => {
    const result = parseClinicalSpeech('Motivo: Control de alta. Dolor EVA 0 sobre 10.');
    expect(result.painScale).toBe(0);
  });

  it('ignora valores de EVA negativos o mayores a 10 (fuera de rango clínico)', () => {
    const negative = parseClinicalSpeech('Motivo: Control. Dolor EVA -3 sobre 10.');
    const outOfRange = parseClinicalSpeech('Motivo: Control. Dolor EVA 15 sobre 10.');
    expect(negative.painScale).toBeUndefined();
    expect(outOfRange.painScale).toBeUndefined();
  });

  it('clasifica correctamente medicamentos de vía tópica e intramuscular', () => {
    const topical = parseClinicalSpeech('Recetar: Gel tópico de árnica cada 8 horas por 5 días.');
    const injectable = parseClinicalSpeech('Recetar: Complejo B 1 ampolla inyectable cada 24 horas por 3 días.');

    expect(topical.medications?.[0]?.route).toBe('Tópica');
    expect(injectable.medications?.[0]?.route).toBe('Intramuscular');
  });

  it('extrae dolor inicial y dolor final por separado durante una sesión', () => {
    const result = parseClinicalSpeech('Dolor al ingresar 8, dolor al salir 3.');
    expect(result.painBefore).toBe(8);
    expect(result.painAfter).toBe(3);
  });

  it('procesa un texto clínico muy largo sin truncar ni lanzar errores', () => {
    const longAnamnesis = 'Evolución progresiva en zona lumbar derecha. '.repeat(120).trim();
    const result = parseClinicalSpeech(`Motivo: Lumbalgia crónica. Anamnesis: ${longAnamnesis}`);

    expect(result.chiefComplaint).toBe('Lumbalgia crónica');
    expect(result.anamnesis?.length).toBeGreaterThan(3000);
  });

  it('no duplica técnicas canónicas cuando se mencionan sinónimos en el mismo dictado', () => {
    const result = parseClinicalSpeech(
      'Aplicamos Terapia Manual, Terapia Manual Ortopédica, Termoterapia y Crioterapia.',
    );

    const manualCount = (result.techniques || []).filter((t) => t === 'Terapia Manual Ortopédica').length;
    const thermoCount = (result.techniques || []).filter((t) => t === 'Termoterapia / Crioterapia').length;
    expect(manualCount).toBe(1);
    expect(thermoCount).toBe(1);
  });

  it('cuando el texto libre no tiene encabezados clínicos lo guarda como motivo y nota si supera 5 caracteres', () => {
    const freeText = 'Mejoría notable sin dolor al caminar';
    const result = parseClinicalSpeech(freeText);

    expect(result.chiefComplaint).toBe(freeText);
    expect(result.notes).toBe(freeText);
  });

  it('no rellena motivo ni notas si el texto sin encabezados es demasiado corto (<= 5 caracteres)', () => {
    const result = parseClinicalSpeech('hola');
    expect(result.chiefComplaint).toBeUndefined();
    expect(result.notes).toBeUndefined();
  });
});
