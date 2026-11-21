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

const FREQUENT_SEARCH_CHIPS = [
  { label: 'Dolor de espalda', query: 'Traumatología' },
  { label: 'Nutrición deportiva', query: 'Nutrición' },
  { label: 'Rehabilitación muscular', query: 'Fisioterapia' },
  { label: 'Terapia de mano', query: 'Terapia' },
];

/** Filter box for the specialty grid (name, treatment or alias) with quick-filter chips. */
export const SpecialtySearch: React.FC<SpecialtySearchProps> = ({
  value = '',
  onChange,
  placeholder = 'Buscar especialidad o tratamiento...',
  resultCount,
}) => (
  <div className="apx-search-container">
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

    {/* Quick Filter Symptom Chips inspired by Stitch Design */}
    <div className="apx-search-chips" aria-label="Búsquedas frecuentes">
      <span className="apx-search-chips__label">Búsquedas Frecuentes:</span>
      <div className="apx-search-chips__list">
        {FREQUENT_SEARCH_CHIPS.map((chip) => (
          <button
            key={chip.label}
            type="button"
            className={`apx-search-chip ${value.toLowerCase() === chip.query.toLowerCase() ? 'is-active' : ''}`}
            onClick={() => onChange(chip.query)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);
