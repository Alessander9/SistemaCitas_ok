import React from 'react';
import { MaterialIcon } from '../../../components/ui/MaterialIcon';
import { SuggestedSupplyItem } from '../../../services/api';

export interface ClinicalKardexAndSummarySectionProps {
  supplyChips: Array<SuggestedSupplyItem & { selected: boolean }>;
  setSupplyChips: React.Dispatch<
    React.SetStateAction<Array<SuggestedSupplyItem & { selected: boolean }>>
  >;
  onAddDefaultSupply: () => void;
  kardexMessage: string | null;
  patientSummaryText: string | null;
  setPatientSummaryText: (val: string | null) => void;
  isGeneratingSummary: boolean;
  onGeneratePatientSummary: () => void;
  summaryCopied: boolean;
  setSummaryCopied: (val: boolean) => void;
}

export const ClinicalKardexAndSummarySection: React.FC<
  ClinicalKardexAndSummarySectionProps
> = ({
  supplyChips,
  setSupplyChips,
  onAddDefaultSupply,
  kardexMessage,
  patientSummaryText,
  setPatientSummaryText,
  isGeneratingSummary,
  onGeneratePatientSummary,
  summaryCopied,
  setSummaryCopied,
}) => {
  return (
    <>
      {/* Fase 4: Chips Pre-seleccionados de Insumos (Voz -> Kardex al Guardar) */}
      <div
        className="clinical-section-card"
        style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}
      >
        <div className="clinical-section-header" style={{ marginBottom: '0.6rem' }}>
          <h4 className="clinical-section-title" style={{ fontSize: '0.9rem' }}>
            <MaterialIcon name="inventory_2" size={18} color="#0284c7" />
            Insumos de Sesión para Kardex (Confirmación antes de descontar)
          </h4>
          <button
            type="button"
            onClick={onAddDefaultSupply}
            style={{
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              borderRadius: '8px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Agregar Insumo
          </button>
        </div>
        {kardexMessage && (
          <div
            style={{
              marginBottom: '0.5rem',
              padding: '0.45rem 0.7rem',
              borderRadius: '8px',
              background: '#ecfdf5',
              color: '#15803d',
              fontSize: '0.76rem',
              fontWeight: 700,
            }}
          >
            ✓ {kardexMessage}
          </div>
        )}
        {supplyChips.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
            Si mencionas insumos durante la consulta (ej.{' '}
            <em>&quot;usamos 2 agujas de punción seca y kinesiotape&quot;</em>), Chanfainita los
            pre-seleccionará aquí para descontarlos del Kardex solo al guardar.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {supplyChips.map((chip, idx) => (
              <div
                key={chip.name}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '999px',
                  border: chip.selected ? '1.5px solid #0284c7' : '1.5px solid #cbd5e1',
                  background: chip.selected ? '#f0f9ff' : '#ffffff',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: chip.selected ? '#0369a1' : '#64748b',
                }}
              >
                <input
                  type="checkbox"
                  checked={chip.selected}
                  onChange={() =>
                    setSupplyChips((prev) =>
                      prev.map((c, i) => (i === idx ? { ...c, selected: !c.selected } : c)),
                    )
                  }
                />
                <span>{chip.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSupplyChips((prev) =>
                      prev.map((c, i) =>
                        i === idx ? { ...c, quantity: Math.max(1, c.quantity - 1) } : c,
                      ),
                    )
                  }
                  style={{
                    border: 'none',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    width: '20px',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  −
                </button>
                <span>×{chip.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSupplyChips((prev) =>
                      prev.map((c, i) => (i === idx ? { ...c, quantity: c.quantity + 1 } : c)),
                    )
                  }
                  style={{
                    border: 'none',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    width: '20px',
                    cursor: 'pointer',
                    fontWeight: 800,
                  }}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fase 3: Traductor a "Lenguaje de Paciente" Post-Consulta (WhatsApp / Portal) */}
      <div
        className="clinical-section-card"
        style={{
          background: 'linear-gradient(135deg, #f0fdfa 0%, #f0f9ff 100%)',
          borderColor: '#99f6e4',
        }}
      >
        <div
          className="clinical-section-header"
          style={{ marginBottom: patientSummaryText ? '0.65rem' : 0 }}
        >
          <h4 className="clinical-section-title" style={{ fontSize: '0.9rem', color: '#0f766e' }}>
            <MaterialIcon name="translate" size={18} color="#0d9488" />
            Indicaciones en Lenguaje de Paciente (WhatsApp / Portal)
          </h4>
          <button
            type="button"
            onClick={onGeneratePatientSummary}
            disabled={isGeneratingSummary}
            style={{
              border: '1px solid #0d9488',
              background: '#0d9488',
              color: '#ffffff',
              borderRadius: '8px',
              padding: '0.35rem 0.8rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isGeneratingSummary ? 'Generando...' : '✨ Generar Resumen Claro'}
          </button>
        </div>
        {patientSummaryText && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              className="clinical-form-input"
              rows={5}
              style={{
                height: 'auto',
                padding: '0.65rem',
                background: '#ffffff',
                fontSize: '0.8rem',
              }}
              value={patientSummaryText}
              onChange={(e) => setPatientSummaryText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-action-ghost"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 700 }}
                onClick={() => {
                  navigator.clipboard?.writeText(patientSummaryText);
                  setSummaryCopied(true);
                  setTimeout(() => setSummaryCopied(false), 2500);
                }}
              >
                {summaryCopied ? '✓ Copiado' : 'Copiar texto'}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(patientSummaryText)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                Enviar por WhatsApp ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
