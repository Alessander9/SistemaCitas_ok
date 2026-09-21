import React from 'react';
import { IconSearch } from '../ui/Icons';
import { IconX } from './AppointmentIcons';
import './AppointmentStep.css';

export interface SpecialtySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Announced to screen readers so the filter result is not silent. */
  resultCount: number;
}

/** Filter box for the specialty grid (name, treatment or alias). */
export const SpecialtySearch: React.FC<SpecialtySearchProps> = ({
  value = '',
  onChange,
  placeholder = 'Buscar especialidad o tratamiento...',
  resultCount,
}) => (
  <div className="apx-search">
    <span className="apx-search__icon">
      <IconSearch size={18} className="apx-icon apx-icon--muted" />
    </span>
    <input
      type="text"
      className="apx-search__input"
      value={value || ''}
      placeholder={placeholder}
      aria-label="Buscar especialidad o tratamiento"
      autoComplete="off"
      onChange={(event) => onChange(event.target.value)}
    />
    {Boolean(value && value.length > 0) && (
      <button
        type="button"
        className="apx-search__clear"
        onClick={() => onChange('')}
        aria-label="Limpiar búsqueda"
      >
        <IconX size={14} />
      </button>
    )}
    <span className="apx-visually-hidden" role="status" aria-live="polite">
      {resultCount} {resultCount === 1 ? 'especialidad encontrada' : 'especialidades encontradas'}
    </span>
  </div>
);
