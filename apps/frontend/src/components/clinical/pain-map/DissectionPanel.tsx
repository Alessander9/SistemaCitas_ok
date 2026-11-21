// apps/frontend/src/components/clinical/pain-map/DissectionPanel.tsx
import React from 'react';
import { DissectionView } from './anatomyHierarchy';
import { MaterialIcon } from '../../ui/MaterialIcon';
import './DissectionPanel.css';

interface DissectionPanelProps {
  view: DissectionView;
  hiddenItemIds: Set<string>;
  hoveredId: string | null;
  selectedId: string | null;
  onToggleItem: (itemId: string) => void;
  onHoverItem: (itemId: string | null) => void;
  onSelectItem: (itemId: string) => void;
  onExitIsolation: () => void;
  onOpenEva: () => void;
}

export const DissectionPanel: React.FC<DissectionPanelProps> = ({
  view,
  hiddenItemIds,
  hoveredId,
  selectedId,
  onToggleItem,
  onHoverItem,
  onSelectItem,
  onExitIsolation,
  onOpenEva,
}) => {
  return (
    <div className="dissection-panels-container">
      {/* 1. Header: Region Title and Subtitle */}
      <div className="dissection-header-banner">
        <div className="dissection-title-wrap">
          <h2 className="dissection-main-title">{view.title}</h2>
          <p className="dissection-sub-title">{view.subtitle}</p>
        </div>
      </div>

      {/* 2. Left Overlay: Layer Stratification Checkboxes */}
      <aside className="dissection-left-sidebar" aria-label="Estratificación por planos">
        {view.layers.map((layer) => (
          <div key={layer.key} className="dissection-layer-group">
            <h4 className="layer-group-heading">{layer.label}</h4>
            <div className="layer-items-list">
              {layer.items.map((item) => {
                const isChecked = !hiddenItemIds.has(item.id);
                const isFocused = selectedId === item.id || item.partIds.includes(selectedId || '');
                const isHovered = hoveredId === item.id;

                return (
                  <label
                    key={item.id}
                    className={`dissection-layer-item ${isFocused ? 'focused' : ''} ${
                      isHovered ? 'hovered' : ''
                    } ${item.isVirtual ? 'virtual' : ''}`}
                    onMouseEnter={() => onHoverItem(item.id)}
                    onMouseLeave={() => onHoverItem(null)}
                    onClick={(e) => {
                      // Click on the row selects the structure
                      if ((e.target as HTMLElement).tagName !== 'INPUT') {
                        onSelectItem(item.id);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={item.isVirtual}
                      onChange={() => onToggleItem(item.id)}
                      className="layer-checkbox"
                    />
                    <div className="item-text-col">
                      <span className="item-primary-name">{item.label}</span>
                      {item.detail && (
                        <span className="item-detail-badge">
                          {item.isVirtual ? 'Ref · Sin 3D' : item.detail}
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </aside>

      {/* 3. Right Overlay: "Capas (simplificado)" & "Ubicación" */}
      <aside className="dissection-right-sidebar" aria-label="Esquema y ubicación">
        {/* Box A: Capas Simplificado */}
        <div className="dissection-widget-box layers-schematic-box">
          <h4 className="widget-box-heading">Capas (simplificado)</h4>
          <div className="isometric-layers-container">
            <svg viewBox="0 0 200 120" className="isometric-layers-svg" aria-hidden="true">
              {/* Layer 1: Superficial */}
              <g transform="translate(10, 10)">
                <polygon
                  points="20,10 160,0 170,25 30,35"
                  fill="#f87171"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
                <text x="175" y="20" fill="#f8fafc" fontSize="9" fontWeight="600">
                  Superficial
                </text>
              </g>

              {/* Layer 2: Intermedio */}
              <g transform="translate(10, 42)">
                <polygon
                  points="20,10 160,0 170,25 30,35"
                  fill="#fca5a5"
                  stroke="#f87171"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
                <text x="175" y="20" fill="#f8fafc" fontSize="9" fontWeight="600">
                  Intermedio
                </text>
              </g>

              {/* Layer 3: Profundo */}
              <g transform="translate(10, 74)">
                <polygon
                  points="20,10 160,0 170,25 30,35"
                  fill="#dc2626"
                  stroke="#b91c1c"
                  strokeWidth="1.5"
                  opacity="0.95"
                />
                <text x="175" y="20" fill="#f8fafc" fontSize="9" fontWeight="600">
                  Profundo
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Box B: Ubicación Mini-Map */}
        <div className="dissection-widget-box location-box">
          <h4 className="widget-box-heading">Ubicación</h4>
          <div className="location-silhouette-wrapper">
            <svg viewBox="0 0 100 150" className="silhouette-svg" aria-label="Ubicación anatómica">
              {/* Human Torso Silhouette */}
              <path
                d="M 50 10 C 55 10 60 15 60 22 C 60 28 56 32 50 32 C 44 32 40 28 40 22 C 40 15 45 10 50 10 Z 
                   M 43 33 C 35 36 28 44 26 55 L 20 85 L 26 87 L 30 65 L 32 95 L 34 140 L 46 140 L 48 95 L 52 95 L 54 140 L 66 140 L 68 95 L 70 65 L 74 87 L 80 85 L 74 55 C 72 44 65 36 57 33 Z"
                fill="#334155"
                opacity="0.6"
              />
              {/* Highlight Area depending on side */}
              {view.side === 'izq' ? (
                <path
                  d="M 52 60 L 68 62 L 64 88 L 52 84 Z"
                  fill="#f43f5e"
                  stroke="#2dd4bf"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
              ) : view.side === 'der' ? (
                <path
                  d="M 48 60 L 32 62 L 36 88 L 48 84 Z"
                  fill="#f43f5e"
                  stroke="#2dd4bf"
                  strokeWidth="1.5"
                  opacity="0.85"
                />
              ) : (
                <circle cx="50" cy="72" r="14" fill="#f43f5e" opacity="0.85" />
              )}
            </svg>
            <span className="location-badge-label">{view.sideLabel}</span>
          </div>
        </div>
      </aside>

      {/* 4. Bottom Card: Selected Info, Includes Checklist & Action Buttons */}
      <footer className="dissection-bottom-card">
        <div className="dissection-bottom-content">
          {/* Col Left: Focus Details */}
          <div className="focus-details-col">
            <div className="fma-tag-row">
              <span className="badge-fma">PIEZA: {view.focusPartId}</span>
              <span className="badge-status">Disección Anatómica</span>
            </div>
            <h3 className="focus-structure-title">{view.title}</h3>
            <p className="focus-zone-sub">
              Vista estratificada con correlación clínica y puntos gatillo
            </p>
            <div className="action-buttons-row">
              <button
                type="button"
                className="btn-dissection-exit"
                onClick={onExitIsolation}
              >
                <MaterialIcon name="fullscreen_exit" size={16} />
                <span>Ver cuerpo completo</span>
              </button>
              <button
                type="button"
                className="btn-dissection-eva"
                onClick={onOpenEva}
              >
                <MaterialIcon name="add_circle" size={16} />
                <span>Evaluar Dolor EVA (0–10)</span>
              </button>
            </div>
          </div>

          {/* Col Right: Includes (Región) Checklist in 2 Columns */}
          <div className="includes-checklist-col">
            <h4 className="includes-heading">
              Incluye ({view.title.split('(')[0].trim()})
            </h4>
            <div className="includes-grid">
              {view.includes.map((inc, i) => (
                <div key={i} className="include-item-check">
                  <span className="check-icon">✓</span>
                  <span className="include-label">{inc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
