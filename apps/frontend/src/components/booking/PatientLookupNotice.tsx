import React from 'react';
import { IconCheck, IconInfo, IconLoader } from './AppointmentIcons';
import './AppointmentStep.css';

/** Lifecycle of the GET /patients/by-document lookup. */
export type PatientLookupState = 'idle' | 'loading' | 'found' | 'not-found' | 'unsupported';

export interface PatientLookupNoticeProps {
  state: PatientLookupState;
  onLookup: () => void;
  /** True until the document number is valid enough to be queried. */
  disabled?: boolean;
}

const COPY: Record<
  Exclude<PatientLookupState, 'unsupported'>,
  { title: string; text: string; action?: string }
> = {
  idle: {
    title: 'Si ya estás registrado, podemos completar tus datos automáticamente.',
    text: 'Solo necesitamos tu número de documento.',
    action: 'Buscar mis datos',
  },
  loading: {
    title: 'Consultando datos...',
    text: 'Estamos verificando si ya cuentas con un registro en la clínica.',
  },
  found: {
    title: 'Encontramos tus datos',
    text: 'Puedes corregir cualquier dato antes de continuar.',
    action: 'Buscar de nuevo',
  },
  'not-found': {
    title: 'No encontramos datos guardados para este documento.',
    text: 'Completa el formulario manualmente; tu registro se creará con esta cita.',
    action: 'Buscar de nuevo',
  },
};

/**
 * Lookup banner. It never invents data: it only reports what the backend
 * answered, and disappears entirely when the endpoint is not available yet.
 */
export const PatientLookupNotice: React.FC<PatientLookupNoticeProps> = ({
  state,
  onLookup,
  disabled = false,
}) => {
  if (state === 'unsupported') return null;

  const copy = COPY[state];
  const isLoading = state === 'loading';
  const isFound = state === 'found';

  return (
    <div
      className={`apx-lookup is-${state}`}
      role="status"
      aria-live="polite"
      aria-busy={isLoading}
    >
      <span className="apx-lookup__icon" aria-hidden="true">
        {isLoading ? <IconLoader size={17} /> : isFound ? <IconCheck size={17} /> : <IconInfo size={17} />}
      </span>

      <span className="apx-lookup__text">
        <strong>{copy.title}</strong>
        <small>{copy.text}</small>
      </span>

      {copy.action && (
        <button
          type="button"
          className="apx-lookup__action"
          onClick={onLookup}
          disabled={disabled || isLoading}
        >
          {copy.action}
        </button>
      )}
    </div>
  );
};
