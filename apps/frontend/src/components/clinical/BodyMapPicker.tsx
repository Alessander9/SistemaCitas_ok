import React, { useState } from 'react';
import { MaterialIcon } from '../ui/MaterialIcon';
import './BodyMapPicker.css';

export interface PainPoint {
  id: string;
  zone: string;
  label: string;
  view: 'anterior' | 'posterior';
  eva: number;
  x: number; // percentage from left
  y: number; // percentage from top
  notes?: string;
}

interface BodyMapPickerProps {
  initialPoints?: PainPoint[];
  onChange?: (points: PainPoint[]) => void;
  readOnly?: boolean;
}

const PRESET_ZONES: Array<{ id: string; label: string; view: 'anterior' | 'posterior'; x: number; y: number }> = [
  // ANTERIOR
  { id: 'ant-cervical', label: 'Cervical / Cuello Anterior', view: 'anterior', x: 50, y: 18 },
  { id: 'ant-shoulder-l', label: 'Hombro Izquierdo', view: 'anterior', x: 33, y: 24 },
  { id: 'ant-shoulder-r', label: 'Hombro Derecho', view: 'anterior', x: 67, y: 24 },
  { id: 'ant-chest', label: 'Tórax / Pectoral', view: 'anterior', x: 50, y: 28 },
  { id: 'ant-elbow-l', label: 'Codo Izquierdo', view: 'anterior', x: 26, y: 38 },
  { id: 'ant-elbow-r', label: 'Codo Derecho', view: 'anterior', x: 74, y: 38 },
  { id: 'ant-wrist-l', label: 'Muñeca Izquierda', view: 'anterior', x: 20, y: 52 },
  { id: 'ant-wrist-r', label: 'Muñeca Derecha', view: 'anterior', x: 80, y: 52 },
  { id: 'ant-hip-l', label: 'Cadera Izquierda', view: 'anterior', x: 42, y: 50 },
  { id: 'ant-hip-r', label: 'Cadera Derecha', view: 'anterior', x: 58, y: 50 },
  { id: 'ant-knee-l', label: 'Rodilla Izquierda', view: 'anterior', x: 40, y: 68 },
  { id: 'ant-knee-r', label: 'Rodilla Derecha', view: 'anterior', x: 60, y: 68 },
  { id: 'ant-ankle-l', label: 'Tobillo Izquierdo', view: 'anterior', x: 41, y: 88 },
  { id: 'ant-ankle-r', label: 'Tobillo Derecho', view: 'anterior', x: 59, y: 88 },

  // POSTERIOR
  { id: 'post-cervical', label: 'Columna Cervical (C1-C7)', view: 'posterior', x: 50, y: 18 },
  { id: 'post-trapezius-l', label: 'Trapecio Izquierdo', view: 'posterior', x: 34, y: 22 },
  { id: 'post-trapezius-r', label: 'Trapecio Derecho', view: 'posterior', x: 66, y: 22 },
  { id: 'post-dorsal', label: 'Columna Dorsal (D1-D12)', view: 'posterior', x: 50, y: 30 },
  { id: 'post-lumbar', label: 'Columna Lumbar (L1-L5)', view: 'posterior', x: 50, y: 44 },
  { id: 'post-sacrum', label: 'Sacro / Coxis', view: 'posterior', x: 50, y: 52 },
  { id: 'post-glute-l', label: 'Glúteo Izquierdo', view: 'posterior', x: 41, y: 54 },
  { id: 'post-glute-r', label: 'Glúteo Derecho', view: 'posterior', x: 59, y: 54 },
  { id: 'post-hamstring-l', label: 'Isquiotibial Izquierdo', view: 'posterior', x: 40, y: 64 },
  { id: 'post-hamstring-r', label: 'Isquiotibial Derecho', view: 'posterior', x: 60, y: 64 },
  { id: 'post-calf-l', label: 'Gemelo / Pantorrilla Izq.', view: 'posterior', x: 40, y: 78 },
  { id: 'post-calf-r', label: 'Gemelo / Pantorrilla Der.', view: 'posterior', x: 60, y: 78 },
  { id: 'post-achilles-l', label: 'Tendón de Aquiles Izq.', view: 'posterior', x: 41, y: 90 },
  { id: 'post-achilles-r', label: 'Tendón de Aquiles Der.', view: 'posterior', x: 59, y: 90 },
];

export const BodyMapPicker: React.FC<BodyMapPickerProps> = ({
  initialPoints = [
    { id: 'p-1', zone: 'post-lumbar', label: 'Columna Lumbar (L4-L5)', view: 'posterior', eva: 7, x: 50, y: 44, notes: 'Contractura paravertebral severa' },
  ],
  onChange,
  readOnly = false,
}) => {
  const [currentView, setCurrentView] = useState<'anterior' | 'posterior'>('posterior');
  const [points, setPoints] = useState<PainPoint[]>(initialPoints);
  const [selectedZone, setSelectedZone] = useState<typeof PRESET_ZONES[0] | null>(null);
  const [selectedEva, setSelectedEva] = useState<number>(7);
  const [pointNotes, setPointNotes] = useState<string>('');

  const getEvaColor = (score: number) => {
    if (score === 0) return '#10b981';
    if (score <= 3) return '#22c55e';
    if (score <= 6) return '#eab308';
    if (score <= 8) return '#f97316';
    return '#ef4444';
  };

  const getEvaLabel = (score: number) => {
    if (score === 0) return 'Sin Dolor';
    if (score <= 3) return 'Dolor Leve';
    if (score <= 6) return 'Dolor Moderado';
    if (score <= 8) return 'Dolor Severo';
    return 'Dolor Insupportable';
  };

  const handleZoneClick = (zone: typeof PRESET_ZONES[0]) => {
    if (readOnly) return;
    const existing = points.find((p) => p.zone === zone.id);
    setSelectedZone(zone);
    if (existing) {
      setSelectedEva(existing.eva);
      setPointNotes(existing.notes || '');
    } else {
      setSelectedEva(5);
      setPointNotes('');
    }
  };

  const handleSavePoint = () => {
    if (!selectedZone) return;
    const updated = points.filter((p) => p.zone !== selectedZone.id);
    const newPoint: PainPoint = {
      id: `point-${Date.now()}`,
      zone: selectedZone.id,
      label: selectedZone.label,
      view: selectedZone.view,
      eva: selectedEva,
      x: selectedZone.x,
      y: selectedZone.y,
      notes: pointNotes.trim() || undefined,
    };

    const nextPoints = [...updated, newPoint];
    setPoints(nextPoints);
    onChange?.(nextPoints);
    setSelectedZone(null);
  };

  const handleRemovePoint = (zoneId: string) => {
    const nextPoints = points.filter((p) => p.zone !== zoneId);
    setPoints(nextPoints);
    onChange?.(nextPoints);
    setSelectedZone(null);
  };

  const filteredZones = PRESET_ZONES.filter((z) => z.view === currentView);

  return (
    <div className="bodymap-container">
      {/* View Switcher: Anterior / Posterior */}
      <div className="bodymap-header">
        <div>
          <h4 className="bodymap-title">
            <MaterialIcon name="accessibility_new" size={20} />
            <span>Mapeo Anatómico del Dolor EVA</span>
          </h4>
          <p className="bodymap-desc">
            Haz clic en los puntos anatómicos para localizar puntos gatillo y registrar intensidad de 0 a 10.
          </p>
        </div>

        <div className="bodymap-toggle">
          <button
            type="button"
            className={`bodymap-toggle-btn ${currentView === 'anterior' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('anterior');
              setSelectedZone(null);
            }}
          >
            Vista Anterior (Frente)
          </button>
          <button
            type="button"
            className={`bodymap-toggle-btn ${currentView === 'posterior' ? 'active' : ''}`}
            onClick={() => {
              setCurrentView('posterior');
              setSelectedZone(null);
            }}
          >
            Vista Posterior (Espalda)
          </button>
        </div>
      </div>

      <div className="bodymap-layout">
        {/* Anatomical Visualizer */}
        <div className="bodymap-visualizer">
          <div className="body-silhouette-wrap">
            {/* SVG Anatomical Human Silhouette */}
            <svg viewBox="0 0 200 420" className="body-silhouette-svg">
              <defs>
                <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
              </defs>

              {/* Head */}
              <circle cx="100" cy="40" r="22" className="body-part" />
              {/* Neck */}
              <path d="M92,60 L108,60 L110,75 L90,75 Z" className="body-part" />

              {/* Torso */}
              <path
                d="M72,75 L128,75 L124,195 L116,215 L84,215 L76,195 Z"
                className="body-part torso"
              />

              {/* Left Arm (Patient Right in Anterior) */}
              <path d="M72,75 L50,90 L38,150 L32,205 L26,230 L38,230 L48,170 L58,120 L72,95 Z" className="body-part" />
              {/* Right Arm */}
              <path d="M128,75 L150,90 L162,150 L168,205 L174,230 L162,230 L152,170 L142,120 L128,95 Z" className="body-part" />

              {/* Pelvis & Legs */}
              {/* Left Leg */}
              <path d="M84,215 L100,225 L96,290 L94,360 L92,390 L76,390 L80,330 L80,260 L84,215 Z" className="body-part" />
              {/* Right Leg */}
              <path d="M116,215 L100,225 L104,290 L106,360 L108,390 L124,390 L120,330 L120,260 L116,215 Z" className="body-part" />

              {/* Feet */}
              <ellipse cx="84" cy="396" rx="10" ry="5" className="body-part" />
              <ellipse cx="116" cy="396" rx="10" ry="5" className="body-part" />
            </svg>

            {/* Clickable Hotspot Pins */}
            {filteredZones.map((zone) => {
              const activePoint = points.find((p) => p.zone === zone.id);
              const isSelected = selectedZone?.id === zone.id;
              const pointColor = activePoint ? getEvaColor(activePoint.eva) : '#0284c7';

              return (
                <button
                  key={zone.id}
                  type="button"
                  className={`bodymap-pin ${activePoint ? 'has-pain' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    backgroundColor: activePoint ? pointColor : undefined,
                  }}
                  onClick={() => handleZoneClick(zone)}
                  title={`${zone.label} ${activePoint ? `· EVA ${activePoint.eva}/10` : ''}`}
                >
                  {activePoint ? (
                    <span className="pin-number">{activePoint.eva}</span>
                  ) : (
                    <span className="pin-dot">+</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bodymap-legend">
            <span className="legend-item"><span className="legend-dot" style={{ background: '#22c55e' }} /> 0-3 Leve</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#eab308' }} /> 4-6 Moderado</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#f97316' }} /> 7-8 Severo</span>
            <span className="legend-item"><span className="legend-dot" style={{ background: '#ef4444' }} /> 9-10 Crítico</span>
          </div>
        </div>

        {/* Details & Pain Points List */}
        <div className="bodymap-sidebar">
          {selectedZone ? (
            <div className="bodymap-form-card">
              <div className="form-card-header">
                <span className="form-card-badge">ZONA ANATÓMICA</span>
                <h5 className="form-card-title">{selectedZone.label}</h5>
              </div>

              <div className="form-field-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Escala Visual Analógica (EVA)</label>
                  <span
                    className="eva-badge-score"
                    style={{
                      backgroundColor: getEvaColor(selectedEva),
                      color: '#ffffff',
                    }}
                  >
                    EVA {selectedEva}/10 · {getEvaLabel(selectedEva)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={selectedEva}
                  onChange={(e) => setSelectedEva(parseInt(e.target.value, 10))}
                  className="eva-slider-input"
                />
              </div>

              <div className="form-field-group">
                <label className="form-label">Notas Clínicas / Tipo de Dolor</label>
                <input
                  type="text"
                  placeholder="Ej: Dolor punzante, contractura muscular, limitación a la flexión..."
                  value={pointNotes}
                  onChange={(e) => setPointNotes(e.target.value)}
                  className="form-text-input"
                />
              </div>

              <div className="form-card-actions">
                {points.some((p) => p.zone === selectedZone.id) && (
                  <button
                    type="button"
                    className="btn-delete-point"
                    onClick={() => handleRemovePoint(selectedZone.id)}
                  >
                    Eliminar Punto
                  </button>
                )}
                <button
                  type="button"
                  className="btn-save-point"
                  onClick={handleSavePoint}
                >
                  Guardar Punto EVA
                </button>
              </div>
            </div>
          ) : (
            <div className="bodymap-list-card">
              <h5 className="list-card-title">Puntos Registrados ({points.length})</h5>
              {points.length === 0 ? (
                <div className="list-card-empty">
                  <MaterialIcon name="my_location" size={28} />
                  <p>No hay puntos de dolor marcados. Haz clic sobre cualquier articulación del cuerpo.</p>
                </div>
              ) : (
                <div className="points-list-wrap">
                  {points.map((p) => (
                    <div key={p.id} className="point-item-row">
                      <div className="point-item-info">
                        <span
                          className="point-eva-badge"
                          style={{ backgroundColor: getEvaColor(p.eva) }}
                        >
                          {p.eva}
                        </span>
                        <div>
                          <strong className="point-item-label">{p.label}</strong>
                          <span className="point-item-view">
                            Vista {p.view === 'anterior' ? 'Anterior' : 'Posterior'} {p.notes ? `• ${p.notes}` : ''}
                          </span>
                        </div>
                      </div>
                      {!readOnly && (
                        <button
                          type="button"
                          className="btn-item-delete"
                          onClick={() => handleRemovePoint(p.zone)}
                          title="Eliminar este punto"
                          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <MaterialIcon name="close" size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BodyMapPicker;
