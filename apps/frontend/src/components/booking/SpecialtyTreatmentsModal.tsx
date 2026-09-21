import React, { useEffect, useRef } from 'react';
import { MedicalService } from '@citassistema/shared-types';
import { IconClock, IconLocation, IconX } from './AppointmentIcons';
import { SpecialtyCardModel } from './appointmentTypes';
import './AppointmentStep.css';

export interface SpecialtyTreatmentsModalProps {
  specialty: SpecialtyCardModel;
  treatments: MedicalService[];
  isLoading: boolean;
  onClose: () => void;
  /** Keeps the reservation flow untouched: selects the specialty and closes. */
  onConfirm: (specialtyId: string) => void;
}

/**
 * Read-only treatments preview (GET /specialties/:id/treatments).
 * Opening it never changes the wizard step, so the booking flow is preserved.
 */
export const SpecialtyTreatmentsModal: React.FC<SpecialtyTreatmentsModalProps> = ({
  specialty,
  treatments,
  isLoading,
  onClose,
  onConfirm,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="apx-modal" onClick={onClose}>
      <div
        className="apx-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apx-treatments-title"
        tabIndex={-1}
        ref={panelRef}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="apx-modal__header">
          <div>
            <span className="apx-modal__eyebrow">Tratamientos disponibles</span>
            <h3 className="apx-modal__title" id="apx-treatments-title">
              {specialty.name}
            </h3>
            <p className="apx-modal__subtitle">
              <IconLocation size={14} className="apx-icon apx-icon--muted" />
              {specialty.location}
            </p>
          </div>
          <button
            type="button"
            className="apx-modal__close"
            onClick={onClose}
            aria-label="Cerrar tratamientos"
          >
            <IconX size={16} />
          </button>
        </header>

        <div className="apx-modal__body">
          {isLoading && <p className="apx-modal__state">Cargando tratamientos...</p>}

          {!isLoading && treatments.length === 0 && (
            <p className="apx-modal__state">
              Esta especialidad todavía no tiene tratamientos publicados.
            </p>
          )}

          {!isLoading &&
            treatments.map((treatment) => (
              <article className="apx-treatment" key={treatment.id}>
                <div className="apx-treatment__top">
                  <span className="apx-treatment__name">{treatment.name}</span>
                  <span className="apx-treatment__price">
                    S/ {treatment.price.toFixed(2)}
                  </span>
                </div>
                {treatment.description && (
                  <p className="apx-treatment__desc">{treatment.description}</p>
                )}
                <span className="apx-treatment__meta">
                  <IconClock size={13} />
                  {treatment.durationMinutes} min
                  {treatment.requiresDeposit && ` · Depósito S/ ${treatment.depositAmount.toFixed(2)}`}
                </span>
              </article>
            ))}
        </div>

        <footer className="apx-modal__footer">
          <button type="button" className="apx-modal__ghost" onClick={onClose}>
            Cerrar
          </button>
          <button
            type="button"
            className="apx-modal__primary"
            onClick={() => onConfirm(specialty.specialtyId)}
          >
            Seleccionar esta especialidad
          </button>
        </footer>
      </div>
    </div>
  );
};
