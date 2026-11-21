import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PainPoint } from '@citassistema/shared-types';
import { MaterialIcon } from '../../ui/MaterialIcon';

export interface PainMap3DViewerProps {
  modelUrl?: string;
  points: PainPoint[];
  onSelectRegion: (regionCode: string) => void;
  onSelectPoint?: (point: PainPoint) => void;
  hoveredRegionCode?: string | null;
  onHoverRegion?: (code: string | null) => void;
}

// Mapeo de mallas 3D anatómicas a códigos del catálogo clínico
const MESH_TO_REGION_MAP: Record<string, { code: string; label: string; isRight?: boolean }> = {
  head: { code: 'CABEZA_ATM', label: 'Cabeza, Cara y ATM' },
  neck: { code: 'COL_CERVICAL', label: 'Columna Cervical y Cuello' },
  chest: { code: 'TORAX_ABDOMEN', label: 'Tórax Anterior y Pectorales' },
  abdomen: { code: 'TORAX_ABDOMEN', label: 'Abdomen y Pared Abdominal' },
  back: { code: 'COL_DORSAL', label: 'Columna Dorsal y Lumbar' },
  pelvis: { code: 'PELVIS_SACRO', label: 'Pelvis y Región Glútea' },
  leftShoulder: { code: 'HOMBRO', label: 'Hombro Izquierdo', isRight: false },
  rightShoulder: { code: 'HOMBRO', label: 'Hombro Derecho', isRight: true },
  leftArm: { code: 'BRAZO', label: 'Brazo Izquierdo', isRight: false },
  rightArm: { code: 'BRAZO', label: 'Brazo Derecho', isRight: true },
  leftElbow: { code: 'CODO', label: 'Codo Izquierdo', isRight: false },
  rightElbow: { code: 'CODO', label: 'Codo Derecho', isRight: true },
  leftHand: { code: 'MANO_MUNECA', label: 'Mano y Muñeca Izquierda', isRight: false },
  rightHand: { code: 'MANO_MUNECA', label: 'Mano y Muñeca Derecha', isRight: true },
  leftThigh: { code: 'MUSLO', label: 'Muslo Izquierdo', isRight: false },
  rightThigh: { code: 'MUSLO', label: 'Muslo Derecho', isRight: true },
  leftKnee: { code: 'RODILLA', label: 'Rodilla Izquierda', isRight: false },
  rightKnee: { code: 'RODILLA', label: 'Rodilla Derecha', isRight: true },
  leftCalf: { code: 'PIERNA', label: 'Pierna / Pantorrilla Izquierda', isRight: false },
  rightCalf: { code: 'PIERNA', label: 'Pierna / Pantorrilla Derecha', isRight: true },
  leftFoot: { code: 'TOBILLO_PIE', label: 'Pie y Tobillo Izquierdo', isRight: false },
  rightFoot: { code: 'TOBILLO_PIE', label: 'Pie y Tobillo Derecho', isRight: true },
};

// Ángulos de cámara prestablecidos (coincidentes con el turnaround anatómico de referencia)
const CAMERA_PRESETS = [
  { label: 'Frontal (0°)', angle: 0, camPos: [0, 0.05, 2.3] as [number, number, number] },
  { label: '3/4 Der (45°)', angle: 45, camPos: [1.6, 0.05, 1.6] as [number, number, number] },
  { label: 'Lat Der (90°)', angle: 90, camPos: [2.3, 0.05, 0] as [number, number, number] },
  { label: 'Post 3/4 Der (135°)', angle: 135, camPos: [1.6, 0.05, -1.6] as [number, number, number] },
  { label: 'Posterior (180°)', angle: 180, camPos: [0, 0.05, -2.3] as [number, number, number] },
  { label: 'Post 3/4 Izq (225°)', angle: 225, camPos: [-1.6, 0.05, -1.6] as [number, number, number] },
  { label: 'Lat Izq (270°)', angle: 270, camPos: [-2.3, 0.05, 0] as [number, number, number] },
  { label: 'Frontal 3/4 Izq (315°)', angle: 315, camPos: [-1.6, 0.05, 1.6] as [number, number, number] },
];

export const PainMap3DViewer: React.FC<PainMap3DViewerProps> = ({
  modelUrl = '/models/female_anatomy_eva.glb',
  points,
  onSelectRegion,
  onSelectPoint,
  hoveredRegionCode: _hoveredRegionCode,
  onHoverRegion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [hoveredMeshInfo, setHoveredMeshInfo] = useState<{ name: string; label: string } | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  // Referencias mutables para el ciclo Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const meshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const origMaterialsRef = useRef<Map<string, THREE.Material>>(new Map());
  const highlightMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);

  // Inicialización de la Escena Three.js
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 520;

    // 1. Escena con fondo neutro de clínica
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // slate-50
    sceneRef.current = scene;

    // 2. Cámara de perspectiva
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.05, 2.3);
    cameraRef.current = camera;

    // 3. Renderer WebGL optimizado con protección para entornos sin WebGL (jsdom/servidores)
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (e) {
      console.warn('WebGLRenderer unavailable in this environment:', e);
      setLoadError('Aceleración WebGL no disponible en este dispositivo. Puedes cambiar al modo 2D Jerárquico.');
      setLoading(false);
      return;
    }

    // 4. Controles de Órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1.0;
    controls.maxDistance = 4.0;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // 5. Iluminación Anatómica de Estudio
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(2.5, 4.0, 3.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.8);
    fillLight.position.set(-2.5, 1.5, 2.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, 0.7);
    rimLight.position.set(0, 2.5, -3.0);
    scene.add(rimLight);

    // Grupo de pines de dolor
    const pinsGroup = new THREE.Group();
    scene.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    // Material de resaltado quirúrgico
    highlightMaterialRef.current = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // sky-600
      emissive: 0x0369a1,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.1,
    });

    // 6. Carga del Modelo GLB
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);
        modelGroupRef.current = model;

        // Registrar mallas para raycasting
        const meshMap = new Map<string, THREE.Mesh>();
        const matMap = new Map<string, THREE.Material>();

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            meshMap.set(child.name, child);
            if (Array.isArray(child.material)) {
              matMap.set(child.name, child.material[0].clone());
            } else if (child.material) {
              matMap.set(child.name, child.material.clone());
            }
          }
        });

        meshesRef.current = meshMap;
        origMaterialsRef.current = matMap;
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Error cargando modelo GLB anatómico:', err);
        setLoadError('No se pudo cargar el modelo 3D. Asegúrate de que el archivo GLB exista.');
        setLoading(false);
      }
    );

    // 7. Bucle de Renderizado
    const clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      clock.getDelta();

      // Transición suave de cámara hacia preset
      if (targetCamPosRef.current && cameraRef.current && controlsRef.current) {
        cameraRef.current.position.lerp(targetCamPosRef.current, 0.08);
        controlsRef.current.update();
        if (cameraRef.current.position.distanceTo(targetCamPosRef.current) < 0.01) {
          targetCamPosRef.current = null;
        }
      } else {
        controls.update();
      }

      // Animación de pulso para pines de dolor
      if (pinsGroupRef.current) {
        const t = clock.getElapsedTime();
        pinsGroupRef.current.children.forEach((pin, i) => {
          const scale = 1 + 0.15 * Math.sin(t * 4 + i);
          pin.scale.set(scale, scale, scale);
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // 8. Manejo de redimensionamiento
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 520;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  // Manejo de Auto-Rotación
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
      controlsRef.current.autoRotateSpeed = 2.0;
    }
  }, [autoRotate]);

  // Manejo de Pines de Dolor en 3D
  useEffect(() => {
    const pinsGroup = pinsGroupRef.current;
    if (!pinsGroup) return;

    // Limpiar pines anteriores
    while (pinsGroup.children.length > 0) {
      const child = pinsGroup.children[0];
      pinsGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    // Ubicaciones de referencia 3D para cada región clínica
    const REGION_ANCHORS_3D: Record<string, [number, number, number]> = {
      CABEZA_ATM: [0, 0.70, 0.08],
      COL_CERVICAL: [0, 0.52, -0.06],
      CUELLO_ANT: [0, 0.52, 0.07],
      TORAX_ABDOMEN: [0, 0.28, 0.12],
      COL_DORSAL: [0, 0.32, -0.10],
      COL_LUMBAR: [0, 0.08, -0.09],
      PELVIS_SACRO: [0, -0.08, -0.08],
      HOMBRO: [0.26, 0.42, 0.02],
      BRAZO: [0.32, 0.24, 0.0],
      CODO: [0.34, 0.12, -0.02],
      ANTEBRAZO: [0.36, -0.02, 0.0],
      MANO_MUNECA: [0.38, -0.16, 0.02],
      CADERA_INGLE: [0.18, -0.14, 0.04],
      MUSLO: [0.16, -0.32, 0.04],
      RODILLA: [0.16, -0.52, 0.06],
      PIERNA: [0.16, -0.68, 0.04],
      TOBILLO_PIE: [0.16, -0.80, 0.08],
    };

    // Color según intensidad EVA
    const getEvaColor = (eva: number): number => {
      if (eva <= 3) return 0x22c55e; // Verde
      if (eva <= 6) return 0xeab308; // Amarillo
      if (eva <= 8) return 0xf97316; // Naranja
      return 0xef4444; // Rojo crítico
    };

    points.forEach((pt) => {
      const anchor = REGION_ANCHORS_3D[pt.regionCode] || [0, 0, 0.1];
      const posX = pt.laterality === 'D' ? -Math.abs(anchor[0]) : pt.laterality === 'I' ? Math.abs(anchor[0]) : anchor[0];
      const posY = anchor[1];
      const posZ = pt.view === 'posterior' ? -Math.abs(anchor[2]) : Math.abs(anchor[2]);

      // Geometría del Pin 3D
      const pinGeom = new THREE.SphereGeometry(0.028, 16, 16);
      const pinMat = new THREE.MeshStandardMaterial({
        color: getEvaColor(pt.eva),
        emissive: getEvaColor(pt.eva),
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });

      const pinMesh = new THREE.Mesh(pinGeom, pinMat);
      pinMesh.position.set(posX, posY, posZ);
      pinMesh.userData = { isPainPoint: true, point: pt };
      pinsGroup.add(pinMesh);
    });
  }, [points]);

  // Selección de Ángulo de Giro
  const setCameraAngle = useCallback((index: number) => {
    setActiveAngleIndex(index);
    const preset = CAMERA_PRESETS[index];
    if (preset) {
      targetCamPosRef.current = new THREE.Vector3(...preset.camPos);
    }
  }, []);

  // Raycasting para Hover y Click
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || loading) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const meshes = Array.from(meshesRef.current.values());
    const intersects = raycaster.intersectObjects(meshes, false);

    // Restaurar materiales anteriores
    meshesRef.current.forEach((mesh, name) => {
      const origMat = origMaterialsRef.current.get(name);
      if (origMat) mesh.material = origMat;
    });

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const meshName = hitMesh.name;
      const mapping = MESH_TO_REGION_MAP[meshName];

      if (mapping) {
        if (highlightMaterialRef.current) {
          hitMesh.material = highlightMaterialRef.current;
        }
        setHoveredMeshInfo({ name: meshName, label: mapping.label });
        onHoverRegion?.(mapping.code);
        if (containerRef.current) containerRef.current.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredMeshInfo(null);
    onHoverRegion?.(null);
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !cameraRef.current || loading) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    // 1. Verificar si se hizo clic en un Pin existente
    if (pinsGroupRef.current) {
      const pinIntersects = raycaster.intersectObjects(pinsGroupRef.current.children, false);
      if (pinIntersects.length > 0) {
        const pinHit = pinIntersects[0].object;
        if (pinHit.userData?.isPainPoint && pinHit.userData.point) {
          onSelectPoint?.(pinHit.userData.point);
          return;
        }
      }
    }

    // 2. Clic en malla anatómica
    const meshes = Array.from(meshesRef.current.values());
    const intersects = raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hitMesh = intersects[0].object as THREE.Mesh;
      const mapping = MESH_TO_REGION_MAP[hitMesh.name];
      if (mapping) {
        onSelectRegion(mapping.code);
      }
    }
  };

  return (
    <div className="pain-3d-wrapper relative w-full h-[540px] rounded-2xl overflow-hidden bg-slate-900 shadow-inner flex flex-col">
      {/* Barra de Ángulos de Turnaround (0° a 315°) */}
      <div className="pain-3d-angles-bar absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-1 overflow-x-auto bg-slate-950/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-1">
          <MaterialIcon name="360" size={16} className="text-emerald-400 mr-1" />
          <span className="font-semibold text-slate-200 hidden sm:inline">Vistas 360°:</span>
        </div>
        <div className="flex items-center gap-1">
          {CAMERA_PRESETS.map((preset, i) => (
            <button
              key={preset.angle}
              type="button"
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                activeAngleIndex === i
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-800/60 hover:bg-slate-700/80 text-slate-300'
              }`}
              onClick={() => setCameraAngle(i)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
            autoRotate
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
          }`}
          onClick={() => setAutoRotate(!autoRotate)}
          title="Alternar rotación automática"
        >
          <MaterialIcon name="sync" size={14} className={autoRotate ? 'animate-spin' : ''} />
          <span className="hidden md:inline">Giro continuo</span>
        </button>
      </div>

      {/* Contenedor Canvas WebGL */}
      <div
        ref={containerRef}
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing relative"
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      >
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-200 z-20">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">Cargando modelo anatómico 3D de alta precisión...</p>
            <p className="text-xs text-slate-400 mt-1">Renderizando geometría editable, escala y grupos PBR</p>
          </div>
        )}

        {/* Error Fallback */}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 text-rose-400 p-6 text-center z-20">
            <MaterialIcon name="error_outline" size={36} className="mb-2" />
            <p className="text-sm font-semibold">{loadError}</p>
          </div>
        )}

        {/* Tooltip flotante con la estructura resaltada */}
        {hoveredMeshInfo && (
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-slate-950/90 backdrop-blur-md border border-sky-500/30 px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <div>
              <p className="text-xs font-semibold text-white">{hoveredMeshInfo.label}</p>
              <p className="text-[10px] text-slate-400">Haz clic para registrar o evaluar dolor EVA</p>
            </div>
          </div>
        )}

        {/* Leyenda de Ayuda y Navegación */}
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] text-slate-400 flex items-center gap-3">
          <span>🖱️ Arrastra: Rotar 360°</span>
          <span>🔍 Rueda: Zoom</span>
          <span>⚡ Clic: Seleccionar región</span>
        </div>
      </div>
    </div>
  );
};
