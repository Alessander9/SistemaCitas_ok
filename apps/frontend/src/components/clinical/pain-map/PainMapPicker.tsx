import React, { useEffect } from 'react';
import { MaterialIcon } from '../../ui/MaterialIcon';
import { PainPoint } from '@citassistema/shared-types';
import { usePainMapState } from './usePainMapState';
import { PainMapBreadcrumb } from './PainMapBreadcrumb';
import { BodyOverview } from './BodyOverview';
import { RegionDetailView } from './RegionDetailView';
import { PainPointForm } from './PainPointForm';
import { PainPointList } from './PainPointList';
import { AnatomySearch } from './AnatomySearch';
import './PainMap.css';

export interface PainMapPickerProps {
  initialPoints?: PainPoint[];
  onChange?: (points: PainPoint[]) => void;
  readOnly?: boolean;
}

export const PainMapPicker: React.FC<PainMapPickerProps> = ({
  initialPoints = [],
  onChange,
  readOnly: _readOnly = false,
}) => {
  const {
    state,
    setView,
    selectRegion,
    selectStructure,
    editPoint,
    closeForm,
    stepBack,
    resetToBody,
    savePoint,
    deletePoint,
    setPoints,
    setSearchOpen,
    setHoveredRegion,
  } = usePainMapState(initialPoints);

  // Sincronizar si cambian initialPoints desde el padre
  useEffect(() => {
    if (initialPoints && initialPoints.length > 0) {
      setPoints(initialPoints);
    }
  }, [initialPoints, setPoints]);

  // Manejo de atajos de teclado globales (Ctrl+K o '/' para buscar, Esc para volver)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        if (state.searchOpen) {
          setSearchOpen(false);
        } else if (state.level !== 'body') {
          stepBack();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [state.searchOpen, state.level, setSearchOpen, stepBack]);

  const handleSavePoint = (point: PainPoint) => {
    savePoint(point);
    const updated = state.points.filter((p) => p.id !== point.id);
    const nextPoints = [...updated, point];
    onChange?.(nextPoints);
  };

  const handleDeletePoint = (pointId: string) => {
    deletePoint(pointId);
    const nextPoints = state.points.filter((p) => p.id !== pointId);
    onChange?.(nextPoints);
  };

  return (
    <div className="pain-map-wrapper">
      {/* 1. Barra Superior con Selector de Vistas y Buscador Directo */}
      <div className="pain-map-top-bar">
        <div className="pain-map-title-area">
          <div className="pain-map-header-icon">
            <MaterialIcon name="accessibility_new" size={24} />
          </div>
          <div>
            <h4 className="pain-map-main-title">Mapeo Anatómico del Dolor EVA & Puntos Gatillo</h4>
            <p className="pain-map-subtitle">
              Exploración de cuerpo completo, zoom regional milimétrico y registro de dolor por estructura.
            </p>
          </div>
        </div>

        <div className="pain-map-actions-row">
          {/* Selector de Vistas: Anterior, Posterior, Lateral */}
          <div className="pain-view-segmented-toggle" role="tablist" aria-label="Seleccionar vista corporal">
            <button
              type="button"
              role="tab"
              aria-selected={state.activeView === 'anterior'}
              className={`pain-view-toggle-btn ${state.activeView === 'anterior' ? 'active' : ''}`}
              onClick={() => setView('anterior')}
            >
              <MaterialIcon name="front_hand" size={15} />
              <span>Anterior</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={state.activeView === 'posterior'}
              className={`pain-view-toggle-btn ${state.activeView === 'posterior' ? 'active' : ''}`}
              onClick={() => setView('posterior')}
            >
              <MaterialIcon name="airline_stops" size={15} />
              <span>Posterior</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={state.activeView === 'lateral'}
              className={`pain-view-toggle-btn ${state.activeView === 'lateral' ? 'active' : ''}`}
              onClick={() => setView('lateral')}
            >
              <MaterialIcon name="straighten" size={15} />
              <span>Lateral</span>
            </button>
          </div>

          {/* Botón Buscador Directo */}
          <button
            type="button"
            className="pain-quick-search-trigger"
            onClick={() => setSearchOpen(true)}
            title="Buscar estructura anatómica (Ctrl+K)"
          >
            <MaterialIcon name="search" size={16} />
            <span>Buscar estructura...</span>
            <span className="pain-kbd-badge">Ctrl+K</span>
          </button>
        </div>
      </div>

      {/* 2. Migas de Pan (Breadcrumb) */}
      <PainMapBreadcrumb
        regionCode={state.selectedRegionCode}
        subregionCode={state.selectedSubregionCode}
        structureCode={state.selectedStructureCode}
        level={state.level}
        onReset={resetToBody}
        onSelectRegion={selectRegion}
        onStepBack={stepBack}
      />

      {/* 3. Layout de Columnas: Visualizador Anatómico + Panel de Puntos/Ficha */}
      <div className="pain-main-columns-layout">
        {/* Columna Izquierda: Silueta General o Detalle Zoom */}
        <div className="pain-visualizer-column">
          {state.level === 'body' && (
            <BodyOverview
              view={state.activeView}
              points={state.points}
              hoveredRegionCode={state.hoveredRegionCode}
              onHoverRegion={setHoveredRegion}
              onSelectRegion={selectRegion}
              onSelectPoint={editPoint}
            />
          )}

          {(state.level === 'region' || state.level === 'point_form') && state.selectedRegionCode && (
            <RegionDetailView
              regionCode={state.selectedRegionCode}
              view={state.activeView}
              points={state.points}
              selectedStructureCode={state.selectedStructureCode}
              onSelectStructure={selectStructure}
              onSelectPoint={editPoint}
              onStepBack={resetToBody}
            />
          )}
        </div>

        {/* Columna Derecha: Formulario del Punto o Lista de Puntos Registrados */}
        <div className="pain-controls-column">
          {state.level === 'point_form' && state.selectedStructureCode && state.selectedRegionCode ? (
            <PainPointForm
              structureCode={state.selectedStructureCode}
              regionCode={state.selectedRegionCode}
              initialPoint={state.activeEditingPoint}
              coords={state.pendingCoords || { x: 50, y: 50 }}
              view={state.activeView}
              onSave={handleSavePoint}
              onDelete={handleDeletePoint}
              onCancel={closeForm}
            />
          ) : (
            <PainPointList
              points={state.points}
              onSelectPoint={editPoint}
              onDeletePoint={handleDeletePoint}
            />
          )}
        </div>
      </div>

      {/* Modal de Búsqueda Rápida (Ctrl+K) */}
      <AnatomySearch
        isOpen={state.searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectStructure={(code) => {
          selectStructure(code);
        }}
      />
    </div>
  );
};
