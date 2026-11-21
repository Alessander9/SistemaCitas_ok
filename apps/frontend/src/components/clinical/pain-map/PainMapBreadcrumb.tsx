import React from 'react';
import { MaterialIcon } from '../../ui/MaterialIcon';
import { getNode } from '@citassistema/shared-types';

interface PainMapBreadcrumbProps {
  regionCode: string | null;
  subregionCode: string | null;
  structureCode: string | null;
  level: 'body' | 'region' | 'point_form';
  onReset: () => void;
  onSelectRegion: (code: string) => void;
  onStepBack: () => void;
}

export const PainMapBreadcrumb: React.FC<PainMapBreadcrumbProps> = ({
  regionCode,
  subregionCode,
  structureCode,
  level,
  onReset,
  onSelectRegion,
  onStepBack,
}) => {
  const regionNode = regionCode ? getNode(regionCode) : null;
  const subregionNode = subregionCode ? getNode(subregionCode) : null;
  const structureNode = structureCode ? getNode(structureCode) : null;

  return (
    <nav className="pain-breadcrumb-nav" aria-label="Ruta Anatómica">
      <div className="pain-breadcrumb-items">
        <button
          type="button"
          className={`pain-breadcrumb-btn ${level === 'body' ? 'active' : ''}`}
          onClick={onReset}
          aria-current={level === 'body' ? 'page' : undefined}
        >
          <MaterialIcon name="accessibility_new" size={16} />
          <span>Cuerpo Completo</span>
        </button>

        {regionNode && (
          <>
            <span className="pain-breadcrumb-separator">/</span>
            <button
              type="button"
              className={`pain-breadcrumb-btn ${level === 'region' ? 'active' : ''}`}
              onClick={() => onSelectRegion(regionNode.code)}
              aria-current={level === 'region' ? 'page' : undefined}
            >
              <span>{regionNode.label}</span>
            </button>
          </>
        )}

        {subregionNode && level === 'point_form' && (
          <>
            <span className="pain-breadcrumb-separator">/</span>
            <span className="pain-breadcrumb-text">{subregionNode.label}</span>
          </>
        )}

        {structureNode && level === 'point_form' && (
          <>
            <span className="pain-breadcrumb-separator">/</span>
            <span className="pain-breadcrumb-current" aria-current="page">
              <strong>{structureNode.label}</strong>
            </span>
          </>
        )}
      </div>

      {level !== 'body' && (
        <button
          type="button"
          className="pain-breadcrumb-back-btn"
          onClick={onStepBack}
          title="Subir de nivel (Esc)"
        >
          <MaterialIcon name="arrow_upward" size={14} />
          <span>Volver (Esc)</span>
        </button>
      )}
    </nav>
  );
};
