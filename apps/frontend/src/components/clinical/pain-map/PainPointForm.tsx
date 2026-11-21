import React, { useState } from 'react';
import { MaterialIcon } from '../../ui/MaterialIcon';
import {
  AnatomyView,
  Laterality,
  PainDepth,
  PainPoint,
  TriggerPointStatus,
  getNode,
  getPath,
} from '@citassistema/shared-types';

interface PainPointFormProps {
  structureCode: string;
  regionCode: string;
  initialPoint?: PainPoint | null;
  coords: { x: number; y: number };
  view: AnatomyView;
  defaultLaterality?: Laterality | null;
  atlasMeta?: Record<string, unknown> | null;
  onSave: (point: PainPoint) => void;
  onDelete?: (pointId: string) => void;
  onCancel: () => void;
}

const PAIN_TYPES: Array<{ id: string; label: string }> = [
  { id: 'punzante', label: 'Punzante' },
  { id: 'quemante', label: 'Quemante' },
  { id: 'sordo', label: 'Sordo / Difuso' },
  { id: 'opresivo', label: 'Opresivo' },
  { id: 'irradiado', label: 'Irradiado' },
  { id: 'hormigueo', label: 'Hormigueo / Parestesia' },
  { id: 'calambre', label: 'Calambre' },
];

const AGGRAVATING_FACTORS: Array<{ id: string; label: string }> = [
  { id: 'carga', label: 'Con Carga' },
  { id: 'flexion', label: 'A la Flexión' },
  { id: 'extension', label: 'A la Extensión' },
  { id: 'rotacion', label: 'Rotación' },
  { id: 'reposo', label: 'En Reposo' },
  { id: 'nocturno', label: 'Dolor Nocturno' },
  { id: 'bipedestacion', label: 'De Pie Prolongado' },
  { id: 'sedestacion', label: 'Sentado Prolongado' },
];

export const PainPointForm: React.FC<PainPointFormProps> = ({
  structureCode,
  regionCode,
  initialPoint,
  coords,
  view,
  defaultLaterality,
  atlasMeta,
  onSave,
  onDelete,
  onCancel,
}) => {
  const node = getNode(structureCode);
  const path = getPath(structureCode);
  const isLateral = node?.lateral ?? true;

  const [eva, setEva] = useState<number>(initialPoint?.eva ?? 5);
  const [laterality, setLaterality] = useState<Laterality>(
    initialPoint?.laterality ?? defaultLaterality ?? (isLateral ? 'D' : 'central'),
  );
  const [triggerPoint, setTriggerPoint] = useState<TriggerPointStatus | undefined>(
    initialPoint?.triggerPoint,
  );
  const [depth, setDepth] = useState<PainDepth | undefined>(
    initialPoint?.depth ?? 'profundo',
  );
  const [selectedPainTypes, setSelectedPainTypes] = useState<string[]>(
    initialPoint?.painTypes ?? ['sordo'],
  );
  const [selectedAggravating, setSelectedAggravating] = useState<string[]>(
    initialPoint?.aggravatingFactors ?? [],
  );
  const [notes, setNotes] = useState<string>(initialPoint?.notes ?? '');

  const getEvaColor = (score: number) => {
    if (score === 0) return '#10b981';
    if (score <= 3) return '#22c55e';
    if (score <= 6) return '#eab308';
    if (score <= 8) return '#f97316';
    return '#ef4444';
  };

  const getEvaLabel = (score: number) => {
    if (score === 0) return 'Sin Dolor (0/10)';
    if (score <= 3) return 'Dolor Leve (1-3/10)';
    if (score <= 6) return 'Dolor Moderado (4-6/10)';
    if (score <= 8) return 'Dolor Severo (7-8/10)';
    return 'Dolor Crítico (9-10/10)';
  };

  const togglePainType = (typeId: string) => {
    if (selectedPainTypes.includes(typeId)) {
      setSelectedPainTypes(selectedPainTypes.filter((t) => t !== typeId));
    } else {
      setSelectedPainTypes([...selectedPainTypes, typeId]);
    }
  };

  const toggleAggravating = (factorId: string) => {
    if (selectedAggravating.includes(factorId)) {
      setSelectedAggravating(selectedAggravating.filter((f) => f !== factorId));
    } else {
      setSelectedAggravating([...selectedAggravating, factorId]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pointToSave: PainPoint = {
      id: initialPoint?.id || `point-${Date.now()}`,
      clinicId: initialPoint?.clinicId || '',
      patientId: initialPoint?.patientId || '',
      professionalId: initialPoint?.professionalId || '',
      medicalRecordId: initialPoint?.medicalRecordId,
      treatmentSessionId: initialPoint?.treatmentSessionId,
      structureCode,
      structureLabel: node?.label || structureCode,
      regionCode,
      laterality: isLateral ? laterality : 'central',
      view,
      coordX: coords.x,
      coordY: coords.y,
      eva,
      painTypes: selectedPainTypes,
      triggerPoint,
      depth,
      aggravatingFactors: selectedAggravating,
      referredArea: atlasMeta || initialPoint?.referredArea || null,
      notes: notes.trim() || undefined,
      recordedAt: initialPoint?.recordedAt || new Date().toISOString(),
    };

    onSave(pointToSave);
  };

  const activeAtlasMeta = atlasMeta || initialPoint?.referredArea || null;

  return (
    <div className="pain-point-form-card">
      <div className="pain-form-header">
        <div className="pain-form-header-info">
          <div className="pain-form-breadcrumb-trail">
            {path.map((p) => p.label).join(' → ')}
          </div>
          <h4 className="pain-form-title">
            <MaterialIcon name="pin_drop" size={20} color="#0284c7" />
            <span>{node?.label || structureCode}</span>
          </h4>
          {activeAtlasMeta && typeof activeAtlasMeta.atlasPartName === 'string' && (
            <div className="pain-form-atlas-tag">
              <MaterialIcon name="view_in_ar" size={14} color="#0f766e" />
              <span>
                Atlas 3D:{' '}
                <strong>
                  {String(activeAtlasMeta.atlasPartNameEs || activeAtlasMeta.atlasPartName)}
                </strong>
                {activeAtlasMeta.fmaId ? ` (${String(activeAtlasMeta.fmaId)})` : ''}
              </span>
            </div>
          )}
        </div>

        {node?.icd10Hints && node.icd10Hints.length > 0 && (
          <span className="pain-form-icd10-badge" title="Sugerencia CIE-10">
            {node.icd10Hints[0]}
          </span>
        )}
      </div>

      <form onSubmit={handleFormSubmit} className="pain-form-body">
        {/* 1. Escala EVA */}
        <div className="pain-form-field">
          <div className="pain-field-label-row">
            <label className="pain-field-label">Escala Visual Análoga (EVA):</label>
            <span
              className="pain-eva-indicator-badge"
              style={{ backgroundColor: getEvaColor(eva) }}
            >
              {getEvaLabel(eva)}
            </span>
          </div>
          <div className="pain-eva-selector">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
              const isSelected = eva === score;
              return (
                <button
                  key={score}
                  type="button"
                  className={`pain-eva-btn ${isSelected ? 'active' : ''}`}
                  style={{
                    borderColor: isSelected ? getEvaColor(score) : undefined,
                    backgroundColor: isSelected ? getEvaColor(score) : undefined,
                    color: isSelected ? '#ffffff' : undefined,
                  }}
                  onClick={() => setEva(score)}
                >
                  {score}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Lateralidad */}
        {isLateral && (
          <div className="pain-form-field">
            <label className="pain-field-label">Lateralidad Anatómica:</label>
            <div className="pain-segmented-control">
              <button
                type="button"
                className={`pain-segment-btn ${laterality === 'D' ? 'active' : ''}`}
                onClick={() => setLaterality('D')}
              >
                Derecho (D)
              </button>
              <button
                type="button"
                className={`pain-segment-btn ${laterality === 'I' ? 'active' : ''}`}
                onClick={() => setLaterality('I')}
              >
                Izquierdo (I)
              </button>
              <button
                type="button"
                className={`pain-segment-btn ${laterality === 'bilateral' ? 'active' : ''}`}
                onClick={() => setLaterality('bilateral')}
              >
                Bilateral
              </button>
            </div>
          </div>
        )}

        {/* 3. Punto Gatillo & Profundidad */}
        <div className="pain-form-row-2col">
          <div className="pain-form-field">
            <label className="pain-field-label">Punto Gatillo Miofascial:</label>
            <div className="pain-segmented-control">
              <button
                type="button"
                className={`pain-segment-btn ${triggerPoint === 'activo' ? 'active trigger-active' : ''}`}
                onClick={() =>
                  setTriggerPoint(triggerPoint === 'activo' ? undefined : 'activo')
                }
              >
                🎯 Activo
              </button>
              <button
                type="button"
                className={`pain-segment-btn ${triggerPoint === 'latente' ? 'active trigger-latent' : ''}`}
                onClick={() =>
                  setTriggerPoint(triggerPoint === 'latente' ? undefined : 'latente')
                }
              >
                💤 Latente
              </button>
              <button
                type="button"
                className={`pain-segment-btn ${!triggerPoint ? 'active' : ''}`}
                onClick={() => setTriggerPoint(undefined)}
              >
                No aplica
              </button>
            </div>
          </div>

          <div className="pain-form-field">
            <label className="pain-field-label">Profundidad del Tejido:</label>
            <div className="pain-segmented-control">
              <button
                type="button"
                className={`pain-segment-btn ${depth === 'superficial' ? 'active' : ''}`}
                onClick={() => setDepth('superficial')}
              >
                Superficial
              </button>
              <button
                type="button"
                className={`pain-segment-btn ${depth === 'profundo' ? 'active' : ''}`}
                onClick={() => setDepth('profundo')}
              >
                Profundo
              </button>
            </div>
          </div>
        </div>

        {/* 4. Tipos de Dolor (Multiselección) */}
        <div className="pain-form-field">
          <label className="pain-field-label">Tipo o Cualidad del Dolor:</label>
          <div className="pain-chips-selector">
            {PAIN_TYPES.map((type) => {
              const isSelected = selectedPainTypes.includes(type.id);
              return (
                <button
                  key={type.id}
                  type="button"
                  className={`pain-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => togglePainType(type.id)}
                >
                  <MaterialIcon
                    name={isSelected ? 'check' : 'add'}
                    size={13}
                  />
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Factores Agravantes */}
        <div className="pain-form-field">
          <label className="pain-field-label">Factores Agravantes:</label>
          <div className="pain-chips-selector">
            {AGGRAVATING_FACTORS.map((factor) => {
              const isSelected = selectedAggravating.includes(factor.id);
              return (
                <button
                  key={factor.id}
                  type="button"
                  className={`pain-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleAggravating(factor.id)}
                >
                  <MaterialIcon
                    name={isSelected ? 'check' : 'add'}
                    size={13}
                  />
                  <span>{factor.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Observaciones Clínicas */}
        <div className="pain-form-field">
          <label className="pain-field-label">Hallazgos a la Palpación / Notas:</label>
          <textarea
            className="pain-form-textarea"
            rows={2}
            placeholder="Ej. Banda tensa palpable con dolor referido hacia el codo, irradiación refleja al test de compresión..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Acciones */}
        <div className="pain-form-actions">
          {initialPoint && onDelete && (
            <button
              type="button"
              className="pain-btn-danger"
              onClick={() => onDelete(initialPoint.id)}
            >
              <MaterialIcon name="delete" size={16} />
              <span>Eliminar</span>
            </button>
          )}

          <div className="pain-form-actions-right">
            <button
              type="button"
              className="pain-btn-secondary"
              onClick={onCancel}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="pain-btn-primary"
            >
              <MaterialIcon name="check" size={16} />
              <span>{initialPoint ? 'Actualizar Punto' : 'Guardar Punto'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
