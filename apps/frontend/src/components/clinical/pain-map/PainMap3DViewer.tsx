import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as T from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  ANATOMY_TAXONOMY,
  PainPoint,
} from '@citassistema/shared-types';
import { MaterialIcon } from '../../ui/MaterialIcon';
import {
  ATLAS_SYSTEMS,
  AtlasCameraView,
  AtlasConcept,
  AtlasPart,
  AtlasSystemId,
  CLINICAL_LAYER_PRESETS,
  ClinicalAtlasMapping,
  createExplosionLayout,
  decodeModelResponse,
  DEFAULT_CLINICAL_SYSTEMS,
  HumanAtlasManifest,
  mapAtlasPartToClinical,
  PointerTap,
  translateAtlasNameEs,
} from './humanAtlasEngine';
import { SelectStructureOptions } from './usePainMapState';
import { AnatomyLabelsOverlay } from './AnatomyLabelsOverlay';
import { DissectionPanel } from './DissectionPanel';
import {
  AnatomyIndexManifest,
  DissectionView,
  resolveDissectionView,
} from './anatomyHierarchy';
import { layoutNumericMarkers, PlacedMarker, ScreenAnchor } from './labelLayout';

export interface PainMap3DViewerProps {
  atlasUrl?: string;
  points: PainPoint[];
  selectedRegionCode?: string | null;
  selectedStructureCode?: string | null;
  onSelectRegion: (regionCode: string) => void;
  onSelectStructure?: (
    structureCode: string,
    coords?: { x: number; y: number },
    options?: SelectStructureOptions,
  ) => void;
  onSelectPoint?: (point: PainPoint) => void;
  hoveredRegionCode?: string | null;
  onHoverRegion?: (code: string | null) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

interface ViewerSceneState {
  explode: number;
  visible: AtlasSystemId[];
  selected: string[];
  isolate: boolean;
  view: AtlasCameraView;
  rotate: boolean;
  reset: number;
}

const INITIAL_SCENE_STATE: ViewerSceneState = {
  explode: 0,
  visible: DEFAULT_CLINICAL_SYSTEMS,
  selected: [],
  isolate: false,
  view: 'three-quarter',
  rotate: false,
  reset: 0,
};

function getEvaHexColor(eva: number): number {
  if (eva <= 3) return 0x22c55e;
  if (eva <= 6) return 0xeab308;
  if (eva <= 8) return 0xf97316;
  return 0xef4444;
}

function getEvaCssColor(eva: number): string {
  if (eva <= 3) return '#22c55e';
  if (eva <= 6) return '#eab308';
  if (eva <= 8) return '#f97316';
  return '#ef4444';
}

export const PainMap3DViewer: React.FC<PainMap3DViewerProps> = ({
  atlasUrl = '/models/atlas.json',
  points,
  selectedRegionCode,
  selectedStructureCode,
  onSelectRegion,
  onSelectStructure,
  onSelectPoint,
  hoveredRegionCode: _hoveredRegionCode,
  onHoverRegion,
  isExpanded = false,
  onToggleExpand,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [atlas, setAtlas] = useState<HumanAtlasManifest | null>(null);
  const [sceneState, setSceneState] = useState<ViewerSceneState>(INITIAL_SCENE_STATE);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [activeDrawer, setActiveDrawer] = useState<'layers' | 'search' | 'catalog' | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMapping, setActiveMapping] = useState<ClinicalAtlasMapping | null>(null);
  const [autoOpenEvaOnTap, setAutoOpenEvaOnTap] = useState<boolean>(true);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  // Estados de Disección Anatómica Estratificada & Etiquetas 3D (Fase 1-6)
  const [anatomyIndex, setAnatomyIndex] = useState<AnatomyIndexManifest | null>(null);
  const [dissectionView, setDissectionView] = useState<DissectionView | null>(null);
  const [hiddenDissectionItems, setHiddenDissectionItems] = useState<Set<string>>(new Set());
  const [hoveredLabelId, setHoveredLabelId] = useState<string | null>(null);
  const [placedLabels, setPlacedLabels] = useState<PlacedMarker[]>([]);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Referencias para callbacks actualizados dentro del bucle Three.js
  const latestSceneStateRef = useRef<ViewerSceneState>(sceneState);
  latestSceneStateRef.current = sceneState;

  const latestPointsRef = useRef<PainPoint[]>(points);
  latestPointsRef.current = points;

  const autoOpenRef = useRef<boolean>(autoOpenEvaOnTap);
  autoOpenRef.current = autoOpenEvaOnTap;

  const latestDissectionViewRef = useRef<DissectionView | null>(null);
  latestDissectionViewRef.current = dissectionView;

  const latestHiddenItemsRef = useRef<Set<string>>(hiddenDissectionItems);
  latestHiddenItemsRef.current = hiddenDissectionItems;

  const setPlacedLabelsRef = useRef(setPlacedLabels);
  setPlacedLabelsRef.current = setPlacedLabels;

  const anatomyIndexRef = useRef<AnatomyIndexManifest | null>(null);
  anatomyIndexRef.current = anatomyIndex;

  // 1. Cargar el manifiesto atlas.json de BodyParts3D (ashemag/human-atlas)
  useEffect(() => {
    const abort = new AbortController();
    setProgress(0);
    setError('');

    fetch(atlasUrl, { signal: abort.signal })
      .then((r) => {
        if (!r.ok) {
          throw new Error('No se pudo cargar el catálogo anatómico 3D (/models/atlas.json).');
        }
        return r.json();
      })
      .then((data: HumanAtlasManifest) => {
        setAtlas(data);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          setError(e instanceof Error ? e.message : 'Error cargando el Atlas 3D.');
        }
      });

    return () => abort.abort();
  }, [atlasUrl]);

  // Cargar índice anatómico precomputado de agrupaciones y anclajes
  useEffect(() => {
    fetch('/models/atlas-anatomy-index.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: AnatomyIndexManifest | null) => {
        if (data) setAnatomyIndex(data);
      })
      .catch(() => {});
  }, []);

  // Resolver vista de disección estratificada cuando se aísla una pieza
  useEffect(() => {
    if (sceneState.isolate && sceneState.selected.length > 0 && atlas) {
      try {
        const view = resolveDissectionView(sceneState.selected[0], atlas, anatomyIndex);
        setDissectionView(view);
        setHiddenDissectionItems(new Set());
      } catch {
        setDissectionView(null);
      }
    } else if (!sceneState.isolate) {
      setDissectionView(null);
      setPlacedLabels([]);
    }
  }, [sceneState.isolate, sceneState.selected, atlas, anatomyIndex]);

  // Mapa rápido de piezas por ID
  const partsById = useMemo(
    () => new Map<string, AtlasPart>(atlas?.parts.map((p) => [p.id, p]) ?? []),
    [atlas],
  );

  // Conteo de piezas por sistema anatómico
  const systemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of ATLAS_SYSTEMS) {
      counts[s.id] = atlas?.parts.filter((p) => p.system === s.id).length ?? 0;
    }
    return counts;
  }, [atlas]);

  const activeSystems = useMemo(
    () => ATLAS_SYSTEMS.filter((s) => (systemCounts[s.id] ?? 0) > 0),
    [systemCounts],
  );

  const visiblePieceCount = useMemo(() => {
    if (!atlas) return 0;
    return atlas.parts.filter((p) =>
      sceneState.isolate
        ? sceneState.selected.includes(p.id)
        : sceneState.visible.includes(p.system) || sceneState.selected.includes(p.id),
    ).length;
  }, [atlas, sceneState.isolate, sceneState.selected, sceneState.visible]);

  // Búsqueda bilingüe en los 3,432 conceptos FMA y 2,234 piezas 3D
  const searchResults = useMemo(() => {
    if (!atlas) return [];
    const term = searchQuery.toLowerCase().trim();
    if (!term) {
      const featured = [
        'supraspinatus',
        'infraspinatus',
        'deltoid',
        'trapezius',
        'biceps brachii',
        'quadratus lumborum',
        'piriformis',
        'gluteus maximus',
        'rectus femoris',
        'biceps femoris',
        'gastrocnemius',
        'calcaneal tendon',
      ];
      return featured
        .map((n) => atlas.concepts.find((c) => c.name.toLowerCase().includes(n)))
        .filter((c): c is AtlasConcept => !!c);
    }

    return atlas.concepts
      .filter((c) => {
        const nameEn = c.name.toLowerCase();
        const nameEs = translateAtlasNameEs(c.name).toLowerCase();
        return (
          nameEn.includes(term) ||
          nameEs.includes(term) ||
          c.id.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => a.name.length - b.name.length)
      .slice(0, 60);
  }, [atlas, searchQuery]);

  // Estructuras clínicas (~170) de nuestro catálogo filtradas por región seleccionada
  const clinicalCatalogStructures = useMemo(() => {
    const allStructs = ANATOMY_TAXONOMY.filter((n) => n.level === 'structure');
    if (!selectedRegionCode) return allStructs;
    return allStructs.filter((s) => {
      if (!s.parent) return false;
      const sub = ANATOMY_TAXONOMY.find((n) => n.code === s.parent);
      return sub?.parent === selectedRegionCode || sub?.code === selectedRegionCode;
    });
  }, [selectedRegionCode]);

  // Handler cuando el médico selecciona una pieza 3D (por tap directo o buscador)
  const handlePartSelected = (
    partId: string,
    hitPoint?: [number, number, number],
    triggerEvaForm = autoOpenRef.current,
  ) => {
    const part = partsById.get(partId);
    if (!part) return;

    const mapping = mapAtlasPartToClinical(part, hitPoint);
    setActiveMapping(mapping);
    setSceneState((s) => ({
      ...s,
      selected: [partId],
      rotate: false,
    }));
    onHoverRegion?.(mapping.regionCode);

    if (triggerEvaForm && onSelectStructure) {
      onSelectStructure(
        mapping.structureCode,
        { x: mapping.coordX, y: mapping.coordY },
        {
          laterality: mapping.laterality,
          view: mapping.view,
          regionCode: mapping.regionCode,
          atlasMeta: {
            atlasPartId: mapping.atlasPartId,
            atlasPartName: mapping.atlasPartName,
            atlasPartNameEs: mapping.atlasPartNameEs,
            fmaId: mapping.fmaId,
            system: mapping.system,
            pos3d: mapping.pos3d,
          },
        },
      );
    }
  };

  const handlePartSelectedRef = useRef(handlePartSelected);
  handlePartSelectedRef.current = handlePartSelected;

  const onSelectPointRef = useRef(onSelectPoint);
  onSelectPointRef.current = onSelectPoint;

  // Selección de concepto desde el buscador FMA
  const handleSelectConcept = (concept: AtlasConcept) => {
    const firstPartId = concept.elements[0];
    const firstPart = firstPartId ? partsById.get(firstPartId) : undefined;
    setSceneState((s) => ({
      ...s,
      selected: concept.elements,
      isolate: false,
      rotate: false,
    }));
    setActiveDrawer(null);
    if (firstPart) {
      const mapping = mapAtlasPartToClinical(firstPart);
      setActiveMapping(mapping);
      if (autoOpenEvaOnTap && onSelectStructure) {
        onSelectStructure(
          mapping.structureCode,
          { x: mapping.coordX, y: mapping.coordY },
          {
            laterality: mapping.laterality,
            view: mapping.view,
            regionCode: mapping.regionCode,
            atlasMeta: {
              atlasPartId: mapping.atlasPartId,
              atlasPartName: concept.name,
              atlasPartNameEs: translateAtlasNameEs(concept.name),
              fmaId: concept.id,
              system: mapping.system,
              pos3d: mapping.pos3d,
            },
          },
        );
      }
    }
  };

  // 2. Motor WebGL Three.js de ashemag/human-atlas + Pines Clínicos EVA 3D
  const markDirtyRef = useRef<(() => void) | null>(null);
  const pinsGroupRef = useRef<T.Group | null>(null);
  const partOffsetsRef = useRef<T.Vector3[]>([]);
  const partCentersRef = useRef<T.Vector3[]>([]);
  const partIndexByIdRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    const el = hostRef.current;
    if (!el || !atlas) return;

    let disposed = false;
    let frame = 0;
    let dirty = true;
    let ready = false;
    let lastView = '';
    let lastReset = -1;
    let lastIsolate = '';
    let layoutKey = '';
    let amount = 0;
    let lastState: ViewerSceneState | null = null;
    const abort = new AbortController();

    markDirtyRef.current = () => {
      dirty = true;
    };

    let renderer: T.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setError(
        'Aceleración WebGL no disponible en este entorno. Puedes alternar al modo 2D Jerárquico.',
      );
      return;
    }

    const initW = el.clientWidth || 640;
    const initH = el.clientHeight || 560;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, initW < 768 ? 1.5 : 2));
    renderer.setSize(initW, initH);
    renderer.setClearColor('#0f172a'); // Fondo clínico oscuro de alto contraste
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute(
      'aria-label',
      'Atlas Anatómico 3D Interactivo BodyParts3D. Arrastra para rotar, haz zoom y haz clic en cualquier estructura para evaluar dolor EVA.',
    );

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(34, initW / initH, 0.005, 100);
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(1.4, 1.05, 3.6);
    controls.target.set(0, 0.85, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.085;
    controls.minDistance = 0.07;
    controls.maxDistance = 40;
    controls.maxPolarAngle = Math.PI * 0.96;
    controls.addEventListener('change', () => {
      dirty = true;
    });

    // Iluminación de estudio con RoomEnvironment PMREM
    const pmrem = new T.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.dispose();
    pmrem.dispose();

    scene.add(new T.HemisphereLight(0xffffff, 0x334155, 1.1));
    const key = new T.DirectionalLight(0xfffaf4, 2.3);
    key.position.set(-2, 4, 3);
    scene.add(key);
    const rim = new T.DirectionalLight(0x38bdf8, 1.6);
    rim.position.set(2, 2, -3);
    scene.add(rim);

    // Plataforma anatómica de referencia
    const ground = new T.Mesh(
      new T.CircleGeometry(12, 72),
      new T.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.019;
    scene.add(ground);

    const platform = new T.Mesh(
      new T.CylinderGeometry(0.68, 0.72, 0.028, 80),
      new T.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.25, roughness: 0.55 }),
    );
    platform.position.y = -0.016;
    scene.add(platform);

    const ring = new T.Mesh(
      new T.RingGeometry(0.63, 0.635, 96),
      new T.MeshBasicMaterial({
        color: 0x14b8a6,
        transparent: true,
        opacity: 0.45,
        side: T.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.001;
    scene.add(ring);

    // Grupo para Pines Clínicos EVA 3D
    const pinsGroup = new T.Group();
    pinsGroup.renderOrder = 20;
    scene.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    // Texturas de estado en GPU por pieza (2,234 piezas)
    const width = T.MathUtils.ceilPowerOfTwo(atlas.parts.length);
    const data = new Float32Array(width * 4);
    const partTexture = new T.DataTexture(data, width, 1, T.RGBAFormat, T.FloatType);
    partTexture.needsUpdate = true;

    const selectedData = new Uint8Array(width * 4);
    const selectionTexture = new T.DataTexture(selectedData, width, 1);
    selectionTexture.needsUpdate = true;

    const materials: T.Material[] = [];
    const geometries: T.BufferGeometry[] = [];
    const pickers: (T.Mesh | undefined)[] = [];
    const centers = atlas.parts.map((p) =>
      new T.Vector3()
        .fromArray(p.bounds[0])
        .add(new T.Vector3().fromArray(p.bounds[1]))
        .multiplyScalar(0.5),
    );
    const offsets: T.Vector3[] = atlas.parts.map(() => new T.Vector3());
    const bounds = atlas.parts.map(
      (p) => new T.Box3(new T.Vector3().fromArray(p.bounds[0]), new T.Vector3().fromArray(p.bounds[1])),
    );

    partCentersRef.current = centers;
    partOffsetsRef.current = offsets;
    const indexMap = new Map<string, number>();
    atlas.parts.forEach((p, idx) => indexMap.set(p.id, idx));
    partIndexByIdRef.current = indexMap;

    let packingWidth = 1;
    let packingHeight = 1;

    // Marcadores de piezas en modo despiece
    const markerPositions = new Float32Array(atlas.parts.length * 3);
    const markerGeometry = new T.BufferGeometry();
    markerGeometry.setAttribute('position', new T.BufferAttribute(markerPositions, 3));
    const markerMaterial = new T.PointsMaterial({
      color: 0x38bdf8,
      size: 5,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.75,
      depthTest: false,
    });
    markerMaterial.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <clipping_planes_fragment>',
        '#include <clipping_planes_fragment>\nif (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;',
      );
    };
    const markers = new T.Points(markerGeometry, markerMaterial);
    markers.frustumCulled = false;
    markers.renderOrder = 10;
    markers.visible = false;
    scene.add(markers);

    // Tooltip flotante de inspección al pasar el mouse
    const hover = document.createElement('div');
    hover.className = 'human-atlas-hover-tooltip';
    hover.setAttribute('role', 'tooltip');
    hover.hidden = true;
    el.appendChild(hover);

    type Target = {
      index: number;
      x: number;
      y: number;
      left: number;
      right: number;
      top: number;
      bottom: number;
    };
    let targets: Target[] = [];
    const projected = new T.Vector3();

    const findTarget = (x: number, y: number, radius: number) => {
      let best = -1;
      let score = Infinity;
      for (const t of targets) {
        const dx = Math.max(t.left - x, 0, x - t.right);
        const dy = Math.max(t.top - y, 0, y - t.bottom);
        const distance = Math.hypot(dx, dy);
        if (distance > radius) continue;
        const candidate = distance + Math.hypot(t.x - x, t.y - y) * 0.025;
        if (candidate < score) {
          score = candidate;
          best = t.index;
        }
      }
      return best;
    };

    const materialFor = (system: string) => {
      const m = new T.MeshStandardMaterial({
        color: ATLAS_SYSTEMS.find((s) => s.id === system)?.color ?? '#aebbb8',
        metalness: 0.08,
        roughness: 0.52,
        side: T.DoubleSide,
        transparent: system === 'integumentary',
        opacity: system === 'integumentary' ? 0.14 : 1,
        depthWrite: system !== 'integumentary',
      });
      m.onBeforeCompile = (shader) => {
        shader.uniforms.partState = { value: partTexture };
        shader.uniforms.selectionState = { value: selectionTexture };
        shader.uniforms.stateWidth = { value: width };
        shader.vertexShader =
          'attribute float partIndex; uniform sampler2D partState; uniform sampler2D selectionState; uniform float stateWidth; varying float partVisible; varying float partSelected;\n' +
          shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nvec2 stateUv = vec2((partIndex + 0.5) / stateWidth, 0.5); vec4 state = texture2D(partState, stateUv); transformed += state.xyz; partVisible = state.w; partSelected = texture2D(selectionState, stateUv).r;',
        );
        shader.fragmentShader =
          'varying float partVisible; varying float partSelected;\n' + shader.fragmentShader;
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <clipping_planes_fragment>',
          '#include <clipping_planes_fragment>\nif (partVisible < 0.5) discard;',
        );
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12, 0.92, 0.82), partSelected * 0.82);',
        );
      };
      materials.push(m);
      return m;
    };

    const mats = new Map(ATLAS_SYSTEMS.map((s) => [s.id, materialFor(s.id)]));

    // Carga progresiva de los 15 bloques comprimidos (.bin.gz)
    let loaded = 0;
    const loadChunk = async (ci: number) => {
      const chunk = atlas.chunks[ci];
      const compressed = !!chunk.gzip && typeof DecompressionStream !== 'undefined';
      const response = await fetch(compressed ? chunk.gzip! : chunk.url, {
        signal: abort.signal,
      });
      const buffer = await decodeModelResponse(response, chunk.bytes, compressed);
      if (disposed) return;

      const groups = new Map<string, T.BufferGeometry[]>();
      atlas.parts.forEach((p, i) => {
        if (p.chunk !== ci) return;
        const g = new T.BufferGeometry();
        g.setAttribute(
          'position',
          new T.BufferAttribute(new Float32Array(buffer, p.positions, p.vertexCount * 3), 3),
        );
        g.setAttribute(
          'normal',
          new T.BufferAttribute(new Int16Array(buffer, p.normals, p.vertexCount * 3), 3, true),
        );
        g.setIndex(new T.BufferAttribute(new Uint32Array(buffer, p.indices, p.indexCount), 1));
        g.boundingBox = bounds[i].clone();
        g.computeBoundingSphere();

        const pick = new T.Mesh(g);
        pick.matrixAutoUpdate = false;
        pickers[i] = pick;
        geometries.push(g);

        g.setAttribute('partIndex', new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i), 1));
        const list = groups.get(p.system) ?? [];
        list.push(g);
        groups.set(p.system, list);
      });

      groups.forEach((gs, system) => {
        const geometry = mergeGeometries(gs, false);
        if (!geometry) throw new Error('Error ensamblando geometría anatómica.');
        geometries.push(geometry);
        const mesh = new T.Mesh(geometry, mats.get(system as AtlasSystemId));
        mesh.frustumCulled = false;
        scene.add(mesh);
      });

      lastState = null;
      loaded++;
      setProgress(Math.round((loaded / atlas.chunks.length) * 100));
      dirty = true;
    };

    (async () => {
      try {
        let cursor = 0;
        await Promise.all(
          Array.from({ length: 3 }, async () => {
            while (cursor < atlas.chunks.length) {
              const i = cursor++;
              await loadChunk(i);
            }
          }),
        );
        if (!disposed) {
          ready = true;
          dirty = true;
        }
      } catch (e) {
        if (!disposed) {
          setError(e instanceof Error ? e.message : 'No se pudo cargar la anatomía 3D.');
        }
      }
    })();

    const fit = (view: string, extent = 0) => {
      const cw = el.clientWidth || 760;
      const ch = el.clientHeight || 680;
      const mobile = cw < 768;
      const normalDistance = mobile ? 3.55 : 3.18;
      const reservedHeight = mobile ? 220 : 160;
      const availableAspect = Math.max(
        0.35,
        (cw - (mobile ? 40 : 120)) / Math.max(160, ch - reservedHeight),
      );
      const atlasDistance =
        (Math.max(packingHeight, packingWidth / availableAspect) /
          (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)))) *
        (ch / Math.max(160, ch - reservedHeight)) *
        1.08;
      const distance = T.MathUtils.lerp(normalDistance, Math.max(0.2, atlasDistance), extent);
      if (extent > 0.8) view = 'front';

      const direction =
        view === 'front'
          ? new T.Vector3(0, 0.02, 1)
          : view === 'back'
            ? new T.Vector3(0, 0.02, -1)
            : view === 'side'
              ? new T.Vector3(1, 0.02, 0)
              : new T.Vector3(0.35, 0.06, 1).normalize();

      controls.target.set(0, 0.86, 0);
      camera.position.copy(controls.target).addScaledVector(direction, distance);
      controls.update();
      dirty = true;
    };

    let lastLabelUpdate = 0;

    const resize = () => {
      if (!el.clientWidth || !el.clientHeight) return;
      setContainerSize({ width: el.clientWidth, height: el.clientHeight });
      layoutKey = '';
      lastState = null;
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, el.clientWidth < 768 ? 1.5 : 2),
      );
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
      fit(latestSceneStateRef.current.view, amount);
    };

    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    observer?.observe(el);

    const raycaster = new T.Raycaster();
    const pointer = new T.Vector2();
    const tap = new PointerTap();
    const worldBox = new T.Box3();
    const hitPoint = new T.Vector3();

    const pickPartAtPointer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);

      // 1. Verificar clic/hover en un Pin EVA 3D existente
      if (pinsGroup.children.length > 0) {
        const pinHits = raycaster.intersectObjects(pinsGroup.children, true);
        if (pinHits.length > 0) {
          let obj: T.Object3D | null = pinHits[0].object;
          while (obj && !obj.userData?.isPainPin) {
            obj = obj.parent;
          }
          if (obj?.userData?.isPainPin) {
            return { type: 'pin' as const, point: obj.userData.point as PainPoint };
          }
        }
      }

      // 2. Raycast contra las 2,234 mallas anatómicas con poda por BoundingBox
      let nearest = Infinity;
      let found = -1;
      let exactHit: [number, number, number] | undefined;
      const hasSolid = atlas.parts.some(
        (p, i) => p.system !== 'integumentary' && data[i * 4 + 3] > 0.5,
      );

      pickers.forEach((mesh, i) => {
        if (!mesh || data[i * 4 + 3] < 0.5 || (hasSolid && atlas.parts[i].system === 'integumentary')) {
          return;
        }
        worldBox.copy(bounds[i]).translate(mesh.position);
        if (!raycaster.ray.intersectBox(worldBox, hitPoint)) return;
        const hits = raycaster.intersectObject(mesh, false);
        if (hits[0] && hits[0].distance < nearest) {
          nearest = hits[0].distance;
          found = i;
          const localPt = hits[0].point.clone().sub(mesh.position);
          exactHit = [localPt.x, localPt.y, localPt.z];
        }
      });

      if (found < 0 && amount > 0.45) {
        const idx = findTarget(clientX - rect.left, clientY - rect.top, 18);
        if (idx >= 0) found = idx;
      }

      if (found >= 0) {
        return {
          type: 'part' as const,
          index: found,
          part: atlas.parts[found],
          hitPoint: exactHit,
        };
      }
      return null;
    };

    const down = (e: PointerEvent) => {
      hover.hidden = true;
      tap.down(e.pointerId, e.clientX, e.clientY, e.pointerType === 'touch' ? 12 : 5);
    };

    const move = (e: PointerEvent) => {
      tap.move(e.pointerId, e.clientX, e.clientY);
      if (e.buttons || e.pointerType === 'touch' || !ready) {
        hover.hidden = true;
        return;
      }
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const hit = pickPartAtPointer(e.clientX, e.clientY);
      if (!hit) {
        hover.hidden = true;
        renderer.domElement.style.cursor = 'grab';
        return;
      }

      renderer.domElement.style.cursor = 'pointer';
      hover.hidden = false;
      if (hit.type === 'pin') {
        hover.textContent = `📍 Punto EVA ${hit.point.eva}/10: ${hit.point.structureLabel || hit.point.structureCode}`;
      } else {
        const nameEs = translateAtlasNameEs(hit.part.name);
        const sysMeta = ATLAS_SYSTEMS.find((s) => s.id === hit.part.system);
        hover.textContent = `${nameEs} (${hit.part.conceptId} · ${sysMeta?.nameEs || hit.part.system})`;
      }
      hover.style.left = `${Math.max(8, Math.min(x + 14, el.clientWidth - 280))}px`;
      hover.style.top = `${Math.max(8, Math.min(y + 18, el.clientHeight - 50))}px`;
    };

    const cancel = (e: PointerEvent) => tap.cancel(e.pointerId);

    const up = (e: PointerEvent) => {
      const validTap = tap.up(e.pointerId, e.clientX, e.clientY);
      if (!validTap || !ready) return;

      const hit = pickPartAtPointer(e.clientX, e.clientY);
      if (!hit) return;

      hover.hidden = true;
      if (hit.type === 'pin') {
        onSelectPointRef.current?.(hit.point);
      } else {
        handlePartSelectedRef.current(hit.part.id, hit.hitPoint);
      }
    };

    renderer.domElement.addEventListener('pointerdown', down);
    renderer.domElement.addEventListener('pointermove', move);
    renderer.domElement.addEventListener('pointerup', up);
    renderer.domElement.addEventListener('pointercancel', cancel);

    const clock = new T.Clock();
    let lastExtent = -1;

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const s = latestSceneStateRef.current;

      const changed =
        lastState?.visible !== s.visible ||
        lastState?.selected !== s.selected ||
        lastState?.isolate !== s.isolate;
      const moving = Math.abs(amount - s.explode) > 0.0001;
      if (moving) {
        amount = T.MathUtils.damp(amount, s.explode, 8, dt);
        dirty = true;
      }

      if (changed || moving || lastExtent < 0) {
        const visible = new Set(s.visible);
        const selection = new Set(s.selected);
        const dView = latestDissectionViewRef.current;
        const hiddenItems = latestHiddenItemsRef.current;

        const hiddenParts = new Set<string>();
        if (dView && hiddenItems.size > 0) {
          dView.layers.forEach((l) => {
            l.items.forEach((item) => {
              if (hiddenItems.has(item.id)) {
                item.partIds.forEach((pid) => hiddenParts.add(pid));
              }
            });
          });
        }
        const dissectionPartSet = dView ? new Set(dView.allPartIds) : selection;

        const visibleParts = atlas.parts.filter((p) =>
          s.isolate
            ? dissectionPartSet.has(p.id) && !hiddenParts.has(p.id)
            : visible.has(p.system) || selection.has(p.id),
        );
        const nextLayoutKey =
          visibleParts.map((p) => p.id).join(',') + ':' + camera.aspect.toFixed(3);

        if (nextLayoutKey !== layoutKey) {
          const layout = createExplosionLayout(visibleParts, camera.aspect);
          packingWidth = layout.width;
          packingHeight = layout.height;
          atlas.parts.forEach((p, i) => {
            const cell = layout.cells.get(p.id);
            offsets[i] = cell ? new T.Vector3(cell.x, cell.y + 0.85, 0) : centers[i].clone();
          });
          layoutKey = nextLayoutKey;
          if (amount > 0.05 && !s.isolate) {
            fit(s.view, Math.max(0, (amount - 0.3) / 0.7));
          }
        }

        atlas.parts.forEach((p, i) => {
          const c = centers[i];
          const destination = offsets[i] || c;
          let dx = 0,
            dy = 0,
            dz = 0;

          if (amount <= 0.45) {
            const t = amount / 0.45;
            const group = ATLAS_SYSTEMS.findIndex((sys) => sys.id === p.system);
            const angle = (group / ATLAS_SYSTEMS.length) * Math.PI * 2;
            dx = Math.sin(angle) * t * 0.48;
            dy = (c.y - 0.85) * t * 0.28;
            dz = Math.cos(angle) * t * 0.48;
          } else {
            const t = (amount - 0.45) / 0.55;
            const group = ATLAS_SYSTEMS.findIndex((sys) => sys.id === p.system);
            const angle = (group / ATLAS_SYSTEMS.length) * Math.PI * 2;
            dx = T.MathUtils.lerp(Math.sin(angle) * 0.48, destination.x - c.x, t);
            dy = T.MathUtils.lerp((c.y - 0.85) * 0.28, destination.y - c.y, t);
            dz = T.MathUtils.lerp(Math.cos(angle) * 0.48, -c.z, t);
          }

          const selected = selection.has(p.id);
          const isVis = s.isolate
            ? dissectionPartSet.has(p.id) && !hiddenParts.has(p.id)
            : visible.has(p.system) || selected;
          data.set([dx, dy, dz, isVis ? 1 : 0], i * 4);
          selectedData[i * 4] = selected && !s.isolate ? 255 : 0;
          markerPositions.set(
            isVis ? [c.x + dx, c.y + dy, c.z + dz] : [10000, 10000, 10000],
            i * 3,
          );

          const mesh = pickers[i];
          if (mesh) {
            mesh.position.set(dx, dy, dz);
            mesh.updateMatrix();
            mesh.updateMatrixWorld(true);
          }
        });

        // Actualizar posición de los Pines EVA 3D si la pieza asociada se desplaza
        pinsGroup.children.forEach((pinObj) => {
          const basePos = pinObj.userData?.basePos as [number, number, number] | undefined;
          const partId = pinObj.userData?.atlasPartId as string | undefined;
          if (!basePos) return;
          let ox = 0,
            oy = 0,
            oz = 0;
          if (partId && indexMap.has(partId)) {
            const idx = indexMap.get(partId)!;
            ox = data[idx * 4];
            oy = data[idx * 4 + 1];
            oz = data[idx * 4 + 2];
          }
          pinObj.position.set(basePos[0] + ox, basePos[1] + oy, basePos[2] + oz);
        });

        partTexture.needsUpdate = true;
        selectionTexture.needsUpdate = true;
        markerGeometry.attributes.position.needsUpdate = true;
        lastState = s;
        lastExtent = amount;
        dirty = true;
      }

      if (s.view !== lastView || s.reset !== lastReset) {
        fit(s.view, amount);
        lastView = s.view;
        lastReset = s.reset;
      }
      if (moving && !s.isolate) {
        fit(amount > 0.5 ? 'front' : s.view, Math.max(0, (amount - 0.3) / 0.7));
      }

      const dView = latestDissectionViewRef.current;
      const hiddenItems = latestHiddenItemsRef.current;
      const dissectionPartSet = dView ? new Set(dView.allPartIds) : new Set(s.selected);

      const isolateKey = s.isolate
        ? (dView ? dView.id : s.selected.join(',')) + ':' + s.reset + ':' + camera.aspect
        : '';
      if (isolateKey !== lastIsolate || (s.isolate && moving)) {
        if (s.isolate) {
          const box = new T.Box3();
          atlas.parts.forEach((p, i) => {
            if (dissectionPartSet.has(p.id)) {
              box.union(
                bounds[i]
                  .clone()
                  .translate(new T.Vector3(data[i * 4], data[i * 4 + 1], data[i * 4 + 2])),
              );
            }
          });
          if (!box.isEmpty()) {
            const center = box.getCenter(new T.Vector3());
            const size = box.getSize(new T.Vector3());
            const distance = Math.max(
              0.12,
              (Math.max(size.y, size.x / camera.aspect, size.z) /
                (2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)))) *
                (dView?.cameraPreset?.distanceMultiplier || 1.4),
            );
            controls.target.copy(center);
            camera.position
              .copy(center)
              .add(new T.Vector3(0.22, 0.12, 1).normalize().multiplyScalar(distance));
            controls.update();
            dirty = true;
          }
        } else if (lastIsolate) {
          camera.clearViewOffset();
          fit(s.view, amount);
        }
        lastIsolate = isolateKey;
      }

      // Proyección en tiempo real de etiquetas 3D con líneas guía
      if (s.isolate && dView && el) {
        const now = performance.now();
        if (now - lastLabelUpdate > 30) {
          lastLabelUpdate = now;
          const cw = el.clientWidth;
          const ch = el.clientHeight;
          if (cw > 0 && ch > 0) {
            const screenAnchors: ScreenAnchor[] = [];

            // Centro de la región para ubicar referencias virtuales
            const regionCenter = new T.Vector3();
            let countParts = 0;
            dView.allPartIds.forEach((pid) => {
              if (indexMap.has(pid)) {
                const idx = indexMap.get(pid)!;
                regionCenter.add(centers[idx]);
                countParts++;
              }
            });
            if (countParts > 0) regionCenter.divideScalar(countParts);

            dView.layers.forEach((layer) => {
              layer.items.forEach((item) => {
                if (hiddenItems.has(item.id)) return;

                if (item.isVirtual && item.virtualOffset) {
                  const vPos = regionCenter
                    .clone()
                    .add(new T.Vector3(...item.virtualOffset));
                  const screenPos = vPos.clone().project(camera);
                  if (screenPos.z > -1 && screenPos.z < 1) {
                    const x = (screenPos.x * 0.5 + 0.5) * cw;
                    const y = (-screenPos.y * 0.5 + 0.5) * ch;
                    let isFacing = true;
                    if (item.normal) {
                      const camDir = camera.position.clone().sub(vPos).normalize();
                      isFacing = new T.Vector3(...item.normal).dot(camDir) > -0.25;
                    }
                    screenAnchors.push({
                      id: item.id,
                      index: item.index,
                      name: item.label,
                      detail: item.detail,
                      description: item.description,
                      layerBadge: item.layerBadge,
                      x,
                      y,
                      z: screenPos.z,
                      isFacingCamera: isFacing,
                      isVirtual: true,
                      isActive: item.isActive,
                    });
                  }
                } else if (!item.isVirtual && item.partIds.length > 0) {
                  const partId = item.partIds[0];
                  if (indexMap.has(partId)) {
                    const idx = indexMap.get(partId)!;
                    const pos = new T.Vector3(
                      centers[idx].x + data[idx * 4],
                      centers[idx].y + data[idx * 4 + 1],
                      centers[idx].z + data[idx * 4 + 2],
                    );
                    const screenPos = pos.clone().project(camera);
                    if (screenPos.z > -1 && screenPos.z < 1) {
                      const x = (screenPos.x * 0.5 + 0.5) * cw;
                      const y = (-screenPos.y * 0.5 + 0.5) * ch;
                      const camDir = camera.position.clone().sub(pos).normalize();
                      const partAnchors = anatomyIndexRef.current?.parts?.[partId]?.anchors;
                      const isFacing = partAnchors?.front
                        ? new T.Vector3(...partAnchors.front.normal).dot(camDir) > -0.3
                        : true;

                      screenAnchors.push({
                        id: item.id,
                        index: item.index,
                        name: item.label,
                        detail: item.detail,
                        description: item.description,
                        layerBadge: item.layerBadge,
                        x,
                        y,
                        z: screenPos.z,
                        isFacingCamera: isFacing,
                        isVirtual: false,
                        isActive: item.isActive,
                      });
                    }
                  }
                }
              });
            });

            const laidOut = layoutNumericMarkers(screenAnchors, 28);

            setPlacedLabelsRef.current?.(laidOut);
          }
        }
      } else if (!s.isolate && setPlacedLabelsRef.current) {
        setPlacedLabelsRef.current((prev) => (prev.length > 0 ? [] : prev));
      }

      controls.enableRotate = amount < 0.8;
      controls.mouseButtons.LEFT = amount < 0.8 ? T.MOUSE.ROTATE : T.MOUSE.PAN;
      controls.touches.ONE = amount < 0.8 ? T.TOUCH.ROTATE : T.TOUCH.PAN;
      ground.visible = platform.visible = ring.visible = amount < 0.5 && !s.isolate;
      markers.visible = amount > 0.75;
      controls.autoRotate = s.rotate && !s.isolate && amount < 0.4;
      controls.autoRotateSpeed = 0.85;
      controls.update();
      if (controls.autoRotate) dirty = true;

      if (dirty) {
        renderer.render(scene, camera);
        targets = [];
        if (amount > 0.45) {
          const hasSolid = atlas.parts.some(
            (p, i) => p.system !== 'integumentary' && data[i * 4 + 3] > 0.5,
          );
          atlas.parts.forEach((p, i) => {
            if (data[i * 4 + 3] < 0.5 || (hasSolid && p.system === 'integumentary')) return;
            let left = Infinity,
              right = -Infinity,
              top = Infinity,
              bottom = -Infinity;
            for (let corner = 0; corner < 8; corner++) {
              projected
                .set(
                  p.bounds[corner & 1 ? 1 : 0][0] + data[i * 4],
                  p.bounds[corner & 2 ? 1 : 0][1] + data[i * 4 + 1],
                  p.bounds[corner & 4 ? 1 : 0][2] + data[i * 4 + 2],
                )
                .project(camera);
              const x = ((projected.x + 1) * el.clientWidth) / 2;
              const y = ((1 - projected.y) * el.clientHeight) / 2;
              left = Math.min(left, x);
              right = Math.max(right, x);
              top = Math.min(top, y);
              bottom = Math.max(bottom, y);
            }
            projected
              .copy(centers[i])
              .add(new T.Vector3(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]))
              .project(camera);
            if (projected.z < -1 || projected.z > 1) return;
            targets.push({
              index: i,
              x: ((projected.x + 1) * el.clientWidth) / 2,
              y: ((1 - projected.y) * el.clientHeight) / 2,
              left,
              right,
              top,
              bottom,
            });
          });
        }
        dirty = false;
      }
    };

    animate();

    return () => {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      observer?.disconnect();
      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      env.dispose();
      partTexture.dispose();
      selectionTexture.dispose();
      markerGeometry.dispose();
      markerMaterial.dispose();
      hover.remove();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [atlas]);

  // Repintar cuando cambia el estado de la escena
  useEffect(() => {
    markDirtyRef.current?.();
  }, [sceneState]);

  // 3. Sincronizar Pines EVA 3D registrados sobre las coordenadas reales de BodyParts3D
  useEffect(() => {
    const pinsGroup = pinsGroupRef.current;
    if (!pinsGroup) return;

    while (pinsGroup.children.length > 0) {
      const child = pinsGroup.children[0];
      pinsGroup.remove(child);
    }

    // Posiciones 3D de respaldo por región en sistema BodyParts3D (Y: 0.0m a 1.72m)
    const FALLBACK_REGION_3D: Record<string, [number, number, number]> = {
      CABEZA_ATM: [0, 1.58, 0.09],
      CUELLO_ANT: [0, 1.44, 0.06],
      COL_CERVICAL: [0, 1.46, -0.06],
      TORAX_ABDOMEN: [0, 1.22, 0.11],
      COL_DORSAL: [0, 1.25, -0.10],
      COL_LUMBAR: [0, 1.02, -0.08],
      PELVIS_SACRO: [0, 0.88, -0.09],
      HOMBRO: [0.19, 1.36, 0.01],
      BRAZO: [0.22, 1.18, 0.0],
      CODO: [0.24, 1.03, -0.02],
      ANTEBRAZO: [0.25, 0.90, 0.01],
      MANO_MUNECA: [0.27, 0.74, 0.03],
      CADERA_INGLE: [0.14, 0.88, 0.04],
      MUSLO: [0.11, 0.66, 0.05],
      RODILLA: [0.10, 0.47, 0.05],
      PIERNA: [0.10, 0.28, -0.04],
      TOBILLO_PIE: [0.09, 0.06, 0.05],
    };

    points.forEach((pt) => {
      let basePos: [number, number, number];
      const refArea = pt.referredArea as Record<string, unknown> | null | undefined;
      const savedPos3d = refArea?.pos3d as [number, number, number] | undefined;
      const savedPartId = refArea?.atlasPartId as string | undefined;

      if (
        Array.isArray(savedPos3d) &&
        savedPos3d.length === 3 &&
        typeof savedPos3d[0] === 'number'
      ) {
        basePos = savedPos3d;
      } else if (savedPartId && partIndexByIdRef.current.has(savedPartId)) {
        const idx = partIndexByIdRef.current.get(savedPartId)!;
        const c = partCentersRef.current[idx];
        basePos = c ? [c.x, c.y, c.z] : [0, 1.0, 0.1];
      } else {
        const fb = FALLBACK_REGION_3D[pt.regionCode] || [0, 1.0, 0.1];
        const px =
          pt.laterality === 'D'
            ? -Math.abs(fb[0])
            : pt.laterality === 'I'
              ? Math.abs(fb[0])
              : fb[0];
        const py = fb[1];
        const pz = pt.view === 'posterior' ? -Math.abs(fb[2]) : Math.abs(fb[2]);
        basePos = [px, py, pz];
      }

      const colorHex = getEvaHexColor(pt.eva);
      const pinContainer = new T.Group();
      pinContainer.position.set(basePos[0], basePos[1], basePos[2]);
      pinContainer.userData = {
        isPainPin: true,
        point: pt,
        basePos,
        atlasPartId: savedPartId,
      };

      // Esfera central EVA
      const coreMesh = new T.Mesh(
        new T.SphereGeometry(0.022, 18, 18),
        new T.MeshStandardMaterial({
          color: colorHex,
          emissive: colorHex,
          emissiveIntensity: 0.9,
          roughness: 0.15,
        }),
      );
      pinContainer.add(coreMesh);

      // Halo exterior para puntos gatillo activos o EVA severo
      const haloMesh = new T.Mesh(
        new T.SphereGeometry(0.036, 16, 16),
        new T.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: pt.triggerPoint === 'activo' ? 0.42 : 0.25,
          depthWrite: false,
        }),
      );
      pinContainer.add(haloMesh);

      pinsGroup.add(pinContainer);
    });

    markDirtyRef.current?.();
  }, [points, atlas]);

  // Alternar visibilidad de un sistema anatómico
  const toggleSystem = (id: AtlasSystemId) => {
    setSceneState((s) => ({
      ...s,
      isolate: false,
      visible: s.visible.includes(id)
        ? s.visible.filter((x) => x !== id)
        : [...s.visible, id],
    }));
  };

  // Aplicar preset clínico de capas
  const applyPreset = (systems: AtlasSystemId[]) => {
    setSceneState((s) => ({
      ...s,
      isolate: false,
      selected: [],
      visible: systems,
    }));
  };

  // Resetear visor 3D
  const handleReset = () => {
    setSceneState((s) => ({
      ...INITIAL_SCENE_STATE,
      reset: s.reset + 1,
    }));
    setActiveMapping(null);
    setActiveDrawer(null);
  };

  return (
    <div className={`human-atlas-clinical-studio ${isExpanded ? 'is-expanded' : ''}`}>
      {/* 1. Cabecera Superior del Estudio Anatómico 3D */}
      <div className="human-atlas-topbar">
        <div className="human-atlas-brand">
          <span className="human-atlas-live-dot" />
          <div className="human-atlas-title-row">
            <strong>Atlas Anatómico Humano 3D</strong>
            <span className="human-atlas-badge">
              {visiblePieceCount.toLocaleString()} / {atlas ? atlas.parts.length.toLocaleString() : '2,234'} estructuras
            </span>
          </div>
        </div>

        <div className="human-atlas-toolbar-actions">
          <button
            type="button"
            className={`human-atlas-tool-btn ${activeDrawer === 'layers' ? 'active' : ''}`}
            onClick={() => setActiveDrawer((d) => (d === 'layers' ? null : 'layers'))}
            title="Activar o desactivar capas anatómicas (Músculos, Esqueleto, Nervios, Tendones, Órganos)"
          >
            <MaterialIcon name="layers" size={16} />
            <span>Capas ({sceneState.visible.length}/15)</span>
          </button>

          <button
            type="button"
            className={`human-atlas-tool-btn ${activeDrawer === 'search' ? 'active' : ''}`}
            onClick={() => setActiveDrawer((d) => (d === 'search' ? null : 'search'))}
            title="Buscar entre las 3,432 estructuras FMA del cuerpo humano"
          >
            <MaterialIcon name="search" size={16} />
            <span>Buscar en Atlas 3D</span>
          </button>

          <button
            type="button"
            className={`human-atlas-tool-btn ${activeDrawer === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveDrawer((d) => (d === 'catalog' ? null : 'catalog'))}
            title="Ver catálogo rápido de puntos gatillo y estructuras EVA"
          >
            <MaterialIcon name="my_location" size={16} />
            <span>Puntos EVA ({clinicalCatalogStructures.length})</span>
          </button>

          {onToggleExpand && (
            <button
              type="button"
              className={`human-atlas-tool-btn ${isExpanded ? 'active' : ''}`}
              onClick={onToggleExpand}
              title={
                isExpanded
                  ? 'Contraer a vista de dos columnas'
                  : 'Expandir Atlas 3D a ancho completo (100%)'
              }
            >
              <MaterialIcon name={isExpanded ? 'fullscreen_exit' : 'fullscreen'} size={16} />
              <span>{isExpanded ? '2 Columnas' : 'Ampliar 100%'}</span>
            </button>
          )}

          <button
            type="button"
            className="human-atlas-tool-btn icon-only"
            onClick={() => setShowAboutModal((v) => !v)}
            title="Fuente científica y licencia CC BY 4.0 (BodyParts3D)"
          >
            <MaterialIcon name="info" size={16} />
          </button>
        </div>
      </div>

      {/* 2. Barra Rápida de Presets Clínicos por Especialidad */}
      <div className="human-atlas-presets-bar">
        {CLINICAL_LAYER_PRESETS.map((preset) => {
          const isCurrent =
            preset.systems.length === sceneState.visible.length &&
            preset.systems.every((id) => sceneState.visible.includes(id));
          return (
            <button
              key={preset.id}
              type="button"
              className={`human-atlas-preset-chip ${isCurrent ? 'active' : ''}`}
              onClick={() => applyPreset(preset.systems)}
            >
              {preset.label}
            </button>
          );
        })}

        <label className="human-atlas-auto-eva-toggle" title="Abrir formulario EVA automáticamente al tocar una estructura 3D">
          <input
            type="checkbox"
            checked={autoOpenEvaOnTap}
            onChange={(e) => setAutoOpenEvaOnTap(e.target.checked)}
          />
          <span>Abrir ficha EVA al tocar</span>
        </label>
      </div>

      {/* 3. Lienzo 3D Interactivo + Paneles Superpuestos */}
      <div className="human-atlas-viewport-area">
        <div ref={hostRef} className="human-atlas-canvas-host" />

        {/* Capa de Etiquetas 3D con Líneas Guía (Overlay SVG de Disección) */}
        {sceneState.isolate && placedLabels.length > 0 && containerSize.width > 0 && (
          <AnatomyLabelsOverlay
            labels={placedLabels}
            width={containerSize.width}
            height={containerSize.height}
            hoveredId={hoveredLabelId}
            selectedId={sceneState.selected[0] || null}
            onHover={setHoveredLabelId}
            onSelect={(id) => {
              const item = dissectionView?.layers.flatMap((l) => l.items).find((i) => i.id === id);
              if (item && item.partIds.length > 0) {
                handlePartSelected(item.partIds[0], undefined, false);
              }
            }}
          />
        )}

        {/* Indicador de carga progresiva de los 15 bloques binarios */}
        {progress < 100 && !error && (
          <div className="human-atlas-loading-overlay" role="status">
            <div className="human-atlas-spinner" />
            <div className="human-atlas-loading-info">
              <strong>Preparando Atlas Anatómico 3D de Precisión</strong>
              <span>
                {progress}% · Cargando {atlas?.parts.length.toLocaleString() ?? '2,234'} estructuras anatómicas en 3D
              </span>
              <div className="human-atlas-progress-bar">
                <i style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}

        {/* Fallback de error o entorno sin WebGL */}
        {error && (
          <div className="human-atlas-error-overlay" role="alert">
            <MaterialIcon name="error" size={32} color="#f43f5e" />
            <p>{error}</p>
          </div>
        )}

        {/* Panel Desplegable 1: Capas y 15 Sistemas Anatómicos */}
        {activeDrawer === 'layers' && (
          <div className="human-atlas-floating-drawer left">
            <div className="human-atlas-drawer-header">
              <strong>Sistemas Anatómicos (15)</strong>
              <button
                type="button"
                className="human-atlas-close-btn"
                onClick={() => setActiveDrawer(null)}
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>
            <div className="human-atlas-systems-scroll">
              {activeSystems.map((sys) => {
                const enabled = sceneState.visible.includes(sys.id);
                return (
                  <div
                    key={sys.id}
                    className={`human-atlas-system-item ${enabled ? 'enabled' : ''}`}
                  >
                    <button
                      type="button"
                      className="human-atlas-system-toggle-main"
                      onClick={() => toggleSystem(sys.id)}
                    >
                      <span
                        className="human-atlas-system-color-dot"
                        style={{ backgroundColor: sys.color }}
                      />
                      <span className="human-atlas-system-name">{sys.nameEs}</span>
                      <span className="human-atlas-system-count">
                        {systemCounts[sys.id]}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="human-atlas-system-only-btn"
                      onClick={() =>
                        setSceneState((s) => ({
                          ...s,
                          visible: [sys.id],
                          isolate: false,
                          selected: [],
                        }))
                      }
                      title={`Mostrar únicamente ${sys.nameEs}`}
                    >
                      Solo
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="human-atlas-drawer-footer">
              <span>{visiblePieceCount.toLocaleString()} piezas activas</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="human-atlas-link-btn"
                  onClick={() =>
                    setSceneState((s) => ({
                      ...s,
                      visible: activeSystems.map((x) => x.id),
                      isolate: false,
                    }))
                  }
                >
                  Mostrar todo
                </button>
                <button
                  type="button"
                  className="human-atlas-link-btn"
                  onClick={() =>
                    setSceneState((s) => ({
                      ...s,
                      visible: ['integumentary'],
                      isolate: false,
                    }))
                  }
                >
                  Solo piel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Panel Desplegable 2: Buscador de las 3,432 Estructuras Anatómicas */}
        {activeDrawer === 'search' && (
          <div className="human-atlas-floating-drawer left">
            <div className="human-atlas-drawer-header">
              <strong>Buscar en 3,432 Estructuras 3D</strong>
              <button
                type="button"
                className="human-atlas-close-btn"
                onClick={() => setActiveDrawer(null)}
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>
            <div className="human-atlas-search-box">
              <MaterialIcon name="search" size={16} color="#94a3b8" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ej. Supraespinoso, Piramidal, Aquiles, Aorta, Fémur..."
              />
              {searchQuery && (
                <button
                  type="button"
                  className="human-atlas-clear-input"
                  onClick={() => setSearchQuery('')}
                >
                  ×
                </button>
              )}
            </div>
            <div className="human-atlas-search-results">
              {searchResults.map((concept) => (
                <button
                  key={concept.id}
                  type="button"
                  className="human-atlas-search-item"
                  onClick={() => handleSelectConcept(concept)}
                >
                  <div>
                    <div className="human-atlas-search-item-title">
                      {translateAtlasNameEs(concept.name)}
                    </div>
                    <div className="human-atlas-search-item-sub">
                      Código Anatómico: <strong>{concept.id}</strong>
                    </div>
                  </div>
                  <span className="human-atlas-piece-pill">
                    {concept.elements.length} {concept.elements.length === 1 ? 'pieza' : 'piezas'}
                  </span>
                </button>
              ))}
              {searchResults.length === 0 && (
                <p className="human-atlas-empty-msg">
                  No se encontraron estructuras con "{searchQuery}".
                </p>
              )}
            </div>
          </div>
        )}

        {/* Panel Desplegable 3: Puntos EVA Clínicos Directos (~170 estructuras) */}
        {activeDrawer === 'catalog' && (
          <div className="human-atlas-floating-drawer left">
            <div className="human-atlas-drawer-header">
              <strong>
                Puntos EVA Disponibles ({clinicalCatalogStructures.length})
              </strong>
              <button
                type="button"
                className="human-atlas-close-btn"
                onClick={() => setActiveDrawer(null)}
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>
            <div className="human-atlas-search-results">
              {clinicalCatalogStructures.map((struct) => {
                const isSelected = selectedStructureCode === struct.code;
                return (
                  <button
                    key={struct.code}
                    type="button"
                    className={`human-atlas-search-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onSelectStructure?.(struct.code);
                      setActiveDrawer(null);
                    }}
                  >
                    <div>
                      <div className="human-atlas-search-item-title">{struct.label}</div>
                      <div className="human-atlas-search-item-sub">
                        {struct.kind?.toUpperCase()} · {struct.lateral ? 'Lateral (D/I)' : 'Central'}
                        {struct.icd10Hints?.[0] ? ` · CIE-10: ${struct.icd10Hints[0]}` : ''}
                      </div>
                    </div>
                    <MaterialIcon name="add_circle" size={16} color="#14b8a6" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Controles de Cámara (3/4, Frontal, Lateral, Posterior, Giro, Reset) */}
        <div
          className={`human-atlas-camera-dock ${sceneState.isolate ? 'dock-isolated' : ''}`}
          role="toolbar"
          aria-label="Vistas de cámara 3D"
        >
          {(
            [
              { id: 'three-quarter', label: '¾', title: 'Vista 3/4 Oblicua' },
              { id: 'front', label: '0°', title: 'Vista Frontal Anterior (0°)' },
              { id: 'side', label: '90°', title: 'Vista Lateral (90°)' },
              { id: 'back', label: '180°', title: 'Vista Posterior Dorsal (180°)' },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              type="button"
              className={`human-atlas-cam-btn ${sceneState.view === v.id ? 'active' : ''}`}
              onClick={() =>
                setSceneState((s) => ({
                  ...s,
                  view: v.id,
                  reset: s.reset + 1,
                  rotate: false,
                }))
              }
              title={v.title}
            >
              {v.label}
            </button>
          ))}
          <div className="human-atlas-cam-divider" />
          <button
            type="button"
            className={`human-atlas-cam-btn ${sceneState.rotate ? 'active' : ''}`}
            onClick={() => setSceneState((s) => ({ ...s, rotate: !s.rotate }))}
            title="Alternar rotación orbital continua 360°"
          >
            <MaterialIcon name={sceneState.rotate ? 'pause' : '360'} size={15} />
          </button>
          <button
            type="button"
            className="human-atlas-cam-btn"
            onClick={handleReset}
            title="Restablecer vista y ensamblar anatomía"
          >
            <MaterialIcon name="restart_alt" size={16} />
          </button>
        </div>

        {/* Panel de Disección Anatómica Estratificada (cuando una pieza está aislada) */}
        {sceneState.isolate && dissectionView ? (
          <DissectionPanel
            view={dissectionView}
            hiddenItemIds={hiddenDissectionItems}
            hoveredId={hoveredLabelId}
            selectedId={sceneState.selected[0] || null}
            onToggleItem={(itemId) => {
              setHiddenDissectionItems((prev) => {
                const next = new Set(prev);
                if (next.has(itemId)) next.delete(itemId);
                else next.add(itemId);
                return next;
              });
              markDirtyRef.current?.();
            }}
            onHoverItem={setHoveredLabelId}
            onSelectItem={(itemId) => {
              const item = dissectionView.layers.flatMap((l) => l.items).find((i) => i.id === itemId);
              if (item && item.partIds.length > 0) {
                handlePartSelected(item.partIds[0], undefined, false);
              }
            }}
            onExitIsolation={() => {
              setSceneState((s) => ({ ...s, isolate: false }));
              setDissectionView(null);
            }}
            onOpenEva={() => {
              if (activeMapping && onSelectStructure) {
                onSelectStructure(
                  activeMapping.structureCode,
                  { x: activeMapping.coordX, y: activeMapping.coordY },
                  {
                    laterality: activeMapping.laterality,
                    view: activeMapping.view,
                    regionCode: activeMapping.regionCode,
                    atlasMeta: {
                      atlasPartId: activeMapping.atlasPartId,
                      atlasPartName: activeMapping.atlasPartName,
                      atlasPartNameEs: activeMapping.atlasPartNameEs,
                      fmaId: activeMapping.fmaId,
                      system: activeMapping.system,
                      pos3d: activeMapping.pos3d,
                    },
                  },
                );
              } else if (activeMapping) {
                onSelectRegion(activeMapping.regionCode);
              }
            }}
          />
        ) : (
          /* Tarjeta Flotante Normal de Inspección cuando no está en aislamiento */
          activeMapping && (
            <div className="human-atlas-inspector-card">
              <div className="human-atlas-inspector-top">
                <div>
                  <span className="human-atlas-inspector-fma">
                    CÓDIGO {activeMapping.fmaId} · PIEZA {activeMapping.atlasPartId}
                  </span>
                  <h5 className="human-atlas-inspector-title">
                    {activeMapping.atlasPartNameEs}
                  </h5>
                  <p className="human-atlas-inspector-subtitle">
                    Zona clínica: <strong>{activeMapping.structureLabel}</strong> ({activeMapping.regionLabel} ·{' '}
                    {activeMapping.laterality === 'D'
                      ? 'Lado Derecho'
                      : activeMapping.laterality === 'I'
                        ? 'Lado Izquierdo'
                        : 'Eje Central'}
                    )
                  </p>
                </div>
                <button
                  type="button"
                  className="human-atlas-close-btn"
                  onClick={() => {
                    setActiveMapping(null);
                    setSceneState((s) => ({ ...s, selected: [], isolate: false }));
                  }}
                  title="Limpiar selección 3D"
                >
                  <MaterialIcon name="close" size={16} />
                </button>
              </div>

              <div className="human-atlas-inspector-actions">
                <button
                  type="button"
                  className={`human-atlas-action-btn secondary ${sceneState.isolate ? 'active' : ''}`}
                  onClick={() =>
                    setSceneState((s) => ({
                      ...s,
                      isolate: !s.isolate,
                      explode: 0,
                    }))
                  }
                >
                  <MaterialIcon name="center_focus_strong" size={15} />
                  <span>{sceneState.isolate ? 'Ver cuerpo completo' : 'Aislar pieza en 3D'}</span>
                </button>

                <button
                  type="button"
                  className="human-atlas-action-btn primary"
                  onClick={() => {
                    if (onSelectStructure) {
                      onSelectStructure(
                        activeMapping.structureCode,
                        { x: activeMapping.coordX, y: activeMapping.coordY },
                        {
                          laterality: activeMapping.laterality,
                          view: activeMapping.view,
                          regionCode: activeMapping.regionCode,
                          atlasMeta: {
                            atlasPartId: activeMapping.atlasPartId,
                            atlasPartName: activeMapping.atlasPartName,
                            atlasPartNameEs: activeMapping.atlasPartNameEs,
                            fmaId: activeMapping.fmaId,
                            system: activeMapping.system,
                            pos3d: activeMapping.pos3d,
                          },
                        },
                      );
                    } else {
                      onSelectRegion(activeMapping.regionCode);
                    }
                  }}
                >
                  <MaterialIcon name="add_location_alt" size={15} />
                  <span>Evaluar Dolor EVA (0–10)</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* Modal de Créditos y Licencia CC BY 4.0 */}
        {showAboutModal && (
          <div className="human-atlas-about-card">
            <div className="human-atlas-drawer-header">
              <strong>Fuente Anatómica & Licencia Verificada</strong>
              <button
                type="button"
                className="human-atlas-close-btn"
                onClick={() => setShowAboutModal(false)}
              >
                <MaterialIcon name="close" size={16} />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Basado en <strong>ashemag/human-atlas</strong> (MIT License) y el dataset científico{' '}
              <strong>BodyParts3D 4.0</strong> (© The Database Center for Life Science, licenciado bajo{' '}
              <strong>CC Attribution 4.0 International</strong>). Incluye 2,234 mallas anatómicas
              individuales y 3,432 conceptos FMA con selección por triángulo y despiece interactivo.
            </p>
          </div>
        )}
      </div>

      {/* 4. Dock Inferior: Despiece Anatómico (0%-100%) + Resumen de Pines EVA */}
      <div className="human-atlas-bottom-dock">
        <div className="human-atlas-explode-group">
          <div className="human-atlas-explode-header">
            <label htmlFor="human-atlas-explode-range">
              <MaterialIcon name="open_in_full" size={14} />
              <span>Separar Capas Anatómicas (Despiece):</span>
            </label>
            <strong>{Math.round(sceneState.explode * 100)}%</strong>
          </div>
          <input
            id="human-atlas-explode-range"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(sceneState.explode * 100)}
            onChange={(e) => {
              const val = Number(e.target.value) / 100;
              setSceneState((s) => ({
                ...s,
                explode: val,
                view: val > 0.8 ? 'front' : s.view,
                rotate: false,
              }));
            }}
            className="human-atlas-explode-slider"
          />
        </div>

        {/* Chips de Puntos EVA Registrados sobre el Modelo 3D */}
        {points.length > 0 && (
          <div className="human-atlas-pins-strip">
            {points.map((pt) => (
              <button
                key={pt.id}
                type="button"
                className="human-atlas-pin-chip"
                onClick={() => onSelectPoint?.(pt)}
                title="Editar este punto de dolor EVA"
              >
                <span
                  className="human-atlas-pin-score"
                  style={{ backgroundColor: getEvaCssColor(pt.eva) }}
                >
                  {pt.eva}
                </span>
                <span className="human-atlas-pin-label">
                  {pt.structureLabel || pt.structureCode}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
