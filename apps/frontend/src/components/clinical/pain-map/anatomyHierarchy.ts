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
  index: number; // Número correlativo para marcadores 3D y leyenda (1, 2, 3...)
  label: string;
  detail?: string;
  description?: string; // Breve descripción de función o características
  layerBadge: 'Superficial' | 'Intermedio' | 'Profundo' | 'Estructura';
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

function formatTitleWithoutDuplicateSide(baseName: string, side: 'izq' | 'der' | 'medial'): string {
  const hasSideInName = /izquierd|derech|medial/i.test(baseName);
  if (hasSideInName) return baseName;
  const suffix = side === 'izq' ? ' (Izquierda)' : side === 'der' ? ' (Derecha)' : '';
  return `${baseName}${suffix}`;
}

function simplifyPortionLabel(englishName: string, fallbackEs: string): string {
  const m = englishName.match(
    /^(lateral|medial|long|short|oblique|transverse|superficial|deep|humeral|ulnar|abdominal|clavicular|sternocostal|acromial|spinal|ascending|descending|superior|inferior)\s+(head|part|belly)\b/i,
  );
  if (m) {
    const adj = m[1].toLowerCase();
    const type = m[2].toLowerCase();
    const typeEs = type === 'head' ? 'Cabeza' : type === 'belly' ? 'Vientre' : 'Porción';
    const ADJ_ES: Record<string, string> = {
      lateral: 'lateral',
      medial: 'medial',
      long: 'larga',
      short: 'corta',
      oblique: 'oblicua',
      transverse: 'transversa',
      superficial: 'superficial',
      deep: 'profunda',
      humeral: 'humeral',
      ulnar: 'cubital',
      abdominal: 'abdominal',
      clavicular: 'clavicular',
      sternocostal: 'esternocostal',
      acromial: 'acromial',
      spinal: 'espinal',
      ascending: 'ascendente',
      descending: 'descendente',
      superior: 'superior',
      inferior: 'inferior',
    };
    const adjEs = ADJ_ES[adj] || adj;
    return `${typeEs} ${adjEs}`;
  }
  // Limpiar redundancia "de músculo..." en español si está presente
  const cleaned = fallbackEs.replace(/\s+de\s+(músculo|musculo).*/i, '');
  return cleaned;
}

function buildFromCuratedRegion(
  def: RegionalDissectionDef,
  focusPart: AtlasPart,
  side: 'izq' | 'der' | 'medial',
  partMap: Map<string, AtlasPart>,
): DissectionView {
  const hasSide = /izquierd|derech|medial/i.test(def.nameEs);
  const sideSuffix = hasSide ? '' : (side === 'izq' ? ' (Izquierda)' : side === 'der' ? ' (Derecha)' : '');
  const sideRegex = side === 'izq' ? /(^left | left| left$)/i : side === 'der' ? /(^right | right| right$)/i : /.*/;

  const allPartIds: string[] = [];
  const landmarks: VirtualLandmark[] = [];
  const includes: string[] = [];

  let globalIndex = 1;

  const mapLayerItems = (
    items: RegionalLayerItem[],
    defaultBadge: 'Superficial' | 'Intermedio' | 'Profundo' | 'Estructura',
  ): DissectionItem[] => {
    return items.map((item) => {
      const idx = globalIndex++;
      const layerBadge = item.layerBadge || defaultBadge;
      const description = item.descriptionEs || item.detailEs || 'Estructura anatómica de la región';

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
          index: idx,
          label: item.labelEs,
          detail: item.detailEs,
          description,
          layerBadge,
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
        index: idx,
        label: item.labelEs,
        detail: item.detailEs,
        description,
        layerBadge,
        partIds: matchedParts,
        isVirtual: false,
        defaultVisible: true,
        isActive: matchedParts.includes(focusPart.id),
      };
    });
  };

  const layers: DissectionLayer[] = [
    { key: 'superficial' as const, label: 'Plano superficial', items: mapLayerItems(def.superficial, 'Superficial') },
    { key: 'intermedio' as const, label: 'Plano intermedio', items: mapLayerItems(def.intermedio, 'Intermedio') },
    { key: 'profundo' as const, label: 'Plano profundo', items: mapLayerItems(def.profundo, 'Profundo') },
    { key: 'estructurasClave' as const, label: 'Estructuras clave', items: mapLayerItems(def.estructurasClave, 'Estructura') },
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
  const title = formatTitleWithoutDuplicateSide(baseNameEs, side);

  const items: DissectionItem[] = indexedPart.components.map((cid, i) => {
    const p = partMap.get(cid);
    const rawLabel = p ? translateAtlasNameEs(p.name) : cid;
    const label = p ? simplifyPortionLabel(p.name, rawLabel) : rawLabel;
    return {
      id: cid,
      index: i + 1,
      label,
      detail: cid === focusPart.id ? 'Porción seleccionada' : 'Porción anatómica',
      description: `Fascículo funcional y porción muscular de ${baseNameEs}.`,
      layerBadge: 'Superficial',
      partIds: [cid],
      defaultVisible: true,
      isActive: cid === focusPart.id,
    };
  });

  return {
    id: `comp_${indexedPart.id}`,
    title,
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
  const title = formatTitleWithoutDuplicateSide(groupNameEs, side);

  const items: DissectionItem[] = fma.elements.map((eid, i) => {
    const p = partMap.get(eid);
    const rawLabel = p ? translateAtlasNameEs(p.name) : eid;
    const label = p ? simplifyPortionLabel(p.name, rawLabel) : rawLabel;
    const layerBadge: 'Superficial' | 'Intermedio' | 'Profundo' =
      i === 0 ? 'Superficial' : i < 3 ? 'Intermedio' : 'Profundo';
    return {
      id: eid,
      index: i + 1,
      label,
      detail: eid === focusPart.id ? 'Músculo seleccionado' : 'Músculo del grupo',
      description: `Estructura muscular integrante del grupo funcional ${groupNameEs}.`,
      layerBadge,
      partIds: [eid],
      defaultVisible: true,
      isActive: eid === focusPart.id,
    };
  });

  return {
    id: `fma_${fma.id}`,
    title,
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
    index: 1,
    label: nameEs,
    detail: 'Estructura anatómica individual',
    description: 'Estructura aislada para examen anatomofuncional detallado.',
    layerBadge: 'Superficial',
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
