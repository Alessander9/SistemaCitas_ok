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
/**
 * Motor Completo de Traducción Anatómica (BodyParts3D / FMA Inglés & Latín -> Español Latino Clínico).
 * Cubre las 2,234 mallas 3D y los 3,432 conceptos anatómicos con inversión gramatical e inflexión de género.
 */
const MULTIWORD_ANATOMICAL_ES: [RegExp, string][] = [
  // Músculos compuestos y términos latinos de extremidad superior, inferior, tronco y cabeza
  [/\biliocostalis lumborum\b/gi, 'músculo iliocostal lumbar'],
  [/\biliocostalis thoracis\b/gi, 'músculo iliocostal torácico'],
  [/\biliocostalis cervicis\b/gi, 'músculo iliocostal cervical'],
  [/\biliocostalis\b/gi, 'músculo iliocostal'],
  [/\blongissimus thoracis\b/gi, 'músculo longísimo torácico'],
  [/\blongissimus cervicis\b/gi, 'músculo longísimo cervical'],
  [/\blongissimus capitis\b/gi, 'músculo longísimo de la cabeza'],
  [/\blongissimus\b/gi, 'músculo longísimo'],
  [/\bspinalis thoracis\b/gi, 'músculo espinoso torácico'],
  [/\bspinalis cervicis\b/gi, 'músculo espinoso cervical'],
  [/\bspinalis capitis\b/gi, 'músculo espinoso de la cabeza'],
  [/\bsemispinalis capitis\b/gi, 'músculo semiespinoso de la cabeza'],
  [/\bsemispinalis cervicis\b/gi, 'músculo semiespinoso cervical'],
  [/\bsemispinalis thoracis\b/gi, 'músculo semiespinoso torácico'],
  [/\bsemispinalis\b/gi, 'músculo semiespinoso'],
  [/\bsplenius capitis\b/gi, 'músculo esplenio de la cabeza'],
  [/\bsplenius cervicis\b/gi, 'músculo esplenio del cuello'],
  [/\bsplenius\b/gi, 'músculo esplenio'],
  [/\bmultifidus\b/gi, 'músculo multífido'],
  [/\berector spinae\b/gi, 'músculo erector de la columna'],
  [/\blevatores costarum longi\b/gi, 'músculos elevadores largos de las costillas'],
  [/\blevatores costarum breves\b/gi, 'músculos elevadores cortos de las costillas'],
  [/\blevatores costarum\b/gi, 'músculos elevadores de las costillas'],
  [/\binterspinales\b/gi, 'músculos interespinosos'],
  [/\binterspinalis\b/gi, 'músculo interespinoso'],
  [/\bintertransversarii\b/gi, 'músculos intertransversos'],
  [/\bintertransversarius\b/gi, 'músculo intertransverso'],
  [/\bobliquus capitis superior\b/gi, 'músculo oblicuo superior de la cabeza'],
  [/\bobliquus capitis inferior\b/gi, 'músculo oblicuo inferior de la cabeza'],
  [/\brectus capitis posterior major\b/gi, 'músculo recto posterior mayor de la cabeza'],
  [/\brectus capitis posterior minor\b/gi, 'músculo recto posterior menor de la cabeza'],
  [/\brectus capitis anterior\b/gi, 'músculo recto anterior de la cabeza'],
  [/\brectus capitis lateralis\b/gi, 'músculo recto lateral de la cabeza'],
  [/\blongus colli\b/gi, 'músculo largo del cuello'],
  [/\blongus capitis\b/gi, 'músculo largo de la cabeza'],
  [/\blevator palpebrae superioris\b/gi, 'músculo elevador del párpado superior'],
  [/\blevator veli palatini\b/gi, 'músculo elevador del velo del paladar'],
  [/\btensor veli palatini\b/gi, 'músculo tensor del velo del paladar'],
  [/\blevator scapulae\b/gi, 'músculo elevador de la escápula'],
  [/\blevator ani\b/gi, 'músculo elevador del ano'],
  [/\bsupraspinatus\b/gi, 'músculo supraespinoso'],
  [/\binfraspinatus\b/gi, 'músculo infraespinoso'],
  [/\bsubscapularis\b/gi, 'músculo subescapular'],
  [/\bteres minor\b/gi, 'músculo redondo menor'],
  [/\bteres major\b/gi, 'músculo redondo mayor'],
  [/\bdeltoid\b/gi, 'músculo deltoides'],
  [/\btrapezius\b/gi, 'músculo trapecio'],
  [/\bsternocleidomastoid\b/gi, 'músculo esternocleidomastoideo (ECOM)'],
  [/\bscalenus anterior\b/gi, 'músculo escaleno anterior'],
  [/\bscalenus medius\b/gi, 'músculo escaleno medio'],
  [/\bscalenus posterior\b/gi, 'músculo escaleno posterior'],
  [/\bscalenus minimus\b/gi, 'músculo escaleno mínimo'],
  [/\bscalene|scalenus\b/gi, 'músculo escaleno'],
  [/\brhomboid major\b/gi, 'músculo romboides mayor'],
  [/\brhomboid minor\b/gi, 'músculo romboides menor'],
  [/\brhomboid\b/gi, 'músculo romboides'],
  [/\blatissimus dorsi\b/gi, 'músculo dorsal ancho'],
  [/\bpectoralis major\b/gi, 'músculo pectoral mayor'],
  [/\bpectoralis minor\b/gi, 'músculo pectoral menor'],
  [/\bsubclavius\b/gi, 'músculo subclavio'],
  [/\bserratus anterior\b/gi, 'músculo serrato anterior'],
  [/\bserratus posterior superior\b/gi, 'músculo serrato posterior superior'],
  [/\bserratus posterior inferior\b/gi, 'músculo serrato posterior inferior'],
  [/\bserratus posterior\b/gi, 'músculo serrato posterior'],
  [/\bbiceps brachii\b/gi, 'músculo bíceps braquial'],
  [/\btriceps brachii\b/gi, 'músculo tríceps braquial'],
  [/\bbrachialis\b/gi, 'músculo braquial'],
  [/\bcoracobrachialis\b/gi, 'músculo coracobraquial'],
  [/\banconeus\b/gi, 'músculo ancóneo'],
  [/\bbrachioradialis\b/gi, 'músculo braquiorradial'],
  [/\bpronator teres\b/gi, 'músculo pronador redondo'],
  [/\bpronator quadratus\b/gi, 'músculo pronador cuadrado'],
  [/\bsupinator\b/gi, 'músculo supinador'],
  [/\bflexor carpi radialis\b/gi, 'músculo flexor radial del carpo'],
  [/\bflexor carpi ulnaris\b/gi, 'músculo flexor cubital del carpo'],
  [/\bpalmaris longus\b/gi, 'músculo palmar largo'],
  [/\bpalmaris brevis\b/gi, 'músculo palmar corto'],
  [/\bflexor digitorum superficialis\b/gi, 'músculo flexor superficial de los dedos'],
  [/\bflexor digitorum profundus\b/gi, 'músculo flexor profundo de los dedos'],
  [/\bflexor digitorum longus\b/gi, 'músculo flexor largo de los dedos'],
  [/\bflexor digitorum brevis\b/gi, 'músculo flexor corto de los dedos'],
  [/\bflexor pollicis longus\b/gi, 'músculo flexor largo del pulgar'],
  [/\bflexor pollicis brevis\b/gi, 'músculo flexor corto del pulgar'],
  [/\babductor pollicis longus\b/gi, 'músculo abductor largo del pulgar'],
  [/\babductor pollicis brevis\b/gi, 'músculo abductor corto del pulgar'],
  [/\badductor pollicis\b/gi, 'músculo aductor del pulgar'],
  [/\bopponens pollicis\b/gi, 'músculo oponente del pulgar'],
  [/\bextensor pollicis longus\b/gi, 'músculo extensor largo del pulgar'],
  [/\bextensor pollicis brevis\b/gi, 'músculo extensor corto del pulgar'],
  [/\bextensor carpi radialis longus\b/gi, 'músculo extensor radial largo del carpo'],
  [/\bextensor carpi radialis brevis\b/gi, 'músculo extensor radial corto del carpo'],
  [/\bextensor carpi ulnaris\b/gi, 'músculo extensor cubital del carpo'],
  [/\bextensor digitorum longus\b/gi, 'músculo extensor largo de los dedos'],
  [/\bextensor digitorum brevis\b/gi, 'músculo extensor corto de los dedos'],
  [/\bextensor digitorum\b/gi, 'músculo extensor de los dedos'],
  [/\bextensor digiti minimi\b/gi, 'músculo extensor del meñique'],
  [/\bextensor indicis\b/gi, 'músculo extensor del índice'],
  [/\babductor digiti minimi\b/gi, 'músculo abductor del quinto dedo'],
  [/\bflexor digiti minimi brevis\b/gi, 'músculo flexor corto del quinto dedo'],
  [/\bopponens digiti minimi\b/gi, 'músculo oponente del meñique'],
  [/\bflexor accessorius\b/gi, 'músculo cuadrado plantar (flexor accesorio)'],
  [/\babductor hallucis\b/gi, 'músculo abductor del hallux'],
  [/\badductor hallucis\b/gi, 'músculo aductor del hallux'],
  [/\bflexor hallucis longus\b/gi, 'músculo flexor largo del hallux'],
  [/\bflexor hallucis brevis\b/gi, 'músculo flexor corto del hallux'],
  [/\bextensor hallucis longus\b/gi, 'músculo extensor largo del hallux'],
  [/\bextensor hallucis brevis\b/gi, 'músculo extensor corto del hallux'],
  [/\brectus abdominis\b/gi, 'músculo recto abdominal'],
  [/\bexternal oblique\b/gi, 'músculo oblicuo externo'],
  [/\binternal oblique\b/gi, 'músculo oblicuo interno'],
  [/\btransversus abdominis\b/gi, 'músculo transverso del abdomen'],
  [/\bquadratus lumborum\b/gi, 'músculo cuadrado lumbar'],
  [/\bpsoas major\b/gi, 'músculo psoas mayor'],
  [/\bpsoas minor\b/gi, 'músculo psoas menor'],
  [/\biliopsoas\b/gi, 'músculo psoas ilíaco'],
  [/\biliacus\b/gi, 'músculo ilíaco'],
  [/\bgluteus maximus\b/gi, 'músculo glúteo mayor'],
  [/\bgluteus medius\b/gi, 'músculo glúteo medio'],
  [/\bgluteus minimus\b/gi, 'músculo glúteo menor'],
  [/\bpiriformis\b/gi, 'músculo piramidal (piriforme)'],
  [/\btensor fasciae latae\b/gi, 'tensor de la fascia lata'],
  [/\bfascia lata\b/gi, 'fascia lata'],
  [/\biliotibial tract\b/gi, 'tracto iliotibial (cintilla de Maissiat)'],
  [/\bgemellus superior|superior gemellus\b/gi, 'músculo gémino superior'],
  [/\bgemellus inferior|inferior gemellus\b/gi, 'músculo gémino inferior'],
  [/\bobturator internus\b/gi, 'músculo obturador interno'],
  [/\bobturator externus\b/gi, 'músculo obturador externo'],
  [/\bquadratus femoris\b/gi, 'músculo cuadrado femoral'],
  [/\bquadriceps femoris\b/gi, 'músculo cuádriceps femoral'],
  [/\brectus femoris\b/gi, 'músculo recto femoral'],
  [/\bvastus lateralis\b/gi, 'músculo vasto lateral'],
  [/\bvastus medialis\b/gi, 'músculo vasto medial'],
  [/\bvastus intermedius\b/gi, 'músculo vasto intermedio'],
  [/\bsartorius\b/gi, 'músculo sartorio'],
  [/\bgracilis\b/gi, 'músculo grácil (recto interno)'],
  [/\badductor magnus\b/gi, 'músculo aductor mayor'],
  [/\badductor longus\b/gi, 'músculo aductor largo'],
  [/\badductor brevis\b/gi, 'músculo aductor corto'],
  [/\bpectineus\b/gi, 'músculo pectíneo'],
  [/\bbiceps femoris\b/gi, 'músculo bíceps femoral'],
  [/\bsemitendinosus\b/gi, 'músculo semitendinoso'],
  [/\bsemimembranosus\b/gi, 'músculo semimembranoso'],
  [/\bpopliteus\b/gi, 'músculo poplíteo'],
  [/\bgastrocnemius\b/gi, 'músculo gastrocnemio (gemelo)'],
  [/\bsoleus\b/gi, 'músculo sóleo'],
  [/\bplantaris\b/gi, 'músculo plantar delgado'],
  [/\btibialis anterior\b/gi, 'músculo tibial anterior'],
  [/\btibialis posterior\b/gi, 'músculo tibial posterior'],
  [/\bfibularis longus|peroneus longus\b/gi, 'músculo peroneo largo'],
  [/\bfibularis brevis|peroneus brevis\b/gi, 'músculo peroneo corto'],
  [/\bfibularis tertius|peroneus tertius\b/gi, 'músculo tercer peroneo'],
  [/\bcalcaneal tendon\b/gi, 'tendón calcáneo (de Aquiles)'],
  [/\blinea alba\b/gi, 'línea alba'],
  [/\bdura mater\b/gi, 'duramadre'],
  [/\btentorium cerebelli\b/gi, 'tienda del cerebelo'],
  [/\bcorpus callosum\b/gi, 'cuerpo calloso'],
  [/\bmedulla oblongata\b/gi, 'bulbo raquídeo (médula oblongada)'],
  [/\bglobus pallidus\b/gi, 'globo pálido'],
  [/\bconus medullaris\b/gi, 'cono medular'],
  [/\bconus elasticus\b/gi, 'cono elástico'],
  [/\bcavum|vena cava\b/gi, 'vena cava'],
  [/\bdorsalis pedis\b/gi, 'pedia dorsal'],
  [/\bprinceps pollicis\b/gi, 'principal del pulgar'],
  [/\bradialis indicis\b/gi, 'radial del índice'],
  [/\bcorpus cavernosum\b/gi, 'cuerpo cavernoso'],
  [/\bcorpus spongiosum\b/gi, 'cuerpo esponjoso'],
  [/\bmons pubis\b/gi, 'monte del pubis'],
  [/\btuber cinereum\b/gi, 'túber cinereum'],
  [/\bstria terminalis\b/gi, 'estría terminal'],
  [/\bcorona radiata\b/gi, 'corona radiada'],
  [/\bfornix\b/gi, 'fórnix'],
  [/\bputamen\b/gi, 'putamen'],
  [/\binsula\b/gi, 'ínsula'],
  [/\bpons\b/gi, 'puente troncoencefálico (protuberancia)'],
  [/\bthalamus\b/gi, 'tálamo'],
  [/\bhypothalamus\b/gi, 'hipotálamo'],
  [/\bepithalamus\b/gi, 'epitálamo'],
  [/\bhippocampus\b/gi, 'hipocampo'],
  [/\bamygdala\b/gi, 'amígdala cerebral'],
  [/\bcerebellum\b/gi, 'cerebelo'],
  [/\bforebrain\b/gi, 'prosencéfalo'],
  [/\bmidbrain\b/gi, 'mesencéfalo'],
  [/\bhindbrain\b/gi, 'rombencéfalo'],
  [/\bbrainstem\b/gi, 'tronco encefálico'],
  [/\btelencephalon\b/gi, 'telencéfalo'],
  [/\bdiencephalon\b/gi, 'diencéfalo'],
  [/\bmetencephalon\b/gi, 'metencéfalo'],
  [/\bneuraxis\b/gi, 'neuroeje'],
  [/\bwhite matter\b/gi, 'sustancia blanca'],
  [/\bgray matter\b/gi, 'sustancia gris'],
  [/\bspinal cord\b/gi, 'médula espinal'],
  [/\bvocal cord\b/gi, 'cuerda vocal'],
  [/\burinary bladder\b/gi, 'vejiga urinaria'],
  [/\bgallbladder\b/gi, 'vesícula biliar'],
  [/\bsmall intestine\b/gi, 'intestino delgado'],
  [/\blarge intestine\b/gi, 'intestino grueso'],
  [/\bindex finger\b/gi, 'dedo índice'],
  [/\bmiddle finger\b/gi, 'dedo medio'],
  [/\bring finger\b/gi, 'dedo anular'],
  [/\blittle finger\b/gi, 'dedo meñique'],
  [/\bbig toe\b/gi, 'dedo gordo del pie (hallux)'],
  [/\blittle toe\b/gi, 'quinto dedo del pie'],
  [/\bhip bone\b/gi, 'hueso coxal (ilíaco)'],
  [/\beyeball\b/gi, 'globo ocular'],
  [/\beyelid\b/gi, 'párpado'],
  [/\beyebrow\b/gi, 'ceja'],
  [/\bplatysma\b/gi, 'músculo platisma'],
  [/\bmasseter\b/gi, 'músculo masetero'],
  [/\btemporalis\b/gi, 'músculo temporal'],
  [/\bdigastric\b/gi, 'músculo digástrico'],
  [/\bmylohyoid\b/gi, 'músculo milohioideo'],
  [/\bgeniohyoid\b/gi, 'músculo genihioideo'],
  [/\bstylohyoid\b/gi, 'músculo estilohioideo'],
  [/\bsternohyoid\b/gi, 'músculo esternohioideo'],
  [/\bsternothyroid\b/gi, 'músculo esternotiroideo'],
  [/\bthyrohyoid\b/gi, 'músculo tirohioideo'],
  [/\bomohyoid\b/gi, 'músculo omohioideo'],
  [/\bgenioglossus\b/gi, 'músculo geniogloso'],
  [/\bhyoglossus\b/gi, 'músculo hiogloso'],
  [/\bstylopharyngeus\b/gi, 'músculo estilofaríngeo'],
  [/\bpalatopharyngeus\b/gi, 'músculo palatofaríngeo'],
  [/\bsalpingopharyngeus\b/gi, 'músculo salpingofaríngeo'],
  [/\bcricothyroid\b/gi, 'músculo cricotiroideo'],
  [/\baryepiglotticus\b/gi, 'músculo aritenoepiglótico'],
  [/\bvocalis\b/gi, 'músculo vocal'],
  [/\bpubococcygeus\b/gi, 'músculo pubococcígeo'],
  [/\biliococcygeus\b/gi, 'músculo iliococcígeo'],
  [/\bpuborectalis\b/gi, 'músculo puborrectal'],
  [/\bcoccygeus\b/gi, 'músculo coccígeo'],
];

const WORD_ES_MAP: Record<string, string> = {
  // Sustantivos principales
  artery: 'arteria',
  arteria: 'arteria',
  arteries: 'arterias',
  vein: 'vena',
  veins: 'venas',
  nerve: 'nervio',
  branch: 'rama',
  branches: 'ramas',
  tributary: 'tributaria',
  trunk: 'tronco',
  part: 'porción',
  parts: 'porciones',
  portion: 'porción',
  subdivision: 'subdivisión',
  subdivisionof: 'subdivisión de',
  division: 'división',
  segment: 'segmento',
  subsector: 'subsector',
  sector: 'sector',
  zone: 'zona',
  region: 'región',
  regions: 'regiones',
  muscle: 'músculo',
  musculature: 'musculatura',
  bone: 'hueso',
  bones: 'huesos',
  skeleton: 'esqueleto',
  ligament: 'ligamento',
  tendon: 'tendón',
  cartilage: 'cartílago',
  fascia: 'fascia',
  retinaculum: 'retináculo',
  membrane: 'membrana',
  capsule: 'cápsula',
  aponeurosis: 'aponeurosis',
  raphe: 'rafe',
  disk: 'disco',
  disc: 'disco',
  meniscus: 'menisco',
  joint: 'articulación',
  symphysis: 'sínfisis',
  vertebra: 'vértebra',
  vertebrae: 'vértebras',
  rib: 'costilla',
  sternum: 'esternón',
  manubrium: 'manubrio',
  clavicle: 'clavícula',
  scapula: 'escápula',
  scapulae: 'escápula',
  humerus: 'húmero',
  radius: 'radio',
  ulna: 'cúbito',
  carpi: 'del carpo',
  metacarpal: 'metacarpiano',
  phalanx: 'falange',
  femur: 'fémur',
  femoris: 'femoral',
  patella: 'rótula',
  tibia: 'tibia',
  fibula: 'peroné',
  talus: 'astrágalo',
  calcaneus: 'calcáneo',
  navicular: 'navicular (escafoides)',
  cuboid: 'cuboides',
  cuneiform: 'cuneiforme',
  scaphoid: 'escafoides',
  lunate: 'semilunar',
  triquetral: 'piramidal del carpo',
  pisiform: 'pisiforme',
  trapezium: 'trapecio del carpo',
  trapezoid: 'trapezoide',
  capitate: 'hueso grande',
  hamate: 'ganchoso',
  metatarsal: 'metatarsiano',
  tarsal: 'tarsiano',
  carpal: 'carpiano',
  pelvis: 'pelvis',
  sacrum: 'sacro',
  coccyx: 'coxis',
  atlas: 'atlas (C1)',
  axis: 'axis (C2)',
  skull: 'cráneo',
  neurocranium: 'neurocráneo',
  viscerocranium: 'viscerocráneo',
  basicranium: 'base del cráneo',
  mandible: 'mandíbula',
  maxilla: 'maxilar',
  vomer: 'vómer',
  ethmoid: 'etmoides',
  sphenoid: 'esfenoides',
  hyoid: 'hioides',
  tooth: 'diente',
  molar: 'molar',
  premolar: 'premolar',
  incisor: 'incisivo',
  canine: 'canino',
  gingiva: 'encía',
  jaw: 'mandíbula',
  mouth: 'boca',
  lip: 'labio',
  cheek: 'mejilla',
  tongue: 'lengua',
  palate: 'paladar',
  uvula: 'úvula',
  pharynx: 'faringe',
  laryngopharynx: 'laringofaringe',
  larynx: 'laringe',
  epiglottis: 'epiglotis',
  trachea: 'tráquea',
  bronchus: 'bronquio',
  lung: 'pulmón',
  diaphragm: 'diafragma',
  mediastinum: 'mediastino',
  heart: 'corazón',
  myocardium: 'miocardio',
  atrium: 'aurícula',
  ventricle: 'ventrículo',
  valve: 'válvula',
  cusp: 'cúspide',
  leaflet: 'valva',
  aorta: 'aorta',
  esophagus: 'esófago',
  stomach: 'estómago',
  duodenum: 'duodeno',
  jejunum: 'yeyuno',
  ileum: 'íleon',
  cecum: 'ciego',
  appendix: 'apéndice',
  colon: 'colon',
  rectum: 'recto',
  liver: 'hígado',
  hemiliver: 'hemihígado',
  pancreas: 'páncreas',
  spleen: 'bazo',
  kidney: 'riñón',
  ureter: 'uréter',
  urethra: 'uretra',
  prostate: 'próstata',
  testis: 'testículo',
  epididymis: 'epidídimo',
  penis: 'pene',
  glans: 'glande',
  vesicle: 'vesícula',
  peritoneum: 'peritoneo',
  mesentery: 'mesenterio',
  mesocolon: 'mesocolon',
  mesoappendix: 'mesoapéndice',
  perineum: 'periné',
  thymus: 'timo',
  thyroid: 'tiroides',
  gland: 'glándula',
  duct: 'conducto',
  canaliculus: 'canalículo',
  canal: 'canal',
  sinus: 'seno',
  foramen: 'foramen',
  fossa: 'fosa',
  cavity: 'cavidad',
  chamber: 'cámara',
  space: 'espacio',
  wall: 'pared',
  septum: 'tabique',
  arch: 'arco',
  ring: 'anillo',
  circle: 'círculo',
  loop: 'asa',
  plexus: 'plexo',
  ganglion: 'ganglio',
  nucleus: 'núcleo',
  cortex: 'corteza',
  subcortex: 'subcorteza',
  archicortex: 'arquicorteza',
  gyrus: 'giro',
  sulcus: 'surco',
  lobe: 'lóbulo',
  lobule: 'lobulillo',
  hemisphere: 'hemisferio',
  commissure: 'comisura',
  decussation: 'decusación',
  peduncle: 'pedúnculo',
  colliculus: 'colículo',
  tectum: 'techo mesencefálico',
  aqueduct: 'acueducto',
  chiasm: 'quiasma',
  habenula: 'habénula',
  tract: 'tracto',
  column: 'columna',
  stria: 'estría',
  lamina: 'lámina',
  layer: 'capa',
  plate: 'placa',
  process: 'proceso',
  incisure: 'escotadura',
  trochlea: 'tróclea',
  head: 'cabeza',
  neck: 'cuello',
  body: 'cuerpo',
  limb: 'miembro',
  girdle: 'cintura',
  shoulder: 'hombro',
  arm: 'brazo',
  brachium: 'brazo',
  brachii: 'braquial',
  forearm: 'antebrazo',
  elbow: 'codo',
  wrist: 'muñeca',
  hand: 'mano',
  finger: 'dedo de la mano',
  thumb: 'pulgar',
  pollicis: 'del pulgar',
  indicis: 'del índice',
  digitorum: 'de los dedos',
  digiti: 'del dedo',
  minimi: 'quinto (meñique)',
  thorax: 'tórax',
  thoracis: 'torácico',
  chest: 'tórax',
  abdomen: 'abdomen',
  back: 'espalda',
  hip: 'cadera',
  thigh: 'muslo',
  knee: 'rodilla',
  leg: 'pierna',
  foot: 'pie',
  pedis: 'del pie',
  toe: 'dedo del pie',
  hallucis: 'del hallux',
  face: 'cara',
  nose: 'nariz',
  concha: 'cornete',
  eye: 'ojo',
  orbit: 'órbita',
  cornea: 'córnea',
  sclera: 'esclerótica',
  iris: 'iris',
  retina: 'retina',
  lens: 'cristalino',
  choroid: 'coroides',
  ear: 'oído',
  skin: 'piel',
  integument: 'tegumento',
  epidermis: 'epidermis',
  epithelium: 'epitelio',
  hair: 'pelo',
  hairs: 'pelos',
  tissue: 'tejido',
  parenchyma: 'parénquima',
  organ: 'órgano',
  organs: 'órganos',
  system: 'sistema',
  apparatus: 'aparato',
  vasculature: 'vasculatura',
  network: 'red',
  tree: 'árbol',
  set: 'conjunto',
  cluster: 'grupo',
  clusters: 'grupos',
  compartment: 'compartimento',
  content: 'contenido',
  component: 'componente',
  structure: 'estructura',
  entity: 'entidad',
  complex: 'complejo',
  formation: 'formación',
  junction: 'unión',
  anastomosis: 'anastomosis',
  boundary: 'límite',
  line: 'línea',
  side: 'lado',
  dorsum: 'dorso',
  root: 'raíz',
  leaf: 'hoja',
  curtain: 'cortina',
  cage: 'caja',
  lake: 'lago',
  sac: 'saco',
  cell: 'célula',
  material: 'material',
  continuity: 'continuidad',
  conduit: 'conducto',
  appendage: 'apéndice',
  variant: 'variante',
  inflow: 'flujo de entrada',
  outflow: 'flujo de salida',
  brain: 'encéfalo (cerebro)',
  sphincter: 'esfínter',
  constrictor: 'constrictor',
  rotator: 'rotador',
  flexor: 'flexor',
  extensor: 'extensor',
  abductor: 'abductor',
  adductor: 'aductor',
  levator: 'elevador',
  tensor: 'tensor',
  opponens: 'oponente',
  lumbrical: 'lumbrical',
  lumbricals: 'lumbricales',
  interosseous: 'interóseo',
  interossei: 'interóseos',

  // Adjetivos, posiciones y ordinales
  anterior: 'anterior',
  posterior: 'posterior',
  superior: 'superior',
  superioris: 'superior',
  inferior: 'inferior',
  medial: 'medial',
  medialis: 'medial',
  lateral: 'lateral',
  lateralis: 'lateral',
  middle: 'medio',
  medius: 'medio',
  intermediate: 'intermedio',
  intermedius: 'intermedio',
  internal: 'interno',
  internus: 'interno',
  external: 'externo',
  externus: 'externo',
  superficial: 'superficial',
  superficialis: 'superficial',
  deep: 'profundo',
  profundus: 'profundo',
  proximal: 'proximal',
  distal: 'distal',
  central: 'central',
  apical: 'apical',
  basal: 'basal',
  dorsal: 'dorsal',
  dorsalis: 'dorsal',
  palmar: 'palmar',
  plantar: 'plantar',
  transverse: 'transverso',
  transversus: 'transverso',
  oblique: 'oblicuo',
  obliquus: 'oblicuo',
  rectus: 'recto',
  straight: 'recto',
  ascending: 'ascendente',
  descending: 'descendente',
  recurrent: 'recurrente',
  circumflex: 'circunflejo',
  collateral: 'colateral',
  communicating: 'comunicante',
  perforating: 'perforante',
  precommunicating: 'precomunicante',
  postcommunicating: 'poscomunicante',
  marginal: 'marginal',
  supramarginal: 'supramarginal',
  callosomarginal: 'callosomarginal',
  pericallosal: 'pericalloso',
  segmental: 'segmentario',
  subsegmental: 'subsegmentario',
  lobar: 'lobar',
  lobular: 'lobulillar',
  intervertebral: 'intervertebral',
  prevertebral: 'prevertebral',
  postvertebral: 'posvertebral',
  vertebral: 'vertebral',
  spinal: 'espinal',
  cervical: 'cervical',
  cervicis: 'cervical',
  colli: 'del cuello',
  capitis: 'de la cabeza',
  thoracic: 'torácico',
  lumbar: 'lumbar',
  lumborum: 'lumbar',
  sacral: 'sacro',
  pelvic: 'pélvico',
  cranial: 'craneal',
  intracranial: 'intracraneal',
  basicranial: 'basicraneal',
  facial: 'facial',
  frontal: 'frontal',
  prefrontal: 'prefrontal',
  frontobasal: 'frontobasal',
  parietal: 'parietal',
  temporal: 'temporal',
  temporo: 'témporo',
  occipital: 'occipital',
  suboccipital: 'suboccipital',
  sphenoidal: 'esfenoidal',
  ethmoidal: 'etmoidal',
  maxillary: 'maxilar',
  mandibular: 'mandibular',
  zygomatic: 'cigomático',
  nasal: 'nasal',
  orbital: 'orbitario',
  ocular: 'ocular',
  optic: 'óptico',
  ophthalmic: 'oftálmico',
  lacrimal: 'lagrimal',
  nasolacrimal: 'nasolagrimal',
  nasociliary: 'nasociliar',
  ciliary: 'ciliar',
  ciliaris: 'ciliar',
  oculomotor: 'oculomotor',
  trochlear: 'troclear',
  supratrochlear: 'supratroclear',
  infratrochlear: 'infratroclear',
  trigeminal: 'trigémino',
  auriculotemporal: 'auriculotemporal',
  palatine: 'palatino',
  palatini: 'del paladar',
  veli: 'del velo',
  pharyngeal: 'faríngeo',
  laryngeal: 'laríngeo',
  epiglottic: 'epiglótico',
  arytenoid: 'aritenoideo',
  cricoid: 'cricoideo',
  crico: 'crico',
  corniculate: 'corniculado',
  thyro: 'tiro',
  thyrocervical: 'tirocervical',
  costocervical: 'costocervical',
  suprahyoid: 'suprahioideo',
  infrahyoid: 'infrahioideo',
  hyo: 'hio',
  submandibular: 'submandibular',
  sublingual: 'sublingual',
  salivary: 'salival',
  carotid: 'carotídeo',
  jugular: 'yugular',
  subclavian: 'subclavio',
  brachiocephalic: 'braquiocefálico',
  axillary: 'axilar',
  acromial: 'acromial',
  thoraco: 'tóraco',
  thoracodorsal: 'toracodorsal',
  suprascapular: 'supraescapular',
  subscapular: 'subescapular',
  scapular: 'escapular',
  clavicular: 'clavicular',
  sternal: 'esternal',
  sternocostal: 'esternocostal',
  xiphoid: 'xifoides',
  costal: 'costal',
  costarum: 'de las costillas',
  intercostal: 'intercostal',
  subcostal: 'subcostal',
  pectoral: 'pectoral',
  pectoralis: 'pectoral',
  humeral: 'humeral',
  brachial: 'braquial',
  antebrachial: 'antebraquial',
  cubital: 'cubital',
  radial: 'radial',
  radialis: 'radial',
  ulnar: 'cubital',
  ulnaris: 'cubital',
  median: 'mediano',
  cephalic: 'cefálico',
  basilic: 'basílico',
  thenar: 'tenar',
  hypothenar: 'hipotenar',
  digital: 'digital',
  Bronchial: 'bronquial',
  bronchial: 'bronquial',
  tracheobronchial: 'traqueobronquial',
  bronchopulmonary: 'broncopulmonar',
  pulmonary: 'pulmonar',
  intrapulmonary: 'intrapulmonar',
  pulmopleural: 'pulmopleural',
  cardiac: 'cardíaco',
  myocardial: 'miocárdico',
  subendocardial: 'subendocárdico',
  coronary: 'coronario',
  aortic: 'aórtico',
  subaortic: 'subaórtico',
  interventricular: 'interventricular',
  ventricular: 'ventricular',
  septal: 'septal',
  papillary: 'papilar',
  mitral: 'mitral',
  tricuspid: 'tricúspide',
  caval: 'cava',
  cava: 'cava',
  azygos: 'ácigos',
  hemiazygos: 'hemiácigos',
  musculophrenic: 'musculofrénico',
  phrenic: 'frénico',
  esophageal: 'esofágico',
  oesophageal: 'esofágico',
  abdominal: 'abdominal',
  epigastric: 'epigástrico',
  celiac: 'celíaco',
  coeliac: 'celíaco',
  gastric: 'gástrico',
  gastro: 'gastro',
  gastroduodenal: 'gastroduodenal',
  gastroepiploic: 'gastroepiploico',
  epiploic: 'epiploico',
  omentalis: 'omental',
  splenic: 'esplénico',
  hepatic: 'hepático',
  intrahepatic: 'intrahepático',
  extrahepatic: 'extrahepático',
  hepatovenous: 'hepatovenoso',
  biliary: 'biliar',
  cystic: 'cístico',
  bile: 'biliar',
  portal: 'porta',
  pancreatic: 'pancreático',
  pancreaticoduodenal: 'pancreatoduodenal',
  pancreaticobiliary: 'pancreatobiliar',
  mesenteric: 'mesentérico',
  mesocolica: 'mesocólica',
  colic: 'cólico',
  coli: 'del colon',
  ileocolic: 'ileocólico',
  ileocecal: 'ileocecal',
  ileal: 'ileal',
  cecal: 'cecal',
  sigmoid: 'sigmoideo',
  rectal: 'rectal',
  anal: 'anal',
  ani: 'del ano',
  renal: 'renal',
  suprarenal: 'suprarrenal',
  adrenal: 'adrenal',
  ureteric: 'ureteral',
  urinary: 'urinario',
  iliac: 'ilíaco',
  iliolumbar: 'iliolumbar',
  pudendal: 'pudendo',
  testicular: 'testicular',
  deferent: 'deferente',
  seminal: 'seminal',
  perineal: 'perineal',
  peritoneal: 'peritoneal',
  pubic: 'púbico',
  pubis: 'del pubis',
  obturator: 'obturador',
  gluteal: 'glúteo',
  gluteus: 'glúteo',
  femoral: 'femoral',
  popliteal: 'poplíteo',
  genicular: 'genicular',
  geniculate: 'geniculado',
  patellar: 'rotuliano',
  tibial: 'tibial',
  fibular: 'peroneo',
  calcaneal: 'calcáneo',
  saphenous: 'safeno',
  cerebral: 'cerebral',
  cerebellar: 'cerebeloso',
  cerebelli: 'del cerebelo',
  pontine: 'pontino',
  basilar: 'basilar',
  choroidal: 'coroideo',
  thalamoperforating: 'talamoperforante',
  thalamogeniculate: 'talamogeniculado',
  hypothalamic: 'hipotalámico',
  pituitary: 'hipofisario',
  pineal: 'pineal',
  mammillary: 'mamilar',
  hippocampal: 'hipocampal',
  parahippocampal: 'parahipocampal',
  cingulate: 'del cíngulo',
  insular: 'insular',
  precentral: 'precentral',
  postcentral: 'poscentral',
  paracentral: 'paracentral',
  precuneal: 'precuneal',
  fusiform: 'fusiforme',
  angular: 'angular',
  splenial: 'esplenial',
  vermian: 'vermiano',
  limbic: 'límbico',
  subarachnoid: 'subaracnoideo',
  interpeduncular: 'interpeduncular',
  circumventricular: 'circunventricular',
  autonomic: 'autónomo',
  parasympathetic: 'parasimpático',
  neural: 'neural',
  nervous: 'nervioso',
  arterial: 'arterial',
  venous: 'venoso',
  vascular: 'vascular',
  systemic: 'sistémico',
  cardiovascular: 'cardiovascular',
  respiratory: 'respiratorio',
  gastrointestinal: 'gastrointestinal',
  alimentary: 'alimentario',
  endocrine: 'endocrino',
  genital: 'genital',
  skeletal: 'esquelético',
  nonskeletal: 'no esquelético',
  musculoskeletal: 'musculoesquelético',
  connective: 'conectivo',
  integumentary: 'tegumentario',
  anatomical: 'anatómico',
  human: 'humano',
  physical: 'físico',
  proper: 'propio',
  main: 'principal',
  common: 'común',
  major: 'mayor',
  maximus: 'mayor',
  magnus: 'mayor',
  minor: 'menor',
  minimus: 'menor',
  long: 'largo',
  longus: 'largo',
  longi: 'largos',
  short: 'corto',
  brevis: 'corto',
  breves: 'cortos',
  great: 'mayor',
  large: 'grande',
  big: 'mayor',
  small: 'pequeño',
  little: 'menor',
  upper: 'superior',
  lower: 'inferior',
  innermost: 'íntimo',
  intrinsic: 'intrínseco',
  extrinsic: 'extrínseco',
  free: 'libre',
  libera: 'libre',
  floating: 'flotante',
  true: 'verdadero',
  false: 'falso',
  typical: 'típico',
  atypical: 'atípico',
  regular: 'regular',
  irregular: 'irregular',
  flat: 'plano',
  solid: 'sólido',
  hollow: 'hueco',
  soft: 'blando',
  loose: 'laxo',
  fibrous: 'fibroso',
  cartilaginous: 'cartilaginoso',
  osseous: 'óseo',
  bony: 'óseo',
  tendinous: 'tendinoso',
  fascial: 'fascial',
  membranous: 'membranoso',
  serous: 'seroso',
  mucoid: 'mucoide',
  cavernous: 'cavernoso',
  cavernosum: 'cavernoso',
  spongiosum: 'esponjoso',
  cavitated: 'cavitado',
  pneumatized: 'neumatizado',
  parenchymatous: 'parenquimatoso',
  nonparenchymatous: 'no parenquimatoso',
  corticomedullary: 'corticomedular',
  heterogeneous: 'heterogéneo',
  immaterial: 'inmaterial',
  nuclear: 'nuclear',
  visceral: 'visceral',
  articular: 'articular',
  sesamoid: 'sesamoideo',
  suspensory: 'suspensorio',
  investing: 'de revestimiento',
  check: 'de contención',
  alar: 'alar',
  arcuate: 'arqueado',
  caudate: 'caudado',
  caudal: 'caudal',
  lingular: 'lingular',
  uvular: 'uvular',
  faucial: 'faucial',
  taenia: 'tenia',
  cardinal: 'cardinal',
  diagonal: 'diagonal',
  vertical: 'vertical',
  axial: 'axial',
  appendicular: 'apendicular',
  polar: 'polar',
  terminal: 'terminal',
  terminalis: 'terminal',
  accessory: 'accesorio',
  accessorius: 'accesorio',
  tertius: 'tercero',
  supreme: 'supremo',
  subsuperior: 'subsuperior',
  anterolateral: 'anterolateral',
  antero: 'antero',
  posteromedial: 'posteromedial',
  inferomedial: 'inferomedial',
  intermediomedial: 'intermediomedial',
  mediobasal: 'mediobasal',
  laterobasal: 'laterobasal',
  apicoposterior: 'apicoposterior',
  secondary: 'secundario',
  first: '1.º',
  second: '2.º',
  third: '3.º',
  fourth: '4.º',
  fifth: '5.º',
  sixth: '6.º',
  seventh: '7.º',
  eighth: '8.º',
  ninth: '9.º',
  tenth: '10.º',
  eleventh: '11.º',
  twelfth: '12.º',
  ii: 'II',
  iii: 'III',
  iv: 'IV',
  v: 'V',
  vi: 'VI',
  vii: 'VII',
  viii: 'VIII',
  ix: 'IX',
};

const FEMININE_HEAD_NOUNS = new Set([
  'arteria',
  'arterias',
  'vena',
  'venas',
  'rama',
  'ramas',
  'tributaria',
  'porción',
  'porciones',
  'subdivisión',
  'división',
  'zona',
  'región',
  'regiones',
  'musculatura',
  'fascia',
  'membrana',
  'cápsula',
  'aponeurosis',
  'articulación',
  'sínfisis',
  'vértebra',
  'vértebras',
  'costilla',
  'clavícula',
  'escápula',
  'falange',
  'rótula',
  'tibia',
  'pelvis',
  'mandíbula',
  'encía',
  'boca',
  'mejilla',
  'lengua',
  'úvula',
  'faringe',
  'laringofaringe',
  'laringe',
  'epiglotis',
  'tráquea',
  'aurícula',
  'válvula',
  'cúspide',
  'valva',
  'aorta',
  'vesícula',
  'uretra',
  'próstata',
  'glándula',
  'fosa',
  'cavidad',
  'cámara',
  'pared',
  'asa',
  'corteza',
  'subcorteza',
  'arquicorteza',
  'comisura',
  'decusación',
  'habénula',
  'columna',
  'estría',
  'lámina',
  'capa',
  'placa',
  'escotadura',
  'tróclea',
  'cabeza',
  'cintura',
  'muñeca',
  'mano',
  'espalda',
  'cadera',
  'rodilla',
  'pierna',
  'cara',
  'nariz',
  'órbita',
  'córnea',
  'esclerótica',
  'retina',
  'coroides',
  'piel',
  'epidermis',
  'vasculatura',
  'red',
  'estructura',
  'entidad',
  'formación',
  'unión',
  'anastomosis',
  'línea',
  'raíz',
  'hoja',
  'cortina',
  'caja',
  'célula',
  'continuidad',
  'variante',
  'tenia',
]);

function inflectSpanishAdjective(word: string, isFem: boolean): string {
  if (!isFem) return word;
  if (word.endsWith('o') && !word.endsWith('.º')) {
    return word.slice(0, -1) + 'a';
  }
  if (word.endsWith('os')) {
    return word.slice(0, -2) + 'as';
  }
  if (word.endsWith('or') && !['anterior', 'posterior', 'superior', 'inferior', 'mayor', 'menor', 'interior', 'exterior'].includes(word)) {
    return word + 'a';
  }
  return word;
}

function translateSingleClauseEs(clause: string): string {
  let text = clause.trim();
  if (!text) return '';

  // Extraer lateralidad al inicio o interna
  let side: 'right' | 'left' | null = null;
  if (/\bright\b/i.test(text)) {
    side = 'right';
    text = text.replace(/\bright\b/gi, '').replace(/\s+/g, ' ').trim();
  } else if (/\bleft\b/i.test(text)) {
    side = 'left';
    text = text.replace(/\bleft\b/gi, '').replace(/\s+/g, ' ').trim();
  }

  // Reemplazar compuestos multipalabra conocidos
  for (const [regex, replacement] of MULTIWORD_ANATOMICAL_ES) {
    if (regex.test(text)) {
      text = text.replace(regex, replacement);
    }
  }

  // Si ya contiene palabras en español con acento o fue totalmente traducido como compuesto,
  // traducir cualquier token inglés restante alrededor
  const rawTokens = text
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (rawTokens.length === 0) {
    return side === 'right' ? 'Derecho' : side === 'left' ? 'Izquierdo' : '';
  }

  // Verificar si el último token es un sustantivo inglés que debe pasar al inicio
  const lastLower = rawTokens[rawTokens.length - 1].toLowerCase();
  const isEnglishHeadNoun =
    rawTokens.length > 1 &&
    Object.prototype.hasOwnProperty.call(WORD_ES_MAP, lastLower) &&
    [
      'artery', 'arteria', 'arteries', 'vein', 'veins', 'nerve', 'branch', 'branches',
      'tributary', 'trunk', 'part', 'parts', 'portion', 'subdivision', 'division',
      'segment', 'subsector', 'sector', 'zone', 'region', 'regions', 'muscle',
      'musculature', 'bone', 'skeleton', 'ligament', 'tendon', 'cartilage', 'fascia',
      'retinaculum', 'membrane', 'capsule', 'disk', 'disc', 'joint', 'symphysis',
      'vertebra', 'vertebrae', 'rib', 'metacarpal', 'phalanx', 'metatarsal', 'tooth',
      'molar', 'premolar', 'incisor', 'canine', 'lobe', 'lobule', 'gyrus', 'sulcus',
      'ventricle', 'atrium', 'valve', 'cusp', 'leaflet', 'duct', 'gland', 'ganglion',
      'nucleus', 'plexus', 'sinus', 'foramen', 'fossa', 'cavity', 'chamber', 'space',
      'wall', 'septum', 'arch', 'ring', 'circle', 'column', 'tract', 'lamina', 'layer',
      'plate', 'process', 'trochlea', 'head', 'neck', 'body', 'limb', 'girdle', 'hand',
      'finger', 'foot', 'toe', 'organ', 'organs', 'system', 'apparatus', 'network',
      'tree', 'set', 'cluster', 'clusters', 'compartment', 'content', 'component',
      'structure', 'entity', 'complex', 'formation', 'junction', 'anastomosis',
      'boundary', 'line', 'side', 'root', 'cage', 'sac', 'cell', 'conduit', 'constrictor',
      'sphincter', 'Bronchial', 'bronchus', 'lung', 'kidney', 'colon', 'hemisphere',
      'commissure', 'peduncle', 'colliculus', 'cortex', 'matter',
    ].includes(lastLower);

  let orderedSpanishTokens: string[] = [];
  let isFem = false;

  if (isEnglishHeadNoun) {
    const headEs = WORD_ES_MAP[lastLower];
    const firstWordOfHead = headEs.split(' ')[0].toLowerCase();
    isFem = FEMININE_HEAD_NOUNS.has(firstWordOfHead);
    const ordinals: string[] = [];
    const adjectives: string[] = [];
    for (const tok of rawTokens.slice(0, -1)) {
      const low = tok.toLowerCase();
      const mapped = WORD_ES_MAP[low] ?? tok;
      const inflected = inflectSpanishAdjective(mapped, isFem);
      if (inflected.endsWith('.º')) {
        ordinals.push(inflected);
      } else {
        adjectives.push(inflected);
      }
    }
    adjectives.reverse();
    orderedSpanishTokens = [...ordinals, headEs, ...adjectives];
  } else {
    const mappedTokens = rawTokens.map((tok) => {
      const low = tok.toLowerCase();
      return WORD_ES_MAP[low] ?? tok;
    });
    const firstWord = mappedTokens[0].split(' ')[0].toLowerCase();
    isFem = FEMININE_HEAD_NOUNS.has(firstWord);
    orderedSpanishTokens = mappedTokens.map((w, idx) =>
      idx === 0 ? w : inflectSpanishAdjective(w, isFem),
    );
  }

  let result = orderedSpanishTokens.join(' ').replace(/\s+/g, ' ').trim();
  if (side === 'right') {
    result += isFem ? ' derecha' : ' derecho';
  } else if (side === 'left') {
    result += isFem ? ' izquierda' : ' izquierdo';
  }
  return result;
}

export function translateAtlasNameEs(englishName: string): string {
  if (!englishName) return '';
  const cleaned = englishName
    .replace(/\bin vivo\b/gi, 'in vivo')
    .replace(/\bsubdivisionof\b/gi, 'subdivision of')
    .trim();

  // Dividir por conectores preposicionales (" of ", " with ", " to ", " in ")
  const parts = cleaned.split(/\s+(of|with|to|in)\s+/i);
  const translatedChunks: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const token = parts[i];
    const low = token.toLowerCase();
    if (i % 2 === 1) {
      if (low === 'of') translatedChunks.push('de');
      else if (low === 'with') translatedChunks.push('con');
      else if (low === 'to') translatedChunks.push('a');
      else if (low === 'in') translatedChunks.push('en');
    } else {
      translatedChunks.push(translateSingleClauseEs(token));
    }
  }

  const joined = translatedChunks.join(' ').replace(/\s+/g, ' ').trim();
  return joined.charAt(0).toUpperCase() + joined.slice(1);
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
