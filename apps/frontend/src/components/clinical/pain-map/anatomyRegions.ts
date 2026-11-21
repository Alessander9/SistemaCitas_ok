// apps/frontend/src/components/clinical/pain-map/anatomyRegions.ts
// 12 Prioritized Clinical Dissection Regions for Physical Therapy & Rehabilitation.
// Contains layered stratification: Superficial, Intermediate, Deep, and Key Landmarks.
// Option A: Structures lacking 3D meshes in BodyParts3D are modeled as Virtual Landmarks.

export interface RegionalLayerItem {
  id: string; // FMA concept ID, part name pattern, or virtual ID
  labelEs: string;
  detailEs?: string;
  isVirtual?: boolean;
  virtualOffset?: [number, number, number]; // Offset relative to region center
  normal?: [number, number, number]; // Orientation normal for camera facing
  fmaConceptPattern?: RegExp;
  partNamePattern?: RegExp;
}

export interface RegionalDissectionDef {
  code: string;
  nameEs: string;
  subtitleEs: string;
  regionClinicalCode: string;
  targetKeywords: RegExp; // Matches part names triggering this region
  cameraPreset: {
    azimuth: number; // degrees
    elevation: number;
    distanceMultiplier: number;
  };
  superficial: RegionalLayerItem[];
  intermedio: RegionalLayerItem[];
  profundo: RegionalLayerItem[];
  estructurasClave: RegionalLayerItem[];
}

export const CURATED_DISSECTION_REGIONS: RegionalDissectionDef[] = [
  // 1. PARED ABDOMINAL LATERAL (Matches the user's reference image exactly)
  {
    code: 'pared_abdominal_lateral',
    nameEs: 'Pared Abdominal Lateral',
    subtitleEs: 'Principales músculos y planos',
    regionClinicalCode: 'reg-lumbar',
    targetKeywords: /external oblique|abdomin.*wall|iliocostalis lumborum/i,
    cameraPreset: { azimuth: 35, elevation: 10, distanceMultiplier: 1.15 },
    superficial: [
      {
        id: 'oblicuo_externo',
        labelEs: 'Oblicuo externo del abdomen',
        detailEs: 'Plano superficial',
        partNamePattern: /external oblique/i,
      },
      {
        id: 'serrato_anterior_inf',
        labelEs: 'Serrato anterior',
        detailEs: 'Porción inferior',
        partNamePattern: /serratus anterior/i,
      },
      {
        id: 'dorsal_ancho_ant',
        labelEs: 'Dorsal ancho',
        detailEs: 'Borde anterior · Sin modelo 3D',
        isVirtual: true,
        virtualOffset: [-0.08, -0.04, -0.06],
        normal: [-0.7, 0, -0.7],
      },
    ],
    intermedio: [
      {
        id: 'oblicuo_interno',
        labelEs: 'Oblicuo interno del abdomen',
        detailEs: 'Plano intermedio · Sin modelo 3D',
        isVirtual: true,
        virtualOffset: [-0.02, -0.08, 0.02],
        normal: [-0.5, 0, 0.8],
      },
    ],
    profundo: [
      {
        id: 'transverso_abdomen',
        labelEs: 'Transverso del abdomen',
        detailEs: 'Plano profundo · Sin modelo 3D',
        isVirtual: true,
        virtualOffset: [0.01, -0.12, 0.01],
        normal: [0, 0, 1],
      },
    ],
    estructurasClave: [
      {
        id: 'aponeurosis_oblicuo',
        labelEs: 'Aponeurosis del oblicuo externo',
        detailEs: 'Estructura tendinosa',
        isVirtual: true,
        virtualOffset: [0.03, -0.16, 0.05],
        normal: [0.3, 0, 0.9],
      },
      {
        id: 'linea_semilunar',
        labelEs: 'Línea semilunar (de Spigelio)',
        detailEs: 'Transición miofascial',
        isVirtual: true,
        virtualOffset: [0.04, -0.06, 0.06],
        normal: [0.2, 0, 0.95],
      },
      {
        id: 'linea_alba',
        labelEs: 'Línea alba',
        detailEs: 'Rafe tendinoso medio',
        partNamePattern: /linea alba/i,
      },
    ],
  },

  // 2. HOMBRO / MANGUITO ROTADOR
  {
    code: 'hombro_manguito_rotador',
    nameEs: 'Complejo del Hombro y Manguito Rotador',
    subtitleEs: 'Músculos periescapulares y estabilizadores glenohumerales',
    regionClinicalCode: 'reg-hombro',
    targetKeywords: /deltoid|supraspinatus|infraspinatus|subscapularis|teres minor/i,
    cameraPreset: { azimuth: 45, elevation: 15, distanceMultiplier: 1.2 },
    superficial: [
      {
        id: 'deltoides_clavicular',
        labelEs: 'Deltoides (porción clavicular)',
        detailEs: 'Fibras anteriores',
        partNamePattern: /clavicular part of .*deltoid/i,
      },
      {
        id: 'deltoides_acromial',
        labelEs: 'Deltoides (porción acromial)',
        detailEs: 'Fibras medias / abductoras',
        partNamePattern: /acromial part of .*deltoid/i,
      },
      {
        id: 'deltoides_espinal',
        labelEs: 'Deltoides (porción espinal)',
        detailEs: 'Fibras posteriores',
        partNamePattern: /spinal part of .*deltoid/i,
      },
    ],
    intermedio: [
      {
        id: 'pectoral_mayor_clav',
        labelEs: 'Pectoral mayor (porción clavicular)',
        detailEs: 'Flexor y aductor',
        partNamePattern: /clavicular part of .*pectoralis major/i,
      },
      {
        id: 'redondo_mayor',
        labelEs: 'Músculo redondo mayor',
        detailEs: 'Aductor y rotador interno',
        partNamePattern: /teres major/i,
      },
    ],
    profundo: [
      {
        id: 'supraespinoso',
        labelEs: 'Músculo supraespinoso',
        detailEs: 'Manguito rotador · Iniciador abducción',
        partNamePattern: /supraspinatus/i,
      },
      {
        id: 'infraespinoso',
        labelEs: 'Músculo infraespinoso',
        detailEs: 'Manguito rotador · Rotador externo',
        partNamePattern: /infraspinatus/i,
      },
      {
        id: 'redondo_menor',
        labelEs: 'Músculo redondo menor',
        detailEs: 'Manguito rotador · Rotador externo',
        partNamePattern: /teres minor/i,
      },
      {
        id: 'subescapular',
        labelEs: 'Músculo subescapular',
        detailEs: 'Manguito rotador · Rotador interno anterior',
        partNamePattern: /subscapularis/i,
      },
    ],
    estructurasClave: [
      {
        id: 'tendon_biceps_largo',
        labelEs: 'Tendón de la cabeza larga del bíceps',
        detailEs: 'Estabilizador anterior',
        partNamePattern: /long head of .*biceps brachii/i,
      },
    ],
  },

  // 3. REGIÓN ESCAPULAR Y DORSAL
  {
    code: 'escapula_periescapular',
    nameEs: 'Región Periescapular y Dorsal',
    subtitleEs: 'Estabilizadores escapulares y retractores',
    regionClinicalCode: 'reg-dorsal',
    targetKeywords: /trapezius|rhomboid|levator scapulae|serratus posterior/i,
    cameraPreset: { azimuth: 160, elevation: 15, distanceMultiplier: 1.25 },
    superficial: [
      {
        id: 'trapecio_descendente',
        labelEs: 'Trapecio (porción descendente)',
        detailEs: 'Fibras superiores · Elevador escapular',
        partNamePattern: /descending part of .*trapezius/i,
      },
      {
        id: 'trapecio_ascendente',
        labelEs: 'Trapecio (porción ascendente)',
        detailEs: 'Fibras inferiores · Depresor escapular',
        partNamePattern: /ascending part of .*trapezius/i,
      },
    ],
    intermedio: [
      {
        id: 'romboides_mayor',
        labelEs: 'Músculo romboides mayor',
        detailEs: 'Retractor y fijador escapular',
        partNamePattern: /rhomboid major/i,
      },
      {
        id: 'romboides_menor',
        labelEs: 'Músculo romboides menor',
        detailEs: 'Retractor escapular superior',
        partNamePattern: /rhomboid minor/i,
      },
      {
        id: 'elevador_escapula',
        labelEs: 'Elevador de la escápula',
        detailEs: 'Ángulo superior de la escápula',
        partNamePattern: /levator scapulae/i,
      },
    ],
    profundo: [
      {
        id: 'serrato_post_sup',
        labelEs: 'Serrato posterior superior',
        detailEs: 'Inspirador accesorio',
        partNamePattern: /serratus posterior superior/i,
      },
      {
        id: 'serrato_post_inf',
        labelEs: 'Serrato posterior inferior',
        detailEs: 'Depresor costal',
        partNamePattern: /serratus posterior inferior/i,
      },
    ],
    estructurasClave: [
      {
        id: 'espina_escapula',
        labelEs: 'Espina y acromion escapular',
        detailEs: 'Repere óseo clave',
        partNamePattern: /scapula/i,
      },
    ],
  },

  // 4. COLUMNA CERVICAL
  {
    code: 'columna_cervical',
    nameEs: 'Columna Cervical y Cuello',
    subtitleEs: 'Musculatura cervical anterior, lateral y posterior',
    regionClinicalCode: 'reg-cervical',
    targetKeywords: /sternocleidomastoid|scalenus|semispinalis capitis|longissimus capitis|longus colli/i,
    cameraPreset: { azimuth: 70, elevation: 12, distanceMultiplier: 1.1 },
    superficial: [
      {
        id: 'ecm',
        labelEs: 'Esternocleidomastoideo',
        detailEs: 'Flexor y rotador contralateral',
        partNamePattern: /sternocleidomastoid/i,
      },
      {
        id: 'trapecio_sup',
        labelEs: 'Trapecio superior',
        detailEs: 'Borde posterolateral',
        partNamePattern: /descending part of .*trapezius/i,
      },
    ],
    intermedio: [
      {
        id: 'escaleno_anterior',
        labelEs: 'Escaleno anterior',
        detailEs: 'Desfiladero interescalénico',
        partNamePattern: /scalenus anterior/i,
      },
      {
        id: 'escaleno_medio',
        labelEs: 'Escaleno medio',
        detailEs: 'Lateral cervical',
        partNamePattern: /scalenus medius/i,
      },
      {
        id: 'escaleno_posterior',
        labelEs: 'Escaleno posterior',
        detailEs: 'Costilla 2',
        partNamePattern: /scalenus posterior/i,
      },
    ],
    profundo: [
      {
        id: 'semiespinoso_cabeza',
        labelEs: 'Semiespinoso de la cabeza',
        detailEs: 'Extensor cefálico principal',
        partNamePattern: /semispinalis capitis/i,
      },
      {
        id: 'semiespinoso_cuello',
        labelEs: 'Semiespinoso del cuello',
        detailEs: 'Extensor y rotador',
        partNamePattern: /semispinalis cervicis/i,
      },
      {
        id: 'rotadores_cervicales',
        labelEs: 'Rotadores cervicales',
        detailEs: 'Musculatura segmentaria profunda',
        partNamePattern: /cervical rotator/i,
      },
    ],
    estructurasClave: [
      {
        id: 'plexo_braquial',
        labelEs: 'Espacio interescalénico',
        detailEs: 'Paso del plexo braquial',
        isVirtual: true,
        virtualOffset: [0.03, 0.02, 0.01],
      },
    ],
  },

  // 5. COLUMNA LUMBAR Y PARAVERTEBRALES
  {
    code: 'columna_lumbar_paravertebral',
    nameEs: 'Columna Lumbar y Erectores Espinales',
    subtitleEs: 'Masa común lumbar y estabilizadores segmentarios',
    regionClinicalCode: 'reg-lumbar',
    targetKeywords: /iliocostalis lumborum|interspinales lumborum|lumbar rotator|psoas major/i,
    cameraPreset: { azimuth: 175, elevation: 12, distanceMultiplier: 1.2 },
    superficial: [
      {
        id: 'fascia_toracolumbar',
        labelEs: 'Fascia toracolumbar',
        detailEs: 'Plano aponeurótico · Sin modelo 3D',
        isVirtual: true,
        virtualOffset: [0, -0.05, -0.04],
        normal: [0, 0, -1],
      },
    ],
    intermedio: [
      {
        id: 'iliocostal_lumbar',
        labelEs: 'Iliocostal lumbar',
        detailEs: 'Tracto lateral erector espinal',
        partNamePattern: /iliocostalis lumborum/i,
      },
      {
        id: 'psoas_mayor',
        labelEs: 'Músculo psoas mayor',
        detailEs: 'Compartimento anterior / lumbar profundo',
        partNamePattern: /psoas major/i,
      },
    ],
    profundo: [
      {
        id: 'rotadores_lumbares',
        labelEs: 'Rotadores lumbares',
        detailEs: 'Plano multifidus/transversoespinoso',
        partNamePattern: /lumbar rotator/i,
      },
      {
        id: 'interespinosos_lumbares',
        labelEs: 'Interespinosos lumbares',
        detailEs: 'Estabilizadores entre apófisis espinosas',
        partNamePattern: /interspinales lumborum/i,
      },
    ],
    estructurasClave: [
      {
        id: 'cresta_iliaca',
        labelEs: 'Cresta ilíaca posterior',
        detailEs: 'Inserción masa común',
        partNamePattern: /ilium/i,
      },
    ],
  },

  // 6. GLÚTEOS Y CADERA POSTERIOR
  {
    code: 'gluteo_cadera_posterior',
    nameEs: 'Complejo Glúteo y Cadera Posterior',
    subtitleEs: 'Pelvitrocantéreos y abductores pélvicos',
    regionClinicalCode: 'reg-cadera',
    targetKeywords: /gluteus|piriformis|obturator|quadratus femoris/i,
    cameraPreset: { azimuth: 155, elevation: 10, distanceMultiplier: 1.25 },
    superficial: [
      {
        id: 'gluteo_mayor',
        labelEs: 'Músculo glúteo mayor',
        detailEs: 'Extensor y rotador externo potente',
        partNamePattern: /gluteus maximus/i,
      },
      {
        id: 'tensor_fascia_lata',
        labelEs: 'Tensor de la fascia lata',
        detailEs: 'Estabilizador anterolateral de rodilla',
        partNamePattern: /tensor fasciae latae/i,
      },
    ],
    intermedio: [
      {
        id: 'gluteo_medio',
        labelEs: 'Músculo glúteo medio',
        detailEs: 'Abductor principal y basculador pélvico',
        partNamePattern: /gluteus medius/i,
      },
    ],
    profundo: [
      {
        id: 'gluteo_menor',
        labelEs: 'Músculo glúteo menor',
        detailEs: 'Abductor y rotador interno',
        partNamePattern: /gluteus minimus/i,
      },
      {
        id: 'piriforme',
        labelEs: 'Músculo piriforme (piramidal)',
        detailEs: 'Rotador externo · Relación nervio ciático',
        partNamePattern: /piriformis/i,
      },
      {
        id: 'obturador_interno',
        labelEs: 'Obturador interno y gemelos',
        detailEs: 'Pelvitrocantéreo profundo',
        partNamePattern: /obturator internus/i,
      },
      {
        id: 'cuadrado_femoral',
        labelEs: 'Cuadrado femoral',
        detailEs: 'Rotador externo inferior',
        partNamePattern: /quadratus femoris/i,
      },
    ],
    estructurasClave: [
      {
        id: 'trocanter_mayor',
        labelEs: 'Trocánter mayor del fémur',
        detailEs: 'Inserción tendinosa glútea',
        partNamePattern: /femur/i,
      },
    ],
  },

  // 7. MUSLO ANTERIOR / CUÁDRICEPS
  {
    code: 'muslo_anterior_cuadriceps',
    nameEs: 'Muslo Anterior y Cuádriceps Femoral',
    subtitleEs: 'Músculos extensores de rodilla y flexores de cadera',
    regionClinicalCode: 'reg-rodilla',
    targetKeywords: /rectus femoris|vastus lateralis|vastus medialis|vastus intermedius|sartorius/i,
    cameraPreset: { azimuth: 25, elevation: 5, distanceMultiplier: 1.25 },
    superficial: [
      {
        id: 'recto_femoral',
        labelEs: 'Recto femoral',
        detailEs: 'Porción biarticular del cuádriceps',
        partNamePattern: /rectus femoris/i,
      },
      {
        id: 'sartorio',
        labelEs: 'Músculo sartorio',
        detailEs: 'Pata de ganso proximal',
        partNamePattern: /sartorius/i,
      },
    ],
    intermedio: [
      {
        id: 'vasto_lateral',
        labelEs: 'Vasto lateral del cuádriceps',
        detailEs: 'Compartimento anterolateral potente',
        partNamePattern: /vastus lateralis/i,
      },
      {
        id: 'vasto_medial',
        labelEs: 'Vasto medial (VMO)',
        detailEs: 'Estabilizador medial de rótula',
        partNamePattern: /vastus medialis/i,
      },
    ],
    profundo: [
      {
        id: 'vasto_intermedio',
        labelEs: 'Vasto intermedio (crural)',
        detailEs: 'Plano óseo femoral profundo',
        partNamePattern: /vastus intermedius/i,
      },
    ],
    estructurasClave: [
      {
        id: 'tendon_rotuliano',
        labelEs: 'Tendón rotuliano y rótula',
        detailEs: 'Aparato extensor distal',
        partNamePattern: /patella/i,
      },
    ],
  },

  // 8. MUSLO POSTERIOR / ISQUIOTIBIALES
  {
    code: 'muslo_posterior_isquiotibiales',
    nameEs: 'Muslo Posterior e Isquiotibiales',
    subtitleEs: 'Flexores de rodilla y extensores de cadera',
    regionClinicalCode: 'reg-rodilla',
    targetKeywords: /biceps femoris|semitendinosus|semimembranosus/i,
    cameraPreset: { azimuth: 165, elevation: 5, distanceMultiplier: 1.25 },
    superficial: [
      {
        id: 'biceps_femoral_largo',
        labelEs: 'Bíceps femoral (cabeza larga)',
        detailEs: 'Origen tuberosidad isquiática',
        partNamePattern: /long head of .*biceps femoris/i,
      },
      {
        id: 'semitendinoso',
        labelEs: 'Músculo semitendinoso',
        detailEs: 'Componente medial de la pata de ganso',
        partNamePattern: /semitendinosus/i,
      },
    ],
    intermedio: [],
    profundo: [
      {
        id: 'biceps_femoral_corto',
        labelEs: 'Bíceps femoral (cabeza corta)',
        detailEs: 'Origen línea áspera femoral',
        partNamePattern: /short head of .*biceps femoris/i,
      },
      {
        id: 'semimembranoso',
        labelEs: 'Músculo semimembranoso',
        detailEs: 'Isquiotibial profundo medial',
        partNamePattern: /semimembranosus/i,
      },
    ],
    estructurasClave: [
      {
        id: 'hueco_popliteo',
        labelEs: 'Fosa poplítea superior',
        detailEs: 'Bifurcación isquiotibial distal',
        isVirtual: true,
        virtualOffset: [0, -0.15, -0.04],
      },
    ],
  },

  // 9. COMPARTIMENTO ADUCTOR DEL MUSLO
  {
    code: 'muslo_medial_aductores',
    nameEs: 'Compartimento Medial de Aductores',
    subtitleEs: 'Aductores y estabilizadores pélvicos mediales',
    regionClinicalCode: 'reg-cadera',
    targetKeywords: /adductor longus|adductor brevis|adductor magnus|gracilis|pectineus/i,
    cameraPreset: { azimuth: 40, elevation: 5, distanceMultiplier: 1.2 },
    superficial: [
      {
        id: 'aductor_largo',
        labelEs: 'Aductor largo (mediano)',
        detailEs: 'Triángulo femoral / de Scarpa',
        partNamePattern: /adductor longus/i,
      },
      {
        id: 'gracil',
        labelEs: 'Músculo grácil (recto interno)',
        detailEs: 'Pata de ganso medial',
        partNamePattern: /gracilis/i,
      },
      {
        id: 'pectineo',
        labelEs: 'Músculo pectíneo',
        detailEs: 'Piso del triángulo femoral',
        partNamePattern: /pectineus/i,
      },
    ],
    intermedio: [
      {
        id: 'aductor_corto',
        labelEs: 'Aductor corto (menor)',
        detailEs: 'Plano intermedio medial',
        partNamePattern: /adductor brevis/i,
      },
    ],
    profundo: [
      {
        id: 'aductor_mayor',
        labelEs: 'Aductor mayor',
        detailEs: 'Hiato aductor de Hunter',
        partNamePattern: /adductor magnus/i,
      },
    ],
    estructurasClave: [
      {
        id: 'pubis_insercion',
        labelEs: 'Sínfisis del pubis y rama isquiopúbica',
        detailEs: 'Inserción proximal aductora',
        partNamePattern: /pubis/i,
      },
    ],
  },

  // 10. PANTORRILLA Y TENDÓN DE AQUILES
  {
    code: 'pantorrilla_aquiles',
    nameEs: 'Pantorrilla, Tríceps Sural y Aquiles',
    subtitleEs: 'Flexores plantares y propulsores de la marcha',
    regionClinicalCode: 'reg-tobillo',
    targetKeywords: /gastrocnemius|soleus|plantaris|calcaneal tendon/i,
    cameraPreset: { azimuth: 170, elevation: 0, distanceMultiplier: 1.2 },
    superficial: [
      {
        id: 'gemelo_medial',
        labelEs: 'Gastrocnemio (cabeza medial)',
        detailEs: 'Gemelo interno potente',
        partNamePattern: /medial head of .*gastrocnemius/i,
      },
      {
        id: 'gemelo_lateral',
        labelEs: 'Gastrocnemio (cabeza lateral)',
        detailEs: 'Gemelo externo',
        partNamePattern: /lateral head of .*gastrocnemius/i,
      },
    ],
    intermedio: [
      {
        id: 'soleo',
        labelEs: 'Músculo sóleo',
        detailEs: 'Flexor plantar monoarticular profundo',
        partNamePattern: /soleus/i,
      },
      {
        id: 'plantar',
        labelEs: 'Músculo plantar delgado',
        detailEs: 'Músculo vestigial accesorio',
        partNamePattern: /plantaris/i,
      },
    ],
    profundo: [
      {
        id: 'tibial_posterior',
        labelEs: 'Músculo tibial posterior',
        detailEs: 'Inversor y estabilizador del arco plantar',
        partNamePattern: /tibialis posterior/i,
      },
    ],
    estructurasClave: [
      {
        id: 'tendon_aquiles',
        labelEs: 'Tendón de Aquiles (calcáneo)',
        detailEs: 'Tendón conjunto tricipital',
        partNamePattern: /calcaneal tendon/i,
      },
      {
        id: 'calcaneo',
        labelEs: 'Calcáneo',
        detailEs: 'Inserción distal del tendón',
        partNamePattern: /calcaneus/i,
      },
    ],
  },

  // 11. BRAZO, CODO Y ANTEBRAZO
  {
    code: 'brazo_codo_antebrazo',
    nameEs: 'Brazo, Complejo del Codo y Antebrazo',
    subtitleEs: 'Flexo-extensores del codo y pronosupinadores',
    regionClinicalCode: 'reg-codo',
    targetKeywords: /biceps brachii|triceps brachii|brachialis|pronator teres|flexor carpi ulnaris|supinator/i,
    cameraPreset: { azimuth: 55, elevation: 10, distanceMultiplier: 1.15 },
    superficial: [
      {
        id: 'biceps_largo',
        labelEs: 'Bíceps braquial (cabeza larga)',
        detailEs: 'Supinador y flexor',
        partNamePattern: /long head of .*biceps brachii/i,
      },
      {
        id: 'biceps_corto',
        labelEs: 'Bíceps braquial (cabeza corta)',
        detailEs: 'Flexor anterior',
        partNamePattern: /short head of .*biceps brachii/i,
      },
      {
        id: 'triceps_lateral',
        labelEs: 'Tríceps braquial (cabeza lateral)',
        detailEs: 'Extensor braquial externo',
        partNamePattern: /lateral head of .*triceps brachii/i,
      },
      {
        id: 'triceps_largo',
        labelEs: 'Tríceps braquial (cabeza larga)',
        detailEs: 'Extensor biarticular',
        partNamePattern: /long head of .*triceps brachii/i,
      },
    ],
    intermedio: [
      {
        id: 'braquial',
        labelEs: 'Músculo braquial anterior',
        detailEs: 'Flexor puro de codo',
        partNamePattern: /brachialis/i,
      },
      {
        id: 'triceps_medial',
        labelEs: 'Tríceps braquial (cabeza medial)',
        detailEs: 'Extensor profundo',
        partNamePattern: /medial head of .*triceps brachii/i,
      },
      {
        id: 'pronador_redondo',
        labelEs: 'Pronador redondo',
        detailEs: 'Pronador del antebrazo',
        partNamePattern: /pronator teres/i,
      },
    ],
    profundo: [
      {
        id: 'supinador',
        labelEs: 'Músculo supinador corto',
        detailEs: 'Plano profundo perirradial',
        partNamePattern: /supinator/i,
      },
    ],
    estructurasClave: [
      {
        id: 'epitroclea_epicondilo',
        labelEs: 'Epicóndilo lateral y epitróclea',
        detailEs: 'Puntos de inserción tendinosa (codo de tenista/golfista)',
        partNamePattern: /humerus/i,
      },
    ],
  },

  // 12. PIERNA LATERAL Y TOBILLO
  {
    code: 'pierna_lateral_tobillo',
    nameEs: 'Pierna Lateral y Tobillo',
    subtitleEs: 'Músculos peroneos y estabilizadores laterales',
    regionClinicalCode: 'reg-tobillo',
    targetKeywords: /fibularis|peroneus|tibialis anterior/i,
    cameraPreset: { azimuth: 65, elevation: -5, distanceMultiplier: 1.15 },
    superficial: [
      {
        id: 'peroneo_largo',
        labelEs: 'Peroneo largo (fibularis longus)',
        detailEs: 'Eversor y flexor plantar',
        partNamePattern: /fibularis longus/i,
      },
      {
        id: 'tibial_anterior',
        labelEs: 'Músculo tibial anterior',
        detailEs: 'Dorsiflexor principal de tobillo',
        partNamePattern: /tibialis anterior/i,
      },
    ],
    intermedio: [
      {
        id: 'peroneo_corto',
        labelEs: 'Peroneo corto (fibularis brevis)',
        detailEs: 'Eversor en el maléolo lateral',
        partNamePattern: /fibularis brevis/i,
      },
    ],
    profundo: [
      {
        id: 'peroneo_tercero',
        labelEs: 'Peroneo tercero (anterior)',
        detailEs: 'Dorsiflexor eversor',
        partNamePattern: /fibularis tertius/i,
      },
    ],
    estructurasClave: [
      {
        id: 'maleolo_lateral',
        labelEs: 'Maléolo lateral (peroné)',
        detailEs: 'Polea de los tendones peroneos',
        partNamePattern: /fibula/i,
      },
    ],
  },
];
