-- Migration 016: Clinical Knowledge Base for Bilateral Voice Assistant ("Chanfainita")
-- CitasSistema — Fase 1: CIE-10, Vademecum, Red Flags, Clinical Protocols & Voice Macros

-- 1. Catálogo CIE-10 (Codificación silenciosa en BD, lenguaje humano en voz)
CREATE TABLE IF NOT EXISTS cie10_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  display_name VARCHAR(200) NOT NULL,
  synonyms TEXT[] NOT NULL DEFAULT '{}',
  specialty VARCHAR(120) NOT NULL DEFAULT 'Fisioterapia y Rehabilitación',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Vademécum Clínico & Cruce de Alergias
CREATE TABLE IF NOT EXISTS vademecum_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  medication_name VARCHAR(180) NOT NULL,
  active_ingredient VARCHAR(150) NOT NULL,
  drug_class VARCHAR(100) NOT NULL,
  default_dose VARCHAR(100) NOT NULL,
  default_route VARCHAR(60) NOT NULL DEFAULT 'Oral',
  default_frequency VARCHAR(120) NOT NULL,
  default_duration VARCHAR(80) NOT NULL,
  contraindications TEXT,
  allergy_keywords TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Banderas Rojas Clínicas (Red Flags)
CREATE TABLE IF NOT EXISTS clinical_red_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region VARCHAR(100) NOT NULL,
  trigger_keywords TEXT[] NOT NULL DEFAULT '{}',
  alert_title VARCHAR(200) NOT NULL,
  spoken_alert_human TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'high',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Protocolos Clínicos de la Sede (Editor Estructurado)
CREATE TABLE IF NOT EXISTS clinical_protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  pathology VARCHAR(200) NOT NULL,
  phase VARCHAR(120) NOT NULL,
  specialty VARCHAR(120) NOT NULL DEFAULT 'Fisioterapia y Rehabilitación',
  recommended_techniques TEXT[] NOT NULL DEFAULT '{}',
  home_exercises TEXT NOT NULL,
  duration_sessions INT DEFAULT 10,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Macros Clínicas por Voz (Plantillas de Control Rápido)
CREATE TABLE IF NOT EXISTS clinical_voice_macros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  trigger_phrase VARCHAR(180) NOT NULL,
  title VARCHAR(180) NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cie10_code ON cie10_catalog(code);
CREATE INDEX IF NOT EXISTS idx_vademecum_clinic ON vademecum_items(clinic_id);
CREATE INDEX IF NOT EXISTS idx_protocols_clinic ON clinical_protocols(clinic_id);
CREATE INDEX IF NOT EXISTS idx_macros_clinic ON clinical_voice_macros(clinic_id);

-- =============================================================================
-- SEED INICIAL: Catálogo CIE-10 (Fisioterapia, Rehabilitación y Traumatología)
-- =============================================================================
INSERT INTO cie10_catalog (code, display_name, synonyms, specialty) VALUES
  ('M54.5', 'Lumbalgia mecánica aguda', ARRAY['lumbalgia', 'dolor lumbar', 'espalda baja', 'dolor de cintura', 'lumbago'], 'Fisioterapia y Rehabilitación'),
  ('M54.4', 'Lumbago con ciática', ARRAY['ciatica', 'ciática', 'irradiacion ciatica', 'irradiación ciática', 'irradiado a gluteo', 'irradiado a pierna'], 'Fisioterapia y Rehabilitación'),
  ('M54.2', 'Cervicalgia mecánica', ARRAY['cervicalgia', 'dolor cervical', 'dolor de cuello', 'torticolis', 'tortícolis'], 'Fisioterapia y Rehabilitación'),
  ('M75.1', 'Síndrome del manguito rotador', ARRAY['manguito rotador', 'tendinitis de hombro', 'hombro doloroso', 'supraespinoso'], 'Traumatología y Ortopedia'),
  ('S76.3', 'Desgarro muscular de isquiotibiales', ARRAY['isquiotibiales', 'desgarro posterior', 'biceps femoral', 'bíceps femoral', 'desgarro muscular'], 'Rehabilitación Deportiva'),
  ('S93.4', 'Esguince de tobillo', ARRAY['esguince', 'tobillo', 'torcedura de tobillo', 'peroneoastragalino'], 'Rehabilitación Deportiva'),
  ('M62.6', 'Distensión y sobrecarga muscular', ARRAY['sobrecarga', 'gemelos', 'soleo', 'sóleo', 'pantorrilla', 'fatiga muscular', 'descarga muscular'], 'Rehabilitación Deportiva'),
  ('M77.1', 'Epicondilitis lateral (codo de tenista)', ARRAY['epicondilitis', 'codo de tenista', 'dolor de codo'], 'Traumatología y Ortopedia'),
  ('M72.2', 'Fascitis plantar', ARRAY['fascitis plantar', 'espolon', 'espolón', 'dolor de talon', 'dolor de talón'], 'Fisioterapia y Rehabilitación'),
  ('S83.5', 'Lesión de ligamento cruzado anterior (LCA)', ARRAY['lca', 'ligamento cruzado', 'rodilla post cirugia', 'post-cirugia lca'], 'Traumatología y Ortopedia'),
  ('M79.1', 'Mialgia y contractura muscular', ARRAY['contractura', 'mialgia', 'tension muscular', 'tensión muscular'], 'Fisioterapia y Rehabilitación')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- SEED INICIAL: Vademécum Clínico (con familias para cruce de alergias)
-- =============================================================================
INSERT INTO vademecum_items (medication_name, active_ingredient, drug_class, default_dose, default_route, default_frequency, default_duration, contraindications, allergy_keywords)
SELECT * FROM (VALUES
  ('Ibuprofeno 400mg', 'Ibuprofeno', 'AINE', '1 comprimido', 'Oral', 'Cada 8 horas después de alimentos', 'Por 3 días', 'Úlcera péptica activa, insuficiencia renal severa, alergia a AINEs.', ARRAY['ibuprofeno', 'aine', 'aines', 'antiinflamatorio', 'aspirina', 'naproxeno']),
  ('Celecoxib 200mg', 'Celecoxib', 'AINE', '1 cápsula', 'Oral', 'Cada 12 horas', 'Por 5 días', 'Alergia a sulfonamidas o AINEs, cardiopatía isquémica.', ARRAY['celecoxib', 'aine', 'aines', 'sulfas', 'sulfonamida']),
  ('Meloxicam 15mg', 'Meloxicam', 'AINE', '1 tableta', 'Oral', 'Cada 24 horas con alimentos', 'Por 7 días', 'Alergia a AINEs, hemorragia digestiva.', ARRAY['meloxicam', 'aine', 'aines']),
  ('Paracetamol 500mg', 'Paracetamol', 'Analgésico no AINE', '1 tableta', 'Oral', 'Cada 8 horas', 'Por 3 días', 'Insuficiencia hepática grave.', ARRAY['paracetamol', 'acetaminofen', 'acetaminofén']),
  ('Pregabalina 75mg', 'Pregabalina', 'Neuromodulador', '1 cápsula', 'Oral', 'Cada 24 horas (noche)', 'Por 7 días', 'Precaución por somnolencia al conducir.', ARRAY['pregabalina']),
  ('Complejo B Forte', 'Vitaminas B1-B6-B12', 'Vitamina Neurotrópica', '1 ampolla', 'Intramuscular', 'Interdiaria (3 dosis)', 'Por 6 días', 'Hipersensibilidad a tiamina.', ARRAY['complejo b', 'tiamina']),
  ('Magnesio Quelado 400mg', 'Magnesio', 'Suplemento Muscular', '1 comprimido', 'Oral', 'Cada 24 horas', 'Por 14 días', 'Insuficiencia renal severa.', ARRAY['magnesio']),
  ('Gel crioterapéutico de árnica', 'Árnica montana', 'Tópico', 'Aplicación local', 'Tópica', 'Cada 8 horas', 'Por 5 días', 'No aplicar sobre heridas abiertas.', ARRAY['arnica', 'árnica'])
) AS v(medication_name, active_ingredient, drug_class, default_dose, default_route, default_frequency, default_duration, contraindications, allergy_keywords)
WHERE NOT EXISTS (SELECT 1 FROM vademecum_items WHERE vademecum_items.medication_name = v.medication_name);

-- =============================================================================
-- SEED INICIAL: Banderas Rojas Clínicas (Red Flags)
-- =============================================================================
INSERT INTO clinical_red_flags (region, trigger_keywords, alert_title, spoken_alert_human, severity)
SELECT * FROM (VALUES
  ('Columna Lumbar', ARRAY['silla de montar', 'incontinencia urinaria', 'retencion urinaria', 'retención urinaria', 'perdida de esfinteres', 'pérdida de esfínteres'], 'Sospecha de Síndrome de Cauda Equina', 'Atención doctora: se detectaron signos compatibles con compromiso neurológico severo de cola de caballo. Se recomienda evaluación de urgencia.', 'critical'),
  ('Neurológico', ARRAY['perdida de fuerza progresiva', 'pérdida de fuerza progresiva', 'pie caido', 'pie caído', 'paralisis', 'parálisis'], 'Déficit Motor Progresivo', 'Atención doctora: hay signos de pérdida de fuerza motora progresiva. Conviene descartar compresión radicular severa.', 'high'),
  ('Sistémico', ARRAY['fiebre alta', 'escalofrios', 'escalofríos', 'perdida de peso inexplicable', 'pérdida de peso inexplicable'], 'Signos Sistémicos de Alarma', 'Atención doctora: la fiebre o pérdida de peso asociada al dolor requiere descartar causa infecciosa o inflamatoria sistémica.', 'high')
) AS rf(region, trigger_keywords, alert_title, spoken_alert_human, severity)
WHERE NOT EXISTS (SELECT 1 FROM clinical_red_flags WHERE clinical_red_flags.alert_title = rf.alert_title);

-- =============================================================================
-- SEED INICIAL: Protocolos Clínicos de la Clínica
-- =============================================================================
INSERT INTO clinical_protocols (pathology, phase, specialty, recommended_techniques, home_exercises, duration_sessions, notes)
SELECT * FROM (VALUES
  ('Lumbalgia mecánica aguda', 'Fase 1 · Control del Dolor', 'Fisioterapia y Rehabilitación', ARRAY['Terapia Manual Ortopédica', 'Electroterapia (TENS / EMS)', 'Termoterapia / Crioterapia'], 'Compresas tibias 15 minutos, pausas activas cada 2 horas y respiración diafragmática sin flexiones bruscas.', 10, 'Evitar cargas mayores a 5 kg durante los primeros 7 días.'),
  ('Lumbago con ciática', 'Fase 1 · Descompresión y Analgesia', 'Fisioterapia y Rehabilitación', ARRAY['Terapia Manual Ortopédica', 'Crioterapia', 'Electroterapia (TENS / EMS)'], 'Reposo relativo, almohada bajo rodillas al dormir y deslizamiento neural suave sin provocar irradiación.', 10, 'Reevaluar signo de Lasègue en sesión 4.'),
  ('Síndrome del manguito rotador', 'Fase 1 · Control Inflamatorio', 'Traumatología y Ortopedia', ARRAY['Ultrasonido Terapéutico', 'Termoterapia / Crioterapia', 'Terapia Manual Ortopédica'], 'Crioterapia 15 minutos tras actividad y ejercicios pendulares de Codman sin carga 2 veces al día.', 10, 'No superar 90 grados de abducción activa en fase aguda.'),
  ('Desgarro muscular de isquiotibiales', 'Fase 2 · Restauración de Movilidad', 'Rehabilitación Deportiva', ARRAY['Ultrasonido Terapéutico', 'Electroterapia (TENS / EMS)', 'Liberación Miofascial'], 'Compresas frías 15 minutos y estiramientos progresivos suaves sin dolor agudo.', 5, 'Progresar a excéntricos controlados cuando EVA sea menor o igual a 3.'),
  ('Esguince de tobillo', 'Fase 3 · Readaptación Funcional', 'Rehabilitación Deportiva', ARRAY['Crioterapia', 'Kinesiotape', 'Ejercicio Terapéutico Funcional'], 'Ejercicios de equilibrio en apoyo monopodal 10 minutos al día y movilidad de tobillo en alfabeto.', 6, 'Evaluar estabilidad lateral antes de retorno deportivo.'),
  ('Cervicalgia mecánica', 'Fase 1 · Relajación Miofascial', 'Fisioterapia y Rehabilitación', ARRAY['Liberación Miofascial', 'Termoterapia / Crioterapia', 'Terapia Manual Ortopédica'], 'Calor local 15 minutos, estiramientos suaves de trapecio superior y ergonomía de pantalla a la altura de los ojos.', 8, 'Descartar irradiación a miembros superiores.')
) AS p(pathology, phase, specialty, recommended_techniques, home_exercises, duration_sessions, notes)
WHERE NOT EXISTS (SELECT 1 FROM clinical_protocols WHERE clinical_protocols.pathology = p.pathology AND clinical_protocols.phase = p.phase);

-- =============================================================================
-- SEED INICIAL: Macros Clínicas por Voz
-- =============================================================================
INSERT INTO clinical_voice_macros (trigger_phrase, title, template_data)
SELECT * FROM (VALUES
  ('control lumbar favorable', 'Control Lumbar Favorable', '{"anamnesis":"Paciente refiere evolución favorable con menor rigidez matutina.","physicalExam":"Disminución de contractura paravertebral lumbar. Rango de flexión mejorado.","techniques":["Terapia Manual Ortopédica","Electroterapia (TENS / EMS)"],"homeRecommendations":"Continuar estiramientos suaves y pausas activas cada 2 horas."}'::jsonb),
  ('control hombro favorable', 'Control Hombro Favorable', '{"anamnesis":"Refiere disminución del dolor nocturno y mejor tolerancia a actividades diarias.","physicalExam":"Arco doloroso reducido, mejor abducción activa sin compensación escapular.","techniques":["Ultrasonido Terapéutico","Ejercicio Terapéutico Funcional"],"homeRecommendations":"Mantener ejercicios pendulares y fortalecimiento progresivo con banda elástica."}'::jsonb),
  ('alta fisioterapia', 'Alta de Fisioterapia', '{"anamnesis":"Paciente asintomático, cumple objetivos funcionales del plan terapéutico.","physicalExam":"Rango articular completo, fuerza muscular simétrica 5/5 sin dolor a la palpación.","painScale":1,"homeRecommendations":"Rutina preventiva de estiramientos 3 veces por semana y control en 3 meses."}'::jsonb)
) AS m(trigger_phrase, title, template_data)
WHERE NOT EXISTS (SELECT 1 FROM clinical_voice_macros WHERE clinical_voice_macros.trigger_phrase = m.trigger_phrase);
