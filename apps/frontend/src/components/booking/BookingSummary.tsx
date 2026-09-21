import React from 'react';
import { IconFileText } from '../ui/Icons';
import {
  IconClock,
  IconCreditCard,
  IconPencil,
  IconUsers,
  resolveSpecialtyIcon,
} from './AppointmentIcons';
import { SpecialtyIconKey } from './appointmentTypes';
import './AppointmentStep.css';

export type BookingSummaryIcon =
  | 'specialty'
  | 'service'
  | 'professional'
  | 'duration'
  | 'datetime'
  | 'price';

export interface BookingSummaryItem {
  id: string;
  icon: BookingSummaryIcon;
  /** Only required when `icon` is 'specialty'. */
  specialtyIconKey?: SpecialtyIconKey;
  label: string;
  value: string;
  meta?: string;
  photoUrl?: string;
}

export interface BookingSummaryProps {
  items: BookingSummaryItem[];
  onEdit: () => void;
  editLabel?: string;
}

const renderIcon = (item: BookingSummaryItem) => {
  if (item.icon === 'specialty') {
    const SpecialtyIcon = resolveSpecialtyIcon(item.specialtyIconKey ?? 'default');
    return <SpecialtyIcon size={20} />;
  }
  if (item.icon === 'service') return <IconFileText size={20} />;
  if (item.icon === 'professional') return <IconUsers size={20} />;
  if (item.icon === 'price') return <IconCreditCard size={20} />;
  return <IconClock size={20} />;
};

/** Horizontal context bar: what is being booked, with a way back to edit. */
export const BookingSummary: React.FC<BookingSummaryProps> = ({
  items,
  onEdit,
  editLabel = 'Editar',
}) => (
  <section className="apx-summary" aria-label="Resumen de la reserva">
    <div className="apx-summary__items">
      {items.map((item) => (
        <div className="apx-summary__item" key={item.id}>
          <span className={`apx-summary__icon apx-summary__icon--${item.icon}`}>
            {item.photoUrl ? (
              <img className="apx-summary__photo" src={item.photoUrl} alt="" loading="lazy" />
            ) : (
              renderIcon(item)
            )}
          </span>
          <span className="apx-summary__text">
            <small className="apx-summary__label">{item.label}</small>
            <strong className="apx-summary__value">{item.value}</strong>
            {item.meta && <span className="apx-summary__meta">{item.meta}</span>}
          </span>
        </div>
      ))}
    </div>

    <button type="button" className="apx-summary__edit" onClick={onEdit}>
      <IconPencil size={15} />
      {editLabel}
    </button>
  </section>
);
