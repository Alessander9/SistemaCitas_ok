import React from 'react';
import { IconChevronDown, IconFilter, IconSort } from './AppointmentIcons';
import { ServiceFilterOption, ServiceSortOption } from './appointmentTypes';
import {
  SERVICE_FILTER_OPTIONS,
  SERVICE_SORT_OPTIONS,
} from './serviceCatalog';
import './AppointmentStep.css';

export interface ServiceToolbarProps {
  count: number;
  filter: ServiceFilterOption;
  sort: ServiceSortOption;
  onFilterChange: (filter: ServiceFilterOption) => void;
  onSortChange: (sort: ServiceSortOption) => void;
}

const countLabel = (count: number) => `${count} ${count === 1 ? 'servicio' : 'servicios'}`;

/** Section header + compact, native-accessible filter/sort controls. */
export const ServiceToolbar: React.FC<ServiceToolbarProps> = ({
  count,
  filter,
  sort,
  onFilterChange,
  onSortChange,
}) => (
  <div className="apx-toolbar">
    <div className="apx-toolbar__title-wrap">
      <h3 className="apx-toolbar__title">Servicios disponibles</h3>
      <span className="apx-toolbar__count">{countLabel(count)}</span>
    </div>

    <div className="apx-toolbar__controls">
      <div className="apx-select">
        <span className="apx-select__icon" aria-hidden="true">
          <IconFilter size={15} />
        </span>
        <select
          className="apx-select__input"
          aria-label="Filtrar servicios"
          value={filter}
          onChange={(event) => onFilterChange(event.target.value as ServiceFilterOption)}
        >
          {SERVICE_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="apx-select__chevron" aria-hidden="true">
          <IconChevronDown size={15} />
        </span>
      </div>

      <div className="apx-select">
        <span className="apx-select__icon" aria-hidden="true">
          <IconSort size={15} />
        </span>
        <select
          className="apx-select__input"
          aria-label="Ordenar servicios"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as ServiceSortOption)}
        >
          {SERVICE_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="apx-select__chevron" aria-hidden="true">
          <IconChevronDown size={15} />
        </span>
      </div>
    </div>
  </div>
);
