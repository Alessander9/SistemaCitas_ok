import {
  ANATOMY_TAXONOMY,
  AnatomyNode,
  AnatomyView,
  getAllStructuresInRegion,
  getNode,
  Laterality,
  searchAnatomy,
} from '@citassistema/shared-types';

export type AtlasSystemId =
  | 'skeletal'
  | 'muscular'
  | 'arterial'
  | 'venous'
  | 'nervous'
  | 'digestive'
  | 'respiratory'
  | 'urinary'
  | 'reproductive'
  | 'lymphatic'
  | 'endocrine'
  | 'integumentary'
  | 'connective'
  | 'sensory'
  | 'cardiac';

export interface AtlasSystemMeta {
  id: AtlasSystemId;
  name: string;
  nameEs: string;
  color: string;
  descriptionEs: string;
}

export const ATLAS_SYSTEMS: AtlasSystemMeta[] = [
  {
    id: 'muscular',
    name: 'Muscles',
    nameEs: 'Músculos Esqueléticos',
    color: '#a85b50',
    descriptionEs:
      'Los músculos esqueléticos generan movimiento, estabilizan las articulaciones y son asiento principal de puntos gatillo miofasciales.',
  },
  {
    id: 'skeletal',
    name: 'Skeleton',
    nameEs: 'Esqueleto y Vértebras',
    color: '#e2d9ba',
    descriptionEs:
      'Estructura ósea de soporte, columna vertebral y superficies articulares donde se insertan tendones y ligamentos.',
  },
  {
    id: 'connective',
    name: 'Connective tissue',
    nameEs: 'Tendones, Ligamentos y Fascias',
    color: '#aec3bb',
    descriptionEs:
      'Tendones, ligamentos, fascias y cápsulas que estabilizan articulaciones y transmiten cargas mecánicas.',
  },
  {
    id: 'nervous',
    name: 'Nervous system',
    nameEs: 'Sistema Nervioso',
    color: '#d8b565',
    descriptionEs:
      'Cerebro, médula espinal, raíces nerviosas y nervios periféricos implicados en dolor neuropático e irradiación radicular.',
  },
  {
    id: 'integumentary',
    name: 'Body surface',
    nameEs: 'Superficie Corporal (Piel)',
    color: '#ba9b7d',
    descriptionEs:
      'Referencia anatómica externa translúcida para ubicación superficial y dermatomas.',
  },
  {
    id: 'arterial',
    name: 'Arteries',
    nameEs: 'Sistema Arterial',
    color: '#c05245',
    descriptionEs: 'Red arterial sistémica y pulmonar de irrigación tisular.',
  },
  {
    id: 'venous',
    name: 'Veins',
    nameEs: 'Sistema Venoso',
    color: '#527c9f',
    descriptionEs: 'Red de retorno venoso superficial y profundo.',
  },
  {
    id: 'cardiac',
    name: 'Heart',
    nameEs: 'Corazón',
    color: '#b96760',
    descriptionEs: 'Bomba muscular cardíaca y cámaras valvulares.',
  },
  {
    id: 'respiratory',
    name: 'Respiratory',
    nameEs: 'Sistema Respiratorio',
    color: '#b98991',
    descriptionEs: 'Vías aéreas, pulmones y estructuras ventilatorias.',
  },
  {
    id: 'digestive',
    name: 'Digestive',
    nameEs: 'Sistema Digestivo',
    color: '#b8916b',
    descriptionEs: 'Tracto gastrointestinal y órganos digestivos anexos.',
  },
  {
    id: 'urinary',
    name: 'Urinary',
    nameEs: 'Sistema Urinario',
    color: '#b47961',
    descriptionEs: 'Riñones, uréteres, vejiga y vías urinarias.',
  },
  {
    id: 'sensory',
    name: 'Sensory organs',
    nameEs: 'Órganos Sensoriales',
    color: '#b0c8ce',
    descriptionEs: 'Estructuras especializadas de visión, audición y equilibrio.',
  },
  {
    id: 'lymphatic',
    name: 'Lymphatic',
    nameEs: 'Sistema Linfático',
    color: '#879f7c',
    descriptionEs: 'Vasos y órganos linfoides de drenaje e inmunidad.',
  },
  {
    id: 'endocrine',
    name: 'Endocrine',
    nameEs: 'Sistema Endocrino',
    color: '#c5a09a',
    descriptionEs: 'Glándulas de regulación hormonal y metabólica.',
  },
  {
    id: 'reproductive',
    name: 'Reproductive',
    nameEs: 'Sistema Reproductor',
    color: '#bda098',
    descriptionEs: 'Estructuras anatómicas del aparato reproductor.',
  },
];

export interface AtlasPart {
  id: string;
  name: string;
  conceptId: string;
  system: AtlasSystemId;
  chunk: number;
  positions: number;
  normals: number;
  indices: number;
  vertexCount: number;
  indexCount: number;
  bounds: [number[], number[]];
}

export interface AtlasConcept {
  id: string;
  name: string;
  elements: string[];
}

export interface HumanAtlasManifest {
  version: string;
  sex?: string;
  source?: string;
  scope?: string;
  parts: AtlasPart[];
  concepts: AtlasConcept[];
  chunks: {
    url: string;
    bytes: number;
    gzip?: string;
    gzipBytes?: number;
  }[];
  triangles: number;
}

export type AtlasCameraView = 'three-quarter' | 'front' | 'back' | 'side';

export interface ClinicalLayerPreset {
  id: string;
  label: string;
  systems: AtlasSystemId[];
}

export const CLINICAL_LAYER_PRESETS: ClinicalLayerPreset[] = [
  {
    id: 'musculoskeletal',
    label: 'Músculo-Esquelético',
    systems: ['skeletal', 'muscular', 'connective', 'nervous', 'integumentary'],
  },
  {
    id: 'myofascial',
    label: 'Miofascial y Nervios',
    systems: ['muscular', 'connective', 'nervous'],
  },
  {
    id: 'skeletal',
    label: 'Esqueleto',
    systems: ['skeletal', 'connective'],
  },
  {
    id: 'organs',
    label: 'Órganos',
    systems: ['cardiac', 'respiratory', 'digestive', 'urinary', 'endocrine', 'reproductive'],
  },
  {
    id: 'all',
    label: 'Todos (2,234)',
    systems: ATLAS_SYSTEMS.map((s) => s.id),
  },
];

export const DEFAULT_CLINICAL_SYSTEMS: AtlasSystemId[] = [
  'skeletal',
  'muscular',
  'connective',
  'nervous',
  'integumentary',
];

/**
 * Decodifica un chunk binario (.bin o .bin.gz) verificando la firma gzip (0x1f 0x8b)
 * para evitar doble descompresión si el servidor estático ya aplicó Content-Encoding.
 */
export async function decodeModelResponse(
  response: Response,
  expectedBytes: number,
  compressed: boolean,
): Promise<ArrayBuffer> {
  if (!response.ok) {
    throw new Error('No se pudo cargar un bloque geométrico del Atlas 3D.');
  }
  const payload = await response.arrayBuffer();
  const signature = new Uint8Array(payload, 0, Math.min(2, payload.byteLength));
  const isGzip =
    (compressed || (signature[0] === 0x1f && signature[1] === 0x8b)) &&
    signature[0] === 0x1f &&
    signature[1] === 0x8b &&
    typeof DecompressionStream !== 'undefined';

  const buffer = isGzip
    ? await new Response(
        new Blob([payload]).stream().pipeThrough(new DecompressionStream('gzip')),
      ).arrayBuffer()
    : payload;

  if (buffer.byteLength !== expectedBytes) {
    throw new Error(
      `El archivo geométrico está incompleto (${buffer.byteLength}/${expectedBytes} bytes).`,
    );
  }
  return buffer;
}

export interface LayoutCell {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Algoritmo de empaquetado sin solapamiento para el modo "Explode Anatomy" (Despiece 0%-100%).
 */
export function createExplosionLayout(parts: AtlasPart[], aspect = 1) {
  const cards = parts.map((p) => ({
    id: p.id,
    system: p.system,
    width: Math.max(0.035, p.bounds[1][0] - p.bounds[0][0]) + 0.04,
    height: Math.max(0.035, p.bounds[1][1] - p.bounds[0][1]) + 0.04,
  }));
  const area = cards.reduce((n, c) => n + c.width * c.height, 0);
  const maxWidth = Math.max(0.3, ...cards.map((c) => c.width));
  const targetWidth = Math.max(
    maxWidth,
    Math.sqrt(area * Math.max(0.5, Math.min(1.5, aspect))) * 1.18,
  );
  cards.sort((a, b) => b.height - a.height || a.id.localeCompare(b.id));
  const cells = new Map<string, LayoutCell>();
  let x = 0,
    y = 0,
    row = 0,
    usedWidth = 0;
  for (const c of cards) {
    if (x > 0 && x + c.width > targetWidth) {
      x = 0;
      y += row;
      row = 0;
    }
    cells.set(c.id, {
      x: x + c.width / 2,
      y: -y - c.height / 2,
      width: c.width,
      height: c.height,
    });
    x += c.width;
    usedWidth = Math.max(usedWidth, x);
    row = Math.max(row, c.height);
  }
  const height = y + row;
  cells.forEach((c) => {
    c.x -= usedWidth / 2;
    c.y += height / 2;
  });
  return { cells, width: usedWidth, height };
}

/**
 * Distingue un clic/tap limpio de una rotación orbital o gesto multitáctil.
 */
export class PointerTap {
  private active = new Map<number, { x: number; y: number; threshold: number }>();
  private blocked = false;

  down(id: number, x: number, y: number, threshold: number) {
    if (this.active.size === 0) this.blocked = false;
    this.active.set(id, { x, y, threshold });
    if (this.active.size > 1) this.blocked = true;
  }

  move(id: number, x: number, y: number) {
    const start = this.active.get(id);
    if (start && Math.hypot(x - start.x, y - start.y) > start.threshold) {
      this.blocked = true;
    }
  }

  up(id: number, x: number, y: number): boolean {
    this.move(id, x, y);
    const tap = this.active.has(id) && this.active.size === 1 && !this.blocked;
    this.active.delete(id);
    return tap;
  }

  cancel(id: number) {
    this.active.delete(id);
    this.blocked = true;
  }
}

/**
 * Diccionario de traducción clínica rápida Inglés (BodyParts3D/FMA) <-> Español
 * para búsqueda bilingüe e inspección médica.
 */
const ANATOMICAL_ES_DICTIONARY: [RegExp, string][] = [
  [/\biliocostalis lumborum\b/gi, 'Músculo Iliocostal Lumbar'],
  [/\biliocostalis thoracis\b/gi, 'Músculo Iliocostal Torácico'],
  [/\biliocostalis cervicis\b/gi, 'Músculo Iliocostal Cervical'],
  [/\biliocostalis\b/gi, 'Músculo Iliocostal'],
  [/\blongissimus thoracis\b/gi, 'Músculo Longísimo Torácico'],
  [/\blongissimus cervicis\b/gi, 'Músculo Longísimo Cervical'],
  [/\blongissimus capitis\b/gi, 'Músculo Longísimo de la Cabeza'],
  [/\blongissimus\b/gi, 'Músculo Longísimo'],
  [/\bspinalis\b/gi, 'Músculo Espinoso'],
  [/\bmultifidus\b/gi, 'Músculo Multífido'],
  [/\berector spinae\b/gi, 'Músculo Erector de la Columna'],
  [/\bsupraspinatus\b/gi, 'Músculo Supraespinoso'],
  [/\binfraspinatus\b/gi, 'Músculo Infraespinoso'],
  [/\bsubscapularis\b/gi, 'Músculo Subescapular'],
  [/\bteres minor\b/gi, 'Músculo Redondo Menor'],
  [/\bteres major\b/gi, 'Músculo Redondo Mayor'],
  [/\bdeltoid\b/gi, 'Músculo Deltoides'],
  [/\btrapezius\b/gi, 'Músculo Trapecio'],
  [/\bsternocleidomastoid\b/gi, 'Esternocleidomastoideo (ECOM)'],
  [/\bscalene|scalenus\b/gi, 'Músculo Escaleno'],
  [/\blevator scapulae\b/gi, 'Elevador de la Escápula'],
  [/\brhomboid major\b/gi, 'Músculo Romboides Mayor'],
  [/\brhomboid minor\b/gi, 'Músculo Romboides Menor'],
  [/\brhomboid\b/gi, 'Músculo Romboides'],
  [/\blatissimus dorsi\b/gi, 'Músculo Dorsal Ancho'],
  [/\bpectoralis major\b/gi, 'Pectoral Mayor'],
  [/\bpectoralis minor\b/gi, 'Pectoral Menor'],
  [/\bserratus anterior\b/gi, 'Serrato Anterior'],
  [/\bserratus posterior\b/gi, 'Serrato Posterior'],
  [/\bbiceps brachii\b/gi, 'Bíceps Braquial'],
  [/\btriceps brachii\b/gi, 'Tríceps Braquial'],
  [/\bbrachialis\b/gi, 'Músculo Braquial'],
  [/\bcoracobrachialis\b/gi, 'Músculo Coracobraquial'],
  [/\bbrachioradialis\b/gi, 'Braquiorradial (Supinador Largo)'],
  [/\bpronator teres\b/gi, 'Pronador Redondo'],
  [/\brectus abdominis\b/gi, 'Recto Abdominal'],
  [/\bexternal oblique\b/gi, 'Oblicuo Externo del Abdomen'],
  [/\binternal oblique\b/gi, 'Oblicuo Interno del Abdomen'],
  [/\btransversus abdominis\b/gi, 'Transverso del Abdomen'],
  [/\bquadratus lumborum\b/gi, 'Músculo Cuadrado Lumbar'],
  [/\bpsoas major|iliopsoas\b/gi, 'Músculo Psoas Ilíaco'],
  [/\bpsoas minor\b/gi, 'Músculo Psoas Menor'],
  [/\biliacus\b/gi, 'Músculo Ilíaco'],
  [/\bgluteus maximus\b/gi, 'Glúteo Mayor'],
  [/\bgluteus medius\b/gi, 'Glúteo Medio'],
  [/\bgluteus minimus\b/gi, 'Glúteo Menor'],
  [/\bpiriformis\b/gi, 'Músculo Piramidal (Piriforme)'],
  [/\btensor fasciae latae\b/gi, 'Tensor de la Fascia Lata'],
  [/\brectus femoris\b/gi, 'Recto Femoral (Cuádriceps)'],
  [/\bvastus lateralis\b/gi, 'Vasto Lateral (Cuádriceps)'],
  [/\bvastus medialis\b/gi, 'Vasto Medial (Cuádriceps)'],
  [/\bvastus intermedius\b/gi, 'Vasto Intermedio (Cuádriceps)'],
  [/\bsartorius\b/gi, 'Músculo Sartorio'],
  [/\bgracilis\b/gi, 'Músculo Grácil (Recto Interno)'],
  [/\badductor magnus\b/gi, 'Aductor Mayor'],
  [/\badductor longus\b/gi, 'Aductor Largo'],
  [/\badductor brevis\b/gi, 'Aductor Corto'],
  [/\bpectineus\b/gi, 'Músculo Pectíneo'],
  [/\bbiceps femoris\b/gi, 'Bíceps Femoral (Isquiotibial)'],
  [/\bsemitendinosus\b/gi, 'Semitendinoso (Isquiotibial)'],
  [/\bsemimembranosus\b/gi, 'Semimembranoso (Isquiotibial)'],
  [/\bpopliteus\b/gi, 'Músculo Poplíteo'],
  [/\bgastrocnemius\b/gi, 'Músculo Gemelo (Gastrocnemio)'],
  [/\bsoleus\b/gi, 'Músculo Sóleo'],
  [/\btibialis anterior\b/gi, 'Tibial Anterior'],
  [/\btibialis posterior\b/gi, 'Tibial Posterior'],
  [/\bfibularis|peroneus\b/gi, 'Músculo Peroneo'],
  [/\bcalcaneal tendon\b/gi, 'Tendón de Aquiles (Calcáneo)'],
  [/\bplantar ligament|plantar aponeurosis\b/gi, 'Ligamento / Fascia Plantar'],
  [/\bmasseter\b/gi, 'Músculo Masetero'],
  [/\btemporalis\b/gi, 'Músculo Temporal'],
  [/\bpterygoid\b/gi, 'Músculo Pterigoideo'],
  [/\bsciatic nerve\b/gi, 'Nervio Ciático'],
  [/\bmedian nerve\b/gi, 'Nervio Mediano'],
  [/\bulnar nerve\b/gi, 'Nervio Cubital (Ulnar)'],
  [/\bradial nerve\b/gi, 'Nervio Radial'],
  [/\bfemoral nerve\b/gi, 'Nervio Femoral'],
  [/\bclavicle\b/gi, 'Clavícula'],
  [/\bscapula\b/gi, 'Escápula (Omóplato)'],
  [/\bhumerus\b/gi, 'Húmero'],
  [/\bradius\b/gi, 'Radio'],
  [/\bulna\b/gi, 'Cúbito (Ulna)'],
  [/\bfemur\b/gi, 'Fémur'],
  [/\bpatella\b/gi, 'Rótula (Patela)'],
  [/\btibia\b/gi, 'Tibia'],
  [/\bfibula\b/gi, 'Peroné (Fíbula)'],
  [/\bsacrum\b/gi, 'Sacro'],
  [/\bcoccyx\b/gi, 'Coxis'],
  [/\bilium|hip bone|pelvis\b/gi, 'Pelvis / Hueso Ilíaco'],
  [/\bsternum\b/gi, 'Esternón'],
  [/\brib\b/gi, 'Costilla'],
  [/\bcervical vertebra\b/gi, 'Vértebra Cervical'],
  [/\bthoracic vertebra\b/gi, 'Vértebra Torácica (Dorsal)'],
  [/\blumbar vertebra\b/gi, 'Vértebra Lumbar'],
  [/\bintervertebral disc\b/gi, 'Disco Intervertebral'],
  [/\bskin\b/gi, 'Superficie Cutánea (Piel)'],
];

export function translateAtlasNameEs(englishName: string): string {
  let sideSuffix = '';
  let base = englishName.trim();

  if (/^right\b/i.test(base)) {
    sideSuffix = ' Derecho';
    base = base.replace(/^right\s+/i, '');
  } else if (/^left\b/i.test(base)) {
    sideSuffix = ' Izquierdo';
    base = base.replace(/^left\s+/i, '');
  } else if (/\bof right\b/i.test(base)) {
    sideSuffix = ' (Derecho)';
    base = base.replace(/\bof right\b/gi, 'de');
  } else if (/\bof left\b/i.test(base)) {
    sideSuffix = ' (Izquierdo)';
    base = base.replace(/\bof left\b/gi, 'de');
  }

  for (const [regex, replacement] of ANATOMICAL_ES_DICTIONARY) {
    if (regex.test(base)) {
      base = base.replace(regex, replacement);
    }
  }

  base = base.replace(/\bright\b/gi, 'Derecho').replace(/\bleft\b/gi, 'Izquierdo');
  return `${base.charAt(0).toUpperCase()}${base.slice(1)}${sideSuffix}`.trim();
}

export interface ClinicalAtlasMapping {
  regionCode: string;
  regionLabel: string;
  structureCode: string;
  structureLabel: string;
  laterality: Laterality;
  view: AnatomyView;
  coordX: number;
  coordY: number;
  pos3d: [number, number, number];
  atlasPartId: string;
  atlasPartName: string;
  atlasPartNameEs: string;
  fmaId: string;
  system: AtlasSystemId;
}

/**
 * Reglas de equivalencia léxica: nombre en BodyParts3D (inglés) -> término clínico en nuestro catálogo.
 */
const KEYWORD_TO_CLINICAL_QUERY: [RegExp, string][] = [
  [/supraspinatus/i, 'supraespinoso'],
  [/infraspinatus/i, 'infraespinoso'],
  [/subscapularis/i, 'subescapular'],
  [/teres minor/i, 'redondo menor'],
  [/deltoid/i, 'deltoides'],
  [/biceps brachii/i, 'biceps'],
  [/triceps brachii/i, 'triceps'],
  [/brachialis/i, 'braquial'],
  [/brachioradialis/i, 'braquiorradial'],
  [/pronator teres/i, 'pronador'],
  [/flexor carpi|flexor digitorum/i, 'flexores'],
  [/extensor carpi|extensor digitorum/i, 'extensores'],
  [/median nerve/i, 'tunel carpiano'],
  [/calcaneal tendon/i, 'aquiles'],
  [/plantar/i, 'fascia plantar'],
  [/gastrocnemius/i, 'gemelo'],
  [/soleus/i, 'soleo'],
  [/tibialis anterior/i, 'tibial anterior'],
  [/tibialis posterior/i, 'tibial posterior'],
  [/fibularis|peroneus/i, 'peroneo'],
  [/patella/i, 'rotuliano'],
  [/rectus femoris/i, 'recto femoral'],
  [/vastus medialis/i, 'vasto medial'],
  [/vastus lateralis/i, 'vasto lateral'],
  [/biceps femoris/i, 'biceps femoral'],
  [/semitendinosus|semimembranosus/i, 'semitendinoso'],
  [/adductor|gracilis|pectineus/i, 'aductores'],
  [/tensor fasciae latae/i, 'fascia lata'],
  [/piriformis/i, 'piramidal'],
  [/sciatic/i, 'ciatico'],
  [/gluteus maximus/i, 'gluteo mayor'],
  [/gluteus medius|gluteus minimus/i, 'gluteo medio'],
  [/sacrum|sacroiliac/i, 'sacroiliaca'],
  [/coccyx/i, 'coxis'],
  [/quadratus lumborum/i, 'cuadrado lumbar'],
  [/psoas|iliacus/i, 'psoas'],
  [/rectus abdominis/i, 'recto abdominal'],
  [/oblique/i, 'oblicuos'],
  [/pectoralis major/i, 'pectoral mayor'],
  [/pectoralis minor/i, 'pectoral menor'],
  [/sternum/i, 'esternon'],
  [/rhomboid/i, 'romboides'],
  [/latissimus dorsi/i, 'dorsal ancho'],
  [/trapezius/i, 'trapecio superior'],
  [/levator scapulae/i, 'elevador de la escapula'],
  [/sternocleidomastoid/i, 'esternocleidomastoideo'],
  [/scalene|scalenus/i, 'escalenos'],
  [/suboccipital/i, 'suboccipitales'],
  [/masseter/i, 'masetero'],
  [/temporalis/i, 'musculo temporal'],
  [/mandible|temporomandibular/i, 'condilo mandibular'],
];

/**
 * Clasifica una coordenada 3D (en el espacio de BodyParts3D: Y de 0 a 1.72m, X de -0.33 a +0.33m, Z de -0.15 a +0.15m)
 * en una de las 17 regiones clínicas de VitalSalud.
 */
export function resolveRegionFrom3DPoint(
  x: number,
  y: number,
  z: number,
  nameHint = '',
): string {
  const n = nameHint.toLowerCase();

  // Pistas léxicas directas
  if (/\b(foot|toe|calcane|tarsal|metatarsal|plantar|hallux|ankle|malleol)\b/.test(n)) {
    return 'TOBILLO_PIE';
  }
  if (/\b(gastrocnemius|soleus|tibia|fibula|calf|crural)\b/.test(n)) {
    return 'PIERNA';
  }
  if (/\b(patella|knee|menisc|cruciate|poplite)\b/.test(n)) {
    return 'RODILLA';
  }
  if (/\b(femur|femoris|vastus|sartorius|gracilis|adductor|thigh)\b/.test(n)) {
    return 'MUSLO';
  }
  if (/\b(glute|piriform|trochanter|inguinal|hip|iliopsoas|tensor fasciae)\b/.test(n)) {
    return 'CADERA_INGLE';
  }
  if (/\b(sacr|coccy|pelvi|pubic|ischia)\b/.test(n)) {
    return 'PELVIS_SACRO';
  }
  if (/\b(hand|finger|thumb|carpal|metacarpal|phalanx of hand|wrist|thenar|hypothenar)\b/.test(n)) {
    return 'MANO_MUNECA';
  }
  if (/\b(forearm|radius|ulna|pronator|supinator|brachioradialis|carpi)\b/.test(n)) {
    return 'ANTEBRAZO';
  }
  if (/\b(elbow|olecranon|epicondyl)\b/.test(n)) {
    return 'CODO';
  }
  if (/\b(biceps brachii|triceps brachii|brachialis|humerus|arm)\b/.test(n) && !/forearm/.test(n)) {
    return 'BRAZO';
  }
  if (/\b(shoulder|supraspinatus|infraspinatus|subscapularis|deltoid|clavicle|acromio|glenohumeral)\b/.test(n)) {
    return 'HOMBRO';
  }
  if (/\b(lumbar|quadratus lumborum)\b/.test(n)) {
    return 'COL_LUMBAR';
  }
  if (/\b(thoracic vertebra|rhomboid|scapula|latissimus|trapezius)\b/.test(n)) {
    return 'COL_DORSAL';
  }
  if (/\b(cervical|suboccipital|nuchal)\b/.test(n)) {
    return z >= 0.01 ? 'CUELLO_ANT' : 'COL_CERVICAL';
  }
  if (/\b(sternocleidomastoid|scalene|hyoid|thyroid|laryn|trachea|pharyn)\b/.test(n)) {
    return 'CUELLO_ANT';
  }
  if (/\b(head|skull|brain|eye|ear|nose|mouth|tooth|jaw|mandib|maxill|masseter|temporal|facial|cranial)\b/.test(n)) {
    return 'CABEZA_ATM';
  }

  // Clasificación geométrica espacial precisa (BodyParts3D Y: 0.00m a 1.72m)
  const absX = Math.abs(x);

  // 1. Cabeza y cara
  if (y > 1.50) return 'CABEZA_ATM';

  // 2. Cuello y columna cervical
  if (y > 1.40 && absX < 0.09) {
    return z >= 0.005 ? 'CUELLO_ANT' : 'COL_CERVICAL';
  }

  // 3. Miembro superior (cuando |x| se separa del tronco)
  if (y > 1.26 && absX >= 0.13) return 'HOMBRO';
  if (y > 1.07 && y <= 1.26 && absX >= 0.16) return 'BRAZO';
  if (y > 0.98 && y <= 1.07 && absX >= 0.17) return 'CODO';
  if (y > 0.82 && y <= 0.98 && absX >= 0.18) return 'ANTEBRAZO';
  if (y >= 0.62 && y <= 0.82 && absX >= 0.19) return 'MANO_MUNECA';

  // 4. Tronco superior y medio
  if (y > 1.12) {
    return z >= -0.01 ? 'TORAX_ABDOMEN' : 'COL_DORSAL';
  }

  // 5. Tronco inferior / Abdomen / Lumbar
  if (y > 0.94) {
    return z >= 0.0 ? 'TORAX_ABDOMEN' : 'COL_LUMBAR';
  }

  // 6. Pelvis, Sacro y Cadera/Glúteo
  if (y > 0.78) {
    return absX > 0.085 ? 'CADERA_INGLE' : 'PELVIS_SACRO';
  }

  // 7. Miembro inferior
  if (y > 0.52) return 'MUSLO';
  if (y > 0.42) return 'RODILLA';
  if (y > 0.14) return 'PIERNA';
  return 'TOBILLO_PIE';
}

/**
 * Mapea cualquier pieza 3D del Human Atlas (2,234 mallas BodyParts3D) y su punto 3D de impacto
 * hacia una estructura clínica válida del catálogo @citassistema/shared-types.
 */
export function mapAtlasPartToClinical(
  part: AtlasPart,
  hitPoint?: [number, number, number],
): ClinicalAtlasMapping {
  const center: [number, number, number] = hitPoint ?? [
    (part.bounds[0][0] + part.bounds[1][0]) / 2,
    (part.bounds[0][1] + part.bounds[1][1]) / 2,
    (part.bounds[0][2] + part.bounds[1][2]) / 2,
  ];
  const [x, y, z] = center;

  // Coordenadas normalizadas 0-100 relativas a la silueta humana (1.72m alto, +-0.34m ancho)
  const coordX = Math.max(0, Math.min(100, Math.round(((x + 0.34) / 0.68) * 1000) / 10));
  const coordY = Math.max(0, Math.min(100, Math.round(((1.72 - y) / 1.72) * 1000) / 10));

  // 1. Intentar mapeo directo por palabra clave a estructura específica del catálogo
  let structureNode: AnatomyNode | undefined;
  if (part.name.toLowerCase() !== 'skin') {
    for (const [regex, clinicalQuery] of KEYWORD_TO_CLINICAL_QUERY) {
      if (regex.test(part.name)) {
        const matches = searchAnatomy(clinicalQuery, 5);
        const structMatch = matches.find((m) => m.node.level === 'structure');
        if (structMatch) {
          structureNode = structMatch.node;
          break;
        }
      }
    }
  }

  // 2. Resolver región clínica
  let regionCode = resolveRegionFrom3DPoint(
    x,
    y,
    z,
    part.name.toLowerCase() === 'skin' ? '' : part.name,
  );

  if (structureNode && structureNode.parent) {
    const parentSub = getNode(structureNode.parent);
    if (parentSub?.parent) {
      regionCode = parentSub.parent;
    } else if (parentSub?.level === 'region') {
      regionCode = parentSub.code;
    }
  }

  // 3. Si no hubo match directo de estructura, buscar la estructura más cercana dentro de la región
  if (!structureNode) {
    const regionStructures = getAllStructuresInRegion(regionCode);
    const preferredView: AnatomyView = z >= -0.005 ? 'anterior' : 'posterior';
    const viewFiltered = regionStructures.filter((s) => s.views.includes(preferredView));
    const candidates = viewFiltered.length > 0 ? viewFiltered : regionStructures;

    let bestDist = Infinity;
    for (const cand of candidates) {
      const anchor = cand.anchor?.[preferredView] || cand.anchor?.[cand.views[0]] || { x: 50, y: 50 };
      const dist = Math.hypot(anchor.x - coordX, anchor.y - coordY);
      if (dist < bestDist) {
        bestDist = dist;
        structureNode = cand;
      }
    }

    // Fallback seguro a la primera estructura del catálogo si la región no tuviera
    if (!structureNode) {
      structureNode = ANATOMY_TAXONOMY.find((n) => n.level === 'structure')!;
    }
  }

  const regionNode = getNode(regionCode);

  // 4. Determinar lateralidad cumpliendo estrictamente R-PAIN-02
  let laterality: Laterality = 'central';
  if (structureNode.lateral) {
    if (/\bright\b/i.test(part.name)) {
      laterality = 'D';
    } else if (/\bleft\b/i.test(part.name)) {
      laterality = 'I';
    } else {
      laterality = x <= 0 ? 'D' : 'I';
    }
  } else {
    laterality = 'central';
  }

  // 5. Determinar vista cumpliendo estrictamente R-PAIN-03
  const desiredView: AnatomyView = z >= -0.005 ? 'anterior' : 'posterior';
  const view: AnatomyView = structureNode.views.includes(desiredView)
    ? desiredView
    : structureNode.views[0] || 'anterior';

  return {
    regionCode,
    regionLabel: regionNode?.label || regionCode,
    structureCode: structureNode.code,
    structureLabel: structureNode.label,
    laterality,
    view,
    coordX,
    coordY,
    pos3d: center,
    atlasPartId: part.id,
    atlasPartName: part.name,
    atlasPartNameEs: translateAtlasNameEs(part.name),
    fmaId: part.conceptId,
    system: part.system,
  };
}
