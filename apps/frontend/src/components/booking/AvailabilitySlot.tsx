import React from 'react';
import { IconCheck } from './AppointmentIcons';
import { SlotAvailability, SlotVisualState } from './appointmentTypes';
import { SLOT_STATE_LABELS } from './availabilityCatalog';
import { formatTime12, formatTimeRange } from './dateUtils';
import './AppointmentStep.css';

export interface AvailabilitySlotProps {
  slot: SlotAvailability;
  state: SlotVisualState;
  /** Grid placement inside the agenda. */
  style?: React.CSSProperties;
  /** Hides the duration line on very short blocks. */
  isCompact?: boolean;
  onSelect: (slot: SlotAvailability) => void;
}

const STATE_LABEL: Record<SlotVisualState, string> = {
  available: SLOT_STATE_LABELS.available,
  busy: SLOT_STATE_LABELS.busy,
  unavailable: SLOT_STATE_LABELS.unavailable,
  selected: 'Seleccionado',
};

const isBookable = (state: SlotVisualState) => state === 'available' || state === 'selected';

/** One bookable block of the agenda: time, state and real duration. */
export const AvailabilitySlot: React.FC<AvailabilitySlotProps> = ({
  slot,
  state,
  style,
  isCompact = false,
  onSelect,
}) => {
  const bookable = isBookable(state);

  return (
    <button
      type="button"
      className={`apx-slot is-${state}${isCompact ? ' is-compact' : ''}`}
      style={style}
      data-slot={`${slot.date}T${slot.startTime}`}
      disabled={!bookable}
      aria-pressed={state === 'selected'}
      aria-label={`${formatTimeRange(slot.startTime, slot.endTime)}, ${STATE_LABEL[
        state
      ].toLowerCase()}, ${slot.durationMinutes} minutos`}
      onClick={() => onSelect(slot)}
    >
      <span className="apx-slot__time">
        {state === 'selected' && <IconCheck size={12} />}
        {formatTime12(slot.startTime)}
      </span>

      <div className="apx-slot__meta">
        <span className="apx-slot__state">{STATE_LABEL[state]}</span>
        {bookable && !isCompact && (
          <span className="apx-slot__duration">{slot.durationMinutes} min</span>
        )}
      </div>
    </button>
  );
};
