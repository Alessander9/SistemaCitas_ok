// apps/frontend/src/components/clinical/pain-map/anatomyHierarchy.ts
// Resolves any selected 3D part into a complete multi-layered Dissection View:
// Priority: 1. Curated Region -> 2. Base Muscle with Component Heads -> 3. FMA Clinical Group -> 4. Single Part

import { CURATED_DISSECTION_REGIONS, RegionalDissectionDef, RegionalLayerItem } from './anatomyRegions';
import { translateAtlasNameEs, HumanAtlasManifest, AtlasPart } from './humanAtlasEngine';

export interface VirtualLandmark {
  id: string;
  label: string;
  detail?: string;
  offset: [number, number, number];
  normal?: [number, number, number];
  isVirtual: true;
}

export interface DissectionItem {
  id: string;
  label: string;
  detail?: string;
  partIds: string[]; // 3D parts associated with this item
  isVirtual?: boolean;
  virtualOffset?: [number, number, number];
  normal?: [number, number, number];
  defaultVisible: boolean;
  isActive: boolean; // Is it the currently selected part
}

export interface DissectionLayer {
  key: 'superficial' | 'intermedio' | 'profundo' | 'estructurasClave';
  label: string;
  items: DissectionItem[];
}

export interface DissectionView {
  id: string;
  title: string;
  subtitle: string;
  focusPartId: string;
  side: 'izq' | 'der' | 'medial';
  sideLabel: string;
  layers: DissectionLayer[];
  landmarks: VirtualLandmark[];
  includes: string[];
  allPartIds: string[]; // Every real 3D mesh that belongs to this view
  cameraPreset: {
    azimuth: number;
    elevation: number;
    distanceMultiplier: number;
  };
  source: 'curated' | 'components' | 'fma-group' | 'single';
}

export interface AnatomyIndexPart {
  id: string;
  name: string;
  conceptId: string;
  system: string;
  side: 'izq' | 'der' | 'medial';
  baseMuscle: string;
  hasSubparts: boolean;
  components: string[];
  anchors: {
    center: [number, number, number];
    front: { pos: [number, number, number]; normal: [number, number, number] };
    back: { pos: [number, number, number]; normal: [number, number, number] };
    left: { pos: [number, number, number]; normal: [number, number, number] };
    right: { pos: [number, number, number]; normal: [number, number, number] };
    top: { pos: [number, number, number]; normal: [number, number, number] };
  };
  neighbors?: string[];
  primaryFmaGroup?: {
    id: string;
    name: string;
    elementCount: number;
    elements: string[];
  } | null;
}

export interface AnatomyIndexManifest {
  version: string;
  parts: Record<string, AnatomyIndexPart>;
}

// Side resolver helper
export function getPartSide(part: AtlasPart): 'izq' | 'der' | 'medial' {
  const name = part.name.toLowerCase();
  if (name.startsWith('left ') || name.includes(' left ') || name.endsWith(' left') || part.id.endsWith('M')) {
    return 'izq';
  }
  if (name.startsWith('right ') || name.includes(' right ') || name.endsWith(' right')) {
    return 'der';
  }
  return 'medial';
}

/**
 * Resolves a selected 3D part into a layered DissectionView.
 */
export function resolveDissectionView(
  focusPartId: string,
  atlas: HumanAtlasManifest,
  indexData?: AnatomyIndexManifest | null,
): DissectionView {
  const partMap = new Map(atlas.parts.map((p) => [p.id, p]));
  const focusPart = partMap.get(focusPartId);

  if (!focusPart) {
    throw new Error(`Part ${focusPartId} not found in atlas`);
  }

  const side = getPartSide(focusPart);

  // ---------------------------------------------------------------------------
  // 1. Check for Curated Region Match
  // ---------------------------------------------------------------------------
  const curatedMatch = CURATED_DISSECTION_REGIONS.find((region) =>
    region.targetKeywords.test(focusPart.name),
  );

  if (curatedMatch) {
    return buildFromCuratedRegion(curatedMatch, focusPart, side, partMap);
  }

  // ---------------------------------------------------------------------------
  // 2. Check for Base Muscle with Components (Heads / Portions)
  // ---------------------------------------------------------------------------
  const indexedPart = indexData?.parts?.[focusPartId];
  if (indexedPart && indexedPart.hasSubparts && indexedPart.components.length > 1) {
    return buildFromComponents(indexedPart, focusPart, side, partMap);
  }

  // ---------------------------------------------------------------------------
  // 3. Check for Clinical FMA Group
  // ---------------------------------------------------------------------------
  if (indexedPart?.primaryFmaGroup && indexedPart.primaryFmaGroup.elements.length > 1) {
    return buildFromFmaGroup(indexedPart, focusPart, side, partMap);
  }

  // ---------------------------------------------------------------------------
  // 4. Single Part Fallback
  // ---------------------------------------------------------------------------
  return buildFromSinglePart(focusPart, side);
}

// -----------------------------------------------------------------------------
// Builders
// -----------------------------------------------------------------------------

function buildFromCuratedRegion(
  def: RegionalDissectionDef,
  focusPart: AtlasPart,
  side: 'izq' | 'der' | 'medial',
  partMap: Map<string, AtlasPart>,
): DissectionView {
  const sideSuffix = side === 'izq' ? ' (Izquierda)' : side === 'der' ? ' (Derecha)' : '';
  const sideRegex = side === 'izq' ? /(^left | left| left$)/i : side === 'der' ? /(^right | right| right$)/i : /.*/;

  const allPartIds: string[] = [];
  const landmarks: VirtualLandmark[] = [];
  const includes: string[] = [];

  const mapLayerItems = (items: RegionalLayerItem[]): DissectionItem[] => {
    return items.map((item) => {
      if (item.isVirtual) {
        includes.push(item.labelEs);
        if (item.virtualOffset) {
          landmarks.push({
            id: item.id,
            label: item.labelEs,
            detail: item.detailEs,
            offset: item.virtualOffset,
            normal: item.normal,
            isVirtual: true,
          });
        }
        return {
          id: item.id,
          label: item.labelEs,
          detail: item.detailEs,
          partIds: [],
          isVirtual: true,
          virtualOffset: item.virtualOffset,
          normal: item.normal,
          defaultVisible: true,
          isActive: false,
        };
      }

      // Find real matching parts matching pattern and side
      const matchedParts: string[] = [];
      partMap.forEach((p) => {
        if (item.partNamePattern && item.partNamePattern.test(p.name)) {
          // If side matches or part is medial
          if (sideRegex.test(p.name) || p.name.toLowerCase().includes(side === 'izq' ? 'left' : 'right')) {
            matchedParts.push(p.id);
          } else if (!p.name.toLowerCase().includes('left') && !p.name.toLowerCase().includes('right')) {
            matchedParts.push(p.id);
          }
        }
      });

      // If no side-specific match was found, allow any match
      if (matchedParts.length === 0 && item.partNamePattern) {
        partMap.forEach((p) => {
          if (item.partNamePattern?.test(p.name)) matchedParts.push(p.id);
        });
      }

      matchedParts.forEach((id) => {
        if (!allPartIds.includes(id)) allPartIds.push(id);
      });

      includes.push(item.labelEs);

      return {
        id: item.id,
        label: item.labelEs,
        detail: item.detailEs,
        partIds: matchedParts,
        isVirtual: false,
        defaultVisible: true,
        isActive: matchedParts.includes(focusPart.id),
      };
    });
  };

  const layers: DissectionLayer[] = [
    { key: 'superficial' as const, label: 'Plano superficial', items: mapLayerItems(def.superficial) },
    { key: 'intermedio' as const, label: 'Plano intermedio', items: mapLayerItems(def.intermedio) },
    { key: 'profundo' as const, label: 'Plano profundo', items: mapLayerItems(def.profundo) },
    { key: 'estructurasClave' as const, label: 'Estructuras clave', items: mapLayerItems(def.estructurasClave) },
  ].filter((l) => l.items.length > 0);

  // Always ensure the focus part is included in the visible set
  if (!allPartIds.includes(focusPart.id)) {
    allPartIds.push(focusPart.id);
  }

  return {
    id: `${def.code}_${side}`,
    title: `${def.nameEs}${sideSuffix}`,
    subtitle: def.subtitleEs,
    focusPartId: focusPart.id,
    side,
    sideLabel: side === 'izq' ? 'Izquierda' : side === 'der' ? 'Derecha' : 'Medial',
    layers,
    landmarks,
    includes,
    allPartIds,
    cameraPreset: def.cameraPreset,
    source: 'curated',
  };
}

function buildFromComponents(
  indexedPart: AnatomyIndexPart,
  focusPart: AtlasPart,
  side: 'izq' | 'der' | 'medial',
  partMap: Map<string, AtlasPart>,
): DissectionView {
  const baseNameEs = translateAtlasNameEs(indexedPart.baseMuscle);
  const sideSuffix = side === 'izq' ? ' (Izquierda)' : side === 'der' ? ' (Derecha)' : '';

  const items: DissectionItem[] = indexedPart.components.map((cid) => {
    const p = partMap.get(cid);
    const label = p ? translateAtlasNameEs(p.name) : cid;
    return {
      id: cid,
      label,
      detail: cid === focusPart.id ? 'Porción seleccionada' : 'Porción anatómica',
      partIds: [cid],
      defaultVisible: true,
      isActive: cid === focusPart.id,
    };
  });

  return {
    id: `comp_${indexedPart.id}`,
    title: `${baseNameEs}${sideSuffix}`,
    subtitle: `Porciones y cabezas musculares (${items.length} componentes)`,
    focusPartId: focusPart.id,
    side,
    sideLabel: side === 'izq' ? 'Izquierda' : 'Derecha',
    layers: [
      {
        key: 'superficial',
        label: 'Porciones musculares',
        items,
      },
    ],
    landmarks: [],
    includes: items.map((i) => i.label),
    allPartIds: [...indexedPart.components],
    cameraPreset: { azimuth: 30, elevation: 10, distanceMultiplier: 1.15 },
    source: 'components',
  };
}

function buildFromFmaGroup(
  indexedPart: AnatomyIndexPart,
  focusPart: AtlasPart,
  side: 'izq' | 'der' | 'medial',
  partMap: Map<string, AtlasPart>,
): DissectionView {
  const fma = indexedPart.primaryFmaGroup!;
  const groupNameEs = translateAtlasNameEs(fma.name);

  const items: DissectionItem[] = fma.elements.map((eid) => {
    const p = partMap.get(eid);
    const label = p ? translateAtlasNameEs(p.name) : eid;
    return {
      id: eid,
      label,
      detail: eid === focusPart.id ? 'Músculo seleccionado' : 'Músculo del grupo',
      partIds: [eid],
      defaultVisible: true,
      isActive: eid === focusPart.id,
    };
  });

  return {
    id: `fma_${fma.id}`,
    title: groupNameEs,
    subtitle: `Grupo muscular FMA (${items.length} estructuras)`,
    focusPartId: focusPart.id,
    side,
    sideLabel: side === 'izq' ? 'Izquierda' : 'Derecha',
    layers: [
      {
        key: 'superficial',
        label: 'Estructuras del grupo',
        items,
      },
    ],
    landmarks: [],
    includes: items.map((i) => i.label),
    allPartIds: [...fma.elements],
    cameraPreset: { azimuth: 25, elevation: 8, distanceMultiplier: 1.2 },
    source: 'fma-group',
  };
}

function buildFromSinglePart(
  focusPart: AtlasPart,
  side: 'izq' | 'der' | 'medial',
): DissectionView {
  const nameEs = translateAtlasNameEs(focusPart.name);

  const item: DissectionItem = {
    id: focusPart.id,
    label: nameEs,
    detail: 'Estructura anatómica individual',
    partIds: [focusPart.id],
    defaultVisible: true,
    isActive: true,
  };

  const allPartIds = [focusPart.id];

  return {
    id: `single_${focusPart.id}`,
    title: nameEs,
    subtitle: `Estructura anatómica aislada · ${focusPart.id}`,
    focusPartId: focusPart.id,
    side,
    sideLabel: side === 'izq' ? 'Izquierda' : 'Derecha',
    layers: [
      {
        key: 'superficial',
        label: 'Estructura principal',
        items: [item],
      },
    ],
    landmarks: [],
    includes: [nameEs],
    allPartIds,
    cameraPreset: { azimuth: 0, elevation: 0, distanceMultiplier: 1.1 },
    source: 'single',
  };
}
