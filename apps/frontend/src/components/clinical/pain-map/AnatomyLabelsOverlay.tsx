// apps/frontend/src/components/clinical/pain-map/AnatomyLabelsOverlay.tsx
// Overlay de marcadores numéricos circulares 3D sobre las estructuras anatómicas.
// Reemplaza flechas y textos extensos por círculos correlativos (1, 2, 3...) de alto contraste.

import React from 'react';
import { PlacedMarker } from './labelLayout';
import './AnatomyLabelsOverlay.css';

interface AnatomyLabelsOverlayProps {
  labels: PlacedMarker[];
  width: number;
  height: number;
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

export const AnatomyLabelsOverlay: React.FC<AnatomyLabelsOverlayProps> = ({
  labels,
  width,
  height,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
}) => {
  if (labels.length === 0 || width <= 0 || height <= 0) {
    return null;
  }

  return (
    <div
      className="anatomy-numeric-markers-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: 'none',
        zIndex: 15,
        overflow: 'hidden',
      }}
      aria-label="Marcadores numéricos anatómicos"
    >
      {labels.map((marker) => {
        const isHovered = hoveredId === marker.id;
        const isSelected = selectedId === marker.id || marker.isActive;
        const isVirtual = !!marker.isVirtual;
        const isFacing = marker.isFacingCamera;

        return (
          <button
            key={`marker-${marker.id}-${marker.index}`}
            type="button"
            className={`anatomy-numeric-marker ${isSelected ? 'selected' : ''} ${
              isHovered ? 'hovered' : ''
            } ${isVirtual ? 'virtual' : ''} ${!isFacing ? 'back-facing' : ''}`}
            style={{
              left: `${marker.x}px`,
              top: `${marker.y}px`,
            }}
            onMouseEnter={() => onHover(marker.id)}
            onMouseLeave={() => onHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(marker.id);
            }}
            aria-label={`${marker.index}: ${marker.name}${marker.description ? ` (${marker.description})` : ''}`}
            title={`${marker.index}. ${marker.name}${marker.detail ? ` · ${marker.detail}` : ''}`}
          >
            <span className="marker-number">{marker.index}</span>
          </button>
        );
      })}
    </div>
  );
};
