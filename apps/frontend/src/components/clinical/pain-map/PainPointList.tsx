import React from 'react';
import { MaterialIcon } from '../../ui/MaterialIcon';
import { PainPoint, getNode } from '@citassistema/shared-types';

interface PainPointListProps {
  points: PainPoint[];
  onSelectPoint: (point: PainPoint) => void;
  onDeletePoint: (pointId: string) => void;
}

export const PainPointList: React.FC<PainPointListProps> = ({
  points,
  onSelectPoint,
  onDeletePoint,
}) => {
  const getEvaColor = (score: number) => {
    if (score === 0) return '#10b981';
    if (score <= 3) return '#22c55e';
    if (score <= 6) return '#eab308';
    if (score <= 8) return '#f97316';
    return '#ef4444';
  };

  const maxEva = points.length > 0 ? Math.max(...points.map((p) => p.eva)) : 0;

  return (
    <div className="pain-point-list-card">
      <div className="pain-point-list-header">
        <div className="pain-point-list-title-row">
          <MaterialIcon name="checklist" size={18} color="#0284c7" />
          <h5 className="pain-point-list-title">
            Puntos Registrados ({points.length})
          </h5>
        </div>

        {points.length > 0 && (
          <span
            className="pain-list-max-eva-badge"
            style={{ backgroundColor: getEvaColor(maxEva) }}
          >
            EVA Máx: {maxEva}/10
          </span>
        )}
      </div>

      <div className="pain-point-items-container">
        {points.length === 0 ? (
          <div className="pain-point-empty-state">
            <MaterialIcon name="location_off" size={28} color="#94a3b8" />
            <p>No se han registrado puntos anatómicos.</p>
            <span>
              Haz clic en una región o presiona <strong>Ctrl+K</strong> para buscar una estructura.
            </span>
          </div>
        ) : (
          <div className="pain-point-cards-grid">
            {points.map((pt) => {
              const node = getNode(pt.structureCode);
              const color = getEvaColor(pt.eva);

              return (
                <div
                  key={pt.id}
                  className="pain-point-card-item"
                  onClick={() => onSelectPoint(pt)}
                >
                  <div
                    className="pain-point-eva-square"
                    style={{ backgroundColor: color }}
                  >
                    {pt.eva}
                  </div>

                  <div className="pain-point-card-info">
                    <div className="pain-point-card-title-row">
                      <strong className="pain-point-card-label">
                        {pt.structureLabel || node?.label || pt.structureCode}
                      </strong>
                      <span className="pain-point-card-laterality">
                        {pt.laterality === 'central'
                          ? 'Central'
                          : pt.laterality === 'D'
                          ? 'Derecho (D)'
                          : pt.laterality === 'I'
                          ? 'Izquierdo (I)'
                          : 'Bilateral'}
                      </span>
                    </div>

                    <div className="pain-point-card-details">
                      <span className="pain-point-view-tag">
                        Vista {pt.view}
                      </span>

                      {pt.triggerPoint && (
                        <span
                          className={`pain-trigger-pill ${
                            pt.triggerPoint === 'activo'
                              ? 'trigger-active'
                              : 'trigger-latent'
                          }`}
                        >
                          {pt.triggerPoint === 'activo'
                            ? '🎯 Gatillo Activo'
                            : '💤 Gatillo Latente'}
                        </span>
                      )}

                      {pt.depth && (
                        <span className="pain-depth-pill">
                          {pt.depth === 'superficial' ? 'Superficial' : 'Profundo'}
                        </span>
                      )}
                    </div>

                    {pt.painTypes && pt.painTypes.length > 0 && (
                      <div className="pain-point-card-types">
                        {pt.painTypes.map((t) => (
                          <span key={t} className="pain-type-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {pt.notes && (
                      <p className="pain-point-card-notes">"{pt.notes}"</p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="pain-point-card-delete-btn"
                    title="Eliminar este punto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePoint(pt.id);
                    }}
                  >
                    <MaterialIcon name="close" size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
