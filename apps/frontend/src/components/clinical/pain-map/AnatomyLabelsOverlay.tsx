// apps/frontend/src/components/clinical/pain-map/AnatomyLabelsOverlay.tsx
import React from 'react';
import { PlacedLabel } from './labelLayout';
import './AnatomyLabelsOverlay.css';

interface AnatomyLabelsOverlayProps {
  labels: PlacedLabel[];
  width: number;
  height: number;
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}

const CARD_WIDTH = 175;
const CARD_HEIGHT = 46;

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
    <svg
      className="anatomy-labels-svg-overlay"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 15,
      }}
    >
      <defs>
        <filter id="labelGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.6" />
        </filter>
        <radialGradient id="anchorGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
        </radialGradient>
      </defs>

      {labels.map((label, idx) => {
        const isHovered = hoveredId === label.id;
        const isSelected = selectedId === label.id || label.isActive;
        const isVirtual = !!label.isVirtual;
        const isFacing = label.isFacingCamera;
        const isLeft = label.side === 'left';

        // Connect to the inner edge facing the model:
        // For left labels: card sits at [labelX, labelX + CARD_WIDTH], so right edge is labelX + CARD_WIDTH
        // For right labels: card sits at [labelX, labelX + CARD_WIDTH], so left edge is labelX
        const connectX = isLeft ? label.labelX + CARD_WIDTH : label.labelX;
        const pathData = `M ${label.anchorX} ${label.anchorY} L ${label.elbowX} ${label.elbowY} L ${connectX} ${label.labelY}`;

        // Styling classes & colors
        const lineColor = isSelected
          ? '#2dd4bf'
          : isHovered
            ? '#38bdf8'
            : isVirtual
              ? '#94a3b8'
              : '#e2e8f0';

        const strokeWidth = isSelected || isHovered ? 2 : 1.25;
        const lineDash = isVirtual
          ? '4,3'
          : !isFacing
            ? '3,3'
            : undefined;

        const opacity = !isFacing && !isHovered && !isSelected ? 0.42 : 1;

        return (
          <g
            key={`lbl-${label.id}-${idx}`}
            className={`label-item-group ${isHovered ? 'hovered' : ''} ${isSelected ? 'selected' : ''}`}
            style={{ opacity, transition: 'opacity 0.2s ease' }}
          >
            {/* 1. Connecting Elbow Line */}
            <path
              d={pathData}
              fill="none"
              stroke={lineColor}
              strokeWidth={strokeWidth}
              strokeDasharray={lineDash}
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#labelGlow)"
            />

            {/* 2. Anchor Point Target (Ring + Dot) */}
            <circle
              cx={label.anchorX}
              cy={label.anchorY}
              r={isHovered || isSelected ? 5.5 : 4}
              fill={isVirtual ? '#64748b' : '#ffffff'}
              stroke={lineColor}
              strokeWidth={2}
            />
            {(isHovered || isSelected) && (
              <circle
                cx={label.anchorX}
                cy={label.anchorY}
                r={10}
                fill="none"
                stroke={lineColor}
                strokeWidth={1.5}
                strokeDasharray="2,2"
                opacity={0.8}
              />
            )}

            {/* 3. Interactive Callout Card (HTML via foreignObject) */}
            <foreignObject
              x={label.labelX}
              y={label.labelY - 20}
              width={CARD_WIDTH}
              height={CARD_HEIGHT + 10}
              style={{ pointerEvents: 'auto', overflow: 'visible' }}
            >
              <div
                className={`anatomy-callout-pill ${isLeft ? 'align-left' : 'align-right'} ${
                  isSelected ? 'active' : ''
                } ${isHovered ? 'hover' : ''} ${isVirtual ? 'virtual' : ''}`}
                onMouseEnter={() => onHover(label.id)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onSelect(label.id)}
                title={label.name}
              >
                <div className="pill-title-row">
                  <span className="pill-dot" style={{ backgroundColor: lineColor }} />
                  <span className="pill-text-name">{label.name}</span>
                </div>
                {label.detail && (
                  <div className="pill-detail-text">
                    {isVirtual ? (
                      <span className="badge-virtual">Ref · Sin 3D</span>
                    ) : (
                      label.detail
                    )}
                  </div>
                )}
              </div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
};
