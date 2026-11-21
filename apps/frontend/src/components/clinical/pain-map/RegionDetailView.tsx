import React, { useRef } from 'react';
import { MaterialIcon } from '../../ui/MaterialIcon';
import {
  AnatomyView,
  getNode,
  getAllStructuresInRegion,
  PainPoint,
} from '@citassistema/shared-types';
import { StructureList } from './StructureList';

interface RegionDetailViewProps {
  regionCode: string;
  view: AnatomyView;
  points: PainPoint[];
  selectedStructureCode: string | null;
  onSelectStructure: (code: string, coords?: { x: number; y: number }) => void;
  onSelectPoint: (point: PainPoint) => void;
  onStepBack: () => void;
}

export const RegionDetailView: React.FC<RegionDetailViewProps> = ({
  regionCode,
  view,
  points,
  selectedStructureCode,
  onSelectStructure,
  onSelectPoint,
  onStepBack,
}) => {
  const regionNode = getNode(regionCode);
  const structures = getAllStructuresInRegion(regionCode).filter((s) =>
    s.views.includes(view),
  );
  const regionPoints = points.filter((p) => p.regionCode === regionCode);

  const svgRef = useRef<SVGSVGElement>(null);

  // Calcular viewBox con zoom centrado en el bbox de la región
  const bbox = regionNode?.bbox || { x: 30, y: 30, w: 40, h: 40 };
  const pad = 12; // porcentaje de margen alrededor para ver contexto

  const minX = Math.max(0, bbox.x - pad);
  const minY = Math.max(0, bbox.y - pad);
  const maxX = Math.min(100, bbox.x + bbox.w + pad);
  const maxY = Math.min(100, bbox.y + bbox.h + pad);

  const vbX = (minX / 100) * 200;
  const vbY = (minY / 100) * 420;
  const vbW = ((maxX - minX) / 100) * 200;
  const vbH = ((maxY - minY) / 100) * 420;

  const viewBoxString = `${vbX} ${vbY} ${vbW} ${vbH}`;

  const getEvaColor = (score: number) => {
    if (score === 0) return '#10b981';
    if (score <= 3) return '#22c55e';
    if (score <= 6) return '#eab308';
    if (score <= 8) return '#f97316';
    return '#ef4444';
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickClientX = e.clientX - rect.left;
    const clickClientY = e.clientY - rect.top;

    // Convertir de px en pantalla a coordenadas SVG (viewBox)
    const svgX = vbX + (clickClientX / rect.width) * vbW;
    const svgY = vbY + (clickClientY / rect.height) * vbH;

    // Convertir de coordenadas SVG (200x420) a porcentaje relativo al cuerpo (0-100)
    const percX = Math.round(((svgX / 200) * 100) * 100) / 100;
    const percY = Math.round(((svgY / 420) * 100) * 100) / 100;

    // Buscar si el clic fue cerca de algún ancla de estructura
    let closestStructure = structures[0];
    let minDistance = Infinity;

    for (const struct of structures) {
      const anchor = struct.anchor?.[view] || { x: struct.bbox?.x ?? 50, y: struct.bbox?.y ?? 50 };
      const dist = Math.hypot(anchor.x - percX, anchor.y - percY);
      if (dist < minDistance) {
        minDistance = dist;
        closestStructure = struct;
      }
    }

    if (closestStructure) {
      onSelectStructure(closestStructure.code, { x: percX, y: percY });
    }
  };

  return (
    <div className="pain-region-detail-container">
      {/* Columna Izquierda: Vista Anatómica Zoom */}
      <div className="pain-region-zoom-view">
        <div className="pain-region-zoom-header">
          <div className="pain-region-title-badge">
            <MaterialIcon name="zoom_in" size={18} color="#0284c7" />
            <span>Detalle con Zoom: <strong>{regionNode?.label || regionCode}</strong></span>
          </div>

          <button
            type="button"
            className="pain-btn-zoom-out"
            onClick={onStepBack}
            title="Volver a vista de cuerpo completo (Esc)"
          >
            <MaterialIcon name="zoom_out_map" size={16} />
            <span>Ver Cuerpo Completo</span>
          </button>
        </div>

        <div className="pain-zoomed-svg-card">
          <svg
            ref={svgRef}
            viewBox={viewBoxString}
            className="pain-zoomed-svg-element"
            onClick={handleSvgClick}
            aria-label={`Detalle anatómico ${regionNode?.label || regionCode}`}
          >
            <defs>
              <filter id="anchorShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodOpacity="0.2" />
              </filter>
            </defs>

            {/* Silueta anatómica subyacente de fondo */}
            <g className="zoomed-body-background" opacity="0.65">
              {view === 'lateral' ? (
                <>
                  <circle cx="104" cy="40" r="22" className="body-part-silhouette" />
                  <path d="M124,35 L132,44 L122,48 L124,54 L114,60 Z" className="body-part-silhouette" />
                  <path d="M96,58 L114,58 L116,78 L94,78 Z" className="body-part-silhouette" />
                  <path d="M90,78 L122,78 L126,140 L120,200 L96,215 L86,180 L88,120 Z" className="body-part-silhouette" />
                  <path d="M102,86 L112,86 L116,146 L112,210 L104,232 L94,232 L98,150 Z" className="body-part-silhouette" />
                  <path d="M96,215 L118,215 L116,290 L114,355 L116,390 L98,390 L94,330 L92,260 Z" className="body-part-silhouette" />
                  <path d="M96,388 L128,392 L134,400 L94,400 Z" className="body-part-silhouette" />
                </>
              ) : (
                <>
                  <circle cx="100" cy="40" r="22" className="body-part-silhouette" />
                  <path d="M92,60 L108,60 L110,75 L90,75 Z" className="body-part-silhouette" />
                  <path d="M72,75 L128,75 L124,195 L116,215 L84,215 L76,195 Z" className="body-part-silhouette" />
                  <path d="M72,75 L48,90 L36,150 L30,205 L24,230 L36,230 L46,170 L58,120 L72,95 Z" className="body-part-silhouette" />
                  <path d="M128,75 L152,90 L164,150 L170,205 L176,230 L164,230 L154,170 L142,120 L128,95 Z" className="body-part-silhouette" />
                  <path d="M84,215 L100,225 L96,290 L94,360 L92,390 L76,390 L80,330 L80,260 L84,215 Z" className="body-part-silhouette" />
                  <path d="M116,215 L100,225 L104,290 L106,360 L108,390 L124,390 L120,330 L120,260 L116,215 Z" className="body-part-silhouette" />
                </>
              )}
            </g>

            {/* Anclas de estructuras anatómicas en la región */}
            <g className="region-structures-anchors">
              {structures.map((struct) => {
                const anchor = struct.anchor?.[view] || { x: 50, y: 50 };
                const ax = (anchor.x / 100) * 200;
                const ay = (anchor.y / 100) * 420;

                const isSelected = selectedStructureCode === struct.code;
                const structPoints = regionPoints.filter((p) => p.structureCode === struct.code);
                const hasPoints = structPoints.length > 0;
                const maxEva = hasPoints ? Math.max(...structPoints.map((p) => p.eva)) : null;

                return (
                  <g
                    key={struct.code}
                    className={`struct-anchor-group ${isSelected ? 'selected' : ''}`}
                    transform={`translate(${ax}, ${ay})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStructure(struct.code, anchor);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Estructura ${struct.label}. Haz clic para registrar punto.`}
                  >
                    <circle
                      r="4.5"
                      className="struct-anchor-circle"
                      fill={hasPoints ? getEvaColor(maxEva!) : isSelected ? '#0284c7' : '#ffffff'}
                      stroke={isSelected ? '#0284c7' : '#64748b'}
                      strokeWidth="1.25"
                      filter="url(#anchorShadow)"
                    />
                    <text
                      y="-7"
                      textAnchor="middle"
                      className="struct-anchor-label"
                      fill="#0f172a"
                      fontSize="5.5"
                      fontWeight="700"
                    >
                      {struct.label}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Puntos ya registrados en esta región */}
            <g className="zoomed-registered-points">
              {regionPoints.map((pt) => {
                const px = (pt.coordX / 100) * 200;
                const py = (pt.coordY / 100) * 420;
                const color = getEvaColor(pt.eva);

                return (
                  <g
                    key={pt.id}
                    className="zoomed-pain-pin"
                    transform={`translate(${px}, ${py})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPoint(pt);
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Editar punto: ${pt.structureLabel || pt.structureCode}, EVA ${pt.eva}`}
                  >
                    <circle r="7" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                    <text
                      y="2.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="6.5"
                      fontWeight="900"
                    >
                      {pt.eva}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        <div className="pain-zoomed-instruction">
          <MaterialIcon name="touch_app" size={16} color="#0284c7" />
          <span>Haz clic sobre cualquier estructura o directamente sobre la imagen para ubicar el punto con precisión milimétrica.</span>
        </div>
      </div>

      {/* Columna Derecha: Acordeón de Estructuras */}
      <div className="pain-region-structures-panel">
        <StructureList
          regionCode={regionCode}
          selectedStructureCode={selectedStructureCode}
          points={points}
          onSelectStructure={(code) => onSelectStructure(code)}
        />
      </div>
    </div>
  );
};
