import React from 'react';
import { IconChevronLeft, IconChevronRight } from './AppointmentIcons';
import './AppointmentStep.css';

export interface WeekNavigationProps {
  rangeLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  isCurrentWeek: boolean;
}

/** ‹ week range › + "Esta semana" shortcut, aligned with the agenda. */
export const WeekNavigation: React.FC<WeekNavigationProps> = ({
  rangeLabel,
  onPrevWeek,
  onNextWeek,
  onCurrentWeek,
  isCurrentWeek,
}) => (
  <nav className="apx-weeknav" aria-label="Navegación por semana">
    <button
      type="button"
      className="apx-iconbtn"
      onClick={onPrevWeek}
      aria-label="Semana anterior"
    >
      <IconChevronLeft size={16} />
    </button>

    <span className="apx-weeknav__label" aria-live="polite">
      {rangeLabel}
    </span>

    <button type="button" className="apx-iconbtn" onClick={onNextWeek} aria-label="Semana siguiente">
      <IconChevronRight size={16} />
    </button>

    <button
      type="button"
      className="apx-weeknav__today"
      onClick={onCurrentWeek}
      disabled={isCurrentWeek}
    >
      Esta semana
    </button>
  </nav>
);
