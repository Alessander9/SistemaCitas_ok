// apps/frontend/src/components/clinical/pain-map/anatomyHierarchy.test.ts
import { describe, it, expect } from 'vitest';
import { layoutAnatomyLabels, relaxPositions, ScreenAnchor } from './labelLayout';
import { resolveDissectionView } from './anatomyHierarchy';
import { HumanAtlasManifest } from './humanAtlasEngine';

describe('labelLayout Algorithm', () => {
  it('relaxes colliding Y coordinates to maintain minSpacing', () => {
    const raw = [100, 105, 110, 115];
    const relaxed = relaxPositions(raw, 30, 0, 500);

    expect(relaxed.length).toBe(4);
    for (let i = 1; i < relaxed.length; i++) {
      expect(relaxed[i] - relaxed[i - 1]).toBeGreaterThanOrEqual(30);
    }
  });

  it('clamps positions within screen bounds', () => {
    const raw = [10, 20, 490, 495];
    const relaxed = relaxPositions(raw, 30, 20, 480);

    expect(relaxed[0]).toBeGreaterThanOrEqual(20);
    expect(relaxed[relaxed.length - 1]).toBeLessThanOrEqual(480);
  });

  it('partitions anchors into left and right columns with elbow lines', () => {
    const anchors: ScreenAnchor[] = [
      { id: '1', name: 'Músculo A', x: 200, y: 150, z: 0, isFacingCamera: true },
      { id: '2', name: 'Músculo B', x: 600, y: 180, z: 0, isFacingCamera: true },
      { id: '3', name: 'Músculo C', x: 180, y: 160, z: 0, isFacingCamera: true },
    ];

    const labels = layoutAnatomyLabels(anchors, {
      width: 800,
      height: 600,
      minSpacing: 40,
    });

    expect(labels.length).toBe(3);

    const left = labels.filter((l) => l.side === 'left');
    const right = labels.filter((l) => l.side === 'right');

    expect(left.length).toBe(2);
    expect(right.length).toBe(1);

    // Verify elbow line structure
    left.forEach((l) => {
      expect(l.elbowX).toBeLessThan(l.anchorX);
      expect(l.labelX).toBeLessThanOrEqual(l.elbowX);
      expect(l.labelY).toBe(l.elbowY); // Horizontal final segment
    });

    right.forEach((l) => {
      expect(l.elbowX).toBeGreaterThan(l.anchorX);
      expect(l.labelX).toBeGreaterThanOrEqual(l.elbowX - 200);
      expect(l.labelY).toBe(l.elbowY);
    });
  });
});

describe('anatomyHierarchy Resolver', () => {
  const mockAtlas: HumanAtlasManifest = {
    version: '4.0',
    parts: [
      {
        id: 'FJ1452M',
        name: 'Left external oblique',
        conceptId: 'FMA13337',
        system: 'muscular',
        chunk: 1,
        positions: 0,
        normals: 0,
        indices: 0,
        vertexCount: 100,
        indexCount: 300,
        bounds: [[-0.2, 0.9, -0.1], [0.0, 1.2, 0.1]],
      },
      {
        id: 'FJ1459M',
        name: 'Left serratus anterior',
        conceptId: 'FMA13397',
        system: 'muscular',
        chunk: 1,
        positions: 0,
        normals: 0,
        indices: 0,
        vertexCount: 100,
        indexCount: 300,
        bounds: [[-0.2, 1.1, -0.05], [-0.05, 1.3, 0.1]],
      },
      {
        id: 'FJ1467M',
        name: 'Acromial part of left deltoid',
        conceptId: 'FMA45877',
        system: 'muscular',
        chunk: 1,
        positions: 0,
        normals: 0,
        indices: 0,
        vertexCount: 100,
        indexCount: 300,
        bounds: [[-0.3, 1.3, -0.05], [-0.2, 1.5, 0.1]],
      },
      {
        id: 'FJ1468M',
        name: 'Clavicular part of left deltoid',
        conceptId: 'FMA45876',
        system: 'muscular',
        chunk: 1,
        positions: 0,
        normals: 0,
        indices: 0,
        vertexCount: 100,
        indexCount: 300,
        bounds: [[-0.25, 1.35, 0.0], [-0.15, 1.5, 0.15]],
      },
    ],
    chunks: [],
    triangles: 1000,
    concepts: [],
    sex: 'male',
    source: 'BodyParts3D',
    scope: 'all',
  };

  it('resolves curated region "Pared Abdominal Lateral (Izquierda)" with Option A virtual landmarks', () => {
    const view = resolveDissectionView('FJ1452M', mockAtlas, null);

    expect(view.source).toBe('curated');
    expect(view.title).toContain('Pared Abdominal Lateral');
    expect(view.title).toContain('Izquierda');
    expect(view.side).toBe('izq');

    // Layers check
    expect(view.layers.length).toBeGreaterThanOrEqual(3);
    const superficial = view.layers.find((l) => l.key === 'superficial');
    const intermedio = view.layers.find((l) => l.key === 'intermedio');
    const profundo = view.layers.find((l) => l.key === 'profundo');
    const clave = view.layers.find((l) => l.key === 'estructurasClave');

    expect(superficial).toBeDefined();
    expect(intermedio).toBeDefined();
    expect(profundo).toBeDefined();
    expect(clave).toBeDefined();

    // Verify Option A virtual landmarks are present
    const virtualItems = [
      ...superficial!.items,
      ...intermedio!.items,
      ...profundo!.items,
      ...clave!.items,
    ].filter((item) => item.isVirtual);

    expect(virtualItems.length).toBeGreaterThanOrEqual(4);
    const itemLabels = virtualItems.map((v) => v.label);
    expect(itemLabels).toContain('Oblicuo interno del abdomen');
    expect(itemLabels).toContain('Transverso del abdomen');
    expect(itemLabels).toContain('Dorsal ancho');

    // Landmarks array check
    expect(view.landmarks.length).toBeGreaterThanOrEqual(4);
    expect(view.landmarks.every((lm) => lm.isVirtual)).toBe(true);

    // Includes list check
    expect(view.includes).toContain('Oblicuo externo del abdomen');
    expect(view.includes).toContain('Oblicuo interno del abdomen');
    expect(view.includes).toContain('Transverso del abdomen');
  });

  it('resolves curated region for Deltoides (Complejo del Hombro)', () => {
    const view = resolveDissectionView('FJ1467M', mockAtlas, null);

    expect(view.source).toBe('curated');
    expect(view.title).toContain('Complejo del Hombro y Manguito Rotador');
    expect(view.side).toBe('izq');
    expect(view.layers.length).toBeGreaterThanOrEqual(3);
  });

  it('resolves multi-component muscle to components when outside curated regions', () => {
    const mockAtlasExtra: HumanAtlasManifest = {
      ...mockAtlas,
      parts: [
        ...mockAtlas.parts,
        {
          id: 'FJ1393M',
          name: 'Lateral head of left flexor hallucis brevis',
          conceptId: 'FMA46001',
          system: 'muscular',
          chunk: 1,
          positions: 0,
          normals: 0,
          indices: 0,
          vertexCount: 50,
          indexCount: 150,
          bounds: [[-0.1, 0.0, 0.1], [-0.05, 0.05, 0.15]],
        },
        {
          id: 'FJ1396M',
          name: 'Medial head of left flexor hallucis brevis',
          conceptId: 'FMA46002',
          system: 'muscular',
          chunk: 1,
          positions: 0,
          normals: 0,
          indices: 0,
          vertexCount: 50,
          indexCount: 150,
          bounds: [[-0.08, 0.0, 0.1], [-0.03, 0.05, 0.15]],
        },
      ],
    };

    const mockIndex = {
      version: '1.0.0',
      parts: {
        FJ1393M: {
          id: 'FJ1393M',
          name: 'Lateral head of left flexor hallucis brevis',
          conceptId: 'FMA46001',
          system: 'muscular',
          side: 'izq' as const,
          baseMuscle: 'left flexor hallucis brevis',
          hasSubparts: true,
          components: ['FJ1393M', 'FJ1396M'],
          anchors: {
            center: [-0.07, 0.02, 0.12] as [number, number, number],
            front: { pos: [-0.07, 0.02, 0.15] as [number, number, number], normal: [0, 0, 1] as [number, number, number] },
            back: { pos: [-0.07, 0.02, 0.1] as [number, number, number], normal: [0, 0, -1] as [number, number, number] },
            left: { pos: [-0.1, 0.02, 0.12] as [number, number, number], normal: [-1, 0, 0] as [number, number, number] },
            right: { pos: [-0.03, 0.02, 0.12] as [number, number, number], normal: [1, 0, 0] as [number, number, number] },
            top: { pos: [-0.07, 0.05, 0.12] as [number, number, number], normal: [0, 1, 0] as [number, number, number] },
          },
        },
      },
    };

    const view = resolveDissectionView('FJ1393M', mockAtlasExtra, mockIndex);

    expect(view.source).toBe('components');
    expect(view.title).toMatch(/flexor.*(hallux|hallucis)/i);
    expect(view.allPartIds).toEqual(['FJ1393M', 'FJ1396M']);
    expect(view.layers[0].items.length).toBe(2);
    expect(view.layers[0].items.find((i) => i.id === 'FJ1393M')?.isActive).toBe(true);
  });
});
