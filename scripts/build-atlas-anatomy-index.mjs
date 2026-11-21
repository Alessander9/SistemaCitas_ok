// scripts/build-atlas-anatomy-index.mjs
// Precomputes anatomical groupings, component heads, side resolution,
// surface anchors and neighbor relationships from atlas.json.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const atlasPath = path.join(rootDir, 'apps/frontend/public/models/atlas.json');
const outputPath = path.join(rootDir, 'apps/frontend/public/models/atlas-anatomy-index.json');
const coverageDocPath = path.join(rootDir, 'docs/atlas-coverage.md');

console.log('Loading atlas.json from:', atlasPath);
const atlas = JSON.parse(fs.readFileSync(atlasPath, 'utf8'));

const parts = atlas.parts;
const concepts = atlas.concepts;
const partMap = new Map(parts.map((p) => [p.id, p]));

// 1. Resolve Side for each part
function resolveSide(part) {
  const name = part.name.toLowerCase();
  if (name.startsWith('left ') || name.includes(' left ') || name.endsWith(' left') || part.id.endsWith('M')) {
    return 'izq';
  }
  if (name.startsWith('right ') || name.includes(' right ') || name.endsWith(' right')) {
    return 'der';
  }
  return 'medial';
}

// 2. Resolve Base Muscle / Structure name
function resolveBaseMuscle(part) {
  let name = part.name;
  // Patterns like "Clavicular part of left deltoid", "Long head of right biceps femoris", "Medial head of left flexor hallucis brevis"
  const headMatch = name.match(/^(?:(?:lateral|medial|long|short|oblique|transverse|superficial|deep|humeral|ulnar)\s+head|head|abdominal\s+part|clavicular\s+part|sternocostal\s+part|acromial\s+part|spinal\s+part|ascending\s+part|descending\s+part|superior\s+part|inferior\s+part|belly)\s+of\s+(.+)$/i);
  if (headMatch) {
    return headMatch[1].trim();
  }
  return name;
}

// 3. Compute surface anchors from bounding box
function computeAnchors(part) {
  const [min, max] = part.bounds;
  const center = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ];

  // We provide 5 primary anchor points with their surface normal vectors
  return {
    center,
    front: { pos: [center[0], center[1], max[2]], normal: [0, 0, 1] },
    back: { pos: [center[0], center[1], min[2]], normal: [0, 0, -1] },
    left: { pos: [min[0], center[1], center[2]], normal: [-1, 0, 0] },
    right: { pos: [maxX(max[0]), center[1], center[2]], normal: [1, 0, 0] },
    top: { pos: [center[0], max[1], center[2]], normal: [0, 1, 0] },
  };
}

function maxX(v) { return v; }

// Build intermediate dictionaries
const baseMuscleGroups = new Map(); // key -> [partId...]

parts.forEach((p) => {
  const side = resolveSide(p);
  const base = resolveBaseMuscle(p).toLowerCase();
  const groupKey = `${side}__${base}`;
  if (!baseMuscleGroups.has(groupKey)) {
    baseMuscleGroups.set(groupKey, []);
  }
  baseMuscleGroups.get(groupKey).push(p.id);
});

// Concepts lookup map
const conceptElementsMap = new Map();
concepts.forEach((c) => {
  conceptElementsMap.set(c.id, c);
});

// Build index
const indexedParts = {};
const muscleComponents = {}; // baseKey -> array of part IDs (for base muscles with > 1 parts)

baseMuscleGroups.forEach((ids, groupKey) => {
  if (ids.length > 1) {
    muscleComponents[groupKey] = ids;
  }
});

parts.forEach((p) => {
  const side = resolveSide(p);
  const base = resolveBaseMuscle(p);
  const groupKey = `${side}__${base.toLowerCase()}`;
  const components = muscleComponents[groupKey] || [p.id];
  const anchors = computeAnchors(p);

  // Find relevant FMA concepts for this part (between 2 and 16 elements, matching system)
  const matchingConcepts = [];
  concepts.forEach((c) => {
    if (c.elements.includes(p.id) && c.elements.length >= 2 && c.elements.length <= 16) {
      // Check if all elements belong to the same system
      const allSameSystem = c.elements.every((id) => partMap.get(id)?.system === p.system);
      if (allSameSystem) {
        matchingConcepts.push({
          id: c.id,
          name: c.name,
          elementCount: c.elements.length,
          elements: c.elements,
        });
      }
    }
  });

  // Sort concepts: most specific (smallest element count > 1) first
  matchingConcepts.sort((a, b) => a.elementCount - b.elementCount);

  indexedParts[p.id] = {
    id: p.id,
    name: p.name,
    conceptId: p.conceptId,
    system: p.system,
    side,
    baseMuscle: base,
    hasSubparts: components.length > 1,
    components,
    anchors,
    primaryFmaGroup: matchingConcepts[0] || null,
  };
});

// Calculate nearest 5 neighbors for each part
parts.forEach((p) => {
  const c1 = indexedParts[p.id].anchors.center;
  const dists = [];
  parts.forEach((other) => {
    if (other.id === p.id) return;
    const c2 = indexedParts[other.id].anchors.center;
    const d2 =
      (c1[0] - c2[0]) ** 2 +
      (c1[1] - c2[1]) ** 2 +
      (c1[2] - c2[2]) ** 2;
    dists.push({ id: other.id, d2, system: other.system });
  });
  dists.sort((a, b) => a.d2 - b.d2);
  indexedParts[p.id].neighbors = dists.slice(0, 6).map((x) => x.id);
});

const output = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  totalParts: parts.length,
  multiPartMusclesCount: Object.keys(muscleComponents).length,
  parts: indexedParts,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output), 'utf8');
console.log(`✅ Saved anatomy index (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB) to ${outputPath}`);

// Generate Coverage Documentation
fs.mkdirSync(path.dirname(coverageDocPath), { recursive: true });
let coverageDoc = `# Reporte de Cobertura Anatómica BodyParts3D 4.0\n\n`;
coverageDoc += `Generado automáticamente: ${new Date().toLocaleString('es-PE')}\n\n`;
coverageDoc += `### Estadísticas Generales\n`;
coverageDoc += `- **Total de Mallas 3D:** ${parts.length}\n`;
coverageDoc += `- **Músculos con Porciones/Cabezas individualizadas:** ${Object.keys(muscleComponents).length}\n\n`;
coverageDoc += `### Músculos con Sub-piezas Detectadas:\n`;
Object.entries(muscleComponents).forEach(([key, ids]) => {
  const sample = partMap.get(ids[0]);
  coverageDoc += `- **${sample.name.replace(/^(?:lateral|medial|long|short|oblique|transverse|superficial|deep|abdominal|clavicular|sternocostal|acromial|spinal|ascending|descending)\s+part|head\s+of\s+/i, '')}** (${ids.length} piezas): ${ids.map((id) => partMap.get(id).name).join(', ')}\n`;
});

fs.writeFileSync(coverageDocPath, coverageDoc, 'utf8');
console.log(`✅ Saved coverage report to ${coverageDocPath}`);
