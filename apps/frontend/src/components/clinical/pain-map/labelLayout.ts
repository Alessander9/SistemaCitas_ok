// apps/frontend/src/components/clinical/pain-map/labelLayout.ts
// Pure algorithm for 2D screen layout of 3D anatomical numeric markers and labels.

export interface ScreenAnchor {
  id: string;
  index?: number;
  name: string;
  detail?: string;
  description?: string;
  layerBadge?: string;
  x: number; // Viewport screen X (0 to width)
  y: number; // Viewport screen Y (0 to height)
  z: number; // Viewport depth (-1 to 1)
  isFacingCamera: boolean;
  isVirtual?: boolean;
  isActive?: boolean;
  color?: string;
}

export interface PlacedMarker {
  id: string;
  index: number;
  name: string;
  detail?: string;
  description?: string;
  layerBadge?: string;
  x: number;
  y: number;
  z: number;
  isFacingCamera: boolean;
  isVirtual?: boolean;
  isActive?: boolean;
  color?: string;
}

export interface PlacedLabel {
  id: string;
  index?: number;
  name: string;
  detail?: string;
  side: 'left' | 'right';
  anchorX: number;
  anchorY: number;
  elbowX: number;
  elbowY: number;
  labelX: number;
  labelY: number;
  isFacingCamera: boolean;
  isVirtual?: boolean;
  isActive?: boolean;
  color?: string;
}

export interface LayoutOptions {
  width: number;
  height: number;
  minSpacing?: number;
  leftMargin?: number;
  rightMargin?: number;
  labelWidth?: number;
  maxLabelsPerSide?: number;
}

/**
 * Positions numeric circular markers directly on 3D structures with gentle
 * collision relaxation so overlapping numbers repel without departing from their anatomy.
 */
export function layoutNumericMarkers(
  anchors: ScreenAnchor[],
  minDistance = 28,
): PlacedMarker[] {
  if (anchors.length === 0) return [];

  const markers: PlacedMarker[] = anchors.map((a, i) => ({
    id: a.id,
    index: a.index ?? i + 1,
    name: a.name,
    detail: a.detail,
    description: a.description,
    layerBadge: a.layerBadge,
    x: a.x,
    y: a.y,
    z: a.z,
    isFacingCamera: a.isFacingCamera,
    isVirtual: a.isVirtual,
    isActive: a.isActive,
    color: a.color,
  }));

  if (markers.length <= 1) return markers;

  // 3-pass pairwise separation for clean readability
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < markers.length; i++) {
      for (let j = i + 1; j < markers.length; j++) {
        const dx = markers[j].x - markers[i].x;
        const dy = markers[j].y - markers[i].y;
        const dist = Math.hypot(dx, dy);
        if (dist < minDistance && dist > 0.001) {
          const overlap = (minDistance - dist) / 2;
          const nx = dx / dist;
          const ny = dy / dist;
          markers[i].x -= nx * overlap;
          markers[i].y -= ny * overlap;
          markers[j].x += nx * overlap;
          markers[j].y += ny * overlap;
        } else if (dist <= 0.001) {
          markers[j].x += minDistance / 2;
          markers[j].y += minDistance / 2;
        }
      }
    }
  }

  return markers.map((m) => ({
    ...m,
    x: Math.round(m.x),
    y: Math.round(m.y),
  }));
}

/**
 * Legacy label layout algorithm kept for backwards compatibility and test suites.
 */
export function layoutAnatomyLabels(
  anchors: ScreenAnchor[],
  options: LayoutOptions,
): PlacedLabel[] {
  const {
    width,
    height,
    minSpacing = 40,
    leftMargin = 20,
    rightMargin = 20,
    labelWidth = 175,
    maxLabelsPerSide = 8,
  } = options;

  if (anchors.length === 0 || width <= 0 || height <= 0) {
    return [];
  }

  const centerX = width / 2;
  const leftAnchors: ScreenAnchor[] = [];
  const rightAnchors: ScreenAnchor[] = [];

  anchors.forEach((a) => {
    const hasRoomOnLeft = a.x > leftMargin + 20;
    if (a.x < centerX && hasRoomOnLeft) {
      leftAnchors.push(a);
    } else {
      rightAnchors.push(a);
    }
  });

  leftAnchors.sort((a, b) => a.y - b.y);
  rightAnchors.sort((a, b) => a.y - b.y);

  const activeLeft = leftAnchors.slice(0, maxLabelsPerSide);
  const activeRight = rightAnchors.slice(0, maxLabelsPerSide);

  const topBound = 65;
  const bottomBound = height - 160;

  const relaxedLeftY = relaxPositions(
    activeLeft.map((a) => a.y),
    minSpacing,
    topBound,
    bottomBound,
  );

  const relaxedRightY = relaxPositions(
    activeRight.map((a) => a.y),
    minSpacing,
    topBound,
    bottomBound,
  );

  const result: PlacedLabel[] = [];

  activeLeft.forEach((a, i) => {
    const placedY = relaxedLeftY[i];
    const targetLabelX = leftMargin;
    const cardRightEdge = targetLabelX + labelWidth;
    const elbowX = a.x > cardRightEdge
      ? (cardRightEdge + a.x) / 2
      : Math.max(targetLabelX + 10, a.x - 20);

    result.push({
      id: a.id,
      index: a.index ?? i + 1,
      name: a.name,
      detail: a.detail,
      side: 'left',
      anchorX: Math.round(a.x),
      anchorY: Math.round(a.y),
      elbowX: Math.round(elbowX),
      elbowY: Math.round(placedY),
      labelX: Math.round(targetLabelX),
      labelY: Math.round(placedY),
      isFacingCamera: a.isFacingCamera,
      isVirtual: a.isVirtual,
      isActive: a.isActive,
      color: a.color,
    });
  });

  activeRight.forEach((a, i) => {
    const placedY = relaxedRightY[i];
    const targetLabelX = Math.max(centerX + 40, width - rightMargin - labelWidth);
    const elbowX = a.x < targetLabelX
      ? (a.x + targetLabelX) / 2
      : Math.min(width - rightMargin, a.x + 20);

    result.push({
      id: a.id,
      index: a.index ?? i + 1,
      name: a.name,
      detail: a.detail,
      side: 'right',
      anchorX: Math.round(a.x),
      anchorY: Math.round(a.y),
      elbowX: Math.round(elbowX),
      elbowY: Math.round(placedY),
      labelX: Math.round(targetLabelX),
      labelY: Math.round(placedY),
      isFacingCamera: a.isFacingCamera,
      isVirtual: a.isVirtual,
      isActive: a.isActive,
      color: a.color,
    });
  });

  return result;
}

export function relaxPositions(
  positions: number[],
  minSpacing: number,
  minBound: number,
  maxBound: number,
): number[] {
  const n = positions.length;
  if (n === 0) return [];
  if (n === 1) return [Math.max(minBound, Math.min(maxBound, positions[0]))];

  const pos = [...positions];

  pos[0] = Math.max(minBound, pos[0]);
  for (let i = 1; i < n; i++) {
    if (pos[i] < pos[i - 1] + minSpacing) {
      pos[i] = pos[i - 1] + minSpacing;
    }
  }

  if (pos[n - 1] > maxBound) {
    pos[n - 1] = maxBound;
    for (let i = n - 2; i >= 0; i--) {
      if (pos[i] > pos[i + 1] - minSpacing) {
        pos[i] = pos[i + 1] - minSpacing;
      }
    }
  }

  for (let i = 0; i < n; i++) {
    pos[i] = Math.max(minBound, Math.min(maxBound, pos[i]));
  }

  return pos;
}
