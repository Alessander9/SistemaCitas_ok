import React from 'react';
import { TimeSlot } from './TimeSlot';
import {
  IconMoon,
  IconSun,
  IconSunrise,
  AppointmentIconProps,
} from './AppointmentIcons';
import { SlotAvailability, SlotGroup, SlotGroupId, SlotVisualState } from './appointmentTypes';
import './AppointmentStep.css';

export interface TimeSlotGroupProps {
  group: SlotGroup;
  selectedDate: string;
  selectedTime: string;
  onSelect: (slot: SlotAvailability) => void;
}

/** Block iconography — SVG only, no emoji. */
const GROUP_ICONS: Record<SlotGroupId, React.FC<AppointmentIconProps>> = {
  morning: IconSunrise,
  afternoon: IconSun,
  evening: IconMoon,
};

/**
 * One time-of-day block of the day agenda. The blocks are purely
 * organizational: same surface, same border, same typography for all of them.
 */
export const TimeSlotGroup: React.FC<TimeSlotGroupProps> = ({
  group,
  selectedDate,
  selectedTime,
  onSelect,
}) => {
  const GroupIcon = GROUP_ICONS[group.id];

  return (
    <section className="apx-group" aria-labelledby={`apx-group-${group.id}`}>
      <header className="apx-group__header">
        <span className="apx-group__icon" aria-hidden="true">
          <GroupIcon size={18} />
        </span>
        <h4 className="apx-group__title" id={`apx-group-${group.id}`}>
          {group.label}
        </h4>
        {group.rangeLabel && <span className="apx-group__range">{group.rangeLabel}</span>}
        <span className="apx-group__count">
          {group.availableCount === 1
            ? '1 horario disponible'
            : `${group.availableCount} horarios disponibles`}
        </span>
      </header>

      <div className="apx-group__slots">
        {group.slots.map((slot) => {
          const state: SlotVisualState =
            slot.date === selectedDate && slot.startTime === selectedTime
              ? 'selected'
              : slot.state;

          return <TimeSlot key={slot.slotId} slot={slot} state={state} onSelect={onSelect} />;
        })}
      </div>
    </section>
  );
};
