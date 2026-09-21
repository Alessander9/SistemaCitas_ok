import React from 'react';
import { IconCheck, IconSlash } from './AppointmentIcons';
import { SlotAvailability, SlotVisualState } from './appointmentTypes';
import { SLOT_STATE_LABELS } from './availabilityCatalog';
import { formatTime12 } from './dateUtils';
import './AppointmentStep.css';

export interface TimeSlotProps {
  slot: SlotAvailability;
  state: SlotVisualState;
  onSelect: (slot: SlotAvailability) => void;
}

const STATE_LABEL: Record<SlotVisualState, string> = {
  available: SLOT_STATE_LABELS.available,
  busy: SLOT_STATE_LABELS.busy,
  unavailable: SLOT_STATE_LABELS.unavailable,
  selected: 'Seleccionado',
};

const isBookable = (state: SlotVisualState) => state === 'available' || state === 'selected';

/**
 * One hour of the day agenda. It always shows the real start → end range of the
 * service, its duration and, when the backend sends it, the recommendation.
 */
export const TimeSlot: React.FC<TimeSlotProps> = ({ slot, state, onSelect }) => {
  const bookable = isBookable(state);
  const isSelected = state === 'selected';

  return (
    <button
      type="button"
      className={`apx-slot-card is-${state}`}
      data-slot={`${slot.date}T${slot.startTime}`}
      disabled={!bookable}
      aria-pressed={isSelected}
      aria-label={`${formatTime12(slot.startTime)} a ${formatTime12(slot.endTime)}, ${STATE_LABEL[
        state
      ].toLowerCase()}, ${slot.durationMinutes} minutos`}
      onClick={() => onSelect(slot)}
    >
      {slot.recommended && (
        <span className="apx-slot-card__badge">{slot.recommendationLabel ?? 'Recomendado'}</span>
      )}

      <span className="apx-slot-card__top">
        <span className="apx-slot-card__time">
          {isSelected && <IconCheck size={13} />}
          {formatTime12(slot.startTime)}
        </span>
        <span className="apx-slot-card__indicator" aria-hidden="true">
          {bookable ? <span className="apx-slot-card__dot" /> : <IconSlash size={14} />}
        </span>
      </span>

      <span className="apx-slot-card__range">– {formatTime12(slot.endTime)}</span>
      {bookable && <span className="apx-slot-card__duration">{slot.durationMinutes} min</span>}

      {/* Available cards already communicate their state with the green dot. */}
      {(!bookable || isSelected) && (
        <span className="apx-slot-card__state">
          {isSelected && <IconCheck size={13} />}
          {STATE_LABEL[state]}
        </span>
      )}
    </button>
  );
};
