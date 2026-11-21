import React from 'react';
import { MaterialIcon } from '../../ui/MaterialIcon';
import {
  getSubregions,
  getStructures,
  PainPoint,
} from '@citassistema/shared-types';

interface StructureListProps {
  regionCode: string;
  selectedStructureCode: string | null;
  points: PainPoint[];
  onSelectStructure: (code: string) => void;
}

export const StructureList: React.FC<StructureListProps> = ({
  regionCode,
  selectedStructureCode,
  points,
  onSelectStructure,
}) => {
  const subregions = getSubregions(regionCode);

  return (
    <div className="pain-structure-list-container">
      <div className="pain-structure-list-header">
        <MaterialIcon name="format_list_bulleted" size={18} color="#0284c7" />
        <h5 className="pain-structure-list-title">Estructuras Anatómicas</h5>
      </div>

      <div className="pain-structure-accordion-scroll">
        {subregions.length === 0 ? (
          <div className="pain-empty-subregions">
            No se encontraron subregiones para esta área.
          </div>
        ) : (
          subregions.map((sub) => {
            const structures = getStructures(sub.code);

            return (
              <div key={sub.code} className="pain-subregion-group">
                <div className="pain-subregion-title">
                  <span>{sub.label}</span>
                  <span className="pain-subregion-count-badge">
                    {structures.length}
                  </span>
                </div>

                <div className="pain-structures-grid">
                  {structures.map((struct) => {
                    const isSelected = selectedStructureCode === struct.code;
                    const structPoints = points.filter(
                      (p) => p.structureCode === struct.code,
                    );
                    const hasPoints = structPoints.length > 0;
                    const maxEva = hasPoints
                      ? Math.max(...structPoints.map((p) => p.eva))
                      : 0;

                    return (
                      <button
                        key={struct.code}
                        type="button"
                        className={`pain-structure-item-btn ${isSelected ? 'selected' : ''} ${hasPoints ? 'has-points' : ''}`}
                        onClick={() => onSelectStructure(struct.code)}
                      >
                        <div className="pain-struct-main">
                          <span className="pain-struct-name">{struct.label}</span>
                          <div className="pain-struct-meta">
                            {struct.kind && (
                              <span className={`pain-kind-pill kind-${struct.kind}`}>
                                {struct.kind}
                              </span>
                            )}
                            {struct.lateral && (
                              <span className="pain-lateral-tag">D/I</span>
                            )}
                          </div>
                        </div>

                        {hasPoints ? (
                          <div
                            className="pain-struct-eva-badge"
                            style={{
                              backgroundColor:
                                maxEva >= 7
                                  ? '#ef4444'
                                  : maxEva >= 4
                                  ? '#eab308'
                                  : '#22c55e',
                            }}
                            title={`${structPoints.length} punto(s) registrado(s). EVA máx: ${maxEva}`}
                          >
                            EVA {maxEva}
                          </div>
                        ) : (
                          <MaterialIcon name="chevron_right" size={16} color="#94a3b8" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
