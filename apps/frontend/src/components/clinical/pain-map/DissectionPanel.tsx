// apps/frontend/src/components/clinical/pain-map/DissectionPanel.tsx
// Rediseño minimalista con Leyenda Lateral de Estructuras y Marcadores Numéricos 1-a-1.

import React, { useState } from 'react';
import { DissectionView, DissectionItem } from './anatomyHierarchy';
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
  hoveredId,
  selectedId,
  onHoverItem,
  onSelectItem,
  onExitIsolation,
  onOpenEva,
}) => {
  const [mobileLegendOpen, setMobileLegendOpen] = useState(false);

  // Flatten all items across layers for sequential numeric legend
  const allItems: DissectionItem[] = view.layers.flatMap((l) => l.items);

  // Focus part or selected structure
  const activeItem = allItems.find(
    (i) => i.id === selectedId || i.partIds.includes(selectedId || ''),
  ) || allItems[0];

  return (
    <div className="dissection-panels-container">
      {/* 1. Header Superior Izquierdo: Título de Región y Subtítulo */}
      <header className="dissection-header-banner">
        <div className="dissection-header-row">
          <div className="dissection-title-wrap">
            <h2 className="dissection-main-title">{view.title}</h2>
            <p className="dissection-sub-title">{view.subtitle}</p>
          </div>

          {/* Botón flotante para dispositivos móviles y tablets */}
          <button
            type="button"
            className="dissection-legend-mobile-toggle"
            onClick={() => setMobileLegendOpen((prev) => !prev)}
            aria-label="Abrir leyenda de estructuras anatómicas"
          >
            <MaterialIcon name="format_list_numbered" size={16} />
            <span>Leyenda ({allItems.length})</span>
            <MaterialIcon
              name={mobileLegendOpen ? 'expand_less' : 'expand_more'}
              size={16}
            />
          </button>
        </div>
      </header>

      {/* 2. Panel Lateral Derecho: Leyenda de Estructuras */}
      <aside
        className={`dissection-legend-sidebar ${mobileLegendOpen ? 'mobile-open' : ''}`}
        aria-label="Leyenda de estructuras anatómicas"
      >
        <div className="legend-sidebar-header">
          <div className="legend-header-title-row">
            <h3 className="legend-main-heading">Leyenda de estructuras</h3>
            <button
              type="button"
              className="legend-close-mobile-btn"
              onClick={() => setMobileLegendOpen(false)}
              aria-label="Cerrar panel de leyenda"
            >
              <MaterialIcon name="close" size={16} />
            </button>
          </div>
        </div>

        {/* Lista numerada interactiva */}
        <div className="legend-items-scroll-list">
          {allItems.map((item) => {
            const isFocused =
              selectedId === item.id || item.partIds.includes(selectedId || '');
            const isHovered = hoveredId === item.id;

            return (
              <div
                key={`legend-${item.id}-${item.index}`}
                className={`legend-structure-card ${isFocused ? 'selected' : ''} ${
                  isHovered ? 'hovered' : ''
                } ${item.isVirtual ? 'virtual' : ''}`}
                onMouseEnter={() => onHoverItem(item.id)}
                onMouseLeave={() => onHoverItem(null)}
                onClick={() => onSelectItem(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectItem(item.id);
                  }
                }}
              >
                {/* Número circular correlativo */}
                <div className="legend-num-badge" aria-hidden="true">
                  {item.index}
                </div>

                {/* Contenido: Nombre, Badge de plano y descripción */}
                <div className="legend-content-col">
                  <div className="legend-title-badge-row">
                    <span className="legend-structure-name">{item.label}</span>
                    <span
                      className={`legend-layer-pill pill-${(item.layerBadge || 'superficial').toLowerCase()}`}
                    >
                      {item.layerBadge || 'Superficial'}
                    </span>
                  </div>
                  {item.description && (
                    <p className="legend-structure-desc">{item.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Tarjeta de Capas (vista simplificada) - Comentada a solicitud del usuario */}
        {/*
        <div className="legend-isometric-layers-box">
          <h4 className="isometric-box-title">Capas (vista simplificada)</h4>
          <div className="isometric-layers-container">
            <svg viewBox="0 0 240 100" className="isometric-layers-svg" aria-hidden="true">
              <g transform="translate(10, 8)">
                <polygon
                  points="20,10 130,0 140,20 30,28"
                  fill="#f87171"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  opacity="0.95"
                />
                <line x1="145" y1="12" x2="165" y2="12" stroke="#64748b" strokeWidth="1" />
                <text x="170" y="15" fill="#f8fafc" fontSize="9" fontWeight="600">
                  {allItems[0]?.label.split('(')[0].trim() || 'Superficial'} (superficial)
                </text>
              </g>

              <g transform="translate(10, 36)">
                <polygon
                  points="20,10 130,0 140,20 30,28"
                  fill="#fca5a5"
                  stroke="#f87171"
                  strokeWidth="1.5"
                  opacity="0.9"
                />
                <line x1="145" y1="12" x2="165" y2="12" stroke="#64748b" strokeWidth="1" />
                <text x="170" y="15" fill="#f8fafc" fontSize="9" fontWeight="600">
                  {allItems.find((i) => i.layerBadge === 'Intermedio')?.label.split('(')[0].trim() || 'Intermedio'} (intermedio)
                </text>
              </g>

              <g transform="translate(10, 64)">
                <polygon
                  points="20,10 130,0 140,20 30,28"
                  fill="#dc2626"
                  stroke="#b91c1c"
                  strokeWidth="1.5"
                  opacity="0.95"
                />
                <line x1="145" y1="12" x2="165" y2="12" stroke="#64748b" strokeWidth="1" />
                <text x="170" y="15" fill="#f8fafc" fontSize="9" fontWeight="600">
                  {allItems.find((i) => i.layerBadge === 'Profundo')?.label.split('(')[0].trim() || 'Profundo'} (profundo)
                </text>
              </g>
            </svg>
          </div>
        </div>
        */}
      </aside>

      {/* 4. Tarjeta Inferior: Información Anatómica y Acciones Clínicas */}
      <footer className="dissection-bottom-card">
        <div className="dissection-bottom-content">
          {/* Columna Izquierda: Código FMA / Pieza y Nombre */}
          <div className="bottom-left-info-col">
            <span className="bottom-code-badge">
              CÓDIGO FMA13337 · PIEZA {view.focusPartId}
            </span>
            <h3 className="bottom-structure-title">
              {activeItem ? activeItem.label : view.title}
            </h3>
          </div>

          {/* Columna Central: Zona Clínica y Lateralidad */}
          <div className="bottom-center-zone-col">
            <span className="bottom-zone-label">
              Zona clínica:{' '}
              <strong className="zone-highlight">
                {view.title.split('(')[0].trim()}
              </strong>
            </span>
            <span className="bottom-zone-side">
              (Tórax y Abdomen · Lado {view.sideLabel})
            </span>
          </div>

          {/* Columna Derecha: Botones de Acción */}
          <div className="bottom-actions-col">
            <button
              type="button"
              className="btn-bottom-exit"
              onClick={onExitIsolation}
            >
              <MaterialIcon name="fullscreen_exit" size={16} />
              <span>Ver cuerpo completo</span>
            </button>
            <button
              type="button"
              className="btn-bottom-eva"
              onClick={onOpenEva}
            >
              <MaterialIcon name="add_circle" size={16} />
              <span>Evaluar Dolor EVA (0–10)</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
