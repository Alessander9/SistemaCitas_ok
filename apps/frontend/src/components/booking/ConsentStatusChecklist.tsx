import React from 'react';
import { IconCheck } from './AppointmentIcons';
import './AppointmentStep.css';

// =============================================================================
// CitasSistema — ConsentStatusChecklist
// Visual progress indicator for step 8. Lists the booking prerequisites
// and flags whether "Políticas" are still pending or fully accepted.
// =============================================================================

export interface ConsentStatusItem {
  id: string;
  label: string;
  isComplete: boolean;
}

export interface ConsentStatusChecklistProps {
  cancellationAccepted: boolean;
  privacyAccepted: boolean;
}

const STATIC_ITEMS: Omit<ConsentStatusItem, 'isComplete'>[] = [
  { id: 'patient', label: 'Datos del paciente' },
  { id: 'datetime', label: 'Fecha y hora' },
  { id: 'professional', label: 'Profesional' },
  { id: 'service', label: 'Servicio' },
];

/**
 * Small checklist shown below the consent cards. The first four items are
 * always complete (the patient reached step 8 having filled them). The
 * "Políticas y consentimiento" item reflects the live acceptance state.
 */
export const ConsentStatusChecklist: React.FC<ConsentStatusChecklistProps> = ({
  cancellationAccepted,
  privacyAccepted,
}) => {
  const policiesComplete = cancellationAccepted && privacyAccepted;

  const items: ConsentStatusItem[] = [
    ...STATIC_ITEMS.map((item) => ({ ...item, isComplete: true })),
    { id: 'policies', label: 'Políticas y consentimiento', isComplete: policiesComplete },
  ];

  return (
    <section className="apx-consent-checklist" aria-label="Estado de la reserva">
      <header className="apx-consent-checklist__header">
        <h4 className="apx-consent-checklist__title">Estado de tu reserva</h4>
        <p className="apx-consent-checklist__subtitle">
          {policiesComplete
            ? 'Todos los pasos requeridos están completos.'
            : 'Falta aceptar las políticas para continuar.'}
        </p>
      </header>
      <ul className="apx-consent-checklist__list" role="list">
        {items.map((item) => (
          <li
            key={item.id}
            className={`apx-consent-checklist__item${item.isComplete ? ' is-complete' : ' is-pending'}`}
          >
            <span
              className="apx-consent-checklist__dot"
              aria-hidden="true"
            >
              {item.isComplete ? (
                <IconCheck size={11} />
              ) : (
                <span className="apx-consent-checklist__dot-ring" />
              )}
            </span>
            <span className="apx-consent-checklist__label">{item.label}</span>
            <span className="apx-consent-checklist__status">
              {item.isComplete ? 'Completado' : 'Pendiente'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};
