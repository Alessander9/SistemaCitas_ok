import { useReducer, useCallback } from 'react';
import {
  AnatomyView,
  getNode,
  PainPoint,
} from '@citassistema/shared-types';

export type PainMapLevel = 'body' | 'region' | 'point_form';

export interface PainMapState {
  level: PainMapLevel;
  activeView: AnatomyView;
  selectedRegionCode: string | null;
  selectedSubregionCode: string | null;
  selectedStructureCode: string | null;
  activeEditingPoint: PainPoint | null;
  pendingCoords: { x: number; y: number } | null;
  points: PainPoint[];
  searchOpen: boolean;
  hoveredRegionCode: string | null;
}

export type PainMapAction =
  | { type: 'SET_VIEW'; payload: AnatomyView }
  | { type: 'SET_HOVERED_REGION'; payload: string | null }
  | { type: 'SELECT_REGION'; payload: string }
  | { type: 'SELECT_SUBREGION'; payload: string }
  | { type: 'SELECT_STRUCTURE'; payload: string; coords?: { x: number; y: number } }
  | { type: 'EDIT_POINT'; payload: PainPoint }
  | { type: 'CLOSE_FORM' }
  | { type: 'STEP_BACK' }
  | { type: 'RESET_TO_BODY' }
  | { type: 'SAVE_POINT'; payload: PainPoint }
  | { type: 'DELETE_POINT'; payload: string }
  | { type: 'SET_POINTS'; payload: PainPoint[] }
  | { type: 'SET_SEARCH_OPEN'; payload: boolean };

function painMapReducer(state: PainMapState, action: PainMapAction): PainMapState {
  switch (action.type) {
    case 'SET_VIEW':
      return {
        ...state,
        activeView: action.payload,
      };

    case 'SET_HOVERED_REGION':
      return {
        ...state,
        hoveredRegionCode: action.payload,
      };

    case 'SELECT_REGION': {
      const regionNode = getNode(action.payload);
      if (!regionNode) return state;

      // Si la región no admite la vista actual, cambiar a la primera vista que admita
      let nextView = state.activeView;
      if (!regionNode.views.includes(nextView) && regionNode.views.length > 0) {
        nextView = regionNode.views[0];
      }

      return {
        ...state,
        level: 'region',
        activeView: nextView,
        selectedRegionCode: action.payload,
        selectedSubregionCode: null,
        selectedStructureCode: null,
        activeEditingPoint: null,
      };
    }

    case 'SELECT_SUBREGION':
      return {
        ...state,
        selectedSubregionCode: action.payload,
      };

    case 'SELECT_STRUCTURE': {
      const structureNode = getNode(action.payload);
      if (!structureNode) return state;

      // Obtener el código de región padre
      let regCode = state.selectedRegionCode;
      if (!regCode && structureNode.parent) {
        const sub = getNode(structureNode.parent);
        regCode = sub?.parent || null;
      }

      // Vista preferida
      let nextView = state.activeView;
      if (!structureNode.views.includes(nextView) && structureNode.views.length > 0) {
        nextView = structureNode.views[0];
      }

      // Default coords del ancla o coordenadas recibidas del clic
      const defaultAnchor = structureNode.anchor?.[nextView] || { x: 50, y: 50 };
      const coords = action.coords || defaultAnchor;

      return {
        ...state,
        level: 'point_form',
        activeView: nextView,
        selectedRegionCode: regCode || state.selectedRegionCode,
        selectedSubregionCode: structureNode.parent || state.selectedSubregionCode,
        selectedStructureCode: action.payload,
        activeEditingPoint: null,
        pendingCoords: coords,
        searchOpen: false,
      };
    }

    case 'EDIT_POINT': {
      const point = action.payload;
      return {
        ...state,
        level: 'point_form',
        activeView: point.view,
        selectedRegionCode: point.regionCode,
        selectedStructureCode: point.structureCode,
        activeEditingPoint: point,
        pendingCoords: { x: point.coordX, y: point.coordY },
      };
    }

    case 'CLOSE_FORM':
      return {
        ...state,
        level: state.selectedRegionCode ? 'region' : 'body',
        activeEditingPoint: null,
        pendingCoords: null,
      };

    case 'STEP_BACK':
      if (state.level === 'point_form') {
        return {
          ...state,
          level: 'region',
          activeEditingPoint: null,
          pendingCoords: null,
        };
      }
      if (state.level === 'region') {
        return {
          ...state,
          level: 'body',
          selectedRegionCode: null,
          selectedSubregionCode: null,
          selectedStructureCode: null,
        };
      }
      return state;

    case 'RESET_TO_BODY':
      return {
        ...state,
        level: 'body',
        selectedRegionCode: null,
        selectedSubregionCode: null,
        selectedStructureCode: null,
        activeEditingPoint: null,
        pendingCoords: null,
      };

    case 'SAVE_POINT': {
      const saved = action.payload;
      const filtered = state.points.filter((p) => p.id !== saved.id);
      const nextPoints = [...filtered, saved];
      return {
        ...state,
        points: nextPoints,
        level: 'region',
        activeEditingPoint: null,
        pendingCoords: null,
      };
    }

    case 'DELETE_POINT': {
      const nextPoints = state.points.filter((p) => p.id !== action.payload);
      return {
        ...state,
        points: nextPoints,
        activeEditingPoint: null,
        level: state.level === 'point_form' ? 'region' : state.level,
      };
    }

    case 'SET_POINTS':
      return {
        ...state,
        points: action.payload,
      };

    case 'SET_SEARCH_OPEN':
      return {
        ...state,
        searchOpen: action.payload,
      };

    default:
      return state;
  }
}

export function usePainMapState(initialPoints: PainPoint[] = []) {
  const [state, dispatch] = useReducer(painMapReducer, {
    level: 'body',
    activeView: 'anterior',
    selectedRegionCode: null,
    selectedSubregionCode: null,
    selectedStructureCode: null,
    activeEditingPoint: null,
    pendingCoords: null,
    points: initialPoints,
    searchOpen: false,
    hoveredRegionCode: null,
  });

  const setView = useCallback((view: AnatomyView) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  const selectRegion = useCallback((code: string) => {
    dispatch({ type: 'SELECT_REGION', payload: code });
  }, []);

  const selectSubregion = useCallback((code: string) => {
    dispatch({ type: 'SELECT_SUBREGION', payload: code });
  }, []);

  const selectStructure = useCallback((code: string, coords?: { x: number; y: number }) => {
    dispatch({ type: 'SELECT_STRUCTURE', payload: code, coords });
  }, []);

  const editPoint = useCallback((point: PainPoint) => {
    dispatch({ type: 'EDIT_POINT', payload: point });
  }, []);

  const closeForm = useCallback(() => {
    dispatch({ type: 'CLOSE_FORM' });
  }, []);

  const stepBack = useCallback(() => {
    dispatch({ type: 'STEP_BACK' });
  }, []);

  const resetToBody = useCallback(() => {
    dispatch({ type: 'RESET_TO_BODY' });
  }, []);

  const savePoint = useCallback((point: PainPoint) => {
    dispatch({ type: 'SAVE_POINT', payload: point });
  }, []);

  const deletePoint = useCallback((pointId: string) => {
    dispatch({ type: 'DELETE_POINT', payload: pointId });
  }, []);

  const setPoints = useCallback((points: PainPoint[]) => {
    dispatch({ type: 'SET_POINTS', payload: points });
  }, []);

  const setSearchOpen = useCallback((open: boolean) => {
    dispatch({ type: 'SET_SEARCH_OPEN', payload: open });
  }, []);

  const setHoveredRegion = useCallback((code: string | null) => {
    dispatch({ type: 'SET_HOVERED_REGION', payload: code });
  }, []);

  return {
    state,
    setView,
    selectRegion,
    selectSubregion,
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
  };
}
