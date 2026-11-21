// apps/frontend/src/components/clinical/pain-map/labelLayout.ts
// Pure algorithm for 2D screen layout of 3D anatomical labels with non-overlapping elbow connectors.

export interface ScreenAnchor {
  id: string;
  name: string;
  detail?: string;
  x: number; // Viewport screen X (0 to width)
  y: number; // Viewport screen Y (0 to height)
  z: number; // Viewport depth (-1 to 1)
  isFacingCamera: boolean;
  isVirtual?: boolean;
  isActive?: boolean;
  color?: string;
}

export interface PlacedLabel {
  id: string;
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
  minSpacing?: number; // Minimum vertical distance between labels (default 40)
  leftMargin?: number;
  rightMargin?: number;
  labelWidth?: number;
  maxLabelsPerSide?: number;
}

/**
 * Calculates non-overlapping label positions in left and right columns
 * with aesthetic elbow connector lines (anchor -> elbow -> label).
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

  // 1. Partition anchors into left and right sides
  const leftAnchors: ScreenAnchor[] = [];
  const rightAnchors: ScreenAnchor[] = [];

  anchors.forEach((a) => {
    // If anchor is on the left half and has enough room after leftMargin for the card
    const hasRoomOnLeft = a.x > leftMargin + 20;
    if (a.x < centerX && hasRoomOnLeft) {
      leftAnchors.push(a);
    } else {
      rightAnchors.push(a);
    }
  });

  // 2. Sort by Y coordinate ascending (top to bottom)
  leftAnchors.sort((a, b) => a.y - b.y);
  rightAnchors.sort((a, b) => a.y - b.y);

  // Limit to max per side
  const activeLeft = leftAnchors.slice(0, maxLabelsPerSide);
  const activeRight = rightAnchors.slice(0, maxLabelsPerSide);

  // 3. Relax Y positions to prevent overlaps
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

  // Build Left Labels
  activeLeft.forEach((a, i) => {
    const placedY = relaxedLeftY[i];
    const targetLabelX = leftMargin;
    const cardRightEdge = targetLabelX + labelWidth;
    // If anchor is further right than cardRightEdge, elbow is in between; otherwise just to the left of anchor
    const elbowX = a.x > cardRightEdge
      ? (cardRightEdge + a.x) / 2
      : Math.max(targetLabelX + 10, a.x - 20);

    result.push({
      id: a.id,
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

  // Build Right Labels
  activeRight.forEach((a, i) => {
    const placedY = relaxedRightY[i];
    const targetLabelX = Math.max(centerX + 40, width - rightMargin - labelWidth);
    const elbowX = a.x < targetLabelX
      ? (a.x + targetLabelX) / 2
      : Math.min(width - rightMargin, a.x + 20);

    result.push({
      id: a.id,
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

/**
 * 2-pass 1D relaxation to ensure all coordinates maintain minSpacing
 * while staying clamped inside [minBound, maxBound].
 */
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

  // Pass 1: Forward push
  pos[0] = Math.max(minBound, pos[0]);
  for (let i = 1; i < n; i++) {
    if (pos[i] < pos[i - 1] + minSpacing) {
      pos[i] = pos[i - 1] + minSpacing;
    }
  }

  // Pass 2: Backward push if exceeding maxBound
  if (pos[n - 1] > maxBound) {
    pos[n - 1] = maxBound;
    for (let i = n - 2; i >= 0; i--) {
      if (pos[i] > pos[i + 1] - minSpacing) {
        pos[i] = pos[i + 1] - minSpacing;
      }
    }
  }

  // Clamp any bottom overflow gracefully
  for (let i = 0; i < n; i++) {
    pos[i] = Math.max(minBound, Math.min(maxBound, pos[i]));
  }

  return pos;
}
