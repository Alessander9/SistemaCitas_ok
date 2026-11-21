export type AnatomyLevel = 'region' | 'subregion' | 'structure';
export type AnatomyKind =
  | 'musculo'
  | 'tendon'
  | 'articulacion'
  | 'ligamento'
  | 'hueso'
  | 'nervio'
  | 'fascia'
  | 'segmento';
export type AnatomyView = 'anterior' | 'posterior' | 'lateral';

export interface AnatomyBBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface AnatomyAnchor {
  x: number;
  y: number;
}

export interface AnatomyNode {
  code: string;
  label: string;
  level: AnatomyLevel;
  parent?: string;
  kind?: AnatomyKind;
  views: AnatomyView[];
  lateral: boolean; // true = requiere D/I (hombro); false = central (L4-L5)
  aliases?: string[];
  anchor?: Partial<Record<AnatomyView, AnatomyAnchor>>;
  bbox?: AnatomyBBox; // bounding box para zoom en SVG (principalmente en regions/subregions)
  icd10Hints?: string[];
}

export const ANATOMY_TAXONOMY: AnatomyNode[] = [
  // ===========================================================================
  // 1. REGIONES DE NIVEL 1 (REGIONS)
  // ===========================================================================
  {
    code: 'CABEZA_ATM',
    label: 'Cabeza, Cara y ATM',
    level: 'region',
    views: ['anterior', 'lateral'],
    lateral: false,
    aliases: ['craneo', 'mandibula', 'facial', 'temporomandibular', 'atm'],
    bbox: { x: 38, y: 3, w: 24, h: 14 },
    anchor: { anterior: { x: 50, y: 10 }, lateral: { x: 52, y: 10 } },
  },
  {
    code: 'CUELLO_ANT',
    label: 'Cuello Anterior',
    level: 'region',
    views: ['anterior'],
    lateral: false,
    aliases: ['garganta', 'cervical anterior', 'hioides'],
    bbox: { x: 42, y: 15, w: 16, h: 8 },
    anchor: { anterior: { x: 50, y: 18 } },
  },
  {
    code: 'COL_CERVICAL',
    label: 'Columna Cervical',
    level: 'region',
    views: ['posterior', 'lateral'],
    lateral: false,
    aliases: ['cuello posterior', 'nuca', 'cervicales', 'c1-c7'],
    bbox: { x: 42, y: 14, w: 16, h: 10 },
    anchor: { posterior: { x: 50, y: 18 }, lateral: { x: 47, y: 18 } },
    icd10Hints: ['M54.2', 'M50.2'],
  },
  {
    code: 'COL_DORSAL',
    label: 'Columna Dorsal y Escapular',
    level: 'region',
    views: ['posterior'],
    lateral: false,
    aliases: ['espalda alta', 'toracica', 'dorsales', 'escapula', 'omoplato', 'd1-d12'],
    bbox: { x: 32, y: 22, w: 36, h: 20 },
    anchor: { posterior: { x: 50, y: 30 } },
    icd10Hints: ['M54.6'],
  },
  {
    code: 'COL_LUMBAR',
    label: 'Columna Lumbar',
    level: 'region',
    views: ['posterior', 'lateral'],
    lateral: false,
    aliases: ['espalda baja', 'lumbares', 'lumbago', 'l1-l5', 'zona lumbar'],
    bbox: { x: 38, y: 38, w: 24, h: 14 },
    anchor: { posterior: { x: 50, y: 44 }, lateral: { x: 49, y: 44 } },
    icd10Hints: ['M54.5'],
  },
  {
    code: 'PELVIS_SACRO',
    label: 'Pelvis, Sacro y Coxis',
    level: 'region',
    views: ['posterior', 'anterior'],
    lateral: false,
    aliases: ['sacro', 'coxis', 'gluteo central', 'sacroiliaca'],
    bbox: { x: 36, y: 49, w: 28, h: 12 },
    anchor: { posterior: { x: 50, y: 53 }, anterior: { x: 50, y: 52 } },
    icd10Hints: ['M53.3'],
  },
  {
    code: 'TORAX_ABDOMEN',
    label: 'Tórax y Abdomen',
    level: 'region',
    views: ['anterior'],
    lateral: false,
    aliases: ['pecho', 'costillas', 'abdominal', 'pectoral', 'esternon'],
    bbox: { x: 34, y: 22, w: 32, h: 28 },
    anchor: { anterior: { x: 50, y: 32 } },
  },
  {
    code: 'HOMBRO',
    label: 'Hombro',
    level: 'region',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['deltoides', 'manguito rotador', 'glenohumeral', 'omoplato'],
    bbox: { x: 24, y: 20, w: 20, h: 14 },
    anchor: { anterior: { x: 32, y: 24 }, posterior: { x: 32, y: 24 }, lateral: { x: 50, y: 25 } },
    icd10Hints: ['M75.1', 'M75.0'],
  },
  {
    code: 'BRAZO',
    label: 'Brazo',
    level: 'region',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['humero', 'biceps', 'triceps'],
    bbox: { x: 22, y: 30, w: 16, h: 12 },
    anchor: { anterior: { x: 28, y: 33 }, posterior: { x: 28, y: 33 } },
  },
  {
    code: 'CODO',
    label: 'Codo',
    level: 'region',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['olecranon', 'epicondilo', 'epitroclea', 'articulacion del codo'],
    bbox: { x: 19, y: 38, w: 16, h: 10 },
    anchor: { anterior: { x: 26, y: 40 }, posterior: { x: 26, y: 40 }, lateral: { x: 48, y: 40 } },
    icd10Hints: ['M77.1', 'M77.0'],
  },
  {
    code: 'ANTEBRAZO',
    label: 'Antebrazo',
    level: 'region',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['radio', 'cubito', 'flexores antebrazo', 'extensores antebrazo'],
    bbox: { x: 16, y: 44, w: 16, h: 12 },
    anchor: { anterior: { x: 23, y: 47 }, posterior: { x: 23, y: 47 } },
  },
  {
    code: 'MANO_MUNECA',
    label: 'Muñeca y Mano',
    level: 'region',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['carpo', 'palma', 'dedos mano', 'pulgar', 'tunel carpiano'],
    bbox: { x: 12, y: 52, w: 18, h: 14 },
    anchor: { anterior: { x: 19, y: 56 }, posterior: { x: 19, y: 56 } },
    icd10Hints: ['G56.0', 'M65.4'],
  },
  {
    code: 'CADERA_INGLE',
    label: 'Cadera, Ingle y Glúteo',
    level: 'region',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['trocanter', 'gluteo', 'femoroacetabular', 'piramidal'],
    bbox: { x: 30, y: 48, w: 22, h: 14 },
    anchor: { anterior: { x: 41, y: 51 }, posterior: { x: 40, y: 54 }, lateral: { x: 50, y: 52 } },
    icd10Hints: ['M70.6', 'M16.9'],
  },
  {
    code: 'MUSLO',
    label: 'Muslo',
    level: 'region',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['cuadriceps', 'isquiotibiales', 'femur', 'aductores'],
    bbox: { x: 32, y: 58, w: 18, h: 16 },
    anchor: { anterior: { x: 41, y: 62 }, posterior: { x: 41, y: 62 } },
  },
  {
    code: 'RODILLA',
    label: 'Rodilla',
    level: 'region',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['rotula', 'meniscos', 'ligamentos rodilla', 'fosa poplitea', 'patela'],
    bbox: { x: 32, y: 69, w: 18, h: 12 },
    anchor: { anterior: { x: 41, y: 72 }, posterior: { x: 41, y: 72 }, lateral: { x: 50, y: 72 } },
    icd10Hints: ['M23.2', 'M22.2', 'M17.9'],
  },
  {
    code: 'PIERNA',
    label: 'Pierna y Pantorrilla',
    level: 'region',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['tibia', 'perone', 'gemelos', 'pantorrilla', 'soleo'],
    bbox: { x: 33, y: 76, w: 18, h: 14 },
    anchor: { anterior: { x: 41, y: 80 }, posterior: { x: 41, y: 80 } },
  },
  {
    code: 'TOBILLO_PIE',
    label: 'Tobillo y Pie',
    level: 'region',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['talon', 'fascia plantar', 'aquiles', 'maleolo', 'empeine', 'tarso'],
    bbox: { x: 32, y: 86, w: 20, h: 12 },
    anchor: { anterior: { x: 41, y: 91 }, posterior: { x: 41, y: 91 }, lateral: { x: 52, y: 92 } },
    icd10Hints: ['M72.2', 'S93.4'],
  },

  // ===========================================================================
  // 2. SUBREGIONES (SUBREGIONS) & ESTRUCTURAS (STRUCTURES)
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // CABEZA & ATM
  // ---------------------------------------------------------------------------
  {
    code: 'CABEZA.ATM_SUB',
    label: 'Articulación Temporomandibular',
    level: 'subregion',
    parent: 'CABEZA_ATM',
    views: ['anterior', 'lateral'],
    lateral: true,
    aliases: ['atm', 'mandibula', 'bruxismo'],
  },
  {
    code: 'CABEZA.ATM.ARTICULACION',
    label: 'ATM (Cóndilo mandibular)',
    level: 'structure',
    parent: 'CABEZA.ATM_SUB',
    kind: 'articulacion',
    views: ['lateral', 'anterior'],
    lateral: true,
    aliases: ['condilo', 'disco atm', 'chasquido mandibular'],
    anchor: { lateral: { x: 56, y: 11 }, anterior: { x: 55, y: 11 } },
    icd10Hints: ['K07.6'],
  },
  {
    code: 'CABEZA.ATM.MASETERO',
    label: 'Músculo Masetero',
    level: 'structure',
    parent: 'CABEZA.ATM_SUB',
    kind: 'musculo',
    views: ['lateral', 'anterior'],
    lateral: true,
    aliases: ['masetero', 'punto gatillo masetero', 'apretamiento dental'],
    anchor: { lateral: { x: 55, y: 13 }, anterior: { x: 54, y: 13 } },
  },
  {
    code: 'CABEZA.ATM.TEMPORAL',
    label: 'Músculo Temporal',
    level: 'structure',
    parent: 'CABEZA.ATM_SUB',
    kind: 'musculo',
    views: ['lateral'],
    lateral: true,
    aliases: ['temporal', 'cefalea tensional', 'sien'],
    anchor: { lateral: { x: 53, y: 8 } },
  },
  {
    code: 'CABEZA.CRANEO_SUB',
    label: 'Bóveda Craneal y Región Ocular',
    level: 'subregion',
    parent: 'CABEZA_ATM',
    views: ['anterior', 'lateral'],
    lateral: false,
    aliases: ['craneo', 'frente', 'orbita'],
  },
  {
    code: 'CABEZA.CRANEO.FRONTAL',
    label: 'Músculo Frontal / Región Frontal',
    level: 'structure',
    parent: 'CABEZA.CRANEO_SUB',
    kind: 'musculo',
    views: ['anterior'],
    lateral: false,
    aliases: ['frente', 'cefalea frontal'],
    anchor: { anterior: { x: 50, y: 6 } },
  },

  // ---------------------------------------------------------------------------
  // COLUMNA CERVICAL
  // ---------------------------------------------------------------------------
  {
    code: 'CERV.SEGMENTOS',
    label: 'Segmentos Vertebrales Cervicales',
    level: 'subregion',
    parent: 'COL_CERVICAL',
    views: ['posterior', 'lateral'],
    lateral: false,
    aliases: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'vertebras cervicales'],
  },
  {
    code: 'CERV.SEG.C1_C2',
    label: 'Complejo Cervical Alto (C1-C2 Atlas/Axis)',
    level: 'structure',
    parent: 'CERV.SEGMENTOS',
    kind: 'segmento',
    views: ['posterior', 'lateral'],
    lateral: false,
    aliases: ['atlas', 'axis', 'suboccipital', 'cefalea cervicogenica'],
    anchor: { posterior: { x: 50, y: 15 }, lateral: { x: 48, y: 15 } },
  },
  {
    code: 'CERV.SEG.C3_C5',
    label: 'Columna Cervical Media (C3-C5)',
    level: 'structure',
    parent: 'CERV.SEGMENTOS',
    kind: 'segmento',
    views: ['posterior', 'lateral'],
    lateral: false,
    aliases: ['cervical media', 'c3', 'c4', 'c5'],
    anchor: { posterior: { x: 50, y: 17 }, lateral: { x: 48, y: 17 } },
  },
  {
    code: 'CERV.SEG.C5_C7',
    label: 'Complejo Cervicotorácico (C5-C7 / C7-D1)',
    level: 'structure',
    parent: 'CERV.SEGMENTOS',
    kind: 'segmento',
    views: ['posterior', 'lateral'],
    lateral: false,
    aliases: ['c6', 'c7', 'vertebra prominente', 'radiculopatia cervical'],
    anchor: { posterior: { x: 50, y: 20 }, lateral: { x: 48, y: 20 } },
    icd10Hints: ['M54.12'],
  },
  {
    code: 'CERV.MUSC',
    label: 'Musculatura Cervical Posterior y Lateral',
    level: 'subregion',
    parent: 'COL_CERVICAL',
    views: ['posterior', 'lateral'],
    lateral: true,
    aliases: ['musculos cuello', 'trapecio', 'escalenos'],
  },
  {
    code: 'CERV.MUSC.TRAPECIO_SUP',
    label: 'Músculo Trapecio Superior',
    level: 'structure',
    parent: 'CERV.MUSC',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['trapecio', 'punto gatillo trapecio 1', 'contractura cervical'],
    anchor: { posterior: { x: 42, y: 19 } },
    icd10Hints: ['M79.1'],
  },
  {
    code: 'CERV.MUSC.ANGULAR_ESCAPULA',
    label: 'Músculo Elevador de la Escápula',
    level: 'structure',
    parent: 'CERV.MUSC',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['angular del omoplato', 'elevador escapula', 'torticolis'],
    anchor: { posterior: { x: 45, y: 18 } },
  },
  {
    code: 'CERV.MUSC.SUBOCCIPITALES',
    label: 'Músculos Suboccipitales',
    level: 'structure',
    parent: 'CERV.MUSC',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['suboccipital', 'recto posterior', 'oblicuo cabeza'],
    anchor: { posterior: { x: 48, y: 15 } },
  },
  {
    code: 'CERV.MUSC.ESCALENOS',
    label: 'Músculos Escalenos (Ant/Med/Post)',
    level: 'structure',
    parent: 'CERV.MUSC',
    kind: 'musculo',
    views: ['lateral', 'anterior'],
    lateral: true,
    aliases: ['escaleno', 'sindrome del desfiladero toracico'],
    anchor: { lateral: { x: 49, y: 18 }, anterior: { x: 46, y: 18 } },
  },
  {
    code: 'CERV.MUSC.ECM',
    label: 'Esternocleidomastoideo (ECM)',
    level: 'structure',
    parent: 'CERV.MUSC',
    kind: 'musculo',
    views: ['lateral', 'anterior'],
    lateral: true,
    aliases: ['ecm', 'esternocleido', 'punto gatillo ecm'],
    anchor: { lateral: { x: 51, y: 17 }, anterior: { x: 47, y: 18 } },
  },

  // ---------------------------------------------------------------------------
  // COLUMNA DORSAL Y ESCÁPULA
  // ---------------------------------------------------------------------------
  {
    code: 'DORSAL.SEGMENTOS',
    label: 'Segmentos Vertebrales Dorsales',
    level: 'subregion',
    parent: 'COL_DORSAL',
    views: ['posterior'],
    lateral: false,
    aliases: ['d1-d12', 't1-t12', 'vertebras dorsales'],
  },
  {
    code: 'DORSAL.SEG.D1_D4',
    label: 'Dorsal Alta (D1-D4)',
    level: 'structure',
    parent: 'DORSAL.SEGMENTOS',
    kind: 'segmento',
    views: ['posterior'],
    lateral: false,
    aliases: ['dorsal alta', 't1-t4'],
    anchor: { posterior: { x: 50, y: 24 } },
  },
  {
    code: 'DORSAL.SEG.D5_D8',
    label: 'Dorsal Media (D5-D8 Interescapular)',
    level: 'structure',
    parent: 'DORSAL.SEGMENTOS',
    kind: 'segmento',
    views: ['posterior'],
    lateral: false,
    aliases: ['dorsal media', 'interescapular', 't5-t8'],
    anchor: { posterior: { x: 50, y: 30 } },
  },
  {
    code: 'DORSAL.SEG.D9_D12',
    label: 'Dorsal Baja (D9-D12 / Charnela Toracolumbar)',
    level: 'structure',
    parent: 'DORSAL.SEGMENTOS',
    kind: 'segmento',
    views: ['posterior'],
    lateral: false,
    aliases: ['dorsal baja', 'charnela', 't9-t12'],
    anchor: { posterior: { x: 50, y: 36 } },
  },
  {
    code: 'DORSAL.MUSC',
    label: 'Musculatura Dorsal y Peri-escapular',
    level: 'subregion',
    parent: 'COL_DORSAL',
    views: ['posterior'],
    lateral: true,
    aliases: ['romboides', 'dorsal ancho', 'escapula'],
  },
  {
    code: 'DORSAL.MUSC.ROMBOIDES',
    label: 'Músculos Romboides (Mayor y Menor)',
    level: 'structure',
    parent: 'DORSAL.MUSC',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['romboide', 'dolor interescapular', 'borde medial escapula'],
    anchor: { posterior: { x: 44, y: 28 } },
  },
  {
    code: 'DORSAL.MUSC.DORSAL_ANCHO',
    label: 'Músculo Dorsal Ancho',
    level: 'structure',
    parent: 'DORSAL.MUSC',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['dorsal ancho', 'latissimus dorsi'],
    anchor: { posterior: { x: 40, y: 36 } },
  },
  {
    code: 'DORSAL.MUSC.PARAVERTEBRALES',
    label: 'Erectores Espinales Torácicos',
    level: 'structure',
    parent: 'DORSAL.MUSC',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['paravertebrales dorsales', 'iliocostal', 'longisimo'],
    anchor: { posterior: { x: 47, y: 31 } },
  },

  // ---------------------------------------------------------------------------
  // COLUMNA LUMBAR
  // ---------------------------------------------------------------------------
  {
    code: 'LUMBAR.SEGMENTOS',
    label: 'Segmentos Vertebrales Lumbares',
    level: 'subregion',
    parent: 'COL_LUMBAR',
    views: ['posterior', 'lateral'],
    lateral: false,
    aliases: ['l1', 'l2', 'l3', 'l4', 'l5', 'disco lumbar'],
  },
  {
    code: 'LUMBAR.SEG.L1_L3',
    label: 'Columna Lumbar Alta (L1-L3)',
    level: 'structure',
    parent: 'LUMBAR.SEGMENTOS',
    kind: 'segmento',
    views: ['posterior', 'lateral'],
    lateral: false,
    aliases: ['l1', 'l2', 'l3', 'lumbar alta'],
    anchor: { posterior: { x: 50, y: 40 }, lateral: { x: 49, y: 40 } },
  },
  {
    code: 'LUMBAR.SEG.L4_L5',
    label: 'Columna Lumbar Baja (L4-L5)',
    level: 'structure',
    parent: 'LUMBAR.SEGMENTOS',
    kind: 'segmento',
    views: ['posterior', 'lateral'],
    lateral: false,
    aliases: ['l4', 'l5', 'discopatia l4-l5', 'hernia l4-l5'],
    anchor: { posterior: { x: 50, y: 44 }, lateral: { x: 49, y: 44 } },
    icd10Hints: ['M51.26', 'M54.5'],
  },
  {
    code: 'LUMBAR.SEG.L5_S1',
    label: 'Charnela Lumbosacra (L5-S1)',
    level: 'structure',
    parent: 'LUMBAR.SEGMENTOS',
    kind: 'segmento',
    views: ['posterior', 'lateral'],
    lateral: false,
    aliases: ['l5-s1', 'lumbosacro', 'ciatica l5-s1'],
    anchor: { posterior: { x: 50, y: 47 }, lateral: { x: 49, y: 47 } },
    icd10Hints: ['M54.4'],
  },
  {
    code: 'LUMBAR.MUSC',
    label: 'Musculatura y Facetas Lumbares',
    level: 'subregion',
    parent: 'COL_LUMBAR',
    views: ['posterior'],
    lateral: true,
    aliases: ['cuadrado lumbar', 'paravertebrales', 'facetas'],
  },
  {
    code: 'LUMBAR.MUSC.CUADRADO_LUMBAR',
    label: 'Músculo Cuadrado Lumbar',
    level: 'structure',
    parent: 'LUMBAR.MUSC',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['cuadrado lumbar', 'cresta iliaca', 'lumbago mecanico'],
    anchor: { posterior: { x: 44, y: 44 } },
  },
  {
    code: 'LUMBAR.MUSC.PARAVERTEBRAL',
    label: 'Paravertebrales Lumbares (Multífidos)',
    level: 'structure',
    parent: 'LUMBAR.MUSC',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['multifidos', 'espinales', 'contractura paravertebral lumbar'],
    anchor: { posterior: { x: 47, y: 44 } },
  },
  {
    code: 'LUMBAR.LIG.ILIOLUMBAR',
    label: 'Ligamento Iliolumbar',
    level: 'structure',
    parent: 'LUMBAR.MUSC',
    kind: 'ligamento',
    views: ['posterior'],
    lateral: true,
    aliases: ['iliolumbar', 'sindrome iliolumbar'],
    anchor: { posterior: { x: 45, y: 46 } },
  },

  // ---------------------------------------------------------------------------
  // PELVIS, SACRO & COXIS
  // ---------------------------------------------------------------------------
  {
    code: 'PELVIS.SUB',
    label: 'Complejo Pélvico y Sacrococcígeo',
    level: 'subregion',
    parent: 'PELVIS_SACRO',
    views: ['posterior', 'anterior'],
    lateral: false,
    aliases: ['sacro', 'coxis', 'pubis'],
  },
  {
    code: 'PELVIS.SACROILIACA',
    label: 'Articulación Sacroilíaca',
    level: 'structure',
    parent: 'PELVIS.SUB',
    kind: 'articulacion',
    views: ['posterior'],
    lateral: true,
    aliases: ['sacroiliaca', 'sacroileitis', 'sindroma sacroiliaco'],
    anchor: { posterior: { x: 46, y: 50 } },
    icd10Hints: ['M46.1'],
  },
  {
    code: 'PELVIS.COXIS',
    label: 'Coxis / Coccix',
    level: 'structure',
    parent: 'PELVIS.SUB',
    kind: 'hueso',
    views: ['posterior'],
    lateral: false,
    aliases: ['coxis', 'coccidinia', 'coxigodinia'],
    anchor: { posterior: { x: 50, y: 55 } },
    icd10Hints: ['M53.3'],
  },
  {
    code: 'PELVIS.PUBIS_SINFISIS',
    label: 'Sínfisis del Pubis',
    level: 'structure',
    parent: 'PELVIS.SUB',
    kind: 'articulacion',
    views: ['anterior'],
    lateral: false,
    aliases: ['pubalgia', 'pubis', 'sinfisis pubica'],
    anchor: { anterior: { x: 50, y: 53 } },
    icd10Hints: ['M76.8'],
  },

  // ---------------------------------------------------------------------------
  // TÓRAX & ABDOMEN
  // ---------------------------------------------------------------------------
  {
    code: 'TORAX.SUB',
    label: 'Pared Torácica y Costal',
    level: 'subregion',
    parent: 'TORAX_ABDOMEN',
    views: ['anterior'],
    lateral: true,
    aliases: ['costillas', 'pectoral', 'intercostal'],
  },
  {
    code: 'TORAX.PECTORAL_MAYOR',
    label: 'Músculo Pectoral Mayor',
    level: 'structure',
    parent: 'TORAX.SUB',
    kind: 'musculo',
    views: ['anterior'],
    lateral: true,
    aliases: ['pectoral', 'pecho'],
    anchor: { anterior: { x: 42, y: 27 } },
  },
  {
    code: 'TORAX.COSTOCONDRAL',
    label: 'Articulación Costocondral / Esternocostal',
    level: 'structure',
    parent: 'TORAX.SUB',
    kind: 'articulacion',
    views: ['anterior'],
    lateral: true,
    aliases: ['costocondritis', 'tietze', 'cartilago costal'],
    anchor: { anterior: { x: 46, y: 29 } },
    icd10Hints: ['M94.0'],
  },
  {
    code: 'TORAX.ABDOMEN_RECTO',
    label: 'Musculatura Abdominal (Recto / Oblicuos)',
    level: 'structure',
    parent: 'TORAX.SUB',
    kind: 'musculo',
    views: ['anterior'],
    lateral: true,
    aliases: ['recto anterior', 'oblicuo', 'abdomen'],
    anchor: { anterior: { x: 45, y: 39 } },
  },

  // ---------------------------------------------------------------------------
  // HOMBRO (MIEMBRO SUPERIOR)
  // ---------------------------------------------------------------------------
  {
    code: 'HOMBRO.MANGUITO',
    label: 'Manguito de los Rotadores',
    level: 'subregion',
    parent: 'HOMBRO',
    views: ['posterior', 'anterior', 'lateral'],
    lateral: true,
    aliases: ['manguito rotador', 'rotadores hombro'],
  },
  {
    code: 'HOMBRO.MR.SUPRAESPINOSO',
    label: 'Tendón / Músculo Supraespinoso',
    level: 'structure',
    parent: 'HOMBRO.MANGUITO',
    kind: 'tendon',
    views: ['posterior', 'anterior', 'lateral'],
    lateral: true,
    aliases: ['supraespinoso', 'tendinopatia supraespinoso', 'troquiter', 'manguito'],
    anchor: { posterior: { x: 34, y: 22 }, anterior: { x: 33, y: 23 }, lateral: { x: 49, y: 23 } },
    icd10Hints: ['M75.1'],
  },
  {
    code: 'HOMBRO.MR.INFRAESPINOSO',
    label: 'Tendón / Músculo Infraespinoso',
    level: 'structure',
    parent: 'HOMBRO.MANGUITO',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['infraespinoso', 'fosa infraespinosa', 'rotador externo'],
    anchor: { posterior: { x: 33, y: 26 } },
  },
  {
    code: 'HOMBRO.MR.REDONDO_MENOR',
    label: 'Músculo Redondo Menor',
    level: 'structure',
    parent: 'HOMBRO.MANGUITO',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['redondo menor', 'teres minor'],
    anchor: { posterior: { x: 32, y: 28 } },
  },
  {
    code: 'HOMBRO.MR.SUBESCAPULAR',
    label: 'Tendón / Músculo Subescapular',
    level: 'structure',
    parent: 'HOMBRO.MANGUITO',
    kind: 'musculo',
    views: ['anterior'],
    lateral: true,
    aliases: ['subescapular', 'troquin', 'rotador interno'],
    anchor: { anterior: { x: 34, y: 25 } },
  },
  {
    code: 'HOMBRO.ARTICULACIONES',
    label: 'Articulaciones y Bursas del Hombro',
    level: 'subregion',
    parent: 'HOMBRO',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['acromioclavicular', 'bursa', 'glenohumeral'],
  },
  {
    code: 'HOMBRO.ART.ACROMIOCLAVICULAR',
    label: 'Articulación Acromioclavicular (AC)',
    level: 'structure',
    parent: 'HOMBRO.ARTICULACIONES',
    kind: 'articulacion',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['acromion', 'clavicula', 'esguince acromioclavicular'],
    anchor: { anterior: { x: 35, y: 21 }, posterior: { x: 35, y: 21 } },
  },
  {
    code: 'HOMBRO.BURSA_SUBACROMIAL',
    label: 'Bursa Subacromiodeltoidea',
    level: 'structure',
    parent: 'HOMBRO.ARTICULACIONES',
    kind: 'fascia',
    views: ['anterior', 'lateral'],
    lateral: true,
    aliases: ['bursitis hombro', 'impingement', 'espacio subacromial'],
    anchor: { anterior: { x: 32, y: 23 }, lateral: { x: 50, y: 23 } },
    icd10Hints: ['M75.5'],
  },
  {
    code: 'HOMBRO.BICEPS_PROXIMAL',
    label: 'Tendón Cabeza Larga del Bíceps (Corredera Bicipital)',
    level: 'structure',
    parent: 'HOMBRO.ARTICULACIONES',
    kind: 'tendon',
    views: ['anterior'],
    lateral: true,
    aliases: ['biceps proximal', 'corredera bicipital', 'tendinitis bicipital'],
    anchor: { anterior: { x: 32, y: 26 } },
    icd10Hints: ['M75.2'],
  },
  {
    code: 'HOMBRO.DELTOIDES',
    label: 'Músculo Deltoides (Fibras Ant/Med/Post)',
    level: 'structure',
    parent: 'HOMBRO.ARTICULACIONES',
    kind: 'musculo',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['deltoides anterior', 'deltoides medio', 'deltoides posterior'],
    anchor: { anterior: { x: 30, y: 25 }, posterior: { x: 30, y: 25 }, lateral: { x: 50, y: 26 } },
  },

  // ---------------------------------------------------------------------------
  // BRAZO
  // ---------------------------------------------------------------------------
  {
    code: 'BRAZO.SUB',
    label: 'Compartimentos Braquiales',
    level: 'subregion',
    parent: 'BRAZO',
    views: ['anterior', 'posterior'],
    lateral: true,
  },
  {
    code: 'BRAZO.BICEPS_CUERPO',
    label: 'Vientre Muscular del Bíceps Braquial',
    level: 'structure',
    parent: 'BRAZO.SUB',
    kind: 'musculo',
    views: ['anterior'],
    lateral: true,
    aliases: ['biceps', 'brazo anterior'],
    anchor: { anterior: { x: 28, y: 33 } },
  },
  {
    code: 'BRAZO.TRICEPS_CUERPO',
    label: 'Músculo Tríceps Braquial',
    level: 'structure',
    parent: 'BRAZO.SUB',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['triceps', 'brazo posterior'],
    anchor: { posterior: { x: 28, y: 33 } },
  },

  // ---------------------------------------------------------------------------
  // CODO
  // ---------------------------------------------------------------------------
  {
    code: 'CODO.SUB',
    label: 'Epicóndilos y Articulación del Codo',
    level: 'subregion',
    parent: 'CODO',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['codo tenista', 'codo golfista', 'olecranon'],
  },
  {
    code: 'CODO.EPICONDILO_LATERAL',
    label: 'Epicóndilo Lateral (Codo de Tenista / Extensores)',
    level: 'structure',
    parent: 'CODO.SUB',
    kind: 'tendon',
    views: ['posterior', 'lateral'],
    lateral: true,
    aliases: ['epicondilitis', 'codo de tenista', 'extensores muneca'],
    anchor: { posterior: { x: 24, y: 39 }, lateral: { x: 46, y: 39 } },
    icd10Hints: ['M77.1'],
  },
  {
    code: 'CODO.EPITROCLEA_MEDIAL',
    label: 'Epitróclea Medial (Codo de Golfista / Flexores)',
    level: 'structure',
    parent: 'CODO.SUB',
    kind: 'tendon',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['epitrocleitis', 'codo de golfista', 'pronador'],
    anchor: { anterior: { x: 28, y: 40 }, posterior: { x: 28, y: 40 } },
    icd10Hints: ['M77.0'],
  },
  {
    code: 'CODO.OLECRANON',
    label: 'Olécranon y Bursa Olecraniana',
    level: 'structure',
    parent: 'CODO.SUB',
    kind: 'articulacion',
    views: ['posterior', 'lateral'],
    lateral: true,
    aliases: ['olecranon', 'bursitis codo'],
    anchor: { posterior: { x: 26, y: 41 }, lateral: { x: 48, y: 41 } },
    icd10Hints: ['M70.2'],
  },

  // ---------------------------------------------------------------------------
  // ANTEBRAZO
  // ---------------------------------------------------------------------------
  {
    code: 'ANTEBRAZO.SUB',
    label: 'Compartimentos Musculares del Antebrazo',
    level: 'subregion',
    parent: 'ANTEBRAZO',
    views: ['anterior', 'posterior'],
    lateral: true,
  },
  {
    code: 'ANTEBRAZO.FLEXORES',
    label: 'Grupo Flexor / Pronador',
    level: 'structure',
    parent: 'ANTEBRAZO.SUB',
    kind: 'musculo',
    views: ['anterior'],
    lateral: true,
    aliases: ['flexores muneca', 'pronador redondo'],
    anchor: { anterior: { x: 24, y: 46 } },
  },
  {
    code: 'ANTEBRAZO.EXTENSORES',
    label: 'Grupo Extensor / Supinador',
    level: 'structure',
    parent: 'ANTEBRAZO.SUB',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['extensores dedos', 'braquiorradial', 'supinador'],
    anchor: { posterior: { x: 24, y: 46 } },
  },

  // ---------------------------------------------------------------------------
  // MUÑECA Y MANO
  // ---------------------------------------------------------------------------
  {
    code: 'MANO.MUNECA_SUB',
    label: 'Articulación de Muñeca y Túnel Carpiano',
    level: 'subregion',
    parent: 'MANO_MUNECA',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['tunel del carpo', 'de quervain', 'radiocarpiana'],
  },
  {
    code: 'MANO.TUNEL_CARPIANO',
    label: 'Túnel Carpiano (Nervio Mediano)',
    level: 'structure',
    parent: 'MANO.MUNECA_SUB',
    kind: 'nervio',
    views: ['anterior'],
    lateral: true,
    aliases: ['sindrome tunel carpiano', 'nervio mediano', 'parestesias mano'],
    anchor: { anterior: { x: 20, y: 53 } },
    icd10Hints: ['G56.0'],
  },
  {
    code: 'MANO.DE_QUERVAIN',
    label: 'Tabaquera Anatómica / Tendones de De Quervain',
    level: 'structure',
    parent: 'MANO.MUNECA_SUB',
    kind: 'tendon',
    views: ['posterior', 'anterior'],
    lateral: true,
    aliases: ['tenosinovitis de quervain', 'extensor corto pulgar', 'abductor largo'],
    anchor: { posterior: { x: 18, y: 52 }, anterior: { x: 18, y: 52 } },
    icd10Hints: ['M65.4'],
  },
  {
    code: 'MANO.TFCC',
    label: 'Complejo Fibrocartílago Triangular (TFCC / Borde Cubital)',
    level: 'structure',
    parent: 'MANO.MUNECA_SUB',
    kind: 'ligamento',
    views: ['posterior', 'anterior'],
    lateral: true,
    aliases: ['tfcc', 'fibrocartilago', 'estiloides cubital'],
    anchor: { posterior: { x: 21, y: 53 }, anterior: { x: 21, y: 53 } },
  },
  {
    code: 'MANO.DEDOS_SUB',
    label: 'Palma, Dedos y Articulaciones Metacarpianas',
    level: 'subregion',
    parent: 'MANO_MUNECA',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['dedo en resorte', 'rizartrosis', 'pulgar', 'artritis manos'],
  },
  {
    code: 'MANO.RIZARTROSIS',
    label: 'Articulación Trapeciometacarpiana (Rizartrosis)',
    level: 'structure',
    parent: 'MANO.DEDOS_SUB',
    kind: 'articulacion',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['rizartrosis', 'base del pulgar', 'artrosis pulgar'],
    anchor: { anterior: { x: 17, y: 55 }, posterior: { x: 17, y: 55 } },
    icd10Hints: ['M19.04'],
  },
  {
    code: 'MANO.FLEXORES_DEDOS',
    label: 'Poleas Flexoras / Dedo en Resorte (A1)',
    level: 'structure',
    parent: 'MANO.DEDOS_SUB',
    kind: 'tendon',
    views: ['anterior'],
    lateral: true,
    aliases: ['dedo en gatillo', 'dedo en resorte', 'polea a1'],
    anchor: { anterior: { x: 19, y: 58 } },
    icd10Hints: ['M65.3'],
  },

  // ---------------------------------------------------------------------------
  // CADERA, INGLE & GLÚTEO
  // ---------------------------------------------------------------------------
  {
    code: 'CADERA.SUB',
    label: 'Complejo Coxofemoral y Pelvitrocantéreo',
    level: 'subregion',
    parent: 'CADERA_INGLE',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['trocanter', 'piramidal', 'psoas', 'gluteo'],
  },
  {
    code: 'CADERA.TROCANTER_MAYOR',
    label: 'Trocánter Mayor / Síndrome Doloroso Trocantéreo',
    level: 'structure',
    parent: 'CADERA.SUB',
    kind: 'articulacion',
    views: ['lateral', 'posterior'],
    lateral: true,
    aliases: ['trocanteritis', 'bursitis trocanterea', 'gluteo medio tendon'],
    anchor: { lateral: { x: 50, y: 52 }, posterior: { x: 36, y: 52 } },
    icd10Hints: ['M70.6'],
  },
  {
    code: 'CADERA.PIRAMIDAL',
    label: 'Músculo Piramidal / Piriforme',
    level: 'structure',
    parent: 'CADERA.SUB',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['piramidal', 'piriforme', 'falsa ciatica', 'sindrome piramidal'],
    anchor: { posterior: { x: 42, y: 53 } },
    icd10Hints: ['G57.0'],
  },
  {
    code: 'CADERA.GLUTEO_MEDIO',
    label: 'Músculo Glúteo Medio y Menor',
    level: 'structure',
    parent: 'CADERA.SUB',
    kind: 'musculo',
    views: ['posterior', 'lateral'],
    lateral: true,
    aliases: ['gluteo medio', 'marcha trendelenburg', 'punto gatillo gluteo'],
    anchor: { posterior: { x: 39, y: 51 }, lateral: { x: 48, y: 50 } },
  },
  {
    code: 'CADERA.PSOAS_ILIACO',
    label: 'Músculo Psoas-Ilíaco (Inserción en Trocánter Menor)',
    level: 'structure',
    parent: 'CADERA.SUB',
    kind: 'tendon',
    views: ['anterior'],
    lateral: true,
    aliases: ['psoas', 'ingle', 'tendinitis psoas'],
    anchor: { anterior: { x: 44, y: 51 } },
  },
  {
    code: 'CADERA.ADUCTORES',
    label: 'Grupo Aductor (Largo / Mayor / Grácil)',
    level: 'structure',
    parent: 'CADERA.SUB',
    kind: 'musculo',
    views: ['anterior'],
    lateral: true,
    aliases: ['aductores', 'tiron inguinal', 'entrepierna'],
    anchor: { anterior: { x: 46, y: 54 } },
  },

  // ---------------------------------------------------------------------------
  // MUSLO
  // ---------------------------------------------------------------------------
  {
    code: 'MUSLO.SUB',
    label: 'Grupos Musculares del Muslo',
    level: 'subregion',
    parent: 'MUSLO',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['cuadriceps', 'isquiotibiales', 'fascia lata'],
  },
  {
    code: 'MUSLO.CUADRICEPS_RECTO',
    label: 'Músculo Recto Femoral (Cuádriceps Anterior)',
    level: 'structure',
    parent: 'MUSLO.SUB',
    kind: 'musculo',
    views: ['anterior'],
    lateral: true,
    aliases: ['recto femoral', 'cuadriceps', 'desgarro cuadriceps'],
    anchor: { anterior: { x: 41, y: 62 } },
  },
  {
    code: 'MUSLO.VASTO_MEDIAL',
    label: 'Músculo Vasto Medial (VMO)',
    level: 'structure',
    parent: 'MUSLO.SUB',
    kind: 'musculo',
    views: ['anterior'],
    lateral: true,
    aliases: ['vasto interno', 'vmo'],
    anchor: { anterior: { x: 44, y: 66 } },
  },
  {
    code: 'MUSLO.VASTO_LATERAL',
    label: 'Músculo Vasto Lateral',
    level: 'structure',
    parent: 'MUSLO.SUB',
    kind: 'musculo',
    views: ['anterior', 'lateral'],
    lateral: true,
    aliases: ['vasto externo', 'cuadriceps lateral'],
    anchor: { anterior: { x: 38, y: 64 }, lateral: { x: 50, y: 63 } },
  },
  {
    code: 'MUSLO.ISQUIOTIBIALES_BICEPS',
    label: 'Isquiotibiales - Bíceps Femoral (Lateral)',
    level: 'structure',
    parent: 'MUSLO.SUB',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['biceps femoral', 'isquiotibial lateral', 'tiron isquio'],
    anchor: { posterior: { x: 39, y: 64 } },
  },
  {
    code: 'MUSLO.ISQUIOTIBIALES_SEMITEND',
    label: 'Isquiotibiales - Semitendinoso / Semimembranoso (Medial)',
    level: 'structure',
    parent: 'MUSLO.SUB',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['semitendinoso', 'semimembranoso', 'isquiotibial medial'],
    anchor: { posterior: { x: 43, y: 64 } },
  },
  {
    code: 'MUSLO.CINTILLA_ILIOTIBIAL',
    label: 'Cintilla Iliotibial / Fascia Lata',
    level: 'structure',
    parent: 'MUSLO.SUB',
    kind: 'fascia',
    views: ['lateral', 'anterior'],
    lateral: true,
    aliases: ['banda iliotibial', 'tfl', 'fascia lata'],
    anchor: { lateral: { x: 52, y: 64 }, anterior: { x: 37, y: 63 } },
  },

  // ---------------------------------------------------------------------------
  // RODILLA
  // ---------------------------------------------------------------------------
  {
    code: 'RODILLA.EXTENSOR_SUB',
    label: 'Aparato Extensor de la Rodilla',
    level: 'subregion',
    parent: 'RODILLA',
    views: ['anterior', 'lateral'],
    lateral: true,
    aliases: ['rotula', 'tendon rotuliano', 'patela'],
  },
  {
    code: 'RODILLA.TENDON_ROTULIANO',
    label: 'Tendón Rotuliano (Polo Inferior Rótula)',
    level: 'structure',
    parent: 'RODILLA.EXTENSOR_SUB',
    kind: 'tendon',
    views: ['anterior', 'lateral'],
    lateral: true,
    aliases: ['rotuliano', 'rodilla del saltador', 'tendinopatia rotuliana'],
    anchor: { anterior: { x: 41, y: 72 }, lateral: { x: 53, y: 72 } },
    icd10Hints: ['M76.5'],
  },
  {
    code: 'RODILLA.TENDON_CUADRICIPITAL',
    label: 'Tendón Cuadricipital (Inserción Superior Rótula)',
    level: 'structure',
    parent: 'RODILLA.EXTENSOR_SUB',
    kind: 'tendon',
    views: ['anterior'],
    lateral: true,
    aliases: ['cuadricipital', 'polo superior rotula'],
    anchor: { anterior: { x: 41, y: 69 } },
  },
  {
    code: 'RODILLA.ART_FEMOROPATELAR',
    label: 'Articulación Femoropatelar (Cartílago)',
    level: 'structure',
    parent: 'RODILLA.EXTENSOR_SUB',
    kind: 'articulacion',
    views: ['anterior', 'lateral'],
    lateral: true,
    aliases: ['condromalacia', 'dolor femoropatelar', 'chasquido rotula'],
    anchor: { anterior: { x: 41, y: 70 }, lateral: { x: 52, y: 70 } },
    icd10Hints: ['M22.2'],
  },
  {
    code: 'RODILLA.COMPARTIMENTOS_SUB',
    label: 'Meniscos y Ligamentos Colaterales',
    level: 'subregion',
    parent: 'RODILLA',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['menisco', 'lcm', 'lcl', 'ligamentos cruzados'],
  },
  {
    code: 'RODILLA.MENISCO_MEDIAL',
    label: 'Menisco Medial / Interlínea Articular Medial',
    level: 'structure',
    parent: 'RODILLA.COMPARTIMENTOS_SUB',
    kind: 'articulacion',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['menisco interno', 'rotura meniscal medial', 'interlinea interna'],
    anchor: { anterior: { x: 43, y: 71 }, posterior: { x: 43, y: 71 } },
    icd10Hints: ['M23.2'],
  },
  {
    code: 'RODILLA.MENISCO_LATERAL',
    label: 'Menisco Lateral / Interlínea Articular Lateral',
    level: 'structure',
    parent: 'RODILLA.COMPARTIMENTOS_SUB',
    kind: 'articulacion',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['menisco externo', 'interlinea externa'],
    anchor: { anterior: { x: 39, y: 71 }, posterior: { x: 39, y: 71 }, lateral: { x: 49, y: 71 } },
    icd10Hints: ['M23.3'],
  },
  {
    code: 'RODILLA.LCM',
    label: 'Ligamento Colateral Medial (LCM)',
    level: 'structure',
    parent: 'RODILLA.COMPARTIMENTOS_SUB',
    kind: 'ligamento',
    views: ['anterior'],
    lateral: true,
    aliases: ['lcm', 'colateral interno', 'esguince lcm'],
    anchor: { anterior: { x: 44, y: 71 } },
    icd10Hints: ['S83.4'],
  },
  {
    code: 'RODILLA.LCL',
    label: 'Ligamento Colateral Lateral (LCL)',
    level: 'structure',
    parent: 'RODILLA.COMPARTIMENTOS_SUB',
    kind: 'ligamento',
    views: ['anterior', 'lateral'],
    lateral: true,
    aliases: ['lcl', 'colateral externo'],
    anchor: { anterior: { x: 38, y: 71 }, lateral: { x: 49, y: 71 } },
    icd10Hints: ['S83.4'],
  },
  {
    code: 'RODILLA.PATA_GANSO',
    label: 'Pata de Ganso (Inserción Pes Anserinus)',
    level: 'structure',
    parent: 'RODILLA.COMPARTIMENTOS_SUB',
    kind: 'tendon',
    views: ['anterior'],
    lateral: true,
    aliases: ['pata de ganso', 'anserina', 'bursitis anserina'],
    anchor: { anterior: { x: 43, y: 73 } },
    icd10Hints: ['M70.5'],
  },
  {
    code: 'RODILLA.HUECO_POPLITEO',
    label: 'Hueco Poplíteo (Quiste de Baker)',
    level: 'structure',
    parent: 'RODILLA.COMPARTIMENTOS_SUB',
    kind: 'articulacion',
    views: ['posterior'],
    lateral: true,
    aliases: ['popliteo', 'quiste de baker', 'corva'],
    anchor: { posterior: { x: 41, y: 71 } },
    icd10Hints: ['M71.2'],
  },

  // ---------------------------------------------------------------------------
  // PIERNA Y PANTORRILLA
  // ---------------------------------------------------------------------------
  {
    code: 'PIERNA.SUB',
    label: 'Compartimentos de la Pierna',
    level: 'subregion',
    parent: 'PIERNA',
    views: ['anterior', 'posterior'],
    lateral: true,
  },
  {
    code: 'PIERNA.GEMELO_MEDIAL',
    label: 'Gastrocnemio Medial (Gemelo Interno)',
    level: 'structure',
    parent: 'PIERNA.SUB',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['gemelo interno', 'tennis leg', 'desgarro gemelo'],
    anchor: { posterior: { x: 43, y: 78 } },
  },
  {
    code: 'PIERNA.GEMELO_LATERAL',
    label: 'Gastrocnemio Lateral (Gemelo Externo)',
    level: 'structure',
    parent: 'PIERNA.SUB',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['gemelo externo'],
    anchor: { posterior: { x: 39, y: 78 } },
  },
  {
    code: 'PIERNA.SOLEO',
    label: 'Músculo Sóleo',
    level: 'structure',
    parent: 'PIERNA.SUB',
    kind: 'musculo',
    views: ['posterior'],
    lateral: true,
    aliases: ['soleo', 'pantorrilla profunda'],
    anchor: { posterior: { x: 41, y: 82 } },
  },
  {
    code: 'PIERNA.TIBIAL_ANTERIOR',
    label: 'Músculo Tibial Anterior (Periostitis)',
    level: 'structure',
    parent: 'PIERNA.SUB',
    kind: 'musculo',
    views: ['anterior'],
    lateral: true,
    aliases: ['tibial anterior', 'periostitis tibial', 'espinilla'],
    anchor: { anterior: { x: 40, y: 80 } },
    icd10Hints: ['M76.8'],
  },
  {
    code: 'PIERNA.PERONEOS',
    label: 'Músculos Peroneos (Largo y Corto)',
    level: 'structure',
    parent: 'PIERNA.SUB',
    kind: 'musculo',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['peroneos', 'peroneo lateral'],
    anchor: { anterior: { x: 38, y: 82 }, posterior: { x: 38, y: 82 }, lateral: { x: 50, y: 81 } },
  },

  // ---------------------------------------------------------------------------
  // TOBILLO Y PIE
  // ---------------------------------------------------------------------------
  {
    code: 'TOBILLO.LIGAMENTOS_SUB',
    label: 'Articulación y Ligamentos del Tobillo',
    level: 'subregion',
    parent: 'TOBILLO_PIE',
    views: ['anterior', 'posterior', 'lateral'],
    lateral: true,
    aliases: ['esguince tobillo', 'maleolo', 'lpaa'],
  },
  {
    code: 'TOBILLO.LPAA',
    label: 'Ligamento Peroneoastragalino Anterior (LPAA)',
    level: 'structure',
    parent: 'TOBILLO.LIGAMENTOS_SUB',
    kind: 'ligamento',
    views: ['anterior', 'lateral'],
    lateral: true,
    aliases: ['lpaa', 'esguince externo tobillo', 'maleolo peroneo'],
    anchor: { anterior: { x: 39, y: 89 }, lateral: { x: 52, y: 89 } },
    icd10Hints: ['S93.4'],
  },
  {
    code: 'TOBILLO.LPC',
    label: 'Ligamento Peroneocalcáneo (LPC)',
    level: 'structure',
    parent: 'TOBILLO.LIGAMENTOS_SUB',
    kind: 'ligamento',
    views: ['lateral', 'posterior'],
    lateral: true,
    aliases: ['lpc', 'ligamento peroneocalcaneo'],
    anchor: { lateral: { x: 50, y: 91 }, posterior: { x: 39, y: 90 } },
  },
  {
    code: 'TOBILLO.DELTOIDEO',
    label: 'Ligamento Deltoideo Medial',
    level: 'structure',
    parent: 'TOBILLO.LIGAMENTOS_SUB',
    kind: 'ligamento',
    views: ['anterior', 'posterior'],
    lateral: true,
    aliases: ['deltoideo', 'maleolo tibial', 'ligamento interno'],
    anchor: { anterior: { x: 43, y: 89 }, posterior: { x: 43, y: 89 } },
  },
  {
    code: 'TOBILLO.AQUILES_SUB',
    label: 'Tendón de Aquiles y Retropié',
    level: 'subregion',
    parent: 'TOBILLO_PIE',
    views: ['posterior', 'lateral'],
    lateral: true,
    aliases: ['aquiles', 'calcaneo', 'tendinitis aquiles'],
  },
  {
    code: 'TOBILLO.AQUILES_MEDIO',
    label: 'Tendón de Aquiles (Porción Media 2-6 cm)',
    level: 'structure',
    parent: 'TOBILLO.AQUILES_SUB',
    kind: 'tendon',
    views: ['posterior', 'lateral'],
    lateral: true,
    aliases: ['tendinitis aquilea', 'aquiles medio'],
    anchor: { posterior: { x: 41, y: 88 }, lateral: { x: 48, y: 88 } },
    icd10Hints: ['M76.6'],
  },
  {
    code: 'TOBILLO.AQUILES_INSERCION',
    label: 'Tendón de Aquiles (Inserción Calcánea / Espolón)',
    level: 'structure',
    parent: 'TOBILLO.AQUILES_SUB',
    kind: 'tendon',
    views: ['posterior', 'lateral'],
    lateral: true,
    aliases: ['entesopatia aquilea', 'bursitis retrocalcanea', 'espolon posterior'],
    anchor: { posterior: { x: 41, y: 92 }, lateral: { x: 48, y: 92 } },
  },
  {
    code: 'PIE.PLANTA_SUB',
    label: 'Planta del Pie y Metatarsianos',
    level: 'subregion',
    parent: 'TOBILLO_PIE',
    views: ['posterior', 'lateral', 'anterior'],
    lateral: true,
    aliases: ['fascia plantar', 'metatarso', 'juanete', 'espolon'],
  },
  {
    code: 'PIE.FASCIA_CALCANEO',
    label: 'Fascia Plantar (Inserción en Calcáneo)',
    level: 'structure',
    parent: 'PIE.PLANTA_SUB',
    kind: 'fascia',
    views: ['lateral', 'posterior'],
    lateral: true,
    aliases: ['fascitis plantar', 'talalgia', 'espolon calcaneo'],
    anchor: { lateral: { x: 50, y: 94 }, posterior: { x: 41, y: 94 } },
    icd10Hints: ['M72.2'],
  },
  {
    code: 'PIE.FASCIA_CUERPO',
    label: 'Fascia Plantar (Banda Media / Arco Longitudinal)',
    level: 'structure',
    parent: 'PIE.PLANTA_SUB',
    kind: 'fascia',
    views: ['lateral'],
    lateral: true,
    aliases: ['arco plantar', 'arco pie', 'fascia media'],
    anchor: { lateral: { x: 54, y: 94 } },
  },
  {
    code: 'PIE.HALLUX_1MTF',
    label: 'Primera Articulación Metatarsofalángica (Hallux / Juanete)',
    level: 'structure',
    parent: 'PIE.PLANTA_SUB',
    kind: 'articulacion',
    views: ['anterior', 'lateral'],
    lateral: true,
    aliases: ['juanete', 'hallux valgus', '1mtf', 'primer dedo pie'],
    anchor: { anterior: { x: 43, y: 94 }, lateral: { x: 58, y: 94 } },
    icd10Hints: ['M20.1'],
  },
  {
    code: 'PIE.NEUROMA_MORTON',
    label: 'Espacio Intermetatarsal (Neuroma de Morton 3º-4º)',
    level: 'structure',
    parent: 'PIE.PLANTA_SUB',
    kind: 'nervio',
    views: ['anterior'],
    lateral: true,
    aliases: ['neuroma morton', 'metatarsalgia', 'intermetatarsal'],
    anchor: { anterior: { x: 40, y: 93 } },
    icd10Hints: ['G57.6'],
  },
];

// =============================================================================
// CATÁLOGO INDEXADO & FUNCIONES HELPER
// =============================================================================

const NODE_MAP = new Map<string, AnatomyNode>(
  ANATOMY_TAXONOMY.map((node) => [node.code, node]),
);

/**
 * Normaliza cadenas para búsqueda insensible a acentos, mayúsculas y signos.
 */
export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Obtiene un nodo anatómico por su código único.
 */
export function getNode(code: string): AnatomyNode | undefined {
  return NODE_MAP.get(code);
}

/**
 * Valida si un código pertenece al catálogo anatómico.
 */
export function validateStructureCode(code: string): boolean {
  return NODE_MAP.has(code);
}

/**
 * Obtiene la ruta jerárquica desde la raíz hasta el nodo solicitado.
 * Ej: [Región Hombro, Subregión Manguito Rotador, Estructura Supraespinoso]
 */
export function getPath(code: string): AnatomyNode[] {
  const path: AnatomyNode[] = [];
  let current = getNode(code);

  while (current) {
    path.unshift(current);
    if (!current.parent) break;
    current = getNode(current.parent);
  }

  return path;
}

/**
 * Obtiene los hijos directos de un nodo padre (o todas las regiones si parentCode es undefined).
 */
export function getChildren(parentCode?: string): AnatomyNode[] {
  if (!parentCode) {
    return ANATOMY_TAXONOMY.filter((n) => n.level === 'region');
  }
  return ANATOMY_TAXONOMY.filter((n) => n.parent === parentCode);
}

/**
 * Obtiene todas las regiones de nivel 1.
 */
export function getRegions(): AnatomyNode[] {
  return ANATOMY_TAXONOMY.filter((n) => n.level === 'region');
}

/**
 * Obtiene las subregiones de una región dada.
 */
export function getSubregions(regionCode: string): AnatomyNode[] {
  return ANATOMY_TAXONOMY.filter(
    (n) => n.level === 'subregion' && n.parent === regionCode,
  );
}

/**
 * Obtiene las estructuras de una subregión dada.
 */
export function getStructures(subregionCode: string): AnatomyNode[] {
  return ANATOMY_TAXONOMY.filter(
    (n) => n.level === 'structure' && n.parent === subregionCode,
  );
}

/**
 * Devuelve todas las estructuras hojas (level === 'structure') pertenecientes a una región dada.
 */
export function getAllStructuresInRegion(regionCode: string): AnatomyNode[] {
  const subregions = getSubregions(regionCode);
  const subregionCodes = new Set(subregions.map((s) => s.code));
  return ANATOMY_TAXONOMY.filter(
    (n) => n.level === 'structure' && n.parent && subregionCodes.has(n.parent),
  );
}

export interface AnatomySearchResult {
  node: AnatomyNode;
  path: AnatomyNode[];
  matchScore: number;
}

/**
 * Búsqueda inteligente en el catálogo anatómico:
 * Coincide por etiqueta, alias, código y ruta completa.
 */
export function searchAnatomy(query: string, limit = 15): AnatomySearchResult[] {
  const cleanQuery = normalizeSearchText(query);
  if (!cleanQuery) return [];

  const results: AnatomySearchResult[] = [];

  for (const node of ANATOMY_TAXONOMY) {
    const nodeLabelNorm = normalizeSearchText(node.label);
    const nodeCodeNorm = normalizeSearchText(node.code);
    const aliasesNorm = (node.aliases || []).map(normalizeSearchText);

    let matchScore = 0;

    if (nodeLabelNorm === cleanQuery) {
      matchScore = 100;
    } else if (nodeLabelNorm.startsWith(cleanQuery)) {
      matchScore = 80;
    } else if (nodeLabelNorm.includes(cleanQuery)) {
      matchScore = 60;
    } else if (aliasesNorm.some((a) => a === cleanQuery)) {
      matchScore = 75;
    } else if (aliasesNorm.some((a) => a.includes(cleanQuery))) {
      matchScore = 50;
    } else if (nodeCodeNorm.includes(cleanQuery)) {
      matchScore = 40;
    }

    if (matchScore > 0) {
      // Priorizar estructuras (hojas clínicas) sobre regiones abstractas
      if (node.level === 'structure') matchScore += 10;
      results.push({
        node,
        path: getPath(node.code),
        matchScore,
      });
    }
  }

  return results
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}
