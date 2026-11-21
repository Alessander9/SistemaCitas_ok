import React from 'react';
import {
  AnatomyView,
  getRegions,
  PainPoint,
} from '@citassistema/shared-types';

interface BodyOverviewProps {
  view: AnatomyView;
  points: PainPoint[];
  hoveredRegionCode: string | null;
  onHoverRegion: (code: string | null) => void;
  onSelectRegion: (code: string) => void;
  onSelectPoint: (point: PainPoint) => void;
}

export const BodyOverview: React.FC<BodyOverviewProps> = ({
  view,
  points,
  hoveredRegionCode,
  onHoverRegion,
  onSelectRegion,
  onSelectPoint,
}) => {
  const regions = getRegions().filter((r) => r.views.includes(view));

  const getEvaColor = (score: number) => {
    if (score === 0) return '#10b981';
    if (score <= 3) return '#22c55e';
    if (score <= 6) return '#eab308';
    if (score <= 8) return '#f97316';
    return '#ef4444';
  };

  const currentViewPoints = points.filter((p) => p.view === view);

  return (
    <div className="pain-body-overview-container">
      <div className="pain-svg-viewport-wrapper">
        <svg
          viewBox="0 0 200 420"
          className="pain-body-silhouette-svg"
          aria-label={`Silueta anatómica - Vista ${view}`}
        >
          <defs>
            <linearGradient id="bodyGradOverview" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* SILUETA BASE SEGÚN VISTA */}
          {view === 'lateral' ? (
            <g className="silhouette-lateral-group" filter="url(#shadowFilter)">
              {/* Cabeza perfil */}
              <circle cx="104" cy="40" r="22" className="body-part-silhouette" />
              {/* Nariz / Mentón perfil */}
              <path d="M124,35 L132,44 L122,48 L124,54 L114,60 Z" className="body-part-silhouette" />
              {/* Cuello perfil */}
              <path d="M96,58 L114,58 L116,78 L94,78 Z" className="body-part-silhouette" />
              {/* Torso perfil */}
              <path d="M90,78 L122,78 L126,140 L120,200 L96,215 L86,180 L88,120 Z" className="body-part-silhouette" />
              {/* Brazo perfil */}
              <path d="M102,86 L112,86 L116,146 L112,210 L104,232 L94,232 L98,150 Z" className="body-part-silhouette arm" />
              {/* Pierna perfil */}
              <path d="M96,215 L118,215 L116,290 L114,355 L116,390 L98,390 L94,330 L92,260 Z" className="body-part-silhouette leg" />
              {/* Pie lateral */}
              <path d="M96,388 L128,392 L134,400 L94,400 Z" className="body-part-silhouette foot" />
            </g>
          ) : (
            <g className="silhouette-standard-group" filter="url(#shadowFilter)">
              {/* Cabeza */}
              <circle cx="100" cy="40" r="22" className="body-part-silhouette" />
              {/* Cuello */}
              <path d="M92,60 L108,60 L110,75 L90,75 Z" className="body-part-silhouette" />

              {/* Torso / Tronco */}
              <path
                d="M72,75 L128,75 L124,195 L116,215 L84,215 L76,195 Z"
                className="body-part-silhouette torso"
              />

              {/* Miembros Superiores */}
              {/* Brazo Izquierdo (anatómico o contralateral) */}
              <path
                d="M72,75 L48,90 L36,150 L30,205 L24,230 L36,230 L46,170 L58,120 L72,95 Z"
                className="body-part-silhouette arm-left"
              />
              {/* Brazo Derecho */}
              <path
                d="M128,75 L152,90 L164,150 L170,205 L176,230 L164,230 L154,170 L142,120 L128,95 Z"
                className="body-part-silhouette arm-right"
              />

              {/* Pelvis y Piernas */}
              <path
                d="M84,215 L100,225 L96,290 L94,360 L92,390 L76,390 L80,330 L80,260 L84,215 Z"
                className="body-part-silhouette leg-left"
              />
              <path
                d="M116,215 L100,225 L104,290 L106,360 L108,390 L124,390 L120,330 L120,260 L116,215 Z"
                className="body-part-silhouette leg-right"
              />

              {/* Pies */}
              <ellipse cx="84" cy="396" rx="10" ry="5" className="body-part-silhouette foot" />
              <ellipse cx="116" cy="396" rx="10" ry="5" className="body-part-silhouette foot" />
            </g>
          )}

          {/* CAPA DE REGIONES CLICABLES (HITBOXES ANATÓMICAS) */}
          <g className="pain-regions-hotspots">
            {regions.map((region) => {
              const bbox = region.bbox || { x: 40, y: 40, w: 20, h: 20 };
              // Escala de bbox 0-100 a viewBox 200x420
              const rx = (bbox.x / 100) * 200;
              const ry = (bbox.y / 100) * 420;
              const rw = (bbox.w / 100) * 200;
              const rh = (bbox.h / 100) * 420;

              const isHovered = hoveredRegionCode === region.code;
              const regionPointsCount = points.filter(
                (p) => p.regionCode === region.code,
              ).length;

              return (
                <g key={region.code} className="region-hitbox-group">
                  <rect
                    x={rx}
                    y={ry}
                    width={rw}
                    height={rh}
                    rx={6}
                    ry={6}
                    className={`pain-region-hitbox ${isHovered ? 'hovered' : ''}`}
                    onClick={() => onSelectRegion(region.code)}
                    onMouseEnter={() => onHoverRegion(region.code)}
                    onMouseLeave={() => onHoverRegion(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Región ${region.label}. ${regionPointsCount} puntos registrados. Haz clic para hacer zoom.`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectRegion(region.code);
                      }
                    }}
                  />
                  {/* Etiqueta flotante de región en hover */}
                  {isHovered && (
                    <g className="region-tooltip-svg">
                      <rect
                        x={Math.max(10, Math.min(rx + rw / 2 - 50, 100))}
                        y={Math.max(12, ry - 14)}
                        width={100}
                        height={18}
                        rx={4}
                        fill="#0f172a"
                        fillOpacity="0.88"
                      />
                      <text
                        x={Math.max(10, Math.min(rx + rw / 2, 150))}
                        y={Math.max(12, ry - 14) + 12}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="600"
                      >
                        {region.label.length > 18
                          ? `${region.label.slice(0, 16)}...`
                          : region.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* CAPA DE PUNTOS REGISTRADOS (PINS EVA) */}
          <g className="pain-registered-pins-layer">
            {currentViewPoints.map((point) => {
              const px = (point.coordX / 100) * 200;
              const py = (point.coordY / 100) * 420;
              const color = getEvaColor(point.eva);
              const isSevere = point.eva >= 7;

              return (
                <g
                  key={point.id}
                  className="registered-pain-pin-marker"
                  transform={`translate(${px}, ${py})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPoint(point);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${point.structureLabel || point.structureCode}, EVA ${point.eva}`}
                >
                  {isSevere && (
                    <circle
                      r="10"
                      fill={color}
                      opacity="0.3"
                      className="pain-pin-pulse-circle"
                    />
                  )}
                  <circle
                    r="6.5"
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1.75"
                    filter="url(#shadowFilter)"
                  />
                  <text
                    y="2.5"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="7"
                    fontWeight="800"
                  >
                    {point.eva}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="pain-overview-footer-hint">
        <span className="pain-hint-icon">💡</span>
        <span>Pasa el cursor y haz clic sobre cualquier región del cuerpo para ingresar con zoom y ubicar puntos exactos.</span>
      </div>
    </div>
  );
};
